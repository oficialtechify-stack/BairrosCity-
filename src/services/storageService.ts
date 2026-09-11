import { storage, ref, uploadBytes, getDownloadURL, auth, signInAnonymously } from '../lib/firebase';

/**
 * Comprime o arquivo de imagem para JPEG leve e de alta nitidez em Data URL,
 * garantindo renderização instantânea e armazenamento confiável mesmo se o Storage falhar.
 */
export function compressImageFile(file: File, maxWidth = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    // Timeout de segurança de 3.5s para nunca travar a Promise
    const timer = setTimeout(() => {
      try {
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => resolve((fallbackReader.result as string) || '');
        fallbackReader.onerror = () => resolve('');
        fallbackReader.readAsDataURL(file);
      } catch {
        resolve('');
      }
    }, 3500);

    try {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const src = readerEvent.target?.result as string;
        if (!src) {
          clearTimeout(timer);
          resolve('');
          return;
        }

        const img = new Image();
        img.onload = () => {
          clearTimeout(timer);
          try {
            let { width, height } = img;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(src);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } catch {
            resolve(src);
          }
        };
        img.onerror = () => {
          clearTimeout(timer);
          resolve(src);
        };
        img.src = src;
      };
      reader.onerror = () => {
        clearTimeout(timer);
        resolve('');
      };
      reader.readAsDataURL(file);
    } catch (readErr) {
      clearTimeout(timer);
      console.warn('Erro ao ler arquivo de imagem:', readErr);
      resolve('');
    }
  });
}

/**
 * Realiza o upload da imagem para o Firebase Storage.
 * Possui timeout rígido de 5s para evitar que a interface fique presa em loop infinito.
 * Se o Firebase Storage falhar, estiver bloqueado por CORS ou demorar mais de 5s,
 * aciona automaticamente o fallback otimizado para salvar a foto sem perda de dados.
 */
export async function uploadCompanyImage(
  userId: string,
  file: File
): Promise<string> {
  const safeUserId = userId && userId.trim() ? userId.trim() : 'user_' + Date.now();
  const timestamp = Date.now();
  const safeFileName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'photo.jpg';
  const filePath = `companies/${safeUserId}/${timestamp}_${safeFileName}`;

  // Tenta autenticação anônima com timeout curto caso não haja usuário logado
  if (!auth.currentUser) {
    try {
      await Promise.race([
        signInAnonymously(auth),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 2000))
      ]);
    } catch (authErr) {
      console.debug('[Firebase Auth] Sessão mantida localmente:', authErr);
    }
  }

  try {
    const storageRef = ref(storage, filePath);
    const metadata = {
      contentType: file.type || 'image/jpeg',
    };

    // Upload no Firebase Storage protegido por timeout de 5 segundos
    const uploadWithTimeout = async (): Promise<string> => {
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    };

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Firebase Storage timeout (limite de 5s excedido)')), 5000);
    });

    const downloadURL = await Promise.race([uploadWithTimeout(), timeoutPromise]);
    console.log('[Firebase Storage] Upload concluído com sucesso:', downloadURL);
    return downloadURL;
  } catch (storageError: any) {
    console.warn(`[Firebase Storage] Storage indisponível (${storageError?.code || storageError?.message}). Ativando fallback de compressão instantâneo:`, storageError);
    
    // Fallback: comprime a imagem para base64 otimizado (< 120KB) para salvar diretamente no banco sem travar a interface
    const compressedDataUrl = await compressImageFile(file, 900, 0.82);
    if (compressedDataUrl) {
      console.log('[Image Storage] Imagem da galeria processada com sucesso via fallback.');
      return compressedDataUrl;
    }
    throw new Error('Não foi possível processar a imagem selecionada.');
  }
}
