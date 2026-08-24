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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { updateProfile } from 'firebase/auth';
import colors from '../../constants/colors';

const SECTIONS = [
  { key: 'flashSale', label: 'Flash Sale' },
  { key: 'featuredStores', label: 'Featured Stores' },
  { key: 'dailyEssentials', label: 'Daily Essentials' },
];

export default function DashboardScreen() {
  // Navigation / Tab Switcher inside Dashboard
  const [activeMainTab, setActiveMainTab] = useState('Overview'); // 'Overview' | 'Products' | 'Orders' | 'Profile'

  // Accordion & Category states for Products
  const [activeSection, setActiveSection] = useState('flashSale');
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Form States for Products / Stores
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [tag, setTag] = useState('');
  const [rating, setRating] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(auth.currentUser?.displayName || 'Admin Hridesh');
  const [profileEmail, setProfileEmail] = useState(auth.currentUser?.email || 'admin@instacart.com');
  const [profilePhone, setProfilePhone] = useState('+91 7267995307');

  // Live Firestore Fetch for Products
  useEffect(() => {
    if (!db) return;
    setLoadingItems(true);
    resetProductForm();
    const unsubscribe = onSnapshot(collection(db, activeSection), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
      setLoadingItems(false);
    });
    return () => unsubscribe();
  }, [activeSection]);

  const resetProductForm = () => {
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

  // Product CRUD
  const handleSaveProduct = async () => {
    if (!title || !image) {
      Alert.alert('Validation', 'Name and Image URL are required.');
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
        tag: tag.trim() || 'Store',
        rating: rating.trim() || '4.8',
        deliveryTime: deliveryTime.trim() || '20-30 min',
      };
    } else {
      if (!price) {
        Alert.alert('Validation', 'Price is required.');
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
        Alert.alert('Success', 'Item updated successfully!');
      } else {
        await addDoc(collection(db, activeSection), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        Alert.alert('Success', 'Item added successfully!');
      }
      resetProductForm();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleEditProduct = (item) => {
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

  const handleDeleteProduct = (id) => {
    Alert.alert('Confirm Delete', 'Delete this item permanently?', [
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

  // Profile Save
  const handleSaveProfile = async () => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profileName,
        });
      }
      setIsEditingProfile(false);
      Alert.alert('Profile Updated', 'Admin details have been saved.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>Management Hub</Text>
          <Text style={styles.headerSub}>Admin Portal • Instacart Store</Text>
        </View>
        <TouchableOpacity style={styles.profileChip} onPress={() => setActiveMainTab('Profile')}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' }}
            style={styles.avatarMini}
          />
          <Text style={styles.profileChipText}>Admin</Text>
        </TouchableOpacity>
      </View>

      {/* Main Feature Tabs */}
      <View style={styles.navTabs}>
        {['Overview', 'Products', 'Orders', 'Profile'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.navTabBtn, activeMainTab === tab && styles.navTabBtnActive]}
            onPress={() => setActiveMainTab(tab)}
          >
            <Text style={[styles.navTabText, activeMainTab === tab && styles.navTabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeMainTab === 'Overview' && (
        <View>
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="currency-inr" size={26} color="#2E7D32" />
              <Text style={styles.kpiVal}>₹1,24,500</Text>
              <Text style={styles.kpiTxt}>Total Revenue</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="cart" size={26} color="#1565C0" />
              <Text style={styles.kpiVal}>428</Text>
              <Text style={styles.kpiTxt}>Total Orders</Text>
            </View>
          </View>

          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="people" size={26} color="#E65100" />
              <Text style={styles.kpiVal}>3,420</Text>
              <Text style={styles.kpiTxt}>Customers</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: '#F3E5F5' }]}>
              <MaterialCommunityIcons name="storefront" size={26} color="#7B1FA2" />
              <Text style={styles.kpiVal}>18</Text>
              <Text style={styles.kpiTxt}>Partner Outlets</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Quick Controls</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionPill} onPress={() => { setActiveMainTab('Products'); setActiveSection('flashSale'); }}>
                <Ionicons name="flash" size={18} color={colors.primary} />
                <Text style={styles.actionPillText}>Flash Sale</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionPill} onPress={() => { setActiveMainTab('Products'); setActiveSection('featuredStores'); }}>
                <Ionicons name="business" size={18} color={colors.primary} />
                <Text style={styles.actionPillText}>Add Store</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionPill} onPress={() => setActiveMainTab('Orders')}>
                <Ionicons name="receipt" size={18} color={colors.primary} />
                <Text style={styles.actionPillText}>Orders (4)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* TAB 2: PRODUCTS & CRUD ACCORDION */}
      {activeMainTab === 'Products' && (
        <View>
          {/* Sub Section Select */}
          <View style={styles.subTabs}>
            {SECTIONS.map((sec) => (
              <TouchableOpacity
                key={sec.key}
                style={[styles.subTabBtn, activeSection === sec.key && styles.subTabBtnActive]}
                onPress={() => setActiveSection(sec.key)}
              >
                <Text style={[styles.subTabText, activeSection === sec.key && styles.subTabTextActive]}>
                  {sec.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Create / Edit Form */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>
              {editingId ? 'Edit Record' : 'Add New'} ({SECTIONS.find((s) => s.key === activeSection)?.label})
            </Text>

            <TextInput
              placeholder={activeSection === 'featuredStores' ? 'Store Name' : 'Product Name'}
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
                  placeholder="Tag (e.g. Supermarket, Organic)"
                  value={tag}
                  onChangeText={setTag}
                  style={styles.input}
                />
                <View style={styles.inputRow}>
                  <TextInput
                    placeholder="Rating (4.8)"
                    value={rating}
                    onChangeText={setRating}
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1 }]}
                  />
                  <TextInput
                    placeholder="Delivery Time (20-30 min)"
                    value={deliveryTime}
                    onChangeText={setDeliveryTime}
                    style={[styles.input, { flex: 1 }]}
                  />
                </View>
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
                    placeholder="Old Price (₹ opt)"
                    value={oldPrice}
                    onChangeText={setOldPrice}
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1 }]}
                  />
                </View>
                <TextInput
                  placeholder="Unit (e.g. 1 kg, 500 ml)"
                  value={unit}
                  onChangeText={setUnit}
                  style={styles.input}
                />
              </>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProduct}>
                <Text style={styles.saveBtnText}>{editingId ? 'Update Item' : 'Add to Catalog'}</Text>
              </TouchableOpacity>
              {editingId && (
                <TouchableOpacity style={styles.cancelBtn} onPress={resetProductForm}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Records List */}
          <Text style={styles.sectionTitle}>Active Inventory ({items.length})</Text>
          {loadingItems ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Image source={{ uri: item.image }} style={styles.itemThumb} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text numberOfLines={1} style={styles.itemTitle}>{item.title || item.name}</Text>
                  {activeSection === 'featuredStores' ? (
                    <Text style={styles.itemSub}>{item.tag} • ⭐ {item.rating} • {item.deliveryTime}</Text>
                  ) : (
                    <Text style={styles.itemSub}>₹{item.price} • {item.unit}</Text>
                  )}
                </View>
                <View style={styles.actionIcons}>
                  <TouchableOpacity onPress={() => handleEditProduct(item)} style={styles.iconEdit}>
                    <Ionicons name="pencil" size={14} color="#2E7D32" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteProduct(item.id)} style={styles.iconDelete}>
                    <Ionicons name="trash" size={14} color="#C62828" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeMainTab === 'Orders' && (
        <View>
          <Text style={styles.sectionTitle}>Incoming & Active Orders</Text>
          
          {[
            { id: 'ORD-9812', user: 'Rahul Verma', total: 450, items: 3, status: 'Processing', color: '#F57C00' },
            { id: 'ORD-9811', user: 'Pooja Singh', total: 1120, items: 7, status: 'Shipped', color: '#1976D2' },
            { id: 'ORD-9810', user: 'Amit Sharma', total: 290, items: 2, status: 'Delivered', color: '#388E3C' },
          ].map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <View>
                  <Text style={styles.orderIdText}>{order.id}</Text>
                  <Text style={styles.orderCustomer}>{order.user} • {order.items} Items</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: `${order.color}15` }]}>
                  <Text style={[styles.statusText, { color: order.color }]}>{order.status}</Text>
                </View>
              </View>
              <View style={styles.orderDivider} />
              <View style={styles.orderBottom}>
                <Text style={styles.orderTotal}>Amount: ₹{order.total}</Text>
                <TouchableOpacity
                  style={styles.orderActionBtn}
                  onPress={() => Alert.alert('Action', `Update status for ${order.id}`)}
                >
                  <Text style={styles.orderActionText}>Update Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* TAB 4: PROFILE VIEW & EDIT */}
      {activeMainTab === 'Profile' && (
        <View>
          <View style={styles.profileHeaderCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }}
              style={styles.profileAvatarLarge}
            />
            <Text style={styles.profileNameText}>{profileName}</Text>
            <Text style={styles.profileRoleText}>Super Admin / Owner</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.profileCardTop}>
              <Text style={styles.cardHeading}>Account Information</Text>
              <TouchableOpacity onPress={() => setIsEditingProfile(!isEditingProfile)}>
                <Text style={styles.editToggleText}>{isEditingProfile ? 'Cancel' : 'Edit Details'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={profileName}
                onChangeText={setProfileName}
                editable={isEditingProfile}
                style={[styles.input, !isEditingProfile && styles.inputDisabled]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={profileEmail}
                onChangeText={setProfileEmail}
                editable={false}
                style={[styles.input, styles.inputDisabled]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Support Phone</Text>
              <TextInput
                value={profilePhone}
                onChangeText={setProfilePhone}
                editable={isEditingProfile}
                style={[styles.input, !isEditingProfile && styles.inputDisabled]}
              />
            </View>

            {isEditingProfile && (
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save Profile Changes</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Security & System Info */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>System Info</Text>
            <Text style={styles.systemInfoText}>Version: 1.0.0 (Production Build)</Text>
            <Text style={styles.systemInfoText}>Database: Google Firebase Cloud</Text>
            <Text style={styles.systemInfoText}>Environment: Expo Managed App</Text>
          </View>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.primary },
  headerSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  profileChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', gap: 6 },
  avatarMini: { width: 26, height: 26, borderRadius: 13 },
  profileChipText: { fontSize: 12, fontWeight: '700', color: colors.primary, paddingRight: 4 },
  
  navTabs: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 12, padding: 4, marginBottom: 18 },
  navTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  navTabBtnActive: { backgroundColor: '#fff', elevation: 2 },
  navTabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  navTabTextActive: { color: colors.primary, fontWeight: '800' },

  kpiGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  kpiVal: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginTop: 6 },
  kpiTxt: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  cardHeading: { fontSize: 15, fontWeight: '800', color: colors.textDark, marginBottom: 12 },
  quickActions: { flexDirection: 'row', gap: 10 },
  actionPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', paddingVertical: 10, borderRadius: 8, gap: 6 },
  actionPillText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  subTabs: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 8, padding: 3, marginBottom: 14 },
  subTabBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
  subTabBtnActive: { backgroundColor: '#fff' },
  subTabText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  subTabTextActive: { color: colors.primary, fontWeight: '700' },

  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, marginBottom: 10 },
  inputDisabled: { backgroundColor: '#F3F4F6', color: '#9CA3AF' },
  inputRow: { flexDirection: 'row', gap: 10 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveBtn: { flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  cancelBtn: { backgroundColor: '#E5E7EB', padding: 12, borderRadius: 8, alignItems: 'center', paddingHorizontal: 16 },
  cancelBtnText: { color: '#374151', fontWeight: '700' },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textDark, marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  itemThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#eee' },
  itemTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  itemSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  actionIcons: { flexDirection: 'row', gap: 6 },
  iconEdit: { backgroundColor: '#DCFCE7', padding: 8, borderRadius: 6 },
  iconDelete: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 6 },

  orderCard: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderIdText: { fontSize: 14, fontWeight: '800', color: colors.textDark },
  orderCustomer: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 14, fontWeight: '800', color: colors.primary },
  orderActionBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  orderActionText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  profileHeaderCard: { backgroundColor: '#fff', alignItems: 'center', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  profileAvatarLarge: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  profileNameText: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  profileRoleText: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 2 },
  profileCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  editToggleText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  formGroup: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 4 },
  systemInfoText: { fontSize: 12, color: '#6B7280', marginVertical: 2 },
});