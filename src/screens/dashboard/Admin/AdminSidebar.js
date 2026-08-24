import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../../../services/api';
import colors from '../../../constants/colors';

export default function AdminSidebar({ visible, onClose, activeTab, setActiveTab, adminProfile }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'grid-outline', activeIcon: 'grid' },
    { id: 'products', label: 'Manage Products', icon: 'cube-outline', activeIcon: 'cube' },
    { id: 'orders', label: 'Customer Orders', icon: 'receipt-outline', activeIcon: 'receipt' },
    { id: 'profile', label: 'Admin Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sidebar}>
          {/* Admin Header */}
          <View style={styles.header}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' }}
              style={styles.avatar}
            />
            <View style={styles.adminInfo}>
              <Text style={styles.name} numberOfLines={1}>{adminProfile?.name || 'Super Admin'}</Text>
              <Text style={styles.badge}>Instacart Admin</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          {/* Nav Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.item, active && styles.activeItem]}
                  onPress={() => handleSelect(item.id)}
                >
                  <Ionicons
                    name={active ? item.activeIcon : item.icon}
                    size={20}
                    color={active ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.itemText, active && styles.activeText]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)' },
  backdrop: { flex: 1 },
  sidebar: {
    width: '78%',
    maxWidth: 300,
    backgroundColor: colors.cardBg,
    height: '100%',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  adminInfo: { flex: 1, marginLeft: 10 },
  name: { fontSize: 14, fontWeight: 'bold', color: colors.textDark },
  badge: { fontSize: 11, color: colors.secondary, fontWeight: '600' },
  closeBtn: { padding: 4 },
  menuContainer: { flex: 1, marginTop: 20, gap: 6 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  activeItem: { backgroundColor: '#E8F5E9' },
  itemText: { fontSize: 14, color: colors.textDark, fontWeight: '500' },
  activeText: { color: colors.primary, fontWeight: 'bold' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: { color: colors.danger, fontWeight: 'bold', fontSize: 14 },
});