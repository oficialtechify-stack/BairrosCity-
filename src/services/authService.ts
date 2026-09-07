import { auth, db, googleProvider, signInWithPopup, signOut, getDoc, doc, setDoc } from '../lib/firebase';
import { UserProfile } from '../types';

export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  if (!user) {
    throw new Error('Nenhum usuário retornado pelo Google.');
  }

  let profile: UserProfile;
  let existingProfile: UserProfile | null = null;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      existingProfile = userDoc.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Erro ao ler perfil do Firestore:', err);
  }

  if (existingProfile) {
    profile = {
      ...existingProfile,
      name: existingProfile.name || user.displayName || 'Usuário Google',
      email: user.email || existingProfile.email,
      photoURL: user.photoURL || existingProfile.photoURL,
    };
  } else {
    profile = {
      id: user.uid,
      name: user.displayName || 'Usuário Google',
      email: user.email || '',
      role: 'morador',
      neighborhood: 'Curado IV',
      photoURL: user.photoURL || undefined,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
  } catch (err) {
    console.warn('Erro ao salvar perfil no Firestore:', err);
  }

  try {
    localStorage.setItem('bairromap_user', JSON.stringify(profile));
  } catch (e) {
    console.warn('Erro ao salvar no localStorage:', e);
  }

  return profile;
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Erro ao sair:', e);
  }
  localStorage.removeItem('bairromap_user');
}
