import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const subscribeToSection = (sectionName, callback) => {
  if (!db) return () => {};
  return onSnapshot(collection(db, sectionName), (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
};

export const addSectionItem = (sectionName, data) => {
  if (!db) return Promise.reject(new Error('DB missing'));
  return addDoc(collection(db, sectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const updateSectionItem = (sectionName, id, data) => {
  if (!db) return Promise.reject(new Error('DB missing'));
  return updateDoc(doc(db, sectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSectionItem = (sectionName, id) => {
  if (!db) return Promise.reject(new Error('DB missing'));
  return deleteDoc(doc(db, sectionName, id));
};