import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
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
import colors from '../../constants/colors';

const SECTIONS = [
  { key: 'flashSale', label: 'Flash Sale' },
  { key: 'featuredStores', label: 'Featured Stores' },
  { key: 'dailyEssentials', label: 'Daily Essentials' },
];

export default function DashboardScreen() {
  const [activeSection, setActiveSection] = useState('flashSale');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Common Form States
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Product specific (Flash Sale & Daily Essentials)
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [unit, setUnit] = useState('');

  // Store specific
  const [tag, setTag] = useState('');
  const [rating, setRating] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Real-time Fetch based on selected Tab
  useEffect(() => {
    setLoading(true);
    resetForm();
    const unsubscribe = onSnapshot(collection(db, activeSection), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeSection]);

  const resetForm = () => {
    setTitle('');
    setImage('');
    setPrice('');
    setOldPrice('');
    setUnit('');
    setTag('');
    setRating('');
    setDeliveryTime('');
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!title || !image) {
      Alert.alert('Validation Error', 'Title/Name aur Image URL zaroori hain.');
      return;
    }

    let payload = {
      image: image.trim(),
      updatedAt: serverTimestamp(),
    };

    if (activeSection === 'featuredStores') {
      payload = {
        ...payload,
        name: title.trim(),
        tag: tag.trim() || 'Groceries',
        rating: rating.trim() || '4.5',
        deliveryTime: deliveryTime.trim() || '20-30 min',
      };
    } else {
      if (!price) {
        Alert.alert('Validation Error', 'Price zaroori hai.');
        return;
      }
      payload = {
        ...payload,
        title: title.trim(),
        name: title.trim(),
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        unit: unit.trim() || '1 unit',
      };
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, activeSection, editingId), payload);
        Alert.alert('Success', 'Item update ho gaya!');
      } else {
        await addDoc(collection(db, activeSection), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        Alert.alert('Success', 'Item add ho gaya!');
      }
      resetForm();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setImage(item.image || '');
    if (activeSection === 'featuredStores') {
      setTitle(item.name || '');
      setTag(item.tag || '');
      setRating(String(item.rating || ''));
      setDeliveryTime(item.deliveryTime || '');
    } else {
      setTitle(item.title || item.name || '');
      setPrice(String(item.price || ''));
      setOldPrice(item.oldPrice ? String(item.oldPrice) : '');
      setUnit(item.unit || '');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Confirmation', 'Kya aap ise sach me delete karna chahte hain?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, activeSection, id));
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.mainHeading}>Admin Content Manager</Text>

      {/* SECTION TABS */}
      <View style={styles.tabsContainer}>
        {SECTIONS.map((sec) => (
          <TouchableOpacity
            key={sec.key}
            style={[styles.tabBtn, activeSection === sec.key && styles.activeTabBtn]}
            onPress={() => setActiveSection(sec.key)}
          >
            <Text style={[styles.tabText, activeSection === sec.key && styles.activeTabText]}>
              {sec.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FORM CARD */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {editingId ? 'Edit Item' : 'Add New'} ({SECTIONS.find((s) => s.key === activeSection)?.label})
        </Text>

        <TextInput
          placeholder={activeSection === 'featuredStores' ? 'Store Name (e.g. Fresh Market)' : 'Product Name (e.g. Organic Avocado)'}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Image URL (https://...)"
          value={image}
          onChangeText={setImage}
          style={styles.input}
        />

        {activeSection === 'featuredStores' ? (
          <>
            <TextInput
              placeholder="Tag / Category (e.g. Supermarket, Fruits)"
              value={tag}
              onChangeText={setTag}
              style={styles.input}
            />
            <TextInput
              placeholder="Rating (e.g. 4.8)"
              value={rating}
              onChangeText={setRating}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Delivery Time (e.g. 15-25 min)"
              value={deliveryTime}
              onChangeText={setDeliveryTime}
              style={styles.input}
            />
          </>
        ) : (
          <>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Price (₹)"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
              />
              <TextInput
                placeholder="Old Price (₹ optional)"
                value={oldPrice}
                onChangeText={setOldPrice}
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
              />
            </View>
            <TextInput
              placeholder="Unit (e.g. 1 kg, 500 ml, 1 bunch)"
              value={unit}
              onChangeText={setUnit}
              style={styles.input}
            />
          </>
        )}

        <View style={styles.formActions}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{editingId ? 'Update' : 'Add Item'}</Text>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ITEMS LIST */}
      <Text style={styles.listHeading}>Existing Items ({items.length})</Text>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemTitle}>{item.title || item.name}</Text>
              {activeSection === 'featuredStores' ? (
                <Text style={styles.itemSub}>{item.tag} • ⭐ {item.rating} • {item.deliveryTime}</Text>
              ) : (
                <Text style={styles.itemSub}>₹{item.price} {item.oldPrice ? `(was ₹${item.oldPrice})` : ''} • {item.unit}</Text>
              )}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  mainHeading: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 14 },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#E9ECEF', borderRadius: 10, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTabBtn: { backgroundColor: '#fff', elevation: 2 },
  tabText: { fontSize: 11, fontWeight: '600', color: '#6C757D' },
  activeTabText: { color: colors.primary, fontWeight: '700' },
  formCard: { backgroundColor: '#fff', padding: 16, borderRadius: 14, elevation: 2, marginBottom: 20 },
  formTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginBottom: 12 },
  input: { backgroundColor: '#F1F3F5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 10 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveBtn: { flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { backgroundColor: '#E9ECEF', padding: 12, borderRadius: 8, alignItems: 'center', paddingHorizontal: 16 },
  cancelBtnText: { color: '#495057', fontWeight: '600' },
  listHeading: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 10 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 8, elevation: 1 },
  thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#eee' },
  itemTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  itemSub: { fontSize: 12, color: '#6C757D', marginTop: 2 },
  actionButtons: { gap: 4 },
  editBtn: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  editBtnText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },
  deleteBtn: { backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  deleteBtnText: { color: '#C62828', fontSize: 11, fontWeight: '700' },
});