import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function ProductDetailModal({
  visible,
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
  const oldPrice = product.oldPrice
    ? typeof product.oldPrice === 'number'
      ? product.oldPrice
      : parseFloat(product.oldPrice.toString().replace(/[^0-9.]/g, ''))
    : null;

  // Calculate or retrieve custom discount
  const discountVal = product.discount
    ? product.discount
    : oldPrice && oldPrice > price
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : null;

  // Retrieve custom highlights or fallback
  const highlightsList = Array.isArray(product.highlights) && product.highlights.length > 0
    ? product.highlights
    : [
        '100% Quality checked & hygienically packed.',
        'Directly sourced from trusted suppliers.',
        'Easy 24-hour return and replacement guarantee.',
      ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconCircle} onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color={colors.textDark} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => onToggleWishlist && onToggleWishlist(product)}
            >
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={22}
                color={isWishlisted ? colors.danger : colors.textDark}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
              <Ionicons name="share-social-outline" size={20} color={colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          {/* Main Product Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.image }} style={styles.mainImage} resizeMode="contain" />
            {discountVal ? (
              <View style={styles.discountTag}>
                <Text style={styles.discountTagText}>{discountVal}% SPECIAL DISCOUNT</Text>
              </View>
            ) : null}
          </View>

          {/* Pricing & Ratings */}
          <View style={styles.content}>
            <View style={styles.brandRow}>
              <Text style={styles.brandText}>{product.brand || 'Instacart Verified'}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color="#fff" />
                <Text style={styles.ratingBadgeText}>{product.rating || '4.8'}</Text>
              </View>
            </View>

            <Text style={styles.title}>{product.name || product.title}</Text>
            <Text style={styles.unitText}>{product.unit || product.weight || '1 unit'}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>₹{price.toFixed(2)}</Text>
              {oldPrice && <Text style={styles.strikePrice}>₹{oldPrice.toFixed(2)}</Text>}
              <Text style={styles.taxText}>(Inclusive of all taxes)</Text>
            </View>

            {/* Delivery Guarantee */}
            <View style={styles.deliveryBox}>
              <Ionicons name="flash-outline" size={20} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={styles.deliveryTitle}>Superfast Instant Delivery in 10-15 Mins</Text>
                <Text style={styles.deliverySub}>Guaranteed fresh products directly from local hub</Text>
              </View>
            </View>

            {/* Product Highlights */}
            <Text style={styles.sectionHeading}>Product Highlights</Text>
            <View style={styles.highlightsWrap}>
              {highlightsList.map((item, idx) => (
                <View key={idx} style={styles.highlightRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginTop: 2 }} />
                  <Text style={styles.highlightItem}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Product Description */}
            <Text style={styles.sectionHeading}>Description & Details</Text>
            <Text style={styles.descText}>
              {product.description ||
                'High-grade everyday item prepared and stored with hygiene. Ideal for regular household use and daily routines.'}
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Cart Action Bar */}
        <View style={styles.footerBar}>
          <View style={styles.qtyControl}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty((prev) => (prev > 1 ? prev - 1 : 1))}
            >
              <Ionicons name="remove" size={18} color={colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.qtyNumber}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((prev) => prev + 1)}>
              <Ionicons name="add" size={18} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => {
              for (let i = 0; i < qty; i++) {
                onAddToCart(product);
              }
              onClose();
            }}
          >
            <Ionicons name="cart" size={18} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart • ₹{(price * qty).toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cardBg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerActions: { flexDirection: 'row', gap: 10 },
  scrollBody: { paddingBottom: 100 },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mainImage: { width: '85%', height: '85%' },
  discountTag: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountTagText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  content: { padding: 18 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandText: { fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  ratingBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '800', color: colors.textDark, marginTop: 8 },
  unitText: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 12 },
  currentPrice: { fontSize: 24, fontWeight: '900', color: colors.textDark },
  strikePrice: { fontSize: 15, color: colors.textMuted, textDecorationLine: 'line-through' },
  taxText: { fontSize: 11, color: colors.textMuted },
  deliveryBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginTop: 18,
    gap: 12,
    alignItems: 'center',
  },
  deliveryTitle: { fontSize: 13, fontWeight: '800', color: '#166534' },
  deliverySub: { fontSize: 11, color: '#15803D', marginTop: 2 },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: colors.textDark, marginTop: 22, marginBottom: 10 },
  highlightsWrap: { gap: 8 },
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  highlightItem: { fontSize: 13, color: '#4B5563', lineHeight: 20, flex: 1 },
  descText: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 10,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtn: { width: 32, height: 38, justifyContent: 'center', alignItems: 'center' },
  qtyNumber: { paddingHorizontal: 10, fontSize: 15, fontWeight: '800', color: colors.textDark },
  addToCartBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    gap: 8,
    height: 46,
  },
  addToCartText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});