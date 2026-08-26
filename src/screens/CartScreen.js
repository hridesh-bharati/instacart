import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { placeOrder } from '../services/api/orders.api';
import { sendNotification } from '../services/api/notifications.api';
import colors from '../constants/colors';

export default function CartScreen({ cart, onUpdateQty, currentUser, onNavigate }) {
  const [step, setStep] = useState('cart'); // 'cart' or 'checkout'
  
  const [fullName, setFullName] = useState(currentUser?.displayName || 'Hridesh Bharati');
  const [phone, setPhone] = useState('7267995307');
  const [address, setAddress] = useState('Bajahi chauraha, Nichlaul');
  const [city, setCity] = useState('Maharajganj');
  const [pincode, setPincode] = useState('273304');
  const [loading, setLoading] = useState(false);

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.qty, 0);
  const deliveryFee = subtotal > 0 ? 20.0 : 0;
  const grandTotal = subtotal + deliveryFee;

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') alert(`${title}: ${msg}`);
    else Alert.alert(title, msg);
  };

  const handleProceed = () => {
    if (!currentUser) {
      showAlert('Login Required', 'Please sign in to place an order.');
      if (onNavigate) onNavigate('Orders');
      return;
    }
    if (cart.length === 0) {
      showAlert('Empty Cart', 'Your cart is empty.');
      return;
    }
    setStep('checkout');
  };

  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      showAlert('Incomplete Details', 'Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      const shippingDetails = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      };

      await placeOrder(currentUser.uid, cart, grandTotal, shippingDetails);

      await sendNotification(
        currentUser.uid,
        'Order Confirmed! 📦',
        `COD Order of ₹${grandTotal.toFixed(2)} is successfully placed for ${city}.`
      );

      setLoading(false);
      setStep('cart');
      showAlert('Success', 'Order placed successfully! Check My Orders.');
      
      if (onNavigate) onNavigate('Orders');
    } catch (err) {
      setLoading(false);
      showAlert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          {step === 'cart' ? 'My Shopping Cart' : 'Checkout & Delivery Details'}
        </Text>
        <Text variant="bodySmall" style={styles.headerSub}>
          {step === 'cart' ? `${totalCount} items in cart` : 'Cash on Delivery (COD)'}
        </Text>
      </View>

      {/* Quick Action Grid Buttons */}
      {step === 'cart' && (
        <View style={styles.quickGrid}>
          <TouchableOpacity 
            style={[styles.quickCard, { backgroundColor: '#E0F2FE' }]}
            onPress={() => onNavigate && onNavigate('Orders')}
          >
            <Ionicons name="receipt-outline" size={18} color="#0369A1" />
            <Text style={[styles.quickCardText, { color: '#0369A1' }]}>My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickCard, { backgroundColor: '#FCE7F3' }]}
            onPress={() => onNavigate && onNavigate('Wishlist')} // <-- FIX: Changed from 'Home' to 'Wishlist'
          >
            <Ionicons name="heart-outline" size={18} color="#BE185D" />
            <Text style={[styles.quickCardText, { color: '#BE185D' }]}>Wishlist</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickCard, { backgroundColor: '#FEF3C7' }]}
            onPress={() => onNavigate && onNavigate('Home')}
          >
            <Ionicons name="storefront-outline" size={18} color="#B45309" />
            <Text style={[styles.quickCardText, { color: '#B45309' }]}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'cart' ? (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {cart.length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialCommunityIcons name="cart-outline" size={64} color={colors.textMuted} />
                <Text variant="titleMedium" style={styles.emptyTitle}>Your Cart is Empty</Text>
                <Text variant="bodySmall" style={styles.emptySub}>Explore products and add items to your cart.</Text>
                <Button 
                  mode="contained" 
                  buttonColor={colors.primary} 
                  style={styles.shopNowBtn}
                  onPress={() => onNavigate && onNavigate('Home')}
                >
                  Shop Now
                </Button>
              </View>
            ) : (
              cart.map((item) => (
                <Surface key={item.id} style={styles.itemCard} elevation={1}>
                  <Image source={{ uri: item.image }} style={styles.itemImg} />
                  <View style={styles.itemInfo}>
                    <Text variant="bodyMedium" style={styles.itemName} numberOfLines={1}>
                      {item.name || item.title}
                    </Text>
                    <Text variant="titleSmall" style={styles.itemPrice}>
                      ₹{parseFloat(item.price || 0).toFixed(2)}
                    </Text>
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
                </Surface>
              ))
            )}
          </ScrollView>

          {cart.length > 0 && (
            <Surface style={styles.footerSummary} elevation={2}>
              <View style={styles.line}>
                <Text variant="bodyMedium" style={styles.lineLabel}>Bag Subtotal</Text>
                <Text variant="bodyMedium" style={styles.lineVal}>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.line}>
                <Text variant="bodyMedium" style={styles.lineLabel}>Delivery Charges</Text>
                <Text variant="bodyMedium" style={styles.lineVal}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.line, styles.totalLine]}>
                <Text variant="titleMedium" style={styles.totalLabel}>Total Amount</Text>
                <Text variant="titleMedium" style={styles.totalVal}>₹{grandTotal.toFixed(2)}</Text>
              </View>

              <Button 
                mode="contained" 
                buttonColor={colors.primary} 
                style={styles.mainBtn}
                contentStyle={{ height: 48 }}
                onPress={handleProceed}
              >
                Proceed to Checkout
              </Button>
            </Surface>
          )}
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.checkoutBody, { paddingBottom: 110 }]}>
          <TouchableOpacity style={styles.backLink} onPress={() => setStep('cart')}>
            <Ionicons name="arrow-back" size={16} color={colors.primary} />
            <Text style={styles.backLinkText}>Back to Cart</Text>
          </TouchableOpacity>

          <Text variant="titleSmall" style={styles.sectionHeading}>1. Contact Information</Text>
          <TextInput
            label="Full Name *"
            mode="outlined"
            value={fullName}
            onChangeText={setFullName}
            style={styles.paperInput}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />
          <TextInput
            label="Mobile Number *"
            mode="outlined"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.paperInput}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          <Text variant="titleSmall" style={[styles.sectionHeading, { marginTop: 12 }]}>2. Detailed Shipping Location</Text>
          <TextInput
            label="House No, Building, Street Name, Landmark *"
            mode="outlined"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            style={[styles.paperInput, { height: 80 }]}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="City / District *"
                mode="outlined"
                value={city}
                onChangeText={setCity}
                style={styles.paperInput}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Pincode *"
                mode="outlined"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                maxLength={6}
                style={styles.paperInput}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
            </View>
          </View>

          <Surface style={styles.paymentBox} elevation={0}>
            <MaterialCommunityIcons name="cash-fast" size={26} color={colors.secondary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text variant="titleSmall" style={styles.payTitle}>Cash on Delivery (COD)</Text>
              <Text variant="bodySmall" style={styles.paySub}>Pay cash securely when your order arrives at your door.</Text>
            </View>
          </Surface>

          <View style={styles.footerSummaryStatic}>
            <View style={[styles.line, styles.totalLine]}>
              <Text variant="titleMedium" style={styles.totalLabel}>Payable Total</Text>
              <Text variant="titleMedium" style={styles.totalVal}>₹{grandTotal.toFixed(2)}</Text>
            </View>

            <Button 
              mode="contained" 
              buttonColor={colors.primary} 
              style={styles.mainBtn}
              contentStyle={{ height: 48 }}
              onPress={handlePlaceOrder}
              loading={loading}
              disabled={loading}
            >
              Place Order (COD)
            </Button>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { marginBottom: 4 },
  headerTitle: { fontWeight: '900', color: colors.textDark },
  headerSub: { color: colors.textMuted, marginTop: 2, marginBottom: 8 },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 12 },
  quickCard: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  quickCardText: { fontSize: 12, fontWeight: '800' },
  scrollBody: { paddingBottom: 100 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontWeight: '800', color: colors.textDark, marginTop: 12 },
  emptySub: { color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  shopNowBtn: { marginTop: 20, borderRadius: 12 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  itemImg: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.background },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontWeight: '700', color: colors.textDark },
  itemPrice: { fontWeight: '800', color: colors.primary, marginTop: 4 },
  qtyWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, gap: 8 },
  qtyBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.cardBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  qtyVal: { fontWeight: 'bold', color: colors.textDark, fontSize: 13 },
  footerSummary: { position: 'absolute', bottom: 0, left: 16, right: 16, backgroundColor: colors.cardBg, padding: 16, borderTopWidth: 1, borderTopColor: colors.border, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  footerSummaryStatic: { backgroundColor: colors.cardBg, padding: 16, borderRadius: 16, marginTop: 16, borderWidth: 1, borderColor: colors.border },
  line: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  lineLabel: { color: colors.textMuted },
  lineVal: { fontWeight: '600', color: colors.textDark },
  totalLine: { marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontWeight: 'bold', color: colors.textDark },
  totalVal: { fontWeight: '900', color: colors.primary },
  mainBtn: { borderRadius: 14, marginTop: 10 },
  checkoutBody: { flex: 1 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  backLinkText: { fontWeight: '700', color: colors.primary, fontSize: 13 },
  sectionHeading: { fontWeight: '900', color: colors.primary, marginBottom: 4 },
  paperInput: { backgroundColor: colors.cardBg, marginBottom: 10, fontSize: 13 },
  rowInputs: { flexDirection: 'row', gap: 10 },
  paymentBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7', padding: 14, borderRadius: 14, marginTop: 10 },
  payTitle: { fontWeight: 'bold', color: '#166534' },
  paySub: { color: '#15803D', marginTop: 2, fontSize: 11 },
});