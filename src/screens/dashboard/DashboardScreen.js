import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import { subscribeToUserProfile, subscribeToLiveProducts } from '../../services/api';

import AdminSidebar from './Admin/AdminSidebar';
import AdminDashboard from './Admin/AdminDashboard';
import AdminProducts from './Admin/AdminProducts';
import AdminOrders from './Admin/AdminOrders';
import AdminProfile from './Admin/AdminProfile';
import UserDashboard from './User/UserDashboard';
import colors from '../../constants/colors';

export default function DashboardScreen() {
  const user = auth.currentUser;
  const isAdmin = user?.email?.toLowerCase() === 'hridesh027@gmail.com';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard' | 'products' | 'orders' | 'profile'
  const [profile, setProfile] = useState({ name: '', email: user?.email || '', phone: '', address: '' });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      const unsubProfile = subscribeToUserProfile(user.uid, (data) => {
        setProfile({
          name: data.name || user.displayName || 'Shopper',
          email: user.email,
          phone: data.phone || '',
          address: data.address || '',
        });
      });

      const unsubProd = subscribeToLiveProducts((list) => setProducts(list));

      return () => {
        unsubProfile();
        unsubProd();
      };
    }
  }, [user]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>{isAdmin ? 'Admin Console' : 'My Account'}</Text>
          <Text style={styles.sub}>{profile.name || user?.email}</Text>
        </View>

        {isAdmin && (
          <TouchableOpacity style={styles.menuIconBtn} onPress={() => setSidebarOpen(true)}>
            <Ionicons name="menu-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Role-Based Rendering */}
      <View style={styles.body}>
        {isAdmin ? (
          <>
            {adminTab === 'dashboard' && <AdminDashboard products={products} />}
            {adminTab === 'products' && <AdminProducts products={products} />}
            {adminTab === 'orders' && <AdminOrders />}
            {adminTab === 'profile' && <AdminProfile profile={profile} uid={user?.uid} />}

            <AdminSidebar
              visible={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              activeTab={adminTab}
              setActiveTab={setAdminTab}
              adminProfile={profile}
            />
          </>
        ) : (
          <UserDashboard profile={profile} uid={user?.uid} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 14,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.primary },
  sub: { fontSize: 12, color: colors.textMuted },
  menuIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: { flex: 1 },
});