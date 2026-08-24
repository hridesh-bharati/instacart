import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addProductToDB, deleteProductFromDB } from '../../../services/api';
import colors from '../../../constants/colors';

export default function AdminProducts({ products }) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!name || !price) {
      Alert.alert('Required', 'Product Name and Price are mandatory');
      return;
    }

    setLoading(true);
    try {
      await addProductToDB({
        name,
        weight: weight || '1 kg',
        price: parseFloat(price),
        oldPrice: oldPrice ? `$${oldPrice}` : '',
        image:
          image ||
          'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80',
      });
      setName('');
      setWeight('');
      setPrice('');
      setOldPrice('');
      setImage('');
      Alert.alert('Success', 'Product published to store!');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Add Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add Product</Text>
        <TextInput
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <View style={styles.row}>
          <TextInput
            placeholder="Weight (e.g. 500 g)"
            value={weight}
            onChangeText={setWeight}
            style={[styles.input, { flex: 1 }]}
          />
          <TextInput
            placeholder="Price ($)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={[styles.input, { flex: 1 }]}
          />
        </View>
        <TextInput
          placeholder="Old Price (Optional)"
          value={oldPrice}
          onChangeText={setOldPrice}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Image URL"
          value={image}
          onChangeText={setImage}
          style={styles.input}
        />

        <TouchableOpacity style={styles.btn} onPress={handlePublish} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Publish Live</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <Text style={styles.listHeading}>Live Inventory ({products.length})</Text>
      {products.map((p) => (
        <View key={p.id} style={styles.itemRow}>
          <Image source={{ uri: p.image }} style={styles.itemImg} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.itemMeta}>{p.weight} • ${parseFloat(p.price).toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.delBtn} onPress={() => deleteProductFromDB(p.id)}>
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 30 },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textDark, marginBottom: 12 },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: colors.textDark,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', gap: 10 },
  btn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  listHeading: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  itemImg: { width: 44, height: 44, borderRadius: 10 },
  itemDetails: { flex: 1, marginLeft: 10 },
  itemName: { fontSize: 13, fontWeight: 'bold', color: colors.textDark },
  itemMeta: { fontSize: 11, color: colors.textMuted },
  delBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});