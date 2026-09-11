import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc,
  getDocs, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Place, Review } from '../types';

const PLACES_COLLECTION = 'places';

// Check if a place document is fake/mock
export function isFakePlace(id: string, data: any): boolean {
  if (data.isMock || id.startsWith('mock-') || id.startsWith('fake-')) return true;
  const nameLower = (data.name || '').toLowerCase();
  if (nameLower.includes('fake') || nameLower.includes('empresa fictícia') || nameLower.includes('teste fictício') || nameLower.includes('empresa teste')) {
    return true;
  }
  return false;
}

// Clean up fake businesses directly from Firestore
export async function cleanupFakePlacesFromFirestore(): Promise<number> {
  try {
    const snap = await getDocs(collection(db, PLACES_COLLECTION));
    let deletedCount = 0;
    for (const docSnap of snap.docs) {
      if (isFakePlace(docSnap.id, docSnap.data())) {
        await deleteDoc(doc(db, PLACES_COLLECTION, docSnap.id));
        deletedCount++;
      }
    }
    return deletedCount;
  } catch (err) {
    console.warn('Erro ao limpar empresas fake do Firestore:', err);
    return 0;
  }
}

// Subscribe to real-time updates of companies/places
export function subscribePlaces(callback: (places: Place[]) => void) {
  // First load from localStorage cache so places are immediately visible without delay
  try {
    const cached = localStorage.getItem('bairroscity_places_backup');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        callback(parsed);
      }
    }
  } catch (e) {
    console.debug('Cache read note:', e);
  }

  const q = query(collection(db, PLACES_COLLECTION));
  
  return onSnapshot(q, (snapshot) => {
    const placesList: Place[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Filter out any mock places
      if (isFakePlace(docSnap.id, data)) {
        return;
      }

      placesList.push({
        id: docSnap.id,
        name: data.name || 'Sem nome',
        category: data.category || 'restaurant',
        customCategory: data.customCategory || '',
        subCategory: data.subCategory || 'Geral',
        description: data.description || '',
        address: data.address || '',
        neighborhood: data.neighborhood || 'Curado',
        city: data.city || 'Recife',
        lat: Number(data.lat) || -8.0645,
        lng: Number(data.lng) || -34.9855,
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        instagram: data.instagram || '',
        website: data.website || '',
        hours: data.hours || '',
        imageUrl: data.imageUrl || data.photoUrl || '',
        logoUrl: data.logoUrl || '',
        isRegisteredCompany: data.isRegisteredCompany !== false,
        rating: Number(data.rating) || 5.0,
        reviewsCount: Number(data.reviewsCount) || (Array.isArray(data.reviews) ? data.reviews.length : 1),
        reviews: Array.isArray(data.reviews) ? data.reviews : [],
        isEvent: Boolean(data.isEvent),
        eventDate: data.eventDate || '',
        eventEndDate: data.eventEndDate || '',
        eventTime: data.eventTime || '',
        isFree: Boolean(data.isFree),
        priceRange: data.priceRange || '$$',
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdAt: data.createdAt || new Date().toISOString(),
        ownerId: data.ownerId,
        ownerName: data.ownerName || '',
        ownerEmail: data.ownerEmail || '',
        viewsCount: Number(data.viewsCount) || 0,
        whatsappClicks: Number(data.whatsappClicks) || 0,
        isPaused: Boolean(data.isPaused),
        productsOrServices: Array.isArray(data.productsOrServices) ? data.productsOrServices : [],
      });
    });

    // Save to persistent backup cache
    try {
      localStorage.setItem('bairroscity_places_backup', JSON.stringify(placesList));
    } catch (e) {
      console.debug('Cache write note:', e);
    }

    callback(placesList);
  }, (error) => {
    console.error('Error fetching places from Firestore:', error);
    // On error, fall back to cached places
    try {
      const cached = localStorage.getItem('bairroscity_places_backup');
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
  });
}

// Add a new company to Firestore
export async function createPlaceInFirestore(placeData: Omit<Place, 'id' | 'rating' | 'reviewsCount' | 'reviews' | 'createdAt'>): Promise<string> {
  const newPlaceRef = doc(collection(db, PLACES_COLLECTION));
  const newPlace = {
    ...placeData,
    id: newPlaceRef.id,
    rating: 5.0,
    reviewsCount: 1,
    reviews: [
      {
        id: `rev-welcome-${Date.now()}`,
        author: 'Sistema BairrosCity',
        rating: 5,
        comment: 'Empresa cadastrada e verificada na plataforma regional.',
        date: new Date().toISOString().split('T')[0],
        userRole: 'Verificação Oficial'
      }
    ],
    viewsCount: 1,
    whatsappClicks: 0,
    isPaused: false,
    createdAt: new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
  };

  try {
    await setDoc(newPlaceRef, newPlace);
  } catch (err) {
    console.warn('Firestore setDoc note, ensuring local backup:', err);
  }

  // Always update local cache so the place is fixed immediately
  try {
    const cached = localStorage.getItem('bairroscity_places_backup');
    const list: Place[] = cached ? JSON.parse(cached) : [];
    const placeWithExtras: Place = {
      ...newPlace,
      createdAt: newPlace.createdAt,
    } as Place;
    list.unshift(placeWithExtras);
    localStorage.setItem('bairroscity_places_backup', JSON.stringify(list));
  } catch (e) {
    console.debug('Local place backup note:', e);
  }

  return newPlaceRef.id;
}

// Update existing company details
export async function updatePlaceInFirestore(placeId: string, updates: Partial<Place>): Promise<void> {
  const placeRef = doc(db, PLACES_COLLECTION, placeId);
  await updateDoc(placeRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

// Delete company from Firestore
export async function deletePlaceFromFirestore(placeId: string): Promise<void> {
  const placeRef = doc(db, PLACES_COLLECTION, placeId);
  await deleteDoc(placeRef);
}

// Increment views or whatsapp clicks for the company
export async function recordCompanyInteraction(placeId: string, type: 'view' | 'whatsapp' | 'call'): Promise<void> {
  try {
    const placeRef = doc(db, PLACES_COLLECTION, placeId);
    if (type === 'view') {
      await updateDoc(placeRef, { viewsCount: increment(1) });
    } else if (type === 'whatsapp') {
      await updateDoc(placeRef, { whatsappClicks: increment(1) });
    }
  } catch (err) {
    // Non-blocking interaction tracking
    console.debug('Metric tracking note:', err);
  }
}

// Add review to a place
export async function addReviewToFirestore(
  placeId: string, 
  review: Omit<Review, 'id' | 'date'>, 
  currentPlace?: Place
) {
  const placeRef = doc(db, PLACES_COLLECTION, placeId);
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  };

  let existingReviews: Review[] = [];
  if (currentPlace && Array.isArray(currentPlace.reviews)) {
    existingReviews = currentPlace.reviews;
  } else {
    try {
      const snap = await getDoc(placeRef);
      if (snap.exists()) {
        const data = snap.data();
        existingReviews = Array.isArray(data.reviews) ? data.reviews : [];
      }
    } catch (e) {
      console.warn('Could not read existing place for reviews', e);
    }
  }

  const updatedReviews = [newReview, ...existingReviews];
  const sumRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
  const newAvg = Number((sumRating / updatedReviews.length).toFixed(1));

  await updateDoc(placeRef, {
    reviews: updatedReviews,
    rating: newAvg,
    reviewsCount: updatedReviews.length,
  });
}
