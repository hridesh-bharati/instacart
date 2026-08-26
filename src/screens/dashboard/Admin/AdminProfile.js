import React, { useState, useEffect } from 'react';
import { View, Image } from 'react-native';
import { Card, Text, Button, TextInput, Switch, ActivityIndicator, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { getAdminSettings, updateAdminSettings } from '../../../services/api/profile.api';
import colors from '../../../constants/colors';

export default function AdminProfile({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.displayName || 'Super Admin',
    email: user?.email || '',
    phone: '+91 7267995307',
    storeName: 'ZapStore Supermarket',
    address: 'Nichlaul, Maharajganj, UP',
    upiId: '7267995307@upi',
    isStoreOpen: true,
    avatar: user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  });

  useEffect(() => {
    getAdminSettings(user?.uid).then((data) => {
      if (data) setFormData((prev) => ({ ...prev, ...data }));
      setLoading(false);
    });
  }, [user]);

  const handlePickAvatar = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.35,
      base64: true,
    });
    if (!res.canceled && res.assets[0]) {
      const uri = res.assets[0].base64 ? `data:image/jpeg;base64,${res.assets[0].base64}` : res.assets[0].uri;
      setFormData((prev) => ({ ...prev, avatar: uri }));
      await updateAdminSettings(user.uid, { avatar: uri });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateAdminSettings(user.uid, formData);
    setSaving(false);
    setIsEditing(false);
  };

  if (loading) return <ActivityIndicator color={colors.primary} />;

  return (
    <View>
      <Card style={{ padding: 16, alignItems: 'center', marginBottom: 12, backgroundColor: '#fff' }}>
        <Image source={{ uri: formData.avatar }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }} />
        <Button mode="text" compact onPress={handlePickAvatar}>Change Photo</Button>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{formData.name}</Text>
        <Text variant="bodySmall" style={{ color: colors.primary }}>{formData.storeName}</Text>
        <Button mode="outlined" style={{ marginTop: 10 }} onPress={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Settings'}
        </Button>
      </Card>

      {isEditing ? (
        <Card style={{ padding: 16, backgroundColor: '#fff', marginBottom: 12 }}>
          <TextInput label="Admin Name" mode="outlined" value={formData.name} onChangeText={(t) => setFormData({ ...formData, name: t })} style={{ marginBottom: 8 }} />
          <TextInput label="Support Phone" mode="outlined" value={formData.phone} onChangeText={(t) => setFormData({ ...formData, phone: t })} style={{ marginBottom: 8 }} />
          <TextInput label="Store Name" mode="outlined" value={formData.storeName} onChangeText={(t) => setFormData({ ...formData, storeName: t })} style={{ marginBottom: 8 }} />
          <TextInput label="Hub Address" mode="outlined" value={formData.address} onChangeText={(t) => setFormData({ ...formData, address: t })} style={{ marginBottom: 12 }} />
          <Button mode="contained" buttonColor={colors.primary} onPress={handleSave} loading={saving}>
            Save Settings
          </Button>
        </Card>
      ) : (
        <Card style={{ padding: 16, backgroundColor: '#fff', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="bodyLarge">Accepting Orders</Text>
            <Switch
              value={formData.isStoreOpen}
              onValueChange={(val) => {
                setFormData({ ...formData, isStoreOpen: val });
                updateAdminSettings(user.uid, { isStoreOpen: val });
              }}
            />
          </View>
          <Divider style={{ marginVertical: 12 }} />
          <Text variant="bodyMedium">Email: {formData.email}</Text>
          <Text variant="bodyMedium" style={{ marginTop: 4 }}>Phone: {formData.phone}</Text>
          <Text variant="bodyMedium" style={{ marginTop: 4 }}>Address: {formData.address}</Text>
          <Text variant="bodyMedium" style={{ marginTop: 4 }}>UPI: {formData.upiId}</Text>
        </Card>
      )}

      <Button mode="contained-tonal" buttonColor="#FEE2E2" textColor="#DC2626" onPress={onLogout}>
        Sign Out from Admin
      </Button>
    </View>
  );
}