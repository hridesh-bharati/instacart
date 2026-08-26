import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// User Profile
export const subscribeToUserProfile = (uid, callback) => {
  if (!db || !uid) return () => {};
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? snap.data() : {});
  });
};

export const updateUserProfile = (uid, profileData) => {
  if (!db || !uid) return Promise.reject(new Error('UID or DB missing'));
  return setDoc(
    doc(db, 'users', uid),
    { ...profileData, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

// Admin Store Settings
export const getAdminSettings = async (uid) => {
  if (!db || !uid) return null;
  const snap = await getDoc(doc(db, 'adminSettings', uid));
  return snap.exists() ? snap.data() : null;
};

export const updateAdminSettings = (uid, settingsData) => {
  if (!db || !uid) return Promise.reject(new Error('UID or DB missing'));
  return setDoc(
    doc(db, 'adminSettings', uid),
    { ...settingsData, updatedAt: serverTimestamp() },
    { merge: true }
  );
};