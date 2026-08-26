import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import colors from '../../../constants/colors';

export default function AdminDashboard() {
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
      <Card style={{ flex: 1, backgroundColor: '#E8F5E9' }}>
        <Card.Content style={{ alignItems: 'center' }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#2E7D32' }}>₹1,24,500</Text>
          <Text variant="bodySmall" style={{ color: colors.textMuted }}>Total Revenue</Text>
        </Card.Content>
      </Card>
      <Card style={{ flex: 1, backgroundColor: '#E3F2FD' }}>
        <Card.Content style={{ alignItems: 'center' }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#1565C0' }}>428</Text>
          <Text variant="bodySmall" style={{ color: colors.textMuted }}>Total Orders</Text>
        </Card.Content>
      </Card>
    </View>
  );
}