import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { flashSaleItems, popularStores, dailyEssentials } from '../data/mockData';
import colors from '../constants/colors';

// Permanent 4 Core Categories for Home Screen
const PERMANENT_CATEGORIES = [
  { id: 'cat-grocery', title: 'Grocery', icon: 'basket', bgColor: '#FFF3E0' },
  { id: 'cat-restaurants', title: 'Restaurants', icon: 'storefront', bgColor: '#FFEBEE' },
  { id: 'cat-alcohol', title: 'Alcohol', icon: 'glass-wine', bgColor: '#F3E5F5' },
  { id: 'cat-retail', title: 'Retail', icon: 'shopping', bgColor: '#E8F5E9' },
];

export default function HomeScreen({ onAddToCart, onNavigateToCategory }) {
  const [flashList, setFlashList] = useState([]);
  const [storesList, setStoresList] = useState([]);
  const [essentialsList, setEssentialsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal & Wishlist
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!db) {
      setFlashList(flashSaleItems);
      setStoresList(popularStores);
      setEssentialsList(dailyEssentials);
      setLoading(false);
      return;
    }

    const unsubFlash = onSnapshot(collection(db, 'flashSale'), (s) => {
      const data = s.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFlashList(data.length > 0 ? data : flashSaleItems);
    }, () => setFlashList(flashSaleItems));

    const unsubStores = onSnapshot(collection(db, 'featuredStores'), (s) => {
      const data = s.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStoresList(data.length > 0 ? data : popularStores);
    }, () => setStoresList(popularStores));

    const unsubEss = onSnapshot(collection(db, 'dailyEssentials'), (s) => {
      const data = s.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEssentialsList(data.length > 0 ? data : dailyEssentials);
      setLoading(false);
    }, () => {
      setEssentialsList(dailyEssentials);
      setLoading(false);
    });

    return () => {
      unsubFlash();
      unsubStores();
      unsubEss();
    };
  }, []);

  const handleOpenDetails = (item) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const handleToggleWishlist = (item) => {
    setWishlist((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      
      {/* 50% Off Banner */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerText}>
          <Text style={styles.bannerHeading}>Get your special{"\n"}sale up to 50%</Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => onNavigateToCategory && onNavigateToCategory(PERMANENT_CATEGORIES[0])}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={12} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80' }}
          style={styles.bannerImg}
        />
      </View>

      {/* 4 Permanent Category Circles */}
      <View style={styles.categoryRow}>
        {PERMANENT_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            activeOpacity={0.7}
            onPress={() => onNavigateToCategory && onNavigateToCategory(cat)}
          >
            <View style={[styles.categoryCircle, { backgroundColor: cat.bgColor }]}>
              <MaterialCommunityIcons name={cat.icon} size={26} color={colors.primary} />
            </View>
            <Text style={styles.categoryTitle}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Flash Sale Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleWithTimer}>
          <Text style={styles.sectionTitle}>Flash Sale</Text>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>03:32:29</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onNavigateToCategory && onNavigateToCategory(PERMANENT_CATEGORIES[0])}>
          <Text style={styles.seeMore}>See More</Text>
        </TouchableOpacity>
      </View>

      {/* Flash Sale Items */}
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {flashList.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onAddToCart={onAddToCart}
              onOpenDetails={handleOpenDetails}
              isWishlisted={wishlist.includes(item.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </ScrollView>
      )}

      {/* Featured Stores */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Stores</Text>
        <TouchableOpacity onPress={() => onNavigateToCategory && onNavigateToCategory(PERMANENT_CATEGORIES[1])}>
          <Text style={styles.seeMore}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {storesList.map((store) => (
          <View key={store.id} style={styles.storeCard}>
            <Image source={{ uri: store.image }} style={styles.storeImage} />
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.storeTag}>{store.tag}</Text>
              <View style={styles.storeMeta}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.storeRating}>{store.rating}</Text>
                <Text style={styles.storeDot}>•</Text>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <Text style={styles.storeTime}>{store.deliveryTime}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Daily Essentials */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Essentials</Text>
        <TouchableOpacity onPress={() => onNavigateToCategory && onNavigateToCategory(PERMANENT_CATEGORIES[0])}>
          <Text style={styles.seeMore}>See More</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {essentialsList.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
            onOpenDetails={handleOpenDetails}
            isWishlisted={wishlist.includes(item.id)}
            onToggleWishlist={handleToggleWishlist}
          />
        ))}
      </ScrollView>

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAddToCart={onAddToCart}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 90 },
  bannerCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerText: { flex: 1, zIndex: 2 },
  bannerHeading: { color: '#fff', fontSize: 19, fontWeight: 'bold', lineHeight: 25, marginBottom: 14 },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 18,
    alignSelf: 'flex-start',
    gap: 6,
  },
  shopNowText: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },
  arrowCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  bannerImg: { width: 120, height: 120, borderRadius: 60, position: 'absolute', right: -10, bottom: -10 },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 14,
  },
  categoryItem: {
    alignItems: 'center',
    width: 70,
    gap: 6,
  },
  categoryCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  categoryTitle: {
    fontSize: 12,
    color: colors.textDark,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
  },
  titleWithTimer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  timerBadge: { backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  timerText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  seeMore: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  horizontalScroll: { paddingLeft: 20 },
  storeCard: { backgroundColor: colors.cardBg, borderRadius: 18, width: 220, marginRight: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  storeImage: { width: '100%', height: 100 },
  storeDetails: { padding: 12 },
  storeName: { fontSize: 14, fontWeight: 'bold', color: colors.textDark },
  storeTag: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  storeMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  storeRating: { fontSize: 12, fontWeight: 'bold', color: colors.textDark },
  storeDot: { color: colors.textMuted },
  storeTime: { fontSize: 11, color: colors.textMuted },
});