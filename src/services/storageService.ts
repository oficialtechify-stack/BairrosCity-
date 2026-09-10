import { storage, ref, uploadBytes, getDownloadURL } from '../lib/firebase';

/**
 * Upload an image file to Firebase Storage under `companies/{userId}/`
 * Returns the public download URL.
 */
export async function uploadCompanyImage(
  userId: string,
  file: File,
  type: 'logo' | 'photo' | 'cover' | string = 'image'
): Promise<string> {
  const safeUserId = userId ? userId.trim() : 'guest_' + Date.now();
  const timestamp = Date.now();
  const safeFileName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
  const filePath = `companies/${safeUserId}/${type}_${timestamp}_${safeFileName}`;

  try {
    const storageRef = ref(storage, filePath);
    const metadata = {
      contentType: file.type || 'image/jpeg',
      customMetadata: {
        userId: safeUserId,
        type,
        uploadedAt: new Date().toISOString(),
      },
    };

    console.log(`[Storage] Uploading to Firebase Storage at path: ${filePath}`);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`[Storage] Upload successful! Public URL:`, downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.warn(`[Storage] Firebase Storage direct upload error:`, error?.message || error);
    
    // Fallback to Data URL if storage bucket fails/offline so user experience is not blocked
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          console.log(`[Storage] Fallback to base64 data URL`);
          resolve(reader.result);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }
}
