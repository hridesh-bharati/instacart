import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Platform,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { updateProfile, signOut } from 'firebase/auth';
import colors from '../../constants/colors';

const SECTIONS = [
  { key: 'flashSale', label: 'Flash Sale', icon: 'flash-outline' },
  { key: 'dailyEssentials', label: 'Daily Essentials', icon: 'basket-outline' },
  { key: 'browseCategories', label: 'Browse Tabs', icon: 'grid-outline' },
  { key: 'featuredStores', label: 'Stores', icon: 'storefront-outline' },
];

export default function DashboardScreen() {
  const currentUser = auth.currentUser;

  const [activeMainTab, setActiveMainTab] = useState('Products');
  const [activeSection, setActiveSection] = useState('flashSale');

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Global Loading States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [rating, setRating] = useState('');
  const [reviewsCount, setReviewsCount] = useState('');
  const [description, setDescription] = useState('');
  const [countLabel, setCountLabel] = useState('');
  const [iconName, setIconName] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [tag, setTag] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Profile Data
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.displayName || 'Admin User',
    email: currentUser?.email || 'admin@instacart.com',
    phone: '+91 7267995307',
    avatar:
      currentUser?.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    storeName: 'Instacart Supermarket',
    storeTagline: 'Fresh Groceries Delivered in 15 Mins',
    address: 'Nichlaul, Maharajganj, Uttar Pradesh, 273304',
    upiId: '7267995307@upi',
    operatingHours: '07:00 AM - 11:00 PM',
    isStoreOpen: true,
    instantDelivery: true,
  });

  // 1. Live Sync
  useEffect(() => {
    if (!db) return;
    setLoadingItems(true);
    const unsubscribe = onSnapshot(collection(db, activeSection), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
      setLoadingItems(false);
    });
    return () => unsubscribe();
  }, [activeSection]);

  // 2. Load Profile
  useEffect(() => {
    async function loadSettings() {
      if (!db || !currentUser?.uid) return;
      try {
        const docRef = doc(db, 'adminSettings', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        console.error('Settings load error:', err);
      }
    }
    loadSettings();
  }, [currentUser]);

  // Fast & CORS-Proof Gallery Image Picker
  const handlePickFile = async (isAvatar = false) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        if (Platform.OS === 'web') alert('Permission to access device media is required!');
        else Alert.alert('Permission Denied', 'Permission to access device media is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: isAvatar ? [1, 1] : [4, 3],
        quality: 0.4, // Lightweight base64 for fast rendering
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingImage(true);
        setLoadingMessage(isAvatar ? 'Updating Profile Avatar...' : 'Loading Image Preview...');

        const imageUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        if (isAvatar) {
          setProfileData((prev) => ({ ...prev, avatar: imageUri }));
          if (db && currentUser?.uid) {
            await setDoc(
              doc(db, 'adminSettings', currentUser.uid),
              { avatar: imageUri, updatedAt: serverTimestamp() },
              { merge: true }
            );
          }
        } else {
          setImage(imageUri);
        }

        setUploadingImage(false);
        setLoadingMessage('');
      }
    } catch (err) {
      setUploadingImage(false);
      setLoadingMessage('');
      if (Platform.OS === 'web') alert('File Selection Error: ' + err.message);
      else Alert.alert('Error', err.message);
    }
  };

  const resetForm = () => {
    setTitle('');
    setImage('');
    setBrand('');
    setCategory('');
    setPrice('');
    setOldPrice('');
    setUnit('');
    setRating('');
    setReviewsCount('');
    setDescription('');
    setCountLabel('');
    setIconName('');
    setBgColor('');
    setTag('');
    setDeliveryTime('');
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setTitle(item.name || item.title || '');
    setImage(item.image || '');

    if (activeSection === 'browseCategories') {
      setCountLabel(item.count || '');
      setIconName(item.icon || '');
      setBgColor(item.bgColor || '');
    } else if (activeSection === 'featuredStores') {
      setTag(item.tag || '');
      setRating(String(item.rating || ''));
      setDeliveryTime(item.deliveryTime || '');
    } else {
      setBrand(item.brand || '');
      setCategory(item.category || '');
      setPrice(String(item.price || ''));
      setOldPrice(item.oldPrice ? String(item.oldPrice) : '');
      setUnit(item.unit || item.weight || '');
      setRating(String(item.rating || ''));
      setReviewsCount(item.reviewsCount || '');
      setDescription(item.description || '');
    }
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!title) {
      if (Platform.OS === 'web') alert('Title / Name is required');
      else Alert.alert('Validation Error', 'Title / Name is required');
      return;
    }

    setSavingProduct(true);
    setLoadingMessage(editingId ? 'Updating in Cloud...' : 'Publishing to live store...');

    let payload = { updatedAt: serverTimestamp() };

    if (activeSection === 'browseCategories') {
      payload = {
        ...payload,
        title: title.trim(),
        count: countLabel.trim() || '100+ items',
        icon: iconName.trim() || 'basket',
        bgColor: bgColor.trim() || '#FFF3E0',
      };
    } else if (activeSection === 'featuredStores') {
      if (!image) {
        setSavingProduct(false);
        if (Platform.OS === 'web') alert('Please select a store image file');
        else Alert.alert('Validation Error', 'Please select a store image file');
        return;
      }
      payload = {
        ...payload,
        name: title.trim(),
        image: image,
        tag: tag.trim() || 'Supermarket',
        rating: rating.trim() || '4.8',
        deliveryTime: deliveryTime.trim() || '20-30 min',
      };
    } else {
      if (!price) {
        setSavingProduct(false);
        if (Platform.OS === 'web') alert('Price is required');
        else Alert.alert('Validation Error', 'Price is required');
        return;
      }
      if (!image) {
        setSavingProduct(false);
        if (Platform.OS === 'web') alert('Please select a product image file');
        else Alert.alert('Validation Error', 'Please select a product image file');
        return;
      }
      payload = {
        ...payload,
        name: title.trim(),
        title: title.trim(),
        image: image,
        brand: brand.trim() || 'Fresh',
        category: category.trim() || 'Grocery',
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        unit: unit.trim() || '1 unit',
        rating: rating.trim() || '4.5',
        reviewsCount: reviewsCount.trim() || '100+ reviews',
        description: description.trim() || 'Fresh and high-grade grocery product.',
      };
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, activeSection, editingId), payload);
      } else {
        await addDoc(collection(db, activeSection), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setModalVisible(false);
      resetForm();
    } catch (err) {
      if (Platform.OS === 'web') alert('Error: ' + err.message);
      else Alert.alert('Error', err.message);
    } finally {
      setSavingProduct(false);
      setLoadingMessage('');
    }
  };

  const executeDelete = async (id) => {
    try {
      await deleteDoc(doc(db, activeSection, id));
    } catch (err) {
      if (Platform.OS === 'web') alert('Delete Failed: ' + err.message);
      else Alert.alert('Delete Failed', err.message);
    }
  };

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this record permanently?')) {
        executeDelete(id);
      }
    } else {
      Alert.alert('Delete Confirmation', 'Delete this record permanently?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => executeDelete(id) },
      ]);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setLoadingMessage('Saving store settings...');
    try {
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: profileData.name,
        });
      }
      if (db && currentUser?.uid) {
        await setDoc(
          doc(db, 'adminSettings', currentUser.uid),
          {
            ...profileData,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      setIsEditingProfile(false);
      if (Platform.OS === 'web') alert('Profile & Settings saved successfully!');
      else Alert.alert('Saved', 'Profile & Settings saved successfully!');
    } catch (err) {
      if (Platform.OS === 'web') alert('Error: ' + err.message);
      else Alert.alert('Error', err.message);
    } finally {
      setSavingProfile(false);
      setLoadingMessage('');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      Alert.alert('Sign Out Error', err.message);
    }
  };

  const filteredItems = items.filter((it) =>
    (it.title || it.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Full-Screen Loading Feedback */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={uploadingImage || savingProduct || savingProfile}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingTitle}>{loadingMessage || 'Processing Request...'}</Text>
          </View>
        </View>
      </Modal>

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>Store Hub</Text>
          <Text style={styles.headerSub}>Control Panel & Real-time Catalog</Text>
        </View>
        <TouchableOpacity style={styles.profileChip} onPress={() => setActiveMainTab('Profile')}>
          <Image source={{ uri: profileData.avatar }} style={styles.avatarMini} />
          <Text style={styles.profileChipText}>{profileData.name.split(' ')[0]}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Tabs Navigation */}
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

      {/* 1. PRODUCTS TAB */}
      {activeMainTab === 'Products' && (
        <View style={{ flex: 1 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.subTabsScroll}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.key;
              return (
                <TouchableOpacity
                  key={sec.key}
                  style={[styles.subTabPill, isActive && styles.subTabPillActive]}
                  onPress={() => {
                    setActiveSection(sec.key);
                    setSearchQuery('');
                  }}
                >
                  <Ionicons name={sec.icon} size={15} color={isActive ? '#fff' : colors.textDark} />
                  <Text style={[styles.subTabPillText, isActive && styles.subTabPillTextActive]}>
                    {sec.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.actionRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color={colors.textMuted} />
              <TextInput
                placeholder={`Search in ${SECTIONS.find((s) => s.key === activeSection)?.label}...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity style={styles.addPrimaryBtn} onPress={handleOpenAddModal}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addPrimaryBtnText}>New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listHeaderRow}>
            <Text style={styles.listHeaderTitle}>
              {SECTIONS.find((s) => s.key === activeSection)?.label} Catalog
            </Text>
            <Text style={styles.listHeaderCount}>{filteredItems.length} Records</Text>
          </View>

          {loadingItems ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 30 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
              {filteredItems.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="cube-outline" size={44} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>No entries found</Text>
                  <Text style={styles.emptySub}>Tap "+ New" button to add an item.</Text>
                </View>
              ) : (
                filteredItems.map((item) => (
                  <View key={item.id} style={styles.catalogCard}>
                    {activeSection === 'browseCategories' ? (
                      <View style={[styles.catIconBox, { backgroundColor: item.bgColor || '#FFF3E0' }]}>
                        <MaterialCommunityIcons name={item.icon || 'basket'} size={22} color={colors.primary} />
                      </View>
                    ) : (
                      <Image source={{ uri: item.image }} style={styles.itemThumb} />
                    )}

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.name || item.title}
                      </Text>
                      <Text style={styles.itemMeta}>
                        {activeSection === 'browseCategories'
                          ? item.count
                          : activeSection === 'featuredStores'
                          ? `${item.tag} • ⭐ ${item.rating}`
                          : `₹${item.price} • ${item.unit || '1 unit'}`}
                      </Text>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.editPill} onPress={() => handleOpenEditModal(item)}>
                        <Ionicons name="pencil" size={14} color="#166534" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deletePill} onPress={() => handleDelete(item.id)}>
                        <Ionicons name="trash-outline" size={14} color="#991B1B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* 2. OVERVIEW TAB */}
      {activeMainTab === 'Overview' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="currency-inr" size={24} color="#2E7D32" />
              <Text style={styles.kpiVal}>₹1,24,500</Text>
              <Text style={styles.kpiTxt}>Total Revenue</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="cart-outline" size={24} color="#1565C0" />
              <Text style={styles.kpiVal}>428</Text>
              <Text style={styles.kpiTxt}>Total Orders</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* 3. ORDERS TAB */}
      {activeMainTab === 'Orders' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.listHeaderTitle}>Active Customer Orders (2)</Text>
          {[
            { id: 'ORD-9812', user: 'Rahul Verma', total: 450, items: 3, status: 'Processing', color: '#F57C00' },
            { id: 'ORD-9811', user: 'Pooja Singh', total: 1120, items: 7, status: 'Shipped', color: '#1976D2' },
          ].map((ord) => (
            <View key={ord.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <View>
                  <Text style={styles.orderId}>{ord.id}</Text>
                  <Text style={styles.orderUser}>{ord.user} • {ord.items} Items</Text>
                </View>
                <View style={[styles.orderBadge, { backgroundColor: `${ord.color}15` }]}>
                  <Text style={[styles.orderBadgeText, { color: ord.color }]}>{ord.status}</Text>
                </View>
              </View>
              <View style={styles.orderBottom}>
                <Text style={styles.orderTotal}>₹{ord.total}.00</Text>
                <TouchableOpacity style={styles.orderActionBtn} onPress={() => alert(`Status updated for ${ord.id}`)}>
                  <Text style={styles.orderActionBtnText}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 4. PROFILE & STORE SETTINGS */}
      {activeMainTab === 'Profile' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.profileHeroCard}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: profileData.avatar }} style={styles.profileImage} />
              <TouchableOpacity
                style={styles.changeAvatarBtn}
                onPress={() => handlePickFile(true)}
              >
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.adminName}>{profileData.name}</Text>
            <Text style={styles.storeTaglineText}>{profileData.storeName}</Text>

            <TouchableOpacity
              style={[styles.editToggleBtn, isEditingProfile && styles.editToggleBtnActive]}
              onPress={() => setIsEditingProfile(!isEditingProfile)}
            >
              <Ionicons
                name={isEditingProfile ? 'close-circle-outline' : 'create-outline'}
                size={16}
                color={isEditingProfile ? '#DC2626' : colors.primary}
              />
              <Text style={[styles.editToggleBtnText, isEditingProfile && { color: '#DC2626' }]}>
                {isEditingProfile ? 'Cancel Editing' : 'Edit Profile & Settings'}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingProfile ? (
            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>Personal Info</Text>

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={profileData.name}
                onChangeText={(t) => setProfileData({ ...profileData, name: t })}
                style={styles.input}
              />

              <Text style={styles.label}>Support Phone</Text>
              <TextInput
                value={profileData.phone}
                onChangeText={(t) => setProfileData({ ...profileData, phone: t })}
                style={styles.input}
                keyboardType="phone-pad"
              />

              <Text style={[styles.cardHeaderTitle, { marginTop: 14 }]}>Store Settings</Text>

              <Text style={styles.label}>Store Name</Text>
              <TextInput
                value={profileData.storeName}
                onChangeText={(t) => setProfileData({ ...profileData, storeName: t })}
                style={styles.input}
              />

              <Text style={styles.label}>Warehouse Address</Text>
              <TextInput
                value={profileData.address}
                onChangeText={(t) => setProfileData({ ...profileData, address: t })}
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                multiline
              />

              <TouchableOpacity
                style={styles.saveSubmitBtn}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveSubmitBtnText}>Save All Settings</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardHeaderTitle}>Live Store Controls</Text>
                <View style={styles.switchRow}>
                  <View style={styles.switchLabelWrap}>
                    <Ionicons name="storefront-outline" size={20} color={colors.primary} />
                    <View>
                      <Text style={styles.switchTitle}>Accepting Orders</Text>
                      <Text style={styles.switchSubtitle}>Toggle store online/offline</Text>
                    </View>
                  </View>
                  <Switch
                    value={profileData.isStoreOpen}
                    onValueChange={(val) => {
                      setProfileData({ ...profileData, isStoreOpen: val });
                      if (db && currentUser?.uid) {
                        setDoc(
                          doc(db, 'adminSettings', currentUser.uid),
                          { isStoreOpen: val },
                          { merge: true }
                        );
                      }
                    }}
                    trackColor={{ false: '#D1D5DB', true: '#BBF7D0' }}
                    thumbColor={profileData.isStoreOpen ? colors.primary : '#9CA3AF'}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                <Text style={styles.logoutBtnText}>Sign Out from Console</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      {/* POPUP MODAL WITH FILE PICKER */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Entry' : 'Add New Entry'} ({SECTIONS.find((s) => s.key === activeSection)?.label})
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              {/* IMAGE FILE PICKER */}
              {activeSection !== 'browseCategories' && (
                <View style={styles.filePickerContainer}>
                  <Text style={styles.inputLabel}>Product / Store Image File *</Text>
                  
                  <TouchableOpacity
                    style={styles.fileUploadBox}
                    onPress={() => handlePickFile(false)}
                  >
                    {image ? (
                      <View style={styles.previewWrap}>
                        <Image source={{ uri: image }} style={styles.pickedImagePreview} />
                        <View style={styles.changeOverlay}>
                          <Ionicons name="camera-reverse-outline" size={16} color="#fff" />
                          <Text style={styles.changeOverlayText}>Change Image</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.placeholderBox}>
                        <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
                        <Text style={styles.uploadBoxTitle}>Tap to Choose File from Device</Text>
                        <Text style={styles.uploadBoxSub}>Instant Upload to Cloud</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.inputLabel}>Title / Name *</Text>
              <TextInput
                placeholder="Product or Store Title"
                value={title}
                onChangeText={setTitle}
                style={styles.modalInput}
              />

              {activeSection === 'browseCategories' ? (
                <>
                  <Text style={styles.inputLabel}>Items Count Label</Text>
                  <TextInput
                    placeholder="e.g. 1,240 items"
                    value={countLabel}
                    onChangeText={setCountLabel}
                    style={styles.modalInput}
                  />
                  <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Icon Name</Text>
                      <TextInput
                        placeholder="basket, egg, food"
                        value={iconName}
                        onChangeText={setIconName}
                        style={styles.modalInput}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Background Color</Text>
                      <TextInput
                        placeholder="#FFF3E0"
                        value={bgColor}
                        onChangeText={setBgColor}
                        style={styles.modalInput}
                      />
                    </View>
                  </View>
                </>
              ) : activeSection === 'featuredStores' ? (
                <>
                  <Text style={styles.inputLabel}>Category Tag</Text>
                  <TextInput
                    placeholder="Supermarket, Organic"
                    value={tag}
                    onChangeText={setTag}
                    style={styles.modalInput}
                  />
                  <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Rating</Text>
                      <TextInput
                        placeholder="4.8"
                        value={rating}
                        onChangeText={setRating}
                        keyboardType="numeric"
                        style={styles.modalInput}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Delivery Time</Text>
                      <TextInput
                        placeholder="20 min"
                        value={deliveryTime}
                        onChangeText={setDeliveryTime}
                        style={styles.modalInput}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Brand</Text>
                      <TextInput
                        placeholder="Brand Name"
                        value={brand}
                        onChangeText={setBrand}
                        style={styles.modalInput}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Category Tag</Text>
                      <TextInput
                        placeholder="Grocery, Bakery"
                        value={category}
                        onChangeText={setCategory}
                        style={styles.modalInput}
                      />
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Selling Price (₹) *</Text>
                      <TextInput
                        placeholder="₹ Price"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        style={styles.modalInput}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>MRP Price (₹ opt)</Text>
                      <TextInput
                        placeholder="Original Price"
                        value={oldPrice}
                        onChangeText={setOldPrice}
                        keyboardType="numeric"
                        style={styles.modalInput}
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Unit / Weight</Text>
                  <TextInput
                    placeholder="1 kg, 500 ml, 1 unit"
                    value={unit}
                    onChangeText={setUnit}
                    style={styles.modalInput}
                  />

                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    placeholder="Product details..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={2}
                    style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]}
                  />
                </>
              )}

              <TouchableOpacity style={styles.saveSubmitBtn} onPress={handleSaveProduct}>
                <Text style={styles.saveSubmitBtnText}>
                  {editingId ? 'Update in Cloud' : 'Publish to Live App'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 16, paddingTop: 10 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.primary },
  headerSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  profileChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 4, paddingRight: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', gap: 6 },
  avatarMini: { width: 26, height: 26, borderRadius: 13 },
  profileChipText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  navTabs: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 10, padding: 3, marginBottom: 12 },
  navTabBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 8 },
  navTabBtnActive: { backgroundColor: '#fff', elevation: 1 },
  navTabText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  navTabTextActive: { color: colors.primary, fontWeight: '800' },

  subTabsScroll: { maxHeight: 40, marginBottom: 10 },
  subTabPill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB', gap: 5 },
  subTabPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  subTabPillText: { fontSize: 11, fontWeight: '600', color: colors.textDark },
  subTabPillTextActive: { color: '#fff', fontWeight: '700' },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, height: 40, borderWidth: 1, borderColor: '#E5E7EB', gap: 6 },
  searchInput: { flex: 1, fontSize: 12, color: colors.textDark },
  addPrimaryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, height: 40, paddingHorizontal: 14, borderRadius: 10, gap: 4 },
  addPrimaryBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  listHeaderTitle: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  listHeaderCount: { fontSize: 11, color: colors.textMuted },

  catalogCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EFEFEF', elevation: 1 },
  itemThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#eee' },
  catIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  itemMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 6 },
  editPill: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  deletePill: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },

  emptyCard: { backgroundColor: '#fff', borderRadius: 14, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF', marginTop: 20 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  emptySub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  kpiGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  kpiCard: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  kpiVal: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginTop: 4 },
  kpiTxt: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EFEFEF' },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  orderBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  orderBadgeText: { fontSize: 10, fontWeight: '700' },
  orderUser: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  orderTotal: { fontSize: 13, fontWeight: '800', color: colors.primary },
  orderActionBtn: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  orderActionBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  profileHeroCard: { backgroundColor: '#fff', borderRadius: 20, padding: 22, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', elevation: 2 },
  avatarWrapper: { position: 'relative', marginBottom: 10 },
  profileImage: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: '#F0FDF4' },
  changeAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  adminName: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  storeTaglineText: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  editToggleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, gap: 5, marginTop: 10 },
  editToggleBtnActive: { backgroundColor: '#FEE2E2' },
  editToggleBtnText: { fontSize: 11, fontWeight: '700', color: colors.primary },

  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeaderTitle: { fontSize: 13, fontWeight: '800', color: colors.textDark, marginBottom: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchTitle: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  switchSubtitle: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  label: { fontSize: 11, fontWeight: '700', color: '#4B5563', marginBottom: 4, marginTop: 6 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, height: 38, fontSize: 12, color: colors.textDark, marginBottom: 6 },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, gap: 6, marginTop: 6 },
  logoutBtnText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },

  // Modal Sheet & File Picker UI
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  modalCloseBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  
  filePickerContainer: { marginBottom: 12 },
  fileUploadBox: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#D1D5DB', borderStyle: 'dashed', borderRadius: 12, minHeight: 110, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  placeholderBox: { alignItems: 'center', padding: 14 },
  uploadBoxTitle: { fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 6 },
  uploadBoxSub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  previewWrap: { width: '100%', height: 130, position: 'relative' },
  pickedImagePreview: { width: '100%', height: 130 },
  changeOverlay: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.65)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  changeOverlayText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  inputLabel: { fontSize: 11, fontWeight: '700', color: '#4B5563', marginBottom: 4 },
  modalInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, height: 38, fontSize: 12, marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8 },
  saveSubmitBtn: { backgroundColor: colors.primary, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveSubmitBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // Loading Overlay
  loadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  loadingCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, alignItems: 'center', width: '80%', maxWidth: 280 },
  loadingTitle: { fontSize: 13, fontWeight: '700', color: colors.textDark, marginTop: 12, textAlign: 'center' },
});