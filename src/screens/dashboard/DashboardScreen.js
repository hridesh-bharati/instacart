import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Appbar, SegmentedButtons, ActivityIndicator, Text, Button, Card } from 'react-native-paper';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { checkIsAdmin, logoutUser } from '../../services/api/auth.api';
import colors from '../../constants/colors';

import AdminDashboard from './Admin/AdminDashboard';
import AdminProducts from './Admin/AdminProducts';
import AdminOrders from './Admin/AdminOrders';
import AdminProfile from './Admin/AdminProfile';
import UserDashboard from './User/UserDashboard';

export default function DashboardScreen({ onNavigateToAuth }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState('products');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAdmin(checkIsAdmin(user));
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating={true} color={colors.primary} />
      </View>
    );
  }

  // 1. Guest View
  if (!currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' }}>
        <Card style={{ padding: 20, alignItems: 'center' }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: colors.textDark }}>
            Account Required
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.textMuted, marginVertical: 12, textAlign: 'center' }}>
            Please sign in to view your orders, saved address and profile.
          </Text>
          <Button mode="contained" buttonColor={colors.primary} onPress={onNavigateToAuth}>
            Login / Register
          </Button>
        </Card>
      </View>
    );
  }

  // 2. Customer View (Normal User)
  if (!isAdmin) {
    return <UserDashboard user={currentUser} onLogout={logoutUser} />;
  }

  // 3. Super Admin View (hridesh027@gmail.com)
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <Appbar.Header elevated style={{ backgroundColor: '#fff' }}>
        <Appbar.Content title="Store Hub" subtitle="Super Admin Console" />
        <Button mode="text" textColor={colors.primary} onPress={() => setAdminTab('profile')}>
          Admin
        </Button>
      </Appbar.Header>

      <View style={{ padding: 12 }}>
        <SegmentedButtons
          value={adminTab}
          onValueChange={setAdminTab}
          buttons={[
            { value: 'overview', label: 'Overview' },
            { value: 'products', label: 'Products' },
            { value: 'orders', label: 'Orders' },
            { value: 'profile', label: 'Profile' },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 80 }}>
        {adminTab === 'overview' && <AdminDashboard />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'profile' && <AdminProfile user={currentUser} onLogout={logoutUser} />}
      </ScrollView>
    </View>
  );
}