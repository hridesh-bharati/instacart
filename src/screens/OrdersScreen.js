import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Text, Card, Chip, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { subscribeToOrders } from '../services/api/orders.api';
import { checkIsAdmin } from '../services/api/auth.api';
import { ProductCardSkeleton } from '../components/ProductCard';
import colors from '../constants/colors';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;
  const isAdmin = checkIsAdmin(currentUser);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToOrders(currentUser.uid, isAdmin, (list) => {
      setOrders(list);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser, isAdmin]);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text variant="titleLarge" style={styles.screenTitle}>Loading Orders...</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.screenTitle}>
        {isAdmin ? 'All Customer Orders' : 'My Confirmed Orders'}
      </Text>

      {orders.length === 0 ? (
        <Card style={styles.emptyCard} elevation={0}>
          <Card.Content style={styles.emptyContent}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={48} color={colors.primary} />
            </View>
            <Text variant="titleMedium" style={styles.emptyTitle}>No Confirmed Orders</Text>
            <Text variant="bodySmall" style={styles.emptySub}>
              Successfully placed orders will appear here instantly with live status tracking.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        orders.map((ord) => {
          const shipping = typeof ord.address === 'object' ? ord.address : null;
          const addressStr = shipping 
            ? `${shipping.fullName} • ${shipping.phone}\n${shipping.address}, ${shipping.city} - ${shipping.pincode}` 
            : ord.address;

          const isDelivered = ord.status === 'Delivered';
          const isShipped = ord.status === 'Shipped';

          return (
            <Surface key={ord.id} style={styles.orderCard} elevation={2}>
              <View style={styles.orderTopRow}>
                <View>
                  <Text variant="titleSmall" style={styles.orderId}>
                    Order #{ord.id.slice(-6).toUpperCase()}
                  </Text>
                  <Text variant="bodySmall" style={styles.orderDate}>
                    {ord.createdAt?.toDate ? ord.createdAt.toDate().toLocaleString() : 'Just now'}
                  </Text>
                </View>
                <Chip 
                  mode="flat" 
                  compact 
                  textStyle={[styles.chipText, { color: isDelivered ? '#15803D' : isShipped ? '#B45309' : '#0369A1' }]} 
                  style={[styles.statusChip, { backgroundColor: isDelivered ? '#DCFCE7' : isShipped ? '#FEF3C7' : '#E0F2FE' }]}
                >
                  {ord.status || 'Processing'}
                </Chip>
              </View>

              {addressStr ? (
                <View style={styles.addressBox}>
                  <View style={styles.addressIconWrap}>
                    <Ionicons name="location" size={16} color={colors.secondary} />
                  </View>
                  <Text variant="bodySmall" style={styles.addressText} numberOfLines={3}>
                    <Text style={{ fontWeight: '800', color: colors.textDark }}>Ship to: </Text>
                    {addressStr}
                  </Text>
                </View>
              ) : null}

              <View style={styles.divider} />

              {ord.items?.map((prod, idx) => (
                <View key={idx} style={styles.itemRow}>
                  {prod.image ? (
                    <Image source={{ uri: prod.image }} style={styles.itemImage} />
                  ) : (
                    <View style={[styles.itemImage, styles.placeholderImg]}>
                      <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                    </View>
                  )}
                  
                  <View style={styles.itemDetails}>
                    <Text variant="bodyMedium" style={styles.itemName} numberOfLines={1}>
                      {prod.name || prod.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.itemQty}>
                      Qty: {prod.qty} unit{prod.qty > 1 ? 's' : ''}
                    </Text>
                  </View>

                  <Text variant="titleSmall" style={styles.itemPrice}>
                    ₹{((parseFloat(prod.price) || 0) * prod.qty).toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.thickDivider} />

              <View style={styles.orderBottomRow}>
                <Text variant="bodyMedium" style={styles.totalLabel}>
                  Total Amount (COD)
                </Text>
                <Text variant="titleMedium" style={styles.totalPrice}>
                  ₹{ord.total || 0}.00
                </Text>
              </View>
            </Surface>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 100, backgroundColor: '#F4F5F7', flexGrow: 1 },
  screenTitle: { fontWeight: '900', color: colors.textDark, marginBottom: 16, fontSize: 22, letterSpacing: -0.5 },
  emptyCard: { backgroundColor: '#F9FAFB', borderRadius: 24, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed', marginTop: 40 },
  emptyContent: { alignItems: 'center', paddingVertical: 50 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontWeight: '900', color: colors.textDark, fontSize: 18 },
  emptySub: { color: colors.textMuted, textAlign: 'center', marginTop: 6, maxWidth: 260, lineHeight: 18 },
  orderCard: { backgroundColor: colors.cardBg, borderRadius: 20, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontWeight: '900', color: colors.textDark, fontSize: 15 },
  orderDate: { color: '#6B7280', marginTop: 3, fontSize: 11, fontWeight: '600' },
  statusChip: { height: 28, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  addressBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 14, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  addressIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  addressText: { color: '#4B5563', fontSize: 12, flex: 1, lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 14 },
  thickDivider: { height: 1, backgroundColor: '#E5E7EB', borderStyle: 'dashed', marginVertical: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemImage: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  placeholderImg: { justifyContent: 'center', alignItems: 'center' },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontWeight: '800', color: colors.textDark, fontSize: 14 },
  itemQty: { color: '#6B7280', fontSize: 12, marginTop: 4, fontWeight: '600' },
  itemPrice: { fontWeight: '900', color: colors.textDark, fontSize: 15 },
  orderBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  totalLabel: { color: '#4B5563', fontWeight: '700', fontSize: 13 },
  totalPrice: { fontWeight: '900', color: colors.primary, fontSize: 18 },
});