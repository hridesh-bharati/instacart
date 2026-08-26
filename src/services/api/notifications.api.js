import { collection, addDoc, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Real-time Notifications Listener for User/Admin
export const subscribeToNotifications = (uid, callback) => {
  if (!db || !uid) return () => {};
  return onSnapshot(collection(db, `users/${uid}/notifications`), (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(list);
  });
};
// Push a Notification
export const sendNotification = async (uid, title, body) => {
  if (!db || !uid) return;
  await addDoc(collection(db, `users/${uid}/notifications`), {
    title,
    body,
    read: false,
    createdAt: serverTimestamp(),
  });
};
// Mark Notification as Read
export const markNotificationRead = async (uid, notifId) => {
  if (!db || !uid) return;
  await updateDoc(doc(db, `users/${uid}/notifications`, notifId), {
    read: true,
  });
};