import { auth, rtdb } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { ref, set, push, remove, onValue } from 'firebase/database';

// Auth APIs
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email.trim(), password);
};

export const registerUser = async (name, email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = cred.user;
  await updateProfile(user, { displayName: name });

  const role = email.toLowerCase() === 'hridesh027@gmail.com' ? 'admin' : 'user';
  await set(ref(rtdb, `users/${user.uid}`), {
    name,
    email: user.email,
    phone: '',
    address: '',
    role,
    createdAt: Date.now(),
  });
  return user;
};

export const logoutUser = () => signOut(auth);

// Profile APIs
export const subscribeToUserProfile = (uid, callback) => {
  const userRef = ref(rtdb, `users/${uid}`);
  return onValue(userRef, (snap) => {
    callback(snap.val() || {});
  });
};

export const updateUserProfile = (uid, profileData) => {
  return set(ref(rtdb, `users/${uid}`), {
    ...profileData,
    updatedAt: Date.now(),
  });
};

// Realtime Products APIs
export const subscribeToLiveProducts = (callback) => {
  const prodRef = ref(rtdb, 'products');
  return onValue(prodRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const list = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      callback(list.reverse());
    } else {
      callback([]);
    }
  });
};

export const addProductToDB = (productData) => {
  const newRef = push(ref(rtdb, 'products'));
  return set(newRef, {
    ...productData,
    createdAt: Date.now(),
  });
};

export const deleteProductFromDB = (id) => {
  return remove(ref(rtdb, `products/${id}`));
};