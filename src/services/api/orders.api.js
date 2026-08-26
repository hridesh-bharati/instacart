import { collection, addDoc, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Real-time Orders Listener (Supports Admin & Customer filter)
export const subscribeToOrders = (uid, isAdmin, callback) => {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'orders'), (snapshot) => {
    let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Agar user admin nahi hai, toh sirf uske apne orders dikhayein
    if (!isAdmin) {
      list = list.filter((ord) => ord.userId === uid);
    }
    // Newest orders first
    list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(list);
  });
};

// Place a New Real Order (Empty cart after order)
export const placeOrder = async (uid, cartItems, totalPrice, deliveryAddress) => {
  if (!db || !uid) throw new Error('Database or User missing');
  const orderRef = collection(db, 'orders');
  const newOrder = {
    userId: uid,
    items: cartItems,
    total: totalPrice,
    address: deliveryAddress || 'Nichlaul, Maharajganj, UP',
    status: 'Processing',
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(orderRef, newOrder);
  return docRef.id;
};

// Update Order Status (For Admin)
export const updateOrderStatus = (orderId, status) => {
  if (!db) return Promise.reject(new Error('DB missing'));
  return updateDoc(doc(db, 'orders', orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
};