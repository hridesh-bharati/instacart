import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToNotifications, markNotificationRead } from '../services/api/notifications.api';
import colors from '../constants/colors';

export default function NotificationsModal({ visible, onClose, currentUser }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const unsub = subscribeToNotifications(currentUser.uid, (list) => {
      setNotifications(list);
    });
    return () => unsub();
  }, [currentUser]);

  const handleMarkRead = (notifId) => {
    if (currentUser) {
      markNotificationRead(currentUser.uid, notifId);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.dragBar} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {notifications.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            ) : (
              notifications.map((item) => (
                <Card 
                  key={item.id} 
                  style={[styles.notifCard, !item.read && styles.unreadCard]}
                  onPress={() => handleMarkRead(item.id)}
                >
                  <Card.Content>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      {!item.read && <View style={styles.dot} />}
                    </View>
                    <Text style={styles.notifBody}>{item.body}</Text>
                    <Text style={styles.notifTime}>
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </Text>
                  </Card.Content>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, maxHeight: '75%', maxWidth: 480, alignSelf: 'center', width: '100%' },
  dragBar: { width: 36, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 10 },
  title: { fontSize: 16, fontWeight: '900', color: colors.textDark },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
  notifCard: { backgroundColor: '#F9FAFB', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  unreadCard: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  notifTitle: { fontSize: 13, fontWeight: '800', color: colors.textDark },
  notifBody: { fontSize: 12, color: '#4B5563', marginTop: 4 },
  notifTime: { fontSize: 10, color: colors.textMuted, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A' },
});