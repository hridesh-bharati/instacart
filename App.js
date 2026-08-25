import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';

import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';
import CartModal from './src/components/CartModal';

import HomeScreen from './src/screens/HomeScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import AuthScreen from './src/screens/AuthScreen';

import colors from './src/constants/colors';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedCategoryFromHome, setSelectedCategoryFromHome] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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

  // Switch to Browse tab and pass category
  const handleCategorySelectFromHome = (categoryObj) => {
    setSelectedCategoryFromHome(categoryObj);
    setActiveTab('Browse');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
      <View style={styles.container}>
        
        {/* Header */}
        {activeTab !== 'Dashboard' && (
          <Header 
            cartCount={totalCartCount} 
            onOpenCart={() => setCartVisible(true)} 
            currentUser={currentUser}
          />
        )}

        <View style={styles.screenWrapper}>
          {activeTab === 'Home' && (
            <HomeScreen
              onAddToCart={handleAddToCart}
              onNavigateToCategory={handleCategorySelectFromHome}
            />
          )}

          {activeTab === 'Browse' && (
            <BrowseScreen
              key={selectedCategoryFromHome ? selectedCategoryFromHome.title : 'browse-all'}
              onAddToCart={handleAddToCart}
              initialCategory={selectedCategoryFromHome}
              onResetInitialCategory={() => setSelectedCategoryFromHome(null)}
            />
          )}

          {activeTab === 'Orders' && (currentUser ? <OrdersScreen /> : <AuthScreen />)}
          {activeTab === 'Dashboard' && (currentUser ? <DashboardScreen /> : <AuthScreen />)}
        </View>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <CartModal
          visible={cartVisible}
          onClose={() => setCartVisible(false)}
          cart={cart}
          onUpdateQty={handleUpdateQty}
          currentUser={currentUser}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
});