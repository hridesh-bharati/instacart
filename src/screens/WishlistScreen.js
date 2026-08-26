import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { toggleWishlistApi } from '../services/api/wishlist.api';
import colors from '../constants/colors';

export default function WishlistScreen({ onAddToCart, onNavigate }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser || !db) {
      setLoading(false);
      return;
    }

    // Real-time listener for user's wishlist
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().wishlist) {
        setWishlistItems(docSnap.data().wishlist);
      } else {
        setWishlistItems([]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const handleRemoveFromWishlist = async (item) => {
    if (!currentUser) return;
    try {
      await toggleWishlistApi(currentUser.uid, item, true);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator animating={true} color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headerTitle}>My Wishlist</Text>
        <Text variant="bodySmall" style={styles.headerSub}>{wishlistItems.length} saved items</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {wishlistItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="heart-outline" size={64} color={colors.textMuted} />
            <Text variant="titleMedium" style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text variant="bodySmall" style={styles.emptySub}>
              Tap the heart icon on any product to save it to your wishlist.
            </Text>
            <Button 
              mode="contained" 
              buttonColor={colors.primary} 
              style={styles.shopNowBtn}
              onPress={() => onNavigate && onNavigate('Home')}
            >
              Explore Products
            </Button>
          </View>
        ) : (
          <View style={styles.grid}>
            {wishlistItems.map((item) => {
              const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);

              return (
                <Surface key={item.id} style={styles.card} elevation={1}>
                  {/* Remove / Heart Button */}
                  <TouchableOpacity 
                    style={styles.removeBtn}
                    onPress={() => handleRemoveFromWishlist(item)}
                  >
                    <Ionicons name="heart" size={16} color="#E53935" />
                  </TouchableOpacity>

                  <Image source={{ uri: item.image }} style={styles.cardImg} resizeMode="contain" />

                  <View style={styles.cardInfo}>
                    <Text variant="bodyMedium" style={styles.cardTitle} numberOfLines={1}>
                      {item.name || item.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.cardUnit}>
                      {item.unit || item.weight || '1 unit'}
                    </Text>

                    <Text variant="titleSmall" style={styles.cardPrice}>
                      ₹{price.toFixed(2)}
                    </Text>

                    <Button
                      mode="contained"
                      buttonColor={colors.primary}
                      compact
                      style={styles.moveToCartBtn}
                      labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
                      onPress={() => {
                        if (onAddToCart) onAddToCart(item);
                      }}
                    >
                      Move to Cart
                    </Button>
                  </View>
                </Surface>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { marginBottom: 12 },
  headerTitle: { fontWeight: '900', color: colors.textDark },
  headerSub: { color: colors.textMuted, marginTop: 2 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollBody: { paddingBottom: 100 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontWeight: '800', color: colors.textDark, marginTop: 12 },
  emptySub: { color: colors.textMuted, marginTop: 4, textAlign: 'center', maxWidth: 260 },
  shopNowBtn: { marginTop: 20, borderRadius: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: {
    backgroundColor: colors.cardBg,
    width: '48%',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  cardImg: { width: '100%', height: 110, backgroundColor: '#F9FAFB', borderRadius: 10, marginBottom: 8 },
  cardInfo: { flex: 1 },
  cardTitle: { fontWeight: '800', color: colors.textDark },
  cardUnit: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  cardPrice: { fontWeight: '900', color: colors.primary, marginVertical: 6 },
  moveToCartBtn: { borderRadius: 10, marginTop: 4 },
});