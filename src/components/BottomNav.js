import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'Browse', icon: 'grid-outline', activeIcon: 'grid' },
    { name: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt' },
    { name: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid' },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => setActiveTab(tab.name)}
            style={styles.navItem}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.navText, isActive && styles.activeText]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
  },
  navText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  activeText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});