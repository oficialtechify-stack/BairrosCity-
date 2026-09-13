import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  sanitizeFirestoreData,
} from '../lib/firebase';
import { Company, Place, CategoryType } from '../types';
import { CATEGORY_CONFIG } from '../data/initialPlaces';

export const COMPANIES_COLLECTION = 'companies';

/**
 * Convert a Company document into a Place object suitable for Map, Cards and Modals
 */
export function companyToPlace(company: Company): Place {
  const exactCategory =
    company.customCategory?.trim() ||
    (company.subCategory &&
    company.subCategory !== 'Geral' &&
    company.subCategory !== 'Empresa Cadastrada' &&
    company.subCategory !== 'Empresa Local'
      ? company.subCategory.trim()
      : '') ||
    (CATEGORY_CONFIG[company.category as CategoryType]?.name) ||
    company.category ||
    'Comércio Local';

  return {
    id: company.id,
    name: company.name || 'Empresa',
    category: (company.category as CategoryType) || 'services',
    subCategory: exactCategory,
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

  // Clean up any old duplicate records for this user so it completely vanishes from previous locations
  try {
    const qComp = query(collection(db, COMPANIES_COLLECTION), where('userId', '==', userId));
    const compSnaps = await getDocs(qComp);
    for (const snap of compSnaps.docs) {
      if (snap.id !== companyId) {
        await deleteDoc(doc(db, COMPANIES_COLLECTION, snap.id));
        console.log(`[Firestore] Removed old location company record ${snap.id}`);
      }
    }
  } catch (cleanCompErr) {
    console.warn('[Firestore] Old company cleanup notice:', cleanCompErr);
  }

  // Also sync to `places` collection for full backward compatibility across all modules
  try {
    const placePayload = sanitizeFirestoreData(companyToPlace(cleanPayload as Company));
    await setDoc(doc(db, 'places', companyId), placePayload, { merge: true });
    console.log(`[Firestore] Mirrored company to 'places/${companyId}'`);

    // Clean up old place records owned by this user so old pins disappear from map
    const qPlace = query(collection(db, 'places'), where('ownerId', '==', userId));
    const placeSnaps = await getDocs(qPlace);
    for (const snap of placeSnaps.docs) {
      if (snap.id !== companyId) {
        await deleteDoc(doc(db, 'places', snap.id));
        console.log(`[Firestore] Removed old location place record ${snap.id}`);
      }
    }
  } catch (placeSyncErr) {
    console.warn('[Firestore] Note: places mirror sync notice:', placeSyncErr);
  }

  return cleanPayload as Company;
}

/**
 * Delete company completely from Firestore (both `companies` and `places` collections).
 * Also cleans up any associated user places so old pins vanish completely.
 */
export async function deleteCompanyFromFirestore(companyId: string, userId?: string): Promise<void> {
  if (!companyId && !userId) {
    console.warn('[Firestore] deleteCompanyFromFirestore called without companyId or userId');
    return;
  }

  console.log(`[Firestore] Deleting company ${companyId} (userId: ${userId})...`);

  // 1. Delete from `companies` collection by companyId
  if (companyId) {
    try {
      const compDocRef = doc(db, COMPANIES_COLLECTION, companyId);
      await deleteDoc(compDocRef);
      console.log(`[Firestore] Successfully removed 'companies/${companyId}'`);
    } catch (err) {
      console.warn(`[Firestore] Could not direct-delete 'companies/${companyId}':`, err);
    }
  }

  // 2. Delete any other matching company records for this user (handles duplicate/old records)
  if (userId) {
    try {
      const qComp = query(collection(db, COMPANIES_COLLECTION), where('userId', '==', userId));
      const compSnaps = await getDocs(qComp);
      for (const snap of compSnaps.docs) {
        await deleteDoc(doc(db, COMPANIES_COLLECTION, snap.id));
        console.log(`[Firestore] Removed user company doc '${snap.id}'`);
      }
    } catch (err) {
      console.warn('[Firestore] Error cleaning user company docs:', err);
    }
  }

  // 3. Delete from `places` collection by companyId
  if (companyId) {
    try {
      const placeDocRef = doc(db, 'places', companyId);
      await deleteDoc(placeDocRef);
      console.log(`[Firestore] Successfully removed 'places/${companyId}'`);
    } catch (err) {
      console.warn(`[Firestore] Could not direct-delete 'places/${companyId}':`, err);
    }
  }

  // 4. Delete any place records where ownerId matches userId
  if (userId) {
    try {
      const qPlace = query(collection(db, 'places'), where('ownerId', '==', userId));
      const placeSnaps = await getDocs(qPlace);
      for (const snap of placeSnaps.docs) {
        await deleteDoc(doc(db, 'places', snap.id));
        console.log(`[Firestore] Removed owned place pin '${snap.id}'`);
      }
    } catch (err) {
      console.warn('[Firestore] Error cleaning user place pins:', err);
    }
  }

  console.log(`[Firestore] Company ${companyId} completely removed.`);
}

/**
 * Completely clean all registered companies from Firestore and local caches as requested by user.
 * Deletes all documents in 'companies' collection and all company pins in 'places'.
 */
export async function cleanAllRegisteredCompaniesFromFirestore(): Promise<{ companiesDeleted: number; placesDeleted: number }> {
  let companiesDeleted = 0;
  let placesDeleted = 0;

  try {
    // 1. Delete all documents in `companies`
    const companiesSnap = await getDocs(collection(db, COMPANIES_COLLECTION));
    for (const docSnap of companiesSnap.docs) {
      try {
        await deleteDoc(doc(db, COMPANIES_COLLECTION, docSnap.id));
        companiesDeleted++;
      } catch (err) {
        console.warn(`Could not delete company doc ${docSnap.id}:`, err);
      }
    }

    // 2. Delete all registered company documents in `places`
    const placesSnap = await getDocs(collection(db, 'places'));
    for (const docSnap of placesSnap.docs) {
      const data = docSnap.data();
      // If it's a registered company or has an ownerId or was created by user
      if (data.isRegisteredCompany || data.ownerId || data.userId || docSnap.id.startsWith('comp-')) {
        try {
          await deleteDoc(doc(db, 'places', docSnap.id));
          placesDeleted++;
        } catch (err) {
          console.warn(`Could not delete place doc ${docSnap.id}:`, err);
        }
      }
    }

    // 3. Clear local storage caches
    try {
      localStorage.removeItem('bairroscity_places_backup');
      localStorage.removeItem('bairroscity_active_companies');
      localStorage.removeItem('bairroscity_company_draft');
      localStorage.removeItem('bairromap_companies');
    } catch (e) {
      console.warn('Could not clear local storage caches:', e);
    }

    console.log(`[Firestore] Cleaned all registered companies: ${companiesDeleted} companies, ${placesDeleted} places.`);
  } catch (err) {
    console.error('[Firestore] Error while wiping registered companies:', err);
  }

  return { companiesDeleted, placesDeleted };
}

