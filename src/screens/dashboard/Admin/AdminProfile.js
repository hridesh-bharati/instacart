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
  Alert,
  Platform,
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
  const [uploadingImage, setUploadingImage] = useState(false);

  // Store & Admin Profile Data States
  const [formData, setFormData] = useState({
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
          setFormData((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [currentUser]);

  // Gallery Picker (Instant Base64 - No CORS Error, No Hanging)
  const handlePickAvatar = async () => {
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
        aspect: [1, 1],
        quality: 0.4, // Fast payload size
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        const asset = result.assets[0];
        
        // Use optimized base64 Data URL for instant sync
        const imageUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        setFormData((prev) => ({ ...prev, avatar: imageUri }));

        // Update Firestore directly
        if (db && currentUser?.uid) {
          await setDoc(
            doc(db, 'adminSettings', currentUser.uid),
            { avatar: imageUri, updatedAt: serverTimestamp() },
            { merge: true }
          );
        }

        // Update Auth profile
        if (currentUser) {
          try {
            await updateProfile(currentUser, { photoURL: imageUri });
          } catch (e) {
            console.log('Auth photoURL skipped (size):', e.message);
          }
        }

        setUploadingImage(false);
      }
    } catch (err) {
      setUploadingImage(false);
      if (Platform.OS === 'web') alert('Selection Error: ' + err.message);
      else Alert.alert('Error', err.message);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: formData.name,
        });
      }

      if (db && currentUser?.uid) {
        await setDoc(
          doc(db, 'adminSettings', currentUser.uid),
          {
            ...formData,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setIsEditing(false);
      if (Platform.OS === 'web') alert('Admin Profile & Store Settings saved successfully!');
      else Alert.alert('Saved', 'Admin Profile & Store Settings saved successfully!');
    } catch (err) {
      if (Platform.OS === 'web') alert('Error: ' + err.message);
      else Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Dynamic Profile Hero Card */}
      <View style={styles.profileHeroCard}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                formData.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.changeAvatarBtn}
            onPress={handlePickAvatar}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={15} color="#fff" />
            )}
          </TouchableOpacity>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: formData.isStoreOpen ? '#10B981' : '#EF4444' },
            ]}
          />
        </View>

        {uploadingImage && (
          <Text style={styles.uploadProgressText}>Updating profile photo...</Text>
        )}

        <Text style={styles.adminName}>{formData.name}</Text>
        <Text style={styles.storeTaglineText}>{formData.storeName}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="shield-check" size={14} color={colors.primary} />
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
            size={16}
            color={isEditing ? '#DC2626' : colors.primary}
          />
          <Text style={[styles.editToggleBtnText, isEditing && { color: '#DC2626' }]}>
            {isEditing ? 'Cancel Editing' : 'Edit Full Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* EDIT MODE */}
      {isEditing ? (
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>Personal Info</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={formData.name}
            onChangeText={(t) => setFormData({ ...formData, name: t })}
            style={styles.input}
            placeholder="Your Name"
          />

          <Text style={styles.label}>Support Phone Number</Text>
          <TextInput
            value={formData.phone}
            onChangeText={(t) => setFormData({ ...formData, phone: t })}
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="+91..."
          />

          <Text style={[styles.cardHeaderTitle, { marginTop: 16 }]}>Store Operational Settings</Text>

          <Text style={styles.label}>Store Brand Name</Text>
          <TextInput
            value={formData.storeName}
            onChangeText={(t) => setFormData({ ...formData, storeName: t })}
            style={styles.input}
            placeholder="Instacart Grocery"
          />

          <Text style={styles.label}>Store Tagline / Subtitle</Text>
          <TextInput
            value={formData.storeTagline}
            onChangeText={(t) => setFormData({ ...formData, storeTagline: t })}
            style={styles.input}
            placeholder="15 Mins Express Delivery"
          />

          <Text style={styles.label}>Physical Warehouse / Hub Address</Text>
          <TextInput
            value={formData.address}
            onChangeText={(t) => setFormData({ ...formData, address: t })}
            style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            multiline
            placeholder="Full store address"
          />

          <Text style={styles.label}>Merchant UPI ID for Payouts</Text>
          <TextInput
            value={formData.upiId}
            onChangeText={(t) => setFormData({ ...formData, upiId: t })}
            style={styles.input}
            placeholder="yourupi@bank"
          />

          <Text style={styles.label}>Operating Hours</Text>
          <TextInput
            value={formData.operatingHours}
            onChangeText={(t) => setFormData({ ...formData, operatingHours: t })}
            style={styles.input}
            placeholder="07:00 AM - 11:00 PM"
          />

          <TouchableOpacity
            style={styles.saveSubmitBtn}
            onPress={handleSaveProfile}
            disabled={saving || uploadingImage}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.saveSubmitBtnText}>Save All Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        /* VIEW MODE */
        <>
          {/* Quick Operation Switches */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>Store Operations & Live Controls</Text>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrap}>
                <Ionicons name="storefront-outline" size={20} color={colors.primary} />
                <View>
                  <Text style={styles.switchTitle}>Accepting Orders</Text>
                  <Text style={styles.switchSubtitle}>Toggle store availability on User app</Text>
                </View>
              </View>
              <Switch
                value={formData.isStoreOpen}
                onValueChange={(val) => {
                  setFormData({ ...formData, isStoreOpen: val });
                  if (db && currentUser?.uid) {
                    setDoc(
                      doc(db, 'adminSettings', currentUser.uid),
                      { isStoreOpen: val },
                      { merge: true }
                    );
                  }
                }}
                trackColor={{ false: '#D1D5DB', true: '#BBF7D0' }}
                thumbColor={formData.isStoreOpen ? colors.primary : '#9CA3AF'}
              />
            </View>

            <View style={styles.switchDivider} />

            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrap}>
                <Ionicons name="flash-outline" size={20} color="#F59E0B" />
                <View>
                  <Text style={styles.switchTitle}>15-Min Instant Delivery</Text>
                  <Text style={styles.switchSubtitle}>Show express delivery tags on items</Text>
                </View>
              </View>
              <Switch
                value={formData.instantDelivery}
                onValueChange={(val) => {
                  setFormData({ ...formData, instantDelivery: val });
                  if (db && currentUser?.uid) {
                    setDoc(
                      doc(db, 'adminSettings', currentUser.uid),
                      { instantDelivery: val },
                      { merge: true }
                    );
                  }
                }}
                trackColor={{ false: '#D1D5DB', true: '#BBF7D0' }}
                thumbColor={formData.instantDelivery ? colors.primary : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Detailed Credentials Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>Store & Contact Details</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="mail-outline" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Admin Account Email</Text>
                <Text style={styles.infoValue}>{formData.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="call-outline" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Help & Support Hotline</Text>
                <Text style={styles.infoValue}>{formData.phone}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Central Fulfilment Hub</Text>
                <Text style={styles.infoValue}>{formData.address}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="card-outline" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Merchant Payout UPI</Text>
                <Text style={styles.infoValue}>{formData.upiId}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Store Working Hours</Text>
                <Text style={styles.infoValue}>{formData.operatingHours}</Text>
              </View>
            </View>
          </View>

          {/* System & Cloud Info */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>System Architecture</Text>
            <View style={styles.sysRow}>
              <Text style={styles.sysKey}>Database Cloud:</Text>
              <Text style={styles.sysVal}>Google Firestore Live</Text>
            </View>
            <View style={styles.sysRow}>
              <Text style={styles.sysKey}>Build Environment:</Text>
              <Text style={styles.sysVal}>Expo Native Runtime</Text>
            </View>
            <View style={styles.sysRow}>
              <Text style={styles.sysKey}>App Version:</Text>
              <Text style={styles.sysVal}>v2.4.0 (Production)</Text>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.logoutBtnText}>Sign Out from Console</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 110 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 },
  profileHeroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#F0FDF4',
    backgroundColor: '#eee',
  },
  changeAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  uploadProgressText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  adminName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
  },
  storeTaglineText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 14,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  storeStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  storeStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  editToggleBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  editToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  switchSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  switchDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 6,
  },
  saveSubmitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    gap: 6,
    marginTop: 18,
  },
  saveSubmitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  sysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sysKey: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sysVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
});