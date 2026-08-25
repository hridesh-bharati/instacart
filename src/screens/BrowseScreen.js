import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { categories, flashSaleItems, dailyEssentials } from '../data/mockData';
import colors from '../constants/colors';

export default function BrowseScreen({ onAddToCart, initialCategory, onResetInitialCategory }) {
  const [categoryList, setCategoryList] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [loading, setLoading] = useState(true);

  // Detail Modal & Wishlist states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  // Sync category whenever passed from Home Screen
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (!db) {
      setCategoryList(categories);
      setAllProducts([...flashSaleItems, ...dailyEssentials]);
      setLoading(false);
      return;
    }

    // 1. Fetch Categories
    const unsubCat = onSnapshot(collection(db, 'browseCategories'), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategoryList(fetched.length > 0 ? fetched : categories);
    }, () => setCategoryList(categories));

    // 2. Fetch All Products from Firebase Collections
    const unsubFlash = onSnapshot(collection(db, 'flashSale'), (flashSnap) => {
      const flash = flashSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const unsubEss = onSnapshot(collection(db, 'dailyEssentials'), (essSnap) => {
        const ess = essSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const combined = [...flash, ...ess];
        setAllProducts(combined.length > 0 ? combined : [...flashSaleItems, ...dailyEssentials]);
        setLoading(false);
      }, () => {
        setAllProducts([...flash, ...dailyEssentials]);
        setLoading(false);
      });
      return () => unsubEss();
    }, () => {
      setAllProducts([...flashSaleItems, ...dailyEssentials]);
      setLoading(false);
    });

    return () => {
      unsubCat();
      unsubFlash();
    };
  }, []);

  const handleBackToAllCategories = () => {
    setSelectedCategory(null);
    if (onResetInitialCategory) onResetInitialCategory();
  };

  const handleOpenDetails = (item) => {
    setSelectedProduct(item);
    setDetailModalVisible(true);
  };

  const handleToggleWishlist = (item) => {
    setWishlist((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  };

  // Filter products by selected category
  const getCategoryProducts = () => {
    if (!selectedCategory) return [];
    const catName = (selectedCategory.title || '').toLowerCase().trim();

    const matched = allProducts.filter((p) => {
      const prodCat = (p.category || p.tag || '').toLowerCase().trim();
      const prodName = (p.name || p.title || '').toLowerCase().trim();
      return prodCat === catName || prodCat.includes(catName) || prodName.includes(catName);
    });

    // Fallback: Show all products if no exact tag matches yet
    return matched.length > 0 ? matched : allProducts;
  };

  const categoryProducts = getCategoryProducts();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      
      {/* 1. CATEGORY DETAIL ITEMS VIEW */}
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
        </View>
      ) : (
        /* 2. ALL CATEGORIES GRID VIEW */
        <>
          <Text style={styles.screenHeading}>Explore Categories</Text>

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.grid}>
              {categoryList.map((item) => (
                <TouchableOpacity
                  key={item.id || item.title}
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(item)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.bgColor || item.color || '#FFF3E0' }]}>
                    <MaterialCommunityIcons
                      name={item.icon || 'basket'}
                      size={28}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardCount}>{item.count || `${item.itemCount || 100}+ items`}</Text>
                </TouchableOpacity>
              ))}
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
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  screenHeading: { fontSize: 20, fontWeight: '800', color: colors.primary, marginBottom: 16, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: { width: 62, height: 62, borderRadius: 31, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark, textAlign: 'center' },
  cardCount: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  detailView: { marginTop: 4 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  backText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  categoryTitleHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  categoryHeaderTitle: { fontSize: 22, fontWeight: '800', color: colors.textDark },
  categoryItemCount: { fontSize: 13, color: colors.textMuted },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});