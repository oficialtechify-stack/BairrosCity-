import { auth, db, googleProvider, signInWithPopup, signOut, getDoc, doc, setDoc, updateDoc } from '../lib/firebase';
import { UserProfile } from '../types';

export async function loginWithGoogle(targetRole: 'morador' | 'empresa' = 'morador', companyName?: string): Promise<UserProfile> {
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
    // If the user intentionally chose to sign in/register as an empresa, upgrade or set role
    const finalRole = targetRole === 'empresa' ? 'empresa' : existingProfile.role || 'morador';
    profile = {
      ...existingProfile,
      name: existingProfile.name || user.displayName || 'Usuário Google',
      email: user.email || existingProfile.email,
      photoURL: user.photoURL || existingProfile.photoURL,
      role: finalRole,
      companyName: finalRole === 'empresa' ? (companyName || existingProfile.companyName || user.displayName || 'Minha Empresa') : undefined,
    };
  } else {
    profile = {
      id: user.uid,
      name: user.displayName || 'Usuário Google',
      email: user.email || '',
      role: targetRole,
      neighborhood: 'Curado IV',
      companyName: targetRole === 'empresa' ? (companyName || user.displayName || 'Minha Empresa') : undefined,
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

export async function updateUserRole(userId: string, newRole: 'morador' | 'empresa', companyName?: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;

    const current = snap.data() as UserProfile;
    const updated: UserProfile = {
      ...current,
      role: newRole,
      companyName: newRole === 'empresa' ? (companyName || current.companyName || current.name) : undefined,
    };

    await setDoc(userRef, updated, { merge: true });
    localStorage.setItem('bairromap_user', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error switching user role:', e);
    throw e;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;

    const current = snap.data() as UserProfile;
    const updated: UserProfile = {
      ...current,
      ...updates,
    };

    await setDoc(userRef, updated, { merge: true });
    localStorage.setItem('bairromap_user', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error updating user profile:', e);
    throw e;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Erro ao sair:', e);
  }
  localStorage.removeItem('bairromap_user');
}

