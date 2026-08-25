// src\screens\dashboard\Admin\AdminOrders.js
import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { sampleOrders } from '../../../data/mockData';
import colors from '../../../constants/colors';

export default function AdminOrders() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Incoming Orders ({sampleOrders.length})</Text>

      {sampleOrders.map((order) => (
        <View key={order.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.orderId}>{order.id}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{order.status}</Text>
            </View>
          </View>
          <Text style={styles.meta}>{order.store} • {order.date}</Text>
          <View style={styles.bottomRow}>
            <Text style={styles.totalText}>Amount: ${order.total.toFixed(2)}</Text>
            <TouchableOpacity style={styles.statusBtn}>
              <Text style={styles.statusBtnText}>Update Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 30 },
  heading: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: 'bold', color: colors.textDark },
  badge: { backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: colors.secondary },
  meta: { fontSize: 12, color: colors.textMuted },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 8,
  },
  totalText: { fontSize: 13, fontWeight: 'bold', color: colors.primary },
  statusBtn: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusBtnText: { fontSize: 11, fontWeight: 'bold', color: colors.primary },
});