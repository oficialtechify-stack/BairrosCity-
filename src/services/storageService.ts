import { storage, ref, uploadBytes, getDownloadURL, auth, signInAnonymously } from '../lib/firebase';

/**
 * Compress an image file to a lightweight, high-resolution JPEG Data URL
 * to use as fallback or instant local rendering.
 */
export function compressImageFile(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
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
          resolve(readerEvent.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(readerEvent.target?.result as string);
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file to Firebase Storage under `companies/{userId}/{timestamp}_{file.name}`.
 * If Firebase Storage is unavailable or restricted by permissions, smoothly falls back
 * to an optimized client-compressed Data URL so user photos are NEVER lost.
 */
export async function uploadCompanyImage(
  userId: string,
  file: File
): Promise<string> {
  const safeUserId = userId && userId.trim() ? userId.trim() : 'guest_' + Date.now();
  const timestamp = Date.now();
  const safeFileName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'photo.jpg';
  const filePath = `companies/${safeUserId}/${timestamp}_${safeFileName}`;

  // Ensure an authenticated session exists in Firebase Auth
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
      console.log('[Firebase Auth] Sessão anônima criada com sucesso para upload.');
    } catch (authErr) {
      console.warn('[Firebase Auth] Sessão anônima não necessária ou já ativa:', authErr);
    }
  }

  try {
    const storageRef = ref(storage, filePath);
    const metadata = {
      contentType: file.type || 'image/jpeg',
    };

    console.log(`[Firebase Storage] Enviando arquivo para: ${filePath}`);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`[Firebase Storage] Upload concluído com sucesso! URL:`, downloadURL);
    return downloadURL;
  } catch (storageError: any) {
    console.warn(`[Firebase Storage] Aviso no Storage (${storageError?.code || storageError?.message}). Aplicando fallback otimizado para Firestore:`, storageError);
    // Fallback: compress image so it saves directly in Firestore without failing
    const compressedDataUrl = await compressImageFile(file, 1200, 0.85);
    console.log('[Image Storage] Imagem da galeria processada com sucesso via fallback.');
    return compressedDataUrl;
  }
}
