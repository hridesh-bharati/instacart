// src\screens\dashboard\Admin\AdminDashboard.js
import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import colors from '../../../constants/colors';

export default function AdminDashboard({ products }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Overview & Metrics</Text>
      
      {/* 3 Metric Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{products.length}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>$4,890</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>214</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
      </View>

      {/* Quick Summary Cards */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Recent Store Activity</Text>
        <Text style={styles.activityText}>• 4 new orders placed in the last hour.</Text>
        <Text style={styles.activityText}>• 2 items are running low on stock.</Text>
        <Text style={styles.activityText}>• Database connected: Realtime DB Live.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNum: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardHeader: { fontSize: 15, fontWeight: 'bold', color: colors.textDark, marginBottom: 4 },
  activityText: { fontSize: 13, color: colors.textDark, lineHeight: 18 },
});