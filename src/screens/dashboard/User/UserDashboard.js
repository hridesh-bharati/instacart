import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateUserProfile, logoutUser } from '../../../services/api';
import colors from '../../../constants/colors';

export default function UserDashboard({ profile, uid }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const handleSave = async () => {
    try {
      await updateUserProfile(uid, { ...profile, ...formData });
      setIsEditing(false);
      Alert.alert('Saved', 'Profile details updated.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Customer Hub</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>8</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>$32.00</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>2</Text>
          <Text style={styles.statLabel}>Coupons</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>My Details</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons
              name={isEditing ? 'close-circle-outline' : 'create-outline'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View>
            <TextInput
              placeholder="Name"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone"
              value={formData.phone}
              onChangeText={(t) => setFormData({ ...formData, phone: t })}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              placeholder="Delivery Address"
              value={formData.address}
              onChangeText={(t) => setFormData({ ...formData, address: t })}
              style={styles.input}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.val}>{profile?.name || 'Shopper'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.val}>{profile?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.val}>{profile?.phone || 'Add phone'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.val}>{profile?.address || 'Add delivery address'}</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 30 },
  heading: { fontSize: 18, fontWeight: '800', color: colors.primary, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statVal: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textDark },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: colors.textDark,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  infoList: { gap: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7',
  },
  label: { fontSize: 13, color: colors.textMuted },
  val: { fontSize: 13, fontWeight: '600', color: colors.textDark },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
    marginTop: 18,
  },
  logoutText: { color: colors.danger, fontWeight: 'bold', fontSize: 13 },
});