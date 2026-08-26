import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Card, Text, Chip, Button, ActivityIndicator, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../../firebaseConfig';
import { subscribeToOrders, updateOrderStatus } from '../../../services/api/orders.api';
import { checkIsAdmin } from '../../../services/api/auth.api';
import colors from '../../../constants/colors';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;
  const isAdmin = checkIsAdmin(currentUser);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToOrders(currentUser.uid, true, (list) => {
      setOrders(list);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  // 3-Stage Status Cycle: Processing -> Shipped -> Delivered -> Processing
  const handleNextStageStatus = async (orderId, currentStatus) => {
    let nextStatus = 'Shipped';
    if (currentStatus === 'Processing') nextStatus = 'Shipped';
    else if (currentStatus === 'Shipped') nextStatus = 'Delivered';
    else nextStatus = 'Processing';

    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.screenTitle}>
        Live Admin Orders ({orders.length})
      </Text>

      {orders.length === 0 ? (
        <Card style={styles.emptyCard} mode="outlined">
          <Card.Content style={styles.emptyContent}>
            <Ionicons name="receipt-outline" size={54} color={colors.textMuted} />
            <Text variant="titleMedium" style={styles.emptyTitle}>No Live Orders</Text>
            <Text variant="bodySmall" style={styles.emptySub}>
              Customer orders placed via Cash on Delivery will appear here instantly.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        orders.map((ord) => {
          const shipping = typeof ord.address === 'object' ? ord.address : null;
          const customerName = shipping?.fullName || ord.user || 'Customer';
          const customerPhone = shipping?.phone ? ` • 📞 ${shipping.phone}` : '';
          const deliveryAddress = shipping ? `${shipping.address}, ${shipping.city} - ${shipping.pincode}` : ord.address;

          const status = ord.status || 'Processing';
          const isDelivered = status === 'Delivered';
          const isShipped = status === 'Shipped';

          return (
            <Surface key={ord.id} style={styles.orderCard} elevation={1}>
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
                  textStyle={[styles.chipText, { color: isDelivered ? colors.success : isShipped ? colors.secondary : colors.primary }]} 
                  style={[styles.statusChip, { backgroundColor: isDelivered ? '#DCFCE7' : isShipped ? '#FFEDD5' : '#E0F2FE' }]}
                >
                  {status}
                </Chip>
              </View>

              <View style={styles.customerBox}>
                <Ionicons name="person-outline" size={14} color={colors.primary} />
                <Text variant="bodySmall" style={styles.customerText}>
                  <Text style={{ fontWeight: '700' }}>{customerName}</Text>
                  {customerPhone}
                </Text>
              </View>

              {deliveryAddress ? (
                <View style={styles.addressBox}>
                  <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                  <Text variant="bodySmall" style={styles.addressText} numberOfLines={2}>
                    {deliveryAddress}
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
                      <Ionicons name="image-outline" size={16} color={colors.textMuted} />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text variant="bodyMedium" style={styles.itemName} numberOfLines={1}>
                      {prod.name || prod.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.itemQty}>Qty: {prod.qty}</Text>
                  </View>
                  <Text variant="bodyMedium" style={{ fontWeight: '800', color: colors.textDark }}>
                    ₹{((parseFloat(prod.price) || 0) * prod.qty).toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.orderBottomRow}>
                <View>
                  <Text variant="bodySmall" style={{ color: colors.textMuted }}>Total Amount</Text>
                  <Text variant="titleMedium" style={styles.totalPrice}>₹{ord.total || 0}.00</Text>
                </View>

                <Button
                  mode="contained-tonal"
                  buttonColor={colors.primary}
                  textColor="#fff"
                  compact
                  style={styles.actionBtn}
                  onPress={() => handleNextStageStatus(ord.id, status)}
                >
                  Next Stage ➔
                </Button>
              </View>
            </Surface>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 100, backgroundColor: colors.background, flexGrow: 1 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontWeight: '900', color: colors.textDark, marginBottom: 16 },
  emptyCard: { backgroundColor: colors.cardBg, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginTop: 40 },
  emptyContent: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontWeight: '800', color: colors.textDark, marginTop: 12 },
  emptySub: { color: colors.textMuted, textAlign: 'center', marginTop: 4, maxWidth: 260 },
  orderCard: { backgroundColor: colors.cardBg, borderRadius: 16, marginBottom: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontWeight: '900', color: colors.textDark },
  orderDate: { color: colors.textMuted, marginTop: 2, fontSize: 11 },
  statusChip: { height: 26 },
  chipText: { fontSize: 10, fontWeight: '900' },
  customerBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  customerText: { color: colors.textDark, fontSize: 12 },
  addressBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4, backgroundColor: colors.background, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  addressText: { color: colors.textMuted, fontSize: 11, flex: 1, lineHeight: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemImage: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  placeholderImg: { justifyContent: 'center', alignItems: 'center' },
  itemName: { fontWeight: '700', color: colors.textDark, fontSize: 13 },
  itemQty: { color: colors.textMuted, fontSize: 11 },
  orderBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 },
  totalPrice: { fontWeight: '900', color: colors.primary },
  actionBtn: { borderRadius: 10 },
});