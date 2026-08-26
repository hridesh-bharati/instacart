import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import {
  Text,
  Button,
  Card,
  IconButton,
  Searchbar,
  SegmentedButtons,
  Portal,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import {
  subscribeToSection,
  addSectionItem,
  updateSectionItem,
  deleteSectionItem,
} from '../../../services/api/products.api';
import colors from '../../../constants/colors';

const CATEGORY_OPTIONS = ['Grocery', 'Restaurants', 'Alcohol', 'Retail'];

export default function AdminProducts() {
  const [section, setSection] = useState('flashSale');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Common Product Fields
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryTag, setCategoryTag] = useState('Grocery');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [unit, setUnit] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState('');

  // Stores Fields
  const [tag, setTag] = useState('');
  const [rating, setRating] = useState('4.8');
  const [deliveryTime, setDeliveryTime] = useState('20-30 min');

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToSection(section, (data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, [section]);

  const handlePickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.35,
      base64: true,
    });
    if (!res.canceled && res.assets[0]) {
      const img = res.assets[0].base64 ? `data:image/jpeg;base64,${res.assets[0].base64}` : res.assets[0].uri;
      setImage(img);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setBrand('');
    setCategoryTag('Grocery');
    setPrice('');
    setOldPrice('');
    setDiscount('');
    setUnit('');
    setImage('');
    setDescription('');
    setHighlights('');
    setTag('');
    setRating('4.8');
    setDeliveryTime('20-30 min');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      const msg = section === 'featuredStores' ? 'Store Name is required' : 'Product Title is required';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Required', msg);
      return;
    }

    setSaving(true);

    const highlightsArray = highlights
      ? highlights.split('\n').filter((line) => line.trim().length > 0)
      : [
          '100% Quality checked & hygienically packed.',
          'Directly sourced from verified partners.',
          'Easy return and replacement guarantee.',
        ];

    const payload = section === 'featuredStores'
      ? {
          name: title.trim(),
          title: title.trim(),
          tag: tag.trim() || 'Grocery & Essentials',
          rating: rating.trim() || '4.5',
          deliveryTime: deliveryTime.trim() || '20-30 min',
          image,
        }
      : {
          title: title.trim(),
          name: title.trim(),
          brand: brand.trim() || 'ZapStore Verified',
          category: categoryTag,
          tag: categoryTag,
          price: parseFloat(price) || 0,
          oldPrice: oldPrice ? parseFloat(oldPrice) : null,
          discount: discount ? parseInt(discount, 10) : null,
          unit: unit.trim() || '1 unit',
          description: description.trim() || 'High-quality everyday product stored with hygiene and ready for superfast delivery.',
          highlights: highlightsArray,
          image,
        };

    try {
      if (editingId) await updateSectionItem(section, editingId, payload);
      else await addSectionItem(section, payload);
      setModalVisible(false);
      resetForm();
    } catch (e) {
      if (Platform.OS === 'web') alert(e.message);
      else Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((i) => (i.title || i.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <View>
      <SegmentedButtons
        value={section}
        onValueChange={(val) => {
          setSection(val);
          resetForm();
        }}
        buttons={[
          { value: 'flashSale', label: 'Flash' },
          { value: 'dailyEssentials', label: 'Essentials' },
          { value: 'browseCategories', label: 'Tabs' },
          { value: 'featuredStores', label: 'Stores' },
        ]}
        style={{ marginBottom: 12 }}
      />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Searchbar
          placeholder={section === 'featuredStores' ? 'Search stores...' : 'Search products...'}
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, backgroundColor: '#fff' }}
        />
        <Button
          mode="contained"
          buttonColor={colors.primary}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          {section === 'featuredStores' ? '+ Store' : '+ Product'}
        </Button>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
      ) : (
        filtered.map((item) => (
          <Card key={item.id} style={{ marginBottom: 8, backgroundColor: '#fff' }}>
            <Card.Title
              title={item.title || item.name}
              subtitle={
                section === 'featuredStores'
                  ? `${item.tag || 'Store'} • ⭐ ${item.rating || '4.5'} • ⏱️ ${item.deliveryTime || '20 min'}`
                  : `₹${item.price || 0} • ${item.unit || ''} • [${item.category || item.tag || 'Grocery'}]`
              }
              left={() =>
                item.image ? (
                  <Image source={{ uri: item.image }} style={{ width: 44, height: 44, borderRadius: 8 }} />
                ) : null
              }
              right={(props) => (
                <View style={{ flexDirection: 'row' }}>
                  <IconButton
                    {...props}
                    icon="pencil"
                    iconColor="#166534"
                    onPress={() => {
                      setEditingId(item.id);
                      setTitle(item.title || item.name || '');
                      setImage(item.image || '');
                      if (section === 'featuredStores') {
                        setTag(item.tag || '');
                        setRating(String(item.rating || '4.8'));
                        setDeliveryTime(item.deliveryTime || '20-30 min');
                      } else {
                        setBrand(item.brand || '');
                        setCategoryTag(item.category || item.tag || 'Grocery');
                        setPrice(String(item.price || ''));
                        setOldPrice(String(item.oldPrice || ''));
                        setDiscount(String(item.discount || ''));
                        setUnit(item.unit || '');
                        setDescription(item.description || '');
                        setHighlights(Array.isArray(item.highlights) ? item.highlights.join('\n') : '');
                      }
                      setModalVisible(true);
                    }}
                  />
                  <IconButton
                    {...props}
                    icon="delete"
                    iconColor="#991B1B"
                    onPress={() => deleteSectionItem(section, item.id)}
                  />
                </View>
              )}
            />
          </Card>
        ))
      )}

      {/* Add / Edit Dialog Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 16,
            borderRadius: 16,
            maxHeight: '90%',
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>
              {editingId
                ? (section === 'featuredStores' ? 'Edit Store Details' : 'Edit Product')
                : (section === 'featuredStores' ? 'Add New Store' : 'Add New Product')}
            </Text>

            {/* Image Picker */}
            <Button mode="outlined" onPress={handlePickImage} style={{ marginBottom: 10 }}>
              {image ? 'Change Image File' : 'Pick Image File'}
            </Button>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ height: 110, borderRadius: 10, marginBottom: 10 }}
                resizeMode="cover"
              />
            ) : null}

            {/* Product / Store Title */}
            <TextInput
              label={section === 'featuredStores' ? 'Store Name *' : 'Product Title *'}
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              style={{ marginBottom: 8 }}
            />

            {section === 'featuredStores' ? (
              <>
                <TextInput
                  label="Category / Tag (e.g. Organic, Fruits & Dairy) *"
                  mode="outlined"
                  value={tag}
                  onChangeText={setTag}
                  style={{ marginBottom: 8 }}
                />
                <TextInput
                  label="Rating (e.g. 4.8)"
                  mode="outlined"
                  value={rating}
                  onChangeText={setRating}
                  keyboardType="numeric"
                  style={{ marginBottom: 8 }}
                />
                <TextInput
                  label="Delivery Time (e.g. 15-25 min) *"
                  mode="outlined"
                  value={deliveryTime}
                  onChangeText={setDeliveryTime}
                  style={{ marginBottom: 14 }}
                />
              </>
            ) : (
              <>
                {/* 4-Category Dropdown / Selector for Tabs and Products */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textDark, marginBottom: 6 }}>
                  Select Category Tab *
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategoryTag(cat)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: categoryTag === cat ? colors.primary : '#E5E7EB',
                        backgroundColor: categoryTag === cat ? '#E0F2FE' : '#F9FAFB',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: categoryTag === cat ? colors.primary : '#4B5563',
                        }}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  label="Brand Name (e.g. ZapStore Fresh / Amul / Haldiram)"
                  mode="outlined"
                  value={brand}
                  onChangeText={setBrand}
                  style={{ marginBottom: 8 }}
                />

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <TextInput
                    label="Selling Price (₹) *"
                    mode="outlined"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    label="Original Price (₹)"
                    mode="outlined"
                    value={oldPrice}
                    onChangeText={setOldPrice}
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <TextInput
                    label="Discount % (e.g. 20)"
                    mode="outlined"
                    value={discount}
                    onChangeText={setDiscount}
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    label="Unit (e.g. 1 kg, 500 g, 1 pc)"
                    mode="outlined"
                    value={unit}
                    onChangeText={setUnit}
                    style={{ flex: 1 }}
                  />
                </View>

                <TextInput
                  label="Product Highlights (Each line = 1 bullet point)"
                  mode="outlined"
                  value={highlights}
                  onChangeText={setHighlights}
                  multiline
                  numberOfLines={3}
                  placeholder="100% Quality checked&#10;Instant Delivery&#10;Fresh source guarantee"
                  style={{ marginBottom: 8 }}
                />

                <TextInput
                  label="Description & Details"
                  mode="outlined"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  style={{ marginBottom: 14 }}
                />
              </>
            )}

            <Button
              mode="contained"
              buttonColor={colors.primary}
              onPress={handleSave}
              loading={saving}
              style={{ borderRadius: 10, paddingVertical: 4 }}
            >
              {section === 'featuredStores' ? 'Save Store to Hub' : 'Save Product to Live Store'}
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}