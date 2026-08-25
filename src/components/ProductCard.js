import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function ProductCard({
  item,
  onAddToCart,
  onOpenDetails,
  isWishlisted = false,
  onToggleWishlist,
}) {
  const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onOpenDetails && onOpenDetails(item)}
    >
      {/* Heart / Wishlist Button */}
      <TouchableOpacity
        style={styles.wishlistBtn}
        onPress={(e) => {
          e.stopPropagation();
          onToggleWishlist && onToggleWishlist(item);
        }}
      >
        <Ionicons
          name={isWishlisted ? 'heart' : 'heart-outline'}
          size={16}
          color={isWishlisted ? '#E53935' : colors.primary}
        />
      </TouchableOpacity>

      {/* Product Image */}
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Product Name & Weight/Unit */}
      <Text style={styles.name} numberOfLines={1}>
        {item.name || item.title}
      </Text>
      <Text style={styles.weight}>{item.weight || item.unit || '1 unit'}</Text>

      {/* Price Row & Add Button */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{price.toFixed(2)}</Text>
        {item.oldPrice ? (
          <Text style={styles.oldPrice}>
            {typeof item.oldPrice === 'number' ? `₹${item.oldPrice}` : item.oldPrice}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={(e) => {
            e.stopPropagation();
            onAddToCart && onAddToCart(item);
          }}
        >
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg || '#fff',
    width: 145,
    borderRadius: 18,
    padding: 12,
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border || '#EFEFEF',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 95,
    borderRadius: 12,
    marginBottom: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  weight: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  oldPrice: {
    fontSize: 11,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 4,
    flex: 1,
  },
  addBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});