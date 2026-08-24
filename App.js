import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';

import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';
import CartModal from './src/components/CartModal';

import HomeScreen from './src/screens/HomeScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import AuthScreen from './src/screens/AuthScreen'; // Correct Path

import colors from './src/constants/colors';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('Home');
  const [cartVisible, setCartVisible] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleUpdateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Auth Guard
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.container}>
          <AuthScreen />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        
        {/* Header Dashboard par hidden rahega */}
        {activeTab !== 'Dashboard' && (
          <Header cartCount={totalCartCount} onOpenCart={() => setCartVisible(true)} />
        )}

        <View style={styles.screenWrapper}>
          {activeTab === 'Home' && <HomeScreen onAddToCart={handleAddToCart} />}
          {activeTab === 'Browse' && <BrowseScreen />}
          {activeTab === 'Orders' && <OrdersScreen />}
          {activeTab === 'Dashboard' && <DashboardScreen />}
        </View>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <CartModal
          visible={cartVisible}
          onClose={() => setCartVisible(false)}
          cart={cart}
          onUpdateQty={handleUpdateQty}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  screenWrapper: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});