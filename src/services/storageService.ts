import { storage, ref, uploadBytes, getDownloadURL } from '../lib/firebase';

/**
 * Upload an image file to Firebase Storage under `companies/{userId}/{timestamp}_{file.name}`
 * Returns the public download URL from getDownloadURL().
 */
export async function uploadCompanyImage(
  userId: string,
  file: File
): Promise<string> {
  const safeUserId = userId && userId.trim() ? userId.trim() : 'guest_' + Date.now();
  const timestamp = Date.now();
  const safeFileName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'image.jpg';
  const filePath = `companies/${safeUserId}/${timestamp}_${safeFileName}`;

  try {
    const storageRef = ref(storage, filePath);
    const metadata = {
      contentType: file.type || 'image/jpeg',
    };

    console.log(`[Firebase Storage] Iniciando upload para: ${filePath}`);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`[Firebase Storage] Upload concluído com sucesso! URL pública:`, downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.error(`[Firebase Storage] Erro ao fazer upload para ${filePath}:`, error);
    throw error;
  }
}
