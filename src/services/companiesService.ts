import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  sanitizeFirestoreData,
} from '../lib/firebase';
import { Company, Place, CategoryType } from '../types';

export const COMPANIES_COLLECTION = 'companies';

/**
 * Convert a Company document into a Place object suitable for Map, Cards and Modals
 */
export function companyToPlace(company: Company): Place {
  return {
    id: company.id,
    name: company.name || 'Empresa',
    category: (company.category as CategoryType) || 'services',
    subCategory: company.subCategory || company.category || 'Empresa Local',
    customCategory: company.customCategory || '',
    description: company.description || '',
    address: company.address || '',
    neighborhood: company.neighborhood || 'Curado IV',
    city: company.city || 'Recife',
    lat: typeof company.lat === 'number' ? company.lat : parseFloat(String(company.lat)) || -8.0645,
    lng: typeof company.lng === 'number' ? company.lng : parseFloat(String(company.lng)) || -34.9855,
    phone: company.phone || '',
    whatsapp: company.whatsapp || '',
    instagram: company.instagram || '',
    website: company.website || '',
    hours: company.hours || 'Segunda a Sábado: 08:00 às 18:00',
    imageUrl: company.photoUrl || company.imageUrl || '',
    photoUrl: company.photoUrl || company.imageUrl || '',
    logoUrl: company.logoUrl || '',
    isRegisteredCompany: true,
    rating: company.rating ?? 5.0,
    reviewsCount: company.reviewsCount ?? 1,
    reviews: company.reviews ?? [],
    tags: [company.category, company.neighborhood].filter(Boolean) as string[],
    createdAt: company.createdAt || new Date().toISOString(),
    ownerId: company.userId || '',
    isPaused: company.isPaused ?? false,
    viewsCount: company.viewsCount ?? 12,
    whatsappClicks: company.whatsappClicks ?? 0,
    productsOrServices: company.productsOrServices ?? [],
  };
}

/**
 * Convert a Place object into Company schema
 */
export function placeToCompany(place: Partial<Place>, userId: string): Partial<Company> {
  return {
    id: place.id,
    userId,
    name: place.name || 'Nova Empresa',
    category: place.category || 'services',
    neighborhood: place.neighborhood || 'Curado IV',
    city: place.city || 'Recife',
    address: place.address || '',
    lat: place.lat ?? -8.0645,
    lng: place.lng ?? -34.9855,
    whatsapp: place.whatsapp || '',
    instagram: place.instagram || '',
    phone: place.phone || '',
    hours: place.hours || 'Segunda a Sábado: 08:00 às 18:00',
    website: place.website || '',
    description: place.description || '',
    logoUrl: place.logoUrl || '',
    photoUrl: place.imageUrl || place.photoUrl || '',
    imageUrl: place.imageUrl || place.photoUrl || '',
    subCategory: place.subCategory || '',
    customCategory: place.customCategory || '',
    productsOrServices: place.productsOrServices || [],
    isPaused: place.isPaused ?? false,
    viewsCount: place.viewsCount ?? 0,
    whatsappClicks: place.whatsappClicks ?? 0,
  };
}

/**
 * Real-time subscription to the `companies` collection in Cloud Firestore
 */
export function subscribeCompanies(
  callback: (companies: Company[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const q = collection(db, COMPANIES_COLLECTION);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Company[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: data.userId || '',
            name: data.name || '',
            category: data.category || 'services',
            neighborhood: data.neighborhood || '',
            city: data.city || 'Recife',
            address: data.address || '',
            lat: typeof data.lat === 'number' ? data.lat : parseFloat(data.lat) || -8.0645,
            lng: typeof data.lng === 'number' ? data.lng : parseFloat(data.lng) || -34.9855,
            whatsapp: data.whatsapp || '',
            instagram: data.instagram || '',
            phone: data.phone || '',
            hours: data.hours || '',
            website: data.website || '',
            description: data.description || '',
            logoUrl: data.logoUrl || '',
            photoUrl: data.photoUrl || data.imageUrl || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            // UI extensions
            subCategory: data.subCategory,
            customCategory: data.customCategory,
            imageUrl: data.photoUrl || data.imageUrl || '',
            isRegisteredCompany: true,
            rating: data.rating ?? 5.0,
            reviewsCount: data.reviewsCount ?? 1,
            reviews: data.reviews ?? [],
            isPaused: data.isPaused ?? false,
            viewsCount: data.viewsCount ?? 0,
            whatsappClicks: data.whatsappClicks ?? 0,
            productsOrServices: data.productsOrServices ?? [],
          });
        });

        // Sort latest updated first
        list.sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
        callback(list);
      },
      (err) => {
        console.warn('[Firestore] Error subscribing to companies:', err);
        onError?.(err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Failed to attach companies listener:', err);
    return () => {};
  }
}

/**
 * Fetch a single company for a given user ID from `companies`
 */
export async function getCompanyByUserId(userId: string): Promise<Company | null> {
  if (!userId) return null;
  try {
    // 1. Direct doc lookup by userId if id === userId
    const directDoc = await getDoc(doc(db, COMPANIES_COLLECTION, userId));
    if (directDoc.exists()) {
      const data = directDoc.data();
      return { id: directDoc.id, ...data } as Company;
    }

    // 2. Query where userId == userId
    const q = query(collection(db, COMPANIES_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Company;
    }
  } catch (err) {
    console.warn('[Firestore] Error querying company by userId:', err);
  }
  return null;
}

/**
 * Save or update a company document in Cloud Firestore using setDoc with { merge: true }
 * vinculated to the userId of the logged-in user.
 */
export async function saveCompanyToFirestore(
  userId: string,
  companyData: Partial<Company>,
  existingCompanyId?: string
): Promise<Company> {
  if (!userId) {
    throw new Error('Usuário não autenticado para salvar a empresa.');
  }

  // Document ID: Use existing company ID, or given custom ID, or fallback to userId
  const companyId = existingCompanyId || companyData.id || `comp-${userId}`;

  const now = new Date().toISOString();

  const payload: Partial<Company> = {
    ...companyData,
    id: companyId,
    userId: userId,
    name: (companyData.name || '').trim() || 'Empresa Sem Nome',
    category: companyData.category || 'services',
    neighborhood: companyData.neighborhood || 'Curado IV',
    city: companyData.city || 'Recife',
    address: (companyData.address || '').trim(),
    lat: typeof companyData.lat === 'number' ? companyData.lat : parseFloat(String(companyData.lat)) || -8.0645,
    lng: typeof companyData.lng === 'number' ? companyData.lng : parseFloat(String(companyData.lng)) || -34.9855,
    whatsapp: companyData.whatsapp || '',
    instagram: companyData.instagram || '',
    phone: companyData.phone || '',
    hours: companyData.hours || 'Segunda a Sábado: 08:00 às 18:00',
    website: companyData.website || '',
    description: companyData.description || '',
    logoUrl: companyData.logoUrl || '',
    photoUrl: companyData.photoUrl || companyData.imageUrl || '',
    updatedAt: now,
  };

  if (!payload.createdAt) {
    payload.createdAt = now;
  }

  // Save to `companies` collection using setDoc with merge: true (sem nenhum campo undefined)
  const compDocRef = doc(db, COMPANIES_COLLECTION, companyId);
  const cleanPayload = sanitizeFirestoreData(payload);
  await setDoc(compDocRef, cleanPayload, { merge: true });
  console.log(`[Firestore] Company successfully saved in 'companies/${companyId}' with merge: true!`);

  // Also sync to `places` collection for full backward compatibility across all modules
  try {
    const placePayload = sanitizeFirestoreData(companyToPlace(cleanPayload as Company));
    await setDoc(doc(db, 'places', companyId), placePayload, { merge: true });
    console.log(`[Firestore] Mirrored company to 'places/${companyId}'`);
  } catch (placeSyncErr) {
    console.warn('[Firestore] Note: places mirror sync notice:', placeSyncErr);
  }

  return cleanPayload as Company;
}
