import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export const ADMIN_EMAIL = 'hridesh027@gmail.com';

export const checkIsAdmin = (user) => {
  if (!user || !user.email) return false;
  return user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email.trim(), password);
};

export const registerUser = async (name, email, password, phone = '') => {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = cred.user;

  if (name) {
    await updateProfile(user, { displayName: name });
  }

  const role = checkIsAdmin(user) ? 'admin' : 'user';

  if (db && user.uid) {
    await setDoc(
      doc(db, 'users', user.uid),
      {
        name: name || 'User',
        email: user.email,
        phone: phone || '',
        role,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
  return user;
};

export const logoutUser = () => signOut(auth);