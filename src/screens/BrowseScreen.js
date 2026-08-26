import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { flashSaleItems, dailyEssentials } from '../data/mockData';
import { toggleWishlistApi } from '../services/api/wishlist.api';
import colors from '../constants/colors';

// Compact Skeleton Component for Category Loading State
function CategorySkeletonCard() {
  return (
    <View style={styles.categoryCardSkeleton}>
      <View style={styles.skeletonCircle} />
      <View style={styles.skeletonLineShort} />
      <View style={styles.skeletonLineTiny} />
    </View>
  );
}

const PERMANENT_CATEGORIES = [
  { id: 'cat-1', title: 'Grocery', icon: 'basket', bgColor: '#FEF3C7', textColor: '#D97706' },
  { id: 'cat-2', title: 'Restaurants', icon: 'storefront', bgColor: '#FCE7F3', textColor: '#DB2777' },
  { id: 'cat-3', title: 'Alcohol', icon: 'glass-wine', bgColor: '#EDE9FE', textColor: '#7C3AED' },
  { id: 'cat-4', title: 'Retail', icon: 'shopping', bgColor: '#DCFCE7', textColor: '#16A34A' },
  { id: 'cat-5', title: 'Electronics', icon: 'laptop', bgColor: '#E0F2FE', textColor: '#0284C7' },
  { id: 'cat-6', title: 'Fashion', icon: 'tshirt-crew', bgColor: '#FEE2E2', textColor: '#DC2626' },
  { id: 'cat-7', title: 'Beauty', icon: 'face-man-shave', bgColor: '#FCE7F3', textColor: '#BE185D' },
  { id: 'cat-8', title: 'Pharmacy', icon: 'pill', bgColor: '#DCFCE7', textColor: '#059669' },
  { id: 'cat-9', title: 'Home Decor', icon: 'home-outline', bgColor: '#FEF3C7', textColor: '#B45309' },
];

export default function BrowseScreen({ onAddToCart, initialCategory, onResetInitialCategory }) {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [loading, setLoading] = useState(true);

  // Detail Modal & Wishlist states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (!db) {
      setAllProducts([...flashSaleItems, ...dailyEssentials]);
      setLoading(false);
      return;
    }

    // Sync All Products across collections
    const unsubFlash = onSnapshot(collection(db, 'flashSale'), (flashSnap) => {
      const flash = flashSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const unsubEss = onSnapshot(collection(db, 'dailyEssentials'), (essSnap) => {
        const ess = essSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const unsubTabs = onSnapshot(collection(db, 'browseCategories'), (tabSnap) => {
          const tabProds = tabSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const combined = [...flash, ...ess, ...tabProds];
          setAllProducts(combined.length > 0 ? combined : [...flashSaleItems, ...dailyEssentials]);
          setLoading(false);
        }, () => {
          setAllProducts([...flash, ...ess]);
          setLoading(false);
        });

        return () => unsubTabs();
      }, () => {
        setAllProducts(flash);
        setLoading(false);
      });

      return () => unsubEss();
    }, () => {
      setAllProducts([...flashSaleItems, ...dailyEssentials]);
      setLoading(false);
    });

    // Sync User Wishlist
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
      unsubUser();
    };
  }, [currentUser]);

  const handleBackToAllCategories = () => {
    setSelectedCategory(null);
    if (onResetInitialCategory) onResetInitialCategory();
  };

  const handleOpenDetails = (item) => {
    setSelectedProduct(item);
    setDetailModalVisible(true);
  };

  const handleToggleWishlist = async (item) => {
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
  };

  // Filter items matching selected category tag
  const getCategoryProducts = () => {
    if (!selectedCategory) return [];
    const catName = (selectedCategory.title || '').toLowerCase().trim();

    return allProducts.filter((p) => {
      const prodCat = (p.category || p.tag || '').toLowerCase().trim();
      const prodName = (p.name || p.title || '').toLowerCase().trim();
      return prodCat === catName || prodCat.includes(catName) || prodName.includes(catName);
    });
  };

  const categoryProducts = getCategoryProducts();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. FILTERED CATEGORY VIEW */}
      {selectedCategory ? (
        <View style={styles.detailView}>
          <TouchableOpacity style={styles.backRow} onPress={handleBackToAllCategories}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backText}>All Categories</Text>
          </TouchableOpacity>

          <View style={styles.categoryTitleHeader}>
            <Text style={styles.categoryHeaderTitle}>{selectedCategory.title}</Text>
            <Text style={styles.categoryItemCount}>({categoryProducts.length} items)</Text>
          </View>

          {loading ? (
            <View style={styles.productGrid}>
              <CategorySkeletonCard />
              <CategorySkeletonCard />
              <CategorySkeletonCard />
            </View>
          ) : categoryProducts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="basket-outline" size={54} color={colors.textMuted} />
              <Text style={styles.emptyText}>No items added to {selectedCategory.title} yet.</Text>
            </View>
          ) : (
            <View style={styles.productGrid}>
              {categoryProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  item={prod}
                  onAddToCart={onAddToCart}
                  onOpenDetails={handleOpenDetails}
                  isWishlisted={wishlist.includes(prod.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </View>
          )}
        </View>
      ) : (
        /* 2. 3x3 CATEGORY CARDS GRID USING MAP */
        <>
          <Text style={styles.screenHeading}>Explore Categories</Text>

          {loading ? (
            <View style={styles.grid}>
              {[...Array(9)].map((_, i) => (
                <CategorySkeletonCard key={i} />
              ))}
            </View>
          ) : (
            <View style={styles.grid}>
              {PERMANENT_CATEGORIES.map((cat) => {
                const count = allProducts.filter((p) => {
                  const prodCat = (p.category || p.tag || '').toLowerCase().trim();
                  return prodCat === cat.title.toLowerCase();
                }).length;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryCard}
                    activeOpacity={0.8}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: cat.bgColor }]}>
                      <MaterialCommunityIcons name={cat.icon} size={24} color={cat.textColor} />
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>{cat.title}</Text>
                    <Text style={styles.cardCount} numberOfLines={1}>{count} items</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={detailModalVisible}
        product={selectedProduct}
        onClose={() => setDetailModalVisible(false)}
        onAddToCart={onAddToCart}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 12 },
  screenHeading: { fontSize: 18, fontWeight: '800', color: colors.primary, marginBottom: 12, marginTop: 4 },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: '3%', 
    rowGap: 10 
  },
  categoryCard: {
    width: '31%', // Exactly 3 cards per row
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 11, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  cardCount: { fontSize: 9, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  categoryCardSkeleton: {
    width: '31%',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    opacity: 0.6,
  },
  skeletonCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#D1D5DB', marginBottom: 6 },
  skeletonLineShort: { width: '60%', height: 10, borderRadius: 4, backgroundColor: '#D1D5DB', marginBottom: 4 },
  skeletonLineTiny: { width: '40%', height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  detailView: { marginTop: 4 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  backText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  categoryTitleHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  categoryHeaderTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  categoryItemCount: { fontSize: 12, color: colors.textMuted },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
});