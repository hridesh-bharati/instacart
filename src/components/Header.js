import React from 'react';
import { StyleSheet, View, TextInput, Platform, Image } from 'react-native';
import { Text, Surface, IconButton, Badge } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function Header({ 
  cartCount = 0, 
  onOpenCart, 
  onOpenNotifications, 
  notificationCount = 0,
  searchQuery = '',
  onSearchChange
}) {
  return (
    <Surface style={styles.container} elevation={1}>
      {/* Top Row: Brand Logo & Action Icons */}
      <View style={styles.topRow}>
        <View style={styles.logoWrap}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.brandLogo} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.actionWrap}>
          {/* Notifications Bell */}
          <View style={styles.iconWrapper}>
            <IconButton
              icon="bell-outline"
              size={20}
              iconColor={colors.textDark}
              style={styles.circleBtn}
              onPress={onOpenNotifications}
            />
            {notificationCount > 0 && (
              <Badge size={16} style={styles.notificationBadge}>
                {notificationCount}
              </Badge>
            )}
          </View>

          {/* Cart Icon */}
          <View style={styles.iconWrapper}>
            <IconButton
              icon="cart-outline"
              size={20}
              iconColor={colors.textDark}
              style={styles.circleBtn}
              onPress={onOpenCart}
            />
            {cartCount > 0 && (
              <Badge size={16} style={styles.cartBadge}>
                {cartCount}
              </Badge>
            )}
          </View>
        </View>
      </View>

      {/* Search Bar & Filter Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search products, stores, and restaurants"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
            style={styles.input}
          />
        </View>
        
        <Surface style={styles.filterBtnSurface} elevation={2}>
          <IconButton
            icon="tune"
            size={18}
            iconColor="#fff"
            style={styles.filterBtn}
            onPress={() => {}}
          />
        </Surface>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoWrap: {
    justifyContent: 'center',
  },
  brandLogo: {
    width: 120, // Aap apne logo ke aspect ratio ke hisaab se width adjust kar sakte hain
    height: 36,
  },
  actionWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  iconWrapper: {
    position: 'relative',
  },
  circleBtn: {
    margin: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.secondary,
    color: '#fff',
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.danger,
    color: '#fff',
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '500',
  },
  filterBtnSurface: {
    borderRadius: 24,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  filterBtn: {
    margin: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});