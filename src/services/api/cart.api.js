import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Real-time Cart Listener for Logged-in User
export const subscribeToCart = (uid, callback) => {
  if (!db || !uid) return () => {};
  return onSnapshot(doc(db, 'userCarts', uid), (snap) => {
    if (snap.exists()) {
      callback(snap.data().items || []);
    } else {
      callback([]);
    }
  });
};

// Save Cart to Firebase
export const saveCartToCloud = async (uid, cartItems) => {
  if (!db || !uid) return;
  await setDoc(
    doc(db, 'userCarts', uid),
    {
      items: cartItems,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};