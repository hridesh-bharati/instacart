import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

// Pulse Skeleton Card for Loading State
export function ProductCardSkeleton() {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.skeletonImage, { opacity: opacityAnim }]} />
      <Animated.View style={[styles.skeletonTitle, { opacity: opacityAnim }]} />
      <Animated.View style={[styles.skeletonSub, { opacity: opacityAnim }]} />
      <View style={styles.priceRow}>
        <Animated.View style={[styles.skeletonPrice, { opacity: opacityAnim }]} />
        <Animated.View style={[styles.skeletonBtn, { opacity: opacityAnim }]} />
      </View>
    </View>
  );
}

export default function ProductCard({
  item,
  onAddToCart,
  onOpenDetails,
  isWishlisted = false,
  onToggleWishlist,
}) {
  const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
  const oldPriceVal = item.oldPrice
    ? typeof item.oldPrice === 'number'
      ? item.oldPrice
      : parseFloat(String(item.oldPrice).replace(/[^0-9.]/g, ''))
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onOpenDetails && onOpenDetails(item)}
    >
      {/* Heart / Wishlist Button */}
      <TouchableOpacity
        style={styles.wishlistBtn}
        activeOpacity={0.7}
        onPress={(e) => {
          e.stopPropagation();
          onToggleWishlist && onToggleWishlist(item);
        }}
      >
        <Ionicons
          name={isWishlisted ? 'heart' : 'heart-outline'}
          size={16}
          color={isWishlisted ? '#EF4444' : colors.textMuted}
        />
      </TouchableOpacity>

      {/* Product Image */}
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />

      {/* Product Name & Weight/Unit */}
      <Text style={styles.name} numberOfLines={1}>
        {item.name || item.title}
      </Text>
      <Text style={styles.weight} numberOfLines={1}>{item.weight || item.unit || '1 unit'}</Text>

      {/* Price Row & Add Button */}
      <View style={styles.priceContainer}>
        <View style={{ flex: 1, marginRight: 4 }}>
          <Text style={styles.price}>₹{price.toFixed(2)}</Text>
          {oldPriceVal ? (
            <Text style={styles.oldPrice}>₹{oldPriceVal.toFixed(2)}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={(e) => {
            e.stopPropagation();
            onAddToCart && onAddToCart(item);
          }}
        >
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    width: 150,
    borderRadius: 16,
    padding: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textDark,
  },
  weight: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  oldPrice: {
    fontSize: 10,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  // Skeleton Specific Styles
  skeletonImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  skeletonTitle: {
    width: '80%',
    height: 13,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginBottom: 6,
  },
  skeletonSub: {
    width: '45%',
    height: 11,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletonPrice: {
    width: '45%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  skeletonBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
  },
});