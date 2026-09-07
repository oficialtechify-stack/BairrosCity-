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
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NeighborhoodPost, PostType, ProblemStatus } from '../types';

const POSTS_COLLECTION = 'neighborhood_posts';

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
  const newPost = {
    ...postData,
    id: newDocRef.id,
    date: new Date().toLocaleDateString('pt-BR'),
    timestamp: Date.now(),
    upvotes: 0,
    commentsCount: 0,
    serverCreatedAt: serverTimestamp(),
  };

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
