import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import colors from '../constants/colors';

export default function BottomNav({ activeTab, setActiveTab }) {
  const [userAvatar, setUserAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'
  );

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.photoURL) setUserAvatar(user.photoURL);

        // Firestore se live updated avatar fetch
        if (db) {
          const unsubDoc = onSnapshot(doc(db, 'adminSettings', user.uid), (docSnap) => {
            if (docSnap.exists() && docSnap.data().avatar) {
              setUserAvatar(docSnap.data().avatar);
            }
          });
          return () => unsubDoc();
        }
      }
    });

    return () => unsubAuth();
  }, []);

  const tabs = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'Browse', icon: 'grid-outline', activeIcon: 'grid' },
    { name: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt' },
    { name: 'Dashboard', isProfile: true },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.name)}
            activeOpacity={0.7}
          >
            {tab.isProfile ? (
              <View style={[styles.avatarWrap, isActive && styles.avatarWrapActive]}>
                <Image source={{ uri: userAvatar }} style={styles.avatarImg} />
              </View>
            ) : (
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? colors.primary : '#9E9E9E'}
              />
            )}
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderWidth: 0,
    outlineWidth: 0,
  },
  avatarWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  tabLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 3,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});