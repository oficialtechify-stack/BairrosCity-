import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  updateDoc,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { db, sanitizeFirestoreData } from '../lib/firebase';
import { NeighborhoodPost, PostType, ProblemStatus, CouncilMember, ResidentVerificationRecord } from '../types';
import { DEFAULT_COUNCIL_MEMBERS } from '../data/initialPlaces';

const POSTS_COLLECTION = 'neighborhood_posts';
const COUNCIL_COLLECTION = 'council_members';
const RESIDENT_VERIFICATIONS_COLLECTION = 'resident_verifications';
const USERS_COLLECTION = 'users';

export function subscribeNeighborhoodPosts(neighborhood: string, callback: (posts: NeighborhoodPost[]) => void) {
  const q = query(collection(db, POSTS_COLLECTION));

  return onSnapshot(q, (snapshot) => {
    const list: NeighborhoodPost[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // If neighborhood is 'Todos' or matches
      if (!neighborhood || neighborhood === 'Todos' || data.neighborhood === neighborhood) {
        list.push({
          id: docSnap.id,
          neighborhood: data.neighborhood || 'Curado',
          type: data.type || 'noticia',
          title: data.title || '',
          content: data.content || '',
          author: data.author || 'Morador',
          authorRole: data.authorRole || 'Morador Local',
          date: data.date || new Date().toLocaleDateString('pt-BR'),
          timestamp: data.timestamp || Date.now(),
          status: data.status || 'aberto',
          eventDate: data.eventDate || '',
          eventTime: data.eventTime || '',
          eventLocation: data.eventLocation || '',
          imageUrl: data.imageUrl || '',
          upvotes: Number(data.upvotes) || 0,
          commentsCount: Number(data.commentsCount) || 0,
        });
      }
    });

    // Sort by timestamp desc
    list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    callback(list);
  }, (error) => {
    console.error('Error fetching neighborhood posts:', error);
  });
}

export async function createNeighborhoodPost(postData: Omit<NeighborhoodPost, 'id' | 'date' | 'upvotes' | 'commentsCount'>): Promise<string> {
  const newDocRef = doc(collection(db, POSTS_COLLECTION));
  const newPost = sanitizeFirestoreData({
    ...postData,
    id: newDocRef.id,
    date: new Date().toLocaleDateString('pt-BR'),
    timestamp: Date.now(),
    upvotes: 0,
    commentsCount: 0,
    serverCreatedAt: serverTimestamp(),
  });

  await setDoc(newDocRef, newPost);
  return newDocRef.id;
}

export async function upvotePost(postId: string) {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, {
    upvotes: increment(1)
  });
}

export async function updateProblemStatus(postId: string, status: ProblemStatus) {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, {
    status
  });
}

// -------------------------------------------------------------
// VEREADOR / COUNCIL MEMBER MANAGEMENT
// -------------------------------------------------------------

function getNeighborhoodSlug(neighborhood: string): string {
  return neighborhood
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function subscribeCouncilMemberByNeighborhood(
  neighborhood: string,
  callback: (member: CouncilMember | null) => void
) {
  const slug = getNeighborhoodSlug(neighborhood);
  const docRef = doc(db, COUNCIL_COLLECTION, slug);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const d = docSnap.data();
      callback({
        id: docSnap.id,
        neighborhood: d.neighborhood || neighborhood,
        name: d.name || '',
        party: d.party || '',
        photoUrl: d.photoUrl || '',
        bio: d.bio || '',
        phone: d.phone || '',
        whatsapp: d.whatsapp || '',
        instagram: d.instagram || '',
        email: d.email || '',
        officeAddress: d.officeAddress || '',
        mandatePeriod: d.mandatePeriod || '2025 - 2028',
        updatedAt: d.updatedAt || '',
      });
    } else {
      // Check default initial fallback if exists
      const fallback = DEFAULT_COUNCIL_MEMBERS[neighborhood];
      if (fallback) {
        callback({
          id: slug,
          neighborhood,
          name: fallback.name,
          party: fallback.party,
          bio: fallback.bio,
          phone: fallback.phone,
          whatsapp: fallback.whatsapp,
          instagram: fallback.instagram,
          email: fallback.email,
          photoUrl: fallback.photoUrl,
          mandatePeriod: '2025 - 2028',
        });
      } else {
        callback(null);
      }
    }
  }, (err) => {
    console.warn('Error subscribing council member:', err);
    const fallback = DEFAULT_COUNCIL_MEMBERS[neighborhood];
    if (fallback) {
      callback({
        id: slug,
        neighborhood,
        name: fallback.name,
        party: fallback.party,
        bio: fallback.bio,
        phone: fallback.phone,
        whatsapp: fallback.whatsapp,
        instagram: fallback.instagram,
        email: fallback.email,
        photoUrl: fallback.photoUrl,
        mandatePeriod: '2025 - 2028',
      });
    } else {
      callback(null);
    }
  });
}

export function subscribeAllCouncilMembers(callback: (members: CouncilMember[]) => void) {
  const q = query(collection(db, COUNCIL_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const list: CouncilMember[] = [];
    snapshot.forEach((snap) => {
      const d = snap.data();
      list.push({
        id: snap.id,
        neighborhood: d.neighborhood || '',
        name: d.name || '',
        party: d.party || '',
        photoUrl: d.photoUrl || '',
        bio: d.bio || '',
        phone: d.phone || '',
        whatsapp: d.whatsapp || '',
        instagram: d.instagram || '',
        email: d.email || '',
        officeAddress: d.officeAddress || '',
        mandatePeriod: d.mandatePeriod || '2025 - 2028',
        updatedAt: d.updatedAt || '',
      });
    });
    callback(list);
  }, (err) => {
    console.error('Error subscribing to all council members:', err);
  });
}

export async function saveCouncilMember(data: Omit<CouncilMember, 'id'>): Promise<string> {
  const slug = getNeighborhoodSlug(data.neighborhood);
  const docRef = doc(db, COUNCIL_COLLECTION, slug);
  const sanitized = sanitizeFirestoreData({
    ...data,
    id: slug,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(docRef, sanitized, { merge: true });
  return slug;
}

export async function deleteCouncilMember(neighborhood: string) {
  const slug = getNeighborhoodSlug(neighborhood);
  const docRef = doc(db, COUNCIL_COLLECTION, slug);
  await deleteDoc(docRef);
}

// -------------------------------------------------------------
// RESIDENT VERIFICATION & QUESTIONNAIRES (LGPD AUDIT)
// -------------------------------------------------------------

export async function saveResidentVerification(data: {
  userId: string;
  name: string;
  email: string;
  neighborhood: string;
  age: number | string;
  instagram: string;
  cpf: string;
}): Promise<string> {
  const docRef = doc(db, RESIDENT_VERIFICATIONS_COLLECTION, data.userId);
  const payload = sanitizeFirestoreData({
    ...data,
    id: data.userId,
    createdAt: new Date().toISOString(),
    verifiedStatus: 'verificado',
  });
  await setDoc(docRef, payload, { merge: true });

  // Also update users collection
  const userRef = doc(db, USERS_COLLECTION, data.userId);
  await setDoc(userRef, {
    neighborhood: data.neighborhood,
    age: data.age,
    instagram: data.instagram,
    cpf: data.cpf,
    surveyCompleted: true,
    surveyCompletedAt: new Date().toISOString(),
  }, { merge: true });

  return data.userId;
}

export function subscribeResidentVerifications(callback: (records: ResidentVerificationRecord[]) => void) {
  const q = query(collection(db, RESIDENT_VERIFICATIONS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const list: ResidentVerificationRecord[] = [];
    snapshot.forEach((snap) => {
      const d = snap.data();
      list.push({
        id: snap.id,
        userId: d.userId || snap.id,
        name: d.name || 'Morador',
        email: d.email || '',
        neighborhood: d.neighborhood || '',
        age: d.age || '',
        instagram: d.instagram || '',
        cpf: d.cpf || '',
        createdAt: d.createdAt || new Date().toISOString(),
        verifiedStatus: d.verifiedStatus || 'verificado',
      });
    });
    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (err) => {
    console.error('Error reading resident verifications:', err);
  });
}

export async function deleteResidentVerification(userId: string) {
  const docRef = doc(db, RESIDENT_VERIFICATIONS_COLLECTION, userId);
  await deleteDoc(docRef);
}

// Real-time count of registered residents by neighborhood
export function subscribeNeighborhoodResidents(callback: (counts: Record<string, number>) => void) {
  const q = query(collection(db, RESIDENT_VERIFICATIONS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const counts: Record<string, number> = {};
    snapshot.forEach((snap) => {
      const d = snap.data();
      if (d.neighborhood) {
        counts[d.neighborhood] = (counts[d.neighborhood] || 0) + 1;
      }
    });
    callback(counts);
  }, (err) => {
    console.warn('Could not read resident counts:', err);
  });
}

