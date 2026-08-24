import React from 'react';
import { StyleSheet, View, Text, Modal, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function CartModal({ visible, onClose, cart, onUpdateQty }) {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal > 0 ? 2.0 : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.sheet}>
          <View style={styles.dragBar} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Your Cart</Text>
              <Text style={styles.subtitle}>{totalCount} items selected</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
            {cart.length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialCommunityIcons name="cart-off" size={46} color={colors.textMuted} />
                <Text style={styles.emptyText}>Your cart is empty</Text>
              </View>
            ) : (
              cart.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Image source={{ uri: item.image }} style={styles.itemImg} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemPrice}>${(item.price * item.qty).toFixed(2)}</Text>
                  </View>
                  <View style={styles.qtyWrap}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => onUpdateQty(item.id, -1)}>
                      <Ionicons name="remove" size={14} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyVal}>{item.qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => onUpdateQty(item.id, 1)}>
                      <Ionicons name="add" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {cart.length > 0 && (
            <View style={styles.summaryWrap}>
              <View style={styles.line}>
                <Text style={styles.lineLabel}>Subtotal</Text>
                <Text style={styles.lineVal}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.line}>
                <Text style={styles.lineLabel}>Delivery Fee</Text>
                <Text style={styles.lineVal}>${deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.line, styles.totalLine]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalVal}>${grandTotal.toFixed(2)}</Text>
              </View>

              <TouchableOpacity style={styles.checkoutBtn}>
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '75%',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  dragBar: {
    width: 38,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemList: {
    maxHeight: 220,
    marginVertical: 10,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F7F7',
  },
  itemImg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 2,
  },
  qtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 8,
  },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  summaryWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  lineLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  lineVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
  },
  totalLine: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  totalVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 12,
    gap: 8,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});