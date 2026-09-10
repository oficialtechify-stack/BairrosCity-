import { auth, db, googleProvider, signInWithPopup, signOut, getDoc, doc, setDoc, updateDoc } from '../lib/firebase';
import { UserProfile } from '../types';

export async function loginWithGoogle(
  targetRole: 'morador' | 'empresa' | 'company' | 'resident' = 'resident',
  companyName?: string
): Promise<UserProfile> {
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

  const isCompanyTarget = targetRole === 'company' || targetRole === 'empresa';
  const canonicalRole: 'company' | 'resident' = isCompanyTarget ? 'company' : 'resident';

  if (existingProfile) {
    // If user explicitly chose company registration/login, set to company
    const existingIsCompany = existingProfile.role === 'company' || existingProfile.role === 'empresa';
    const finalRole: 'company' | 'resident' = isCompanyTarget || existingIsCompany ? 'company' : 'resident';

    profile = {
      ...existingProfile,
      id: user.uid,
      uid: user.uid,
      name: existingProfile.name || user.displayName || 'Usuário Google',
      email: user.email || existingProfile.email || '',
      photoURL: user.photoURL || existingProfile.photoURL,
      role: finalRole,
      companyName: finalRole === 'company' ? (companyName || existingProfile.companyName || user.displayName || 'Minha Empresa') : undefined,
      createdAt: existingProfile.createdAt || new Date().toISOString(),
    };
  } else {
    profile = {
      id: user.uid,
      uid: user.uid,
      name: user.displayName || 'Usuário Google',
      email: user.email || '',
      role: canonicalRole,
      neighborhood: 'Curado IV',
      companyName: canonicalRole === 'company' ? (companyName || user.displayName || 'Minha Empresa') : undefined,
      photoURL: user.photoURL || undefined,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    // Persist to Firestore with explicit uid, email, role, createdAt
    const firestoreUserData = {
      uid: user.uid,
      id: user.uid,
      email: profile.email,
      role: profile.role,
      name: profile.name,
      neighborhood: profile.neighborhood,
      companyName: profile.companyName || '',
      photoURL: profile.photoURL || '',
      createdAt: profile.createdAt,
    };
    await setDoc(doc(db, 'users', user.uid), firestoreUserData, { merge: true });
    console.log(`[Firestore] User profile saved in 'users/${user.uid}' with role: ${profile.role}`);
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

export async function updateUserRole(
  userId: string,
  newRole: 'morador' | 'empresa' | 'company' | 'resident',
  companyName?: string
): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;

    const current = snap.data() as UserProfile;
    const isComp = newRole === 'company' || newRole === 'empresa';
    const canonicalRole: 'company' | 'resident' = isComp ? 'company' : 'resident';

    const updated: UserProfile = {
      ...current,
      uid: userId,
      role: canonicalRole,
      companyName: isComp ? (companyName || current.companyName || current.name) : undefined,
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

