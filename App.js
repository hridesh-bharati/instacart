// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import { subscribeToCart, saveCartToCloud } from './src/services/api/cart.api';
import { subscribeToNotifications } from './src/services/api/notifications.api';

import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';
import NotificationsModal from './src/components/NotificationsModal';

import HomeScreen from './src/screens/HomeScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import CartScreen from './src/screens/CartScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import AuthScreen from './src/screens/AuthScreen';

import colors from './src/constants/colors';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedCategoryFromHome, setSelectedCategoryFromHome] = useState(null);
  const [cart, setCart] = useState([]);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Sync Cart from Cloud
  useEffect(() => {
    if (currentUser) {
      const unsubCart = subscribeToCart(currentUser.uid, (cloudCart) => {
        setCart(cloudCart);
      });
      const unsubNotif = subscribeToNotifications(currentUser.uid, (notifs) => {
        const unread = notifs.filter((n) => !n.read).length;
        setUnreadNotifCount(unread);
      });
      return () => {
        unsubCart();
        unsubNotif();
      };
    } else {
      setCart([]);
      setUnreadNotifCount(0);
    }
  }, [currentUser]);

  const handleAddToCart = async (item) => {
    if (!currentUser) {
      setActiveTab('Orders');
      return;
    }
    let updatedCart;
    const exists = cart.find((p) => p.id === item.id);
    if (exists) {
      updatedCart = cart.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
    } else {
      updatedCart = [...cart, { ...item, qty: 1 }];
    }
    setCart(updatedCart);
    await saveCartToCloud(currentUser.uid, updatedCart);
  };

  const handleUpdateQty = async (id, delta) => {
    if (!currentUser) return;
    const updatedCart = cart
      .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
      .filter((item) => item.qty > 0);
    setCart(updatedCart);
    await saveCartToCloud(currentUser.uid, updatedCart);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
        <View style={styles.container}>
          
          {/* Header with Cart & Notification Bell */}
          {activeTab !== 'Dashboard' && (
            <Header 
              cartCount={totalCartCount} 
              onOpenCart={() => setActiveTab('Cart')} 
              currentUser={currentUser}
              notificationCount={unreadNotifCount}
              onOpenNotifications={() => setNotifModalVisible(true)}
            />
          )}

          {/* Screen Routing */}
          <View style={styles.screenWrapper}>
            {activeTab === 'Home' && (
              <HomeScreen
                onAddToCart={handleAddToCart}
                onNavigateToCategory={(cat) => {
                  setSelectedCategoryFromHome(cat);
                  setActiveTab('Browse');
                }}
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

            {activeTab === 'Cart' && (
              <CartScreen
                cart={cart}
                onUpdateQty={handleUpdateQty}
                currentUser={currentUser}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'Wishlist' && (
              <WishlistScreen
                onAddToCart={handleAddToCart}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'Orders' && (
              currentUser ? <OrdersScreen /> : <AuthScreen onSuccess={() => setActiveTab('Orders')} />
            )}

            {(activeTab === 'Dashboard' || activeTab === 'Profile') && (
              <DashboardScreen onNavigateToAuth={() => setActiveTab('Orders')} />
            )}
          </View>

          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Notifications Modal */}
          <NotificationsModal
            visible={notifModalVisible}
            onClose={() => setNotifModalVisible(false)}
            currentUser={currentUser}
          />

        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, backgroundColor: colors.background, maxWidth: 480, alignSelf: 'center', width: '100%' },
  screenWrapper: { flex: 1, paddingBottom: 70 },
});