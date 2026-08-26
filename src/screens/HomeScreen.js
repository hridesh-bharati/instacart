import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { flashSaleItems, popularStores, dailyEssentials } from '../data/mockData';
import { toggleWishlistApi } from '../services/api/wishlist.api';
import colors from '../constants/colors';

const PERMANENT_CATEGORIES = [
  { id: 'cat-grocery', title: 'Grocery', icon: 'basket', bgColor: '#FEF3C7', textColor: '#D97706' },
  { id: 'cat-restaurants', title: 'Restaurants', icon: 'storefront', bgColor: '#FCE7F3', textColor: '#DB2777' },
  { id: 'cat-alcohol', title: 'Alcohol', icon: 'glass-wine', bgColor: '#EDE9FE', textColor: '#7C3AED' },
  { id: 'cat-retail', title: 'Retail', icon: 'shopping', bgColor: '#DCFCE7', textColor: '#16A34A' },
];

// Reusable Store Skeleton Card
function StoreCardSkeleton() {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 0.8, duration: 650, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.3, duration: 650, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <View style={styles.storeCard}>
      <Animated.View style={[styles.skeletonStoreImg, { opacity: opacityAnim }]} />
      <View style={styles.storeDetails}>
        <Animated.View style={[styles.skeletonStoreTitle, { opacity: opacityAnim }]} />
        <Animated.View style={[styles.skeletonStoreSub, { opacity: opacityAnim }]} />
      </View>
    </View>
  );
}

// Reusable Section Header
function SectionHeader({ icon, iconColor, title, showTimer, onPressSeeMore }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.titleWithTimer}>
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text style={styles.sectionTitle}>{title}</Text>
        {showTimer && (
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>03:32:29</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onPressSeeMore}>
        <Text style={styles.seeMore}>See All</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen({ onAddToCart, onNavigateToCategory }) {
  const [flashList, setFlashList] = useState([]);
  const [storesList, setStoresList] = useState([]);
  const [essentialsList, setEssentialsList] = useState([]);
  
  const [loadingFlash, setLoadingFlash] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingEss, setLoadingEss] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!db) {
      setFlashList(flashSaleItems);
      setStoresList(popularStores);
      setEssentialsList(dailyEssentials);
      setLoadingFlash(false);
      setLoadingStores(false);
      setLoadingEss(false);
      return;
    }

    const unsubFlash = onSnapshot(collection(db, 'flashSale'), (s) => {
      const data = s.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFlashList(data.length > 0 ? data : flashSaleItems);
      setLoadingFlash(false);
    }, () => {
      setFlashList(flashSaleItems);
      setLoadingFlash(false);
    });

    const unsubStores = onSnapshot(collection(db, 'featuredStores'), (s) => {
      const data = s.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStoresList(data.length > 0 ? data : popularStores);
      setLoadingStores(false);
    }, () => {
      setStoresList(popularStores);
      setLoadingStores(false);
    });

    const unsubEss = onSnapshot(collection(db, 'dailyEssentials'), (s) => {
      const data = s.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEssentialsList(data.length > 0 ? data : dailyEssentials);
      setLoadingEss(false);
    }, () => {
      setEssentialsList(dailyEssentials);
      setLoadingEss(false);
    });

    let unsubUser = () => {};
    if (currentUser) {
      unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
        if (docSnap.exists() && docSnap.data().wishlist) {
          setWishlist(docSnap.data().wishlist.map((p) => p.id));
        } else {
          setWishlist([]);
        }
      });
    }

    return () => {
      unsubFlash();
      unsubStores();
      unsubEss();
      unsubUser();
    };
  }, [currentUser]);

  const handleOpenDetails = useCallback((item) => {
    setSelectedProduct(item);
    setModalVisible(true);
  }, []);

  const handleToggleWishlist = useCallback(async (item) => {
    if (!currentUser) {
      alert('Please sign in to manage your wishlist.');
      return;
    }
    const isFav = wishlist.includes(item.id);
    try {
      await toggleWishlistApi(currentUser.uid, item, isFav);
      setWishlist((prev) =>
        isFav ? prev.filter((id) => id !== item.id) : [...prev, item.id]
      );
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  }, [currentUser, wishlist]);

  // DRY helper for rendering horizontal product lists
  const renderProductScroll = (loading, data, keyPrefix = '') => (
    loading ? (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {[...Array(3)].map((_, i) => <ProductCardSkeleton key={i} />)}
      </ScrollView>
    ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {data.map((item) => (
          <ProductCard
            key={`${keyPrefix}${item.id}`}
            item={item}
            onAddToCart={onAddToCart}
            onOpenDetails={handleOpenDetails}
            isWishlisted={wishlist.includes(item.id)}
            onToggleWishlist={handleToggleWishlist}
          />
        ))}
      </ScrollView>
    )
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* 50% Off Banner */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerText}>
          <View style={styles.saleTagBadge}>
            <Ionicons name="flame" size={12} color="#fff" style={{ marginRight: 3 }} />
            <Text style={styles.saleTagText}>MEGA FESTIVAL SALE</Text>
          </View>
          <Text style={styles.bannerHeading}>Get your special{"\n"}sale up to 50% OFF</Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => onNavigateToCategory && onNavigateToCategory(PERMANENT_CATEGORIES[0])}
          >
            <Text style={styles.shopNowText}>Grab Deals</Text>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={12} color="#fff" />
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
            activeOpacity={0.8}
            onPress={() => onNavigateToCategory && onNavigateToCategory(cat)}
          >
            <View style={[styles.categoryCircle, { backgroundColor: cat.bgColor }]}>
              <MaterialCommunityIcons name={cat.icon} size={26} color={cat.textColor} />
            </View>
            <Text style={styles.categoryTitle}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Flash Sale Section */}
      <SectionHeader
        icon="flash"
        iconColor={colors.secondary}
        title="Flash Sale"
        showTimer={true}
        onPressSeeMore={() => onNavigateToCategory && onNavigateToCategory(PERMANENT_CATEGORIES[0])}
      />
      {renderProductScroll(loadingFlash, flashList)}

      {/* Featured Stores Section */}
      <SectionHeader
        icon="storefront-outline"
        iconColor={colors.primary}
        title="Featured Stores"
        onPressSeeMore={() => onNavigateToCategory && onNavigateToCategory(PERMANENT_CATEGORIES[1])}
      />
      {loadingStores ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {[...Array(2)].map((_, i) => <StoreCardSkeleton key={i} />)}
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {storesList.map((store) => (
            <View key={store.id} style={styles.storeCard}>
              <Image source={{ uri: store.image }} style={styles.storeImage} />
              <View style={styles.storeDetails}>
                <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                <Text style={styles.storeTag} numberOfLines={1}>{store.tag}</Text>
                <View style={styles.storeMeta}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.storeRating}>{store.rating}</Text>
                  <Text style={styles.storeDot}>•</Text>
                  <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.storeTime}>{store.deliveryTime}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Daily Essentials Section */}
      <SectionHeader
        icon="leaf-outline"
        iconColor={colors.success}
        title="Daily Essentials"
        onPressSeeMore={() => onNavigateToCategory && onNavigateToCategory(PERMANENT_CATEGORIES[0])}
      />
      {renderProductScroll(loadingEss, essentialsList)}

      {/* Trending / Best Sellers Section */}
      <SectionHeader
        icon="trending-up"
        iconColor="#D97706"
        title="Trending Near You"
        onPressSeeMore={() => onNavigateToCategory && onNavigateToCategory(PERMANENT_CATEGORIES[3])}
      />
      {renderProductScroll(loadingFlash, flashList.slice().reverse(), 'trending-')}

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
  container: { paddingBottom: 90, backgroundColor: colors.background },
  bannerCard: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#144637',
    elevation: 4,
  },
  bannerText: { flex: 1, zIndex: 2 },
  saleTagBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.secondary, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6, 
    alignSelf: 'flex-start', 
    marginBottom: 8 
  },
  saleTagText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  bannerHeading: { color: '#fff', fontSize: 18, fontWeight: '900', lineHeight: 24, marginBottom: 12 },
  shopNowBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary, paddingVertical: 8, paddingLeft: 14, paddingRight: 6, borderRadius: 16, alignSelf: 'flex-start', gap: 8 },
  shopNowText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  arrowCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  bannerImg: { width: 120, height: 120, borderRadius: 60, position: 'absolute', right: -10, bottom: -10 },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  categoryItem: {
    alignItems: 'center',
    width: 70,
    gap: 6,
  },
  categoryCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.04)',
    elevation: 3,
  },
  categoryTitle: { fontSize: 12, color: colors.textDark, fontWeight: '700', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 22, marginBottom: 12 },
  titleWithTimer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: colors.textDark, marginLeft: 2 },
  timerBadge: { backgroundColor: colors.danger, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 6 },
  timerText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  seeMore: { fontSize: 13, color: '#0284C7', fontWeight: '800' },
  horizontalScroll: { paddingLeft: 16 },
  storeCard: { backgroundColor: colors.cardBg, borderRadius: 18, width: 220, marginRight: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', elevation: 2 },
  storeImage: { width: '100%', height: 110, resizeMode: 'cover' },
  storeDetails: { padding: 12 },
  storeName: { fontSize: 14, fontWeight: '900', color: colors.textDark },
  storeTag: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  storeMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  storeRating: { fontSize: 12, fontWeight: '800', color: colors.textDark },
  storeDot: { color: colors.textMuted },
  storeTime: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  skeletonStoreImg: { width: '100%', height: 110, backgroundColor: '#E5E7EB' },
  skeletonStoreTitle: { width: '75%', height: 14, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 6 },
  skeletonStoreSub: { width: '45%', height: 10, borderRadius: 4, backgroundColor: '#E5E7EB', marginTop: 4 },
});