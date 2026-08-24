import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function ProductCard({ item, onAddToCart }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.wishlistBtn}>
        <Ionicons name="heart-outline" size={16} color={colors.primary} />
      </TouchableOpacity>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.weight}>{item.weight}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <Text style={styles.oldPrice}>{item.oldPrice}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => onAddToCart(item)}>
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    width: 145,
    borderRadius: 18,
    padding: 12,
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
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