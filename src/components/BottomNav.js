import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { checkIsAdmin } from '../services/api/auth.api';
import colors from '../constants/colors';

export default function BottomNav({ activeTab, setActiveTab }) {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [userAvatar, setUserAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'
  );

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdminUser(checkIsAdmin(user));
        if (user.photoURL) setUserAvatar(user.photoURL);

        if (db) {
          const unsubDoc = onSnapshot(doc(db, 'adminSettings', user.uid), (docSnap) => {
            if (docSnap.exists() && docSnap.data().avatar) {
              setUserAvatar(docSnap.data().avatar);
            }
          });
          return () => unsubDoc();
        }
      } else {
        setIsAdminUser(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const tabs = [
    { name: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'Browse', label: 'Browse', icon: 'grid-outline', activeIcon: 'grid' },
    { name: 'Orders', label: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt' },
    { 
      name: isAdminUser ? 'Dashboard' : 'Profile', 
      label: isAdminUser ? 'Dashboard' : 'Profile', 
      isProfile: true 
    },
  ];

  return (
    <View style={styles.navContainer}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const targetTabName = tab.name;
          const isActive = activeTab === targetTabName;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => setActiveTab(targetTabName)}
              activeOpacity={0.8}
            >
              {/* Active Pill Background Highlight */}
              {isActive && <View style={styles.activeIndicatorPill} />}

              {tab.isProfile ? (
                <View style={[styles.avatarWrap, isActive && styles.avatarWrapActive]}>
                  <Image source={{ uri: userAvatar }} style={styles.avatarImg} />
                </View>
              ) : (
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={20}
                  color={isActive ? colors.primary : '#9CA3AF'}
                />
              )}

              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  navBar: {
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // Premium Soft Elevation Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activeIndicatorPill: {
    position: 'absolute',
    top: 6,
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  avatarWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
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
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
});