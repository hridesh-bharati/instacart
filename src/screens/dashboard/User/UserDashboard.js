import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Card, Text, Button, TextInput, ActivityIndicator, Divider } from 'react-native-paper';
import { subscribeToUserProfile, updateUserProfile } from '../../../services/api/profile.api';
import colors from '../../../constants/colors';

export default function UserDashboard({ user, onLogout }) {
  const [profile, setProfile] = useState({ name: user?.displayName || '', phone: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToUserProfile(user.uid, (data) => {
      setProfile((prev) => ({ ...prev, ...data }));
    });
    return () => unsub();
  }, [user.uid]);

  const handleSave = async () => {
    setSaving(true);
    await updateUserProfile(user.uid, profile);
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <View style={{ padding: 16 }}>
      <Card style={{ padding: 16, marginBottom: 12, backgroundColor: '#fff' }}>
        <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: colors.textDark }}>
          Customer Profile
        </Text>
        <Text variant="bodySmall" style={{ color: colors.textMuted }}>{user.email}</Text>
        <Divider style={{ marginVertical: 12 }} />

        {isEditing ? (
          <View>
            <TextInput label="Full Name" mode="outlined" value={profile.name} onChangeText={(t) => setProfile({ ...profile, name: t })} style={{ marginBottom: 8 }} />
            <TextInput label="Phone" mode="outlined" value={profile.phone} onChangeText={(t) => setProfile({ ...profile, phone: t })} keyboardType="phone-pad" style={{ marginBottom: 8 }} />
            <TextInput label="Address" mode="outlined" value={profile.address} onChangeText={(t) => setProfile({ ...profile, address: t })} multiline style={{ marginBottom: 12 }} />
            <Button mode="contained" buttonColor={colors.primary} onPress={handleSave} loading={saving}>Save Profile</Button>
          </View>
        ) : (
          <View>
            <Text variant="bodyMedium">Name: {profile.name || 'Not set'}</Text>
            <Text variant="bodyMedium" style={{ marginTop: 4 }}>Phone: {profile.phone || 'Not set'}</Text>
            <Text variant="bodyMedium" style={{ marginTop: 4 }}>Address: {profile.address || 'No saved address'}</Text>
            <Button mode="outlined" style={{ marginTop: 12 }} onPress={() => setIsEditing(true)}>Edit Details</Button>
          </View>
        )}
      </Card>

      <Button mode="contained-tonal" buttonColor="#FEE2E2" textColor="#DC2626" onPress={onLogout}>
        Log Out
      </Button>
    </View>
  );
}