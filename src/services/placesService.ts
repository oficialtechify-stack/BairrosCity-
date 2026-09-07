import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc,
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Place, Review } from '../types';

const PLACES_COLLECTION = 'places';

// Subscribe to real-time updates of companies/places
export function subscribePlaces(callback: (places: Place[]) => void) {
  const q = query(collection(db, PLACES_COLLECTION));
  
  return onSnapshot(q, (snapshot) => {
    const placesList: Place[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      placesList.push({
        id: docSnap.id,
        name: data.name || 'Sem nome',
        category: data.category || 'restaurant',
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
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        rating: Number(data.rating) || 5.0,
        reviewsCount: Number(data.reviewsCount) || 0,
        reviews: Array.isArray(data.reviews) ? data.reviews : [],
        isEvent: Boolean(data.isEvent),
        eventDate: data.eventDate || '',
        eventTime: data.eventTime || '',
        priceRange: data.priceRange || '$$',
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdAt: data.createdAt || new Date().toISOString(),
        ownerId: data.ownerId,
        ownerName: data.ownerName || '',
        ownerEmail: data.ownerEmail || '',
      });
    });

    callback(placesList);
  }, (error) => {
    console.error('Error fetching places from Firestore:', error);
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
    createdAt: new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
  };

  await setDoc(newPlaceRef, newPlace);
  return newPlaceRef.id;
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
