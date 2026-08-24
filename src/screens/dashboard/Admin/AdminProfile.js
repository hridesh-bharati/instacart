import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateUserProfile } from '../../../services/api';
import colors from '../../../constants/colors';

export default function AdminProfile({ profile, uid }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    address: profile.address || '',
  });

  const handleSave = async () => {
    try {
      await updateUserProfile(uid, { ...profile, ...formData });
      setIsEditing(false);
      Alert.alert('Updated', 'Admin profile saved.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Admin Credentials & Info</Text>
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
            placeholder="Store Location"
            value={formData.address}
            onChangeText={(t) => setFormData({ ...formData, address: t })}
            style={styles.input}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.val}>{profile.name || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Admin Email:</Text>
            <Text style={styles.val}>{profile.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.val}>{profile.phone || 'Add phone'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Store Base:</Text>
            <Text style={styles.val}>{profile.address || 'Nichlaul, Maharajganj, UP'}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: 12,
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
});