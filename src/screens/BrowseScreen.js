import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { categories } from '../data/mockData';
import colors from '../constants/colors';

export default function BrowseScreen() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Explore Categories</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          placeholder="Filter categories..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.grid}>
        {filteredCategories.map((cat) => (
          <TouchableOpacity key={cat.id} style={styles.gridCard}>
            <View style={[styles.iconBox, { backgroundColor: cat.color }]}>
              <MaterialCommunityIcons name={cat.icon} size={32} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>{cat.title}</Text>
            <Text style={styles.cardCount}>{cat.count}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 90,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  cardCount: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});