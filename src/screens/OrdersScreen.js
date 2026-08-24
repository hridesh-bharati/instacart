import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sampleOrders } from '../data/mockData';
import colors from '../constants/colors';

export default function OrdersScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>My Orders</Text>

      {sampleOrders.map((order) => {
        const isTransit = order.status === 'In Transit';
        return (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderTop}>
              <View>
                <Text style={styles.storeName}>{order.store}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isTransit ? '#FFF3E0' : '#E8F5E9' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: isTransit ? colors.secondary : colors.success },
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderBottom}>
              <Text style={styles.orderInfo}>
                {order.itemsCount} items • <Text style={styles.boldTotal}>${order.total.toFixed(2)}</Text>
              </Text>
              <TouchableOpacity style={styles.reorderBtn}>
                <Text style={styles.reorderText}>Reorder</Text>
                <Ionicons name="refresh" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 90,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 12,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    fontSize: 13,
    color: colors.textMuted,
  },
  boldTotal: {
    color: colors.textDark,
    fontWeight: 'bold',
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  reorderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
});