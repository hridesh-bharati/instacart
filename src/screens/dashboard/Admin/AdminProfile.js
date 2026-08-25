import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile, signOut } from 'firebase/auth';
import { auth, db } from '../../../firebaseConfig';
import colors from '../../../constants/colors';

export default function AdminProfile({ onLogout }) {
  const currentUser = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Complete Store & Profile State
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || 'Admin Hridesh',
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

  // Fetch Live Profile from Firestore
  useEffect(() => {
    async function loadAdminData() {
      if (!db || !currentUser?.uid) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'adminSettings', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          setFormData((prev) => ({
            ...prev,
            ...cloudData,
            name: cloudData.name || currentUser?.displayName || prev.name,
            email: currentUser?.email || prev.email,
            avatar: cloudData.avatar || currentUser?.photoURL || prev.avatar,
          }));
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [currentUser]);

  // Fast Base64 Avatar Picker (Instant, No CORS Freeze)
  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        if (Platform.OS === 'web') alert('Gallery access required');
        else Alert.alert('Permission Denied', 'Gallery access required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.35,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingAvatar(true);

        const imageUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        setFormData((prev) => ({ ...prev, avatar: imageUri }));

        if (db && currentUser?.uid) {
          await setDoc(
            doc(db, 'adminSettings', currentUser.uid),
            { avatar: imageUri, updatedAt: serverTimestamp() },
            { merge: true }
          );
        }

        setUploadingAvatar(false);
      }
    } catch (err) {
      setUploadingAvatar(false);
      if (Platform.OS === 'web') alert('Avatar upload error: ' + err.message);
      else Alert.alert('Error', err.message);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName: formData.name });
      }

      if (db && currentUser?.uid) {
        await setDoc(
          doc(db, 'adminSettings', currentUser.uid),
          { ...formData, updatedAt: serverTimestamp() },
          { merge: true }
        );
      }

      setIsEditing(false);
    } catch (err) {
      if (Platform.OS === 'web') alert('Error: ' + err.message);
      else Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStoreStatus = async (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (db && currentUser?.uid) {
      try {
        await setDoc(
          doc(db, 'adminSettings', currentUser.uid),
          { [key]: value, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch (e) {
        console.error('Toggle error:', e);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      if (onLogout) onLogout();
    } catch (err) {
      Alert.alert('Sign Out Error', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      
      {/* 1. HERO PROFILE CARD */}
      <View style={styles.profileHeroCard}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: formData.avatar }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.changeAvatarBtn}
            onPress={handlePickAvatar}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={14} color="#fff" />
            )}
          </TouchableOpacity>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: formData.isStoreOpen ? '#10B981' : '#EF4444' },
            ]}
          />
        </View>

        <Text style={styles.adminName}>{formData.name}</Text>
        <Text style={styles.storeTaglineText}>{formData.storeName}</Text>
        <Text style={styles.storeSubTag}>{formData.storeTagline}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="shield-check" size={13} color={colors.primary} />
            <Text style={styles.roleBadgeText}>Super Admin</Text>
          </View>
          <View
            style={[
              styles.storeStatusBadge,
              { backgroundColor: formData.isStoreOpen ? '#ECFDF5' : '#FEF2F2' },
            ]}
          >
            <Text
              style={[
                styles.storeStatusText,
                { color: formData.isStoreOpen ? '#059669' : '#DC2626' },
              ]}
            >
              {formData.isStoreOpen ? 'Store Online' : 'Store Closed'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.editToggleBtn, isEditing && styles.editToggleBtnActive]}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons
            name={isEditing ? 'close-circle-outline' : 'create-outline'}
            size={15}
            color={isEditing ? '#DC2626' : colors.primary}
          />
          <Text style={[styles.editToggleBtnText, isEditing && { color: '#DC2626' }]}>
            {isEditing ? 'Cancel Editing' : 'Edit Full Store Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. EDIT FORM */}
      {isEditing ? (
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Personal Credentials</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={formData.name}
            onChangeText={(t) => setFormData({ ...formData, name: t })}
            style={styles.input}
            placeholder="Admin Full Name"
          />

          <Text style={styles.label}>Help & Support Contact</Text>
          <TextInput
            value={formData.phone}
            onChangeText={(t) => setFormData({ ...formData, phone: t })}
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="+91..."
          />

          <Text style={[styles.cardHeaderTitle, { marginTop: 14 }]}>Store Setup & Logistics</Text>

          <Text style={styles.label}>Store Display Name</Text>
          <TextInput
            value={formData.storeName}
            onChangeText={(t) => setFormData({ ...formData, storeName: t })}
            style={styles.input}
            placeholder="Store Name"
          />

          <Text style={styles.label}>Tagline / Promotional Line</Text>
          <TextInput
            value={formData.storeTagline}
            onChangeText={(t) => setFormData({ ...formData, storeTagline: t })}
            style={styles.input}
            placeholder="Express Delivery in 15 mins"
          />

          <Text style={styles.label}>Hub / Warehouse Address</Text>
          <TextInput
            value={formData.address}
            onChangeText={(t) => setFormData({ ...formData, address: t })}
            style={[styles.input, { height: 55, textAlignVertical: 'top' }]}
            multiline
            placeholder="Complete address"
          />

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>UPI ID (Payouts)</Text>
              <TextInput
                value={formData.upiId}
                onChangeText={(t) => setFormData({ ...formData, upiId: t })}
                style={styles.input}
                placeholder="upi@bank"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Working Hours</Text>
              <TextInput
                value={formData.operatingHours}
                onChangeText={(t) => setFormData({ ...formData, operatingHours: t })}
                style={styles.input}
                placeholder="7 AM - 11 PM"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveSubmitBtn}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={17} color="#fff" />
                <Text style={styles.saveSubmitBtnText}>Save Profile Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        /* 3. VIEW MODE: COMPLETE DETAILS LIST */
        <>
          {/* Live Store Controls */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>Live Store Controls</Text>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrap}>
                <Ionicons name="storefront-outline" size={18} color={colors.primary} />
                <View>
                  <Text style={styles.switchTitle}>Accepting Orders</Text>
                  <Text style={styles.switchSubtitle}>Show store as open to customers</Text>
                </View>
              </View>
              <Switch
                value={formData.isStoreOpen}
                onValueChange={(val) => handleToggleStoreStatus('isStoreOpen', val)}
                trackColor={{ false: '#D1D5DB', true: '#BBF7D0' }}
                thumbColor={formData.isStoreOpen ? colors.primary : '#9CA3AF'}
              />
            </View>

            <View style={styles.switchDivider} />

            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrap}>
                <Ionicons name="flash-outline" size={18} color="#F59E0B" />
                <View>
                  <Text style={styles.switchTitle}>15-Min Instant Delivery</Text>
                  <Text style={styles.switchSubtitle}>Express badge on items</Text>
                </View>
              </View>
              <Switch
                value={formData.instantDelivery}
                onValueChange={(val) => handleToggleStoreStatus('instantDelivery', val)}
                trackColor={{ false: '#D1D5DB', true: '#BBF7D0' }}
                thumbColor={formData.instantDelivery ? colors.primary : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Detailed Info Cards */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>Store & Contact Credentials</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="mail-outline" size={15} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Admin Account Email</Text>
                <Text style={styles.infoValue}>{formData.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="call-outline" size={15} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Support Hotline Phone</Text>
                <Text style={styles.infoValue}>{formData.phone}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="location-outline" size={15} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Main Hub / Warehouse</Text>
                <Text style={styles.infoValue}>{formData.address}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="card-outline" size={15} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Merchant Payout UPI</Text>
                <Text style={styles.infoValue}>{formData.upiId}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="time-outline" size={15} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Daily Operating Hours</Text>
                <Text style={styles.infoValue}>{formData.operatingHours}</Text>
              </View>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={17} color="#DC2626" />
            <Text style={styles.logoutBtnText}>Sign Out from Console</Text>
          </TouchableOpacity>
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 90 },
  centerContainer: { padding: 40, alignItems: 'center' },
  profileHeroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#F0FDF4',
    backgroundColor: '#eee',
  },
  changeAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  adminName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
  },
  storeTaglineText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  storeSubTag: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  storeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  storeStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 5,
  },
  editToggleBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  editToggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textDark,
  },
  switchSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
  },
  switchDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  infoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
    marginTop: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 3,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: colors.textDark,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveSubmitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
    borderRadius: 10,
    gap: 6,
    marginTop: 12,
  },
  saveSubmitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
});