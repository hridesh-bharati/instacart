import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const toggleWishlistApi = async (uid, product, isFav) => {
  if (!db || !uid) return;
  const ref = doc(db, 'users', uid);
  if (isFav) {
    await updateDoc(ref, {
      wishlist: arrayRemove(product),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      wishlist: arrayUnion(product),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
};