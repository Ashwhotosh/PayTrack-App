// app/notifications.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { Bell, Trash2, Check, MoreVertical } from 'lucide-react-native';

type NotificationType = 'system' | 'promotional' | 'transaction';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

// Mock data - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Payment Successful',
    message: 'Your payment of ₹500 to John Doe was successful',
    type: 'transaction',
    timestamp: '2024-02-25T10:30:00Z',
    read: false,
  },
  {
    id: '2',
    title: 'Special Offer',
    message: 'Get 20% cashback on your next transaction',
    type: 'promotional',
    timestamp: '2024-02-24T15:45:00Z',
    read: true,
  },
  {
    id: '3',
    title: 'Security Alert',
    message: 'New login detected from Mumbai device',
    type: 'system',
    timestamp: '2024-02-24T08:20:00Z',
    read: false,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(notif => notif.id !== id));
          },
        },
      ]
    );
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
          },
        },
      ]
    );
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'system':
        return '#FF9800';
      case 'promotional':
        return '#4CAF50';
      case 'transaction':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bell color="#8e44ad" size={32} />
        <Text style={styles.title}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllNotifications}
          >
            <Trash2 color="#FF5252" size={24} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell color="#666" size={48} />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View
              key={notification.id}
              style={[
                styles.notificationItem,
                notification.read && styles.readNotification,
              ]}
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <View style={styles.titleContainer}>
                    <View
                      style={[
                        styles.typeIndicator,
                        { backgroundColor: getTypeColor(notification.type) },
                      ]}
                    />
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                  </View>
                  <Text style={styles.timestamp}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
                <Text style={styles.message}>{notification.message}</Text>
                <View style={styles.notificationFooter}>
                  <Text style={styles.type}>
                    {notification.type.charAt(0).toUpperCase() +
                      notification.type.slice(1)}
                  </Text>
                  <View style={styles.actions}>
                    {!notification.read && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => markAsRead(notification.id)}
                      >
                        <Check color="#4CAF50" size={20} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteNotification(notification.id)}
                    >
                      <Trash2 color="#FF5252" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 16,
  },
  notificationItem: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  readNotification: {
    opacity: 0.7,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  message: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});