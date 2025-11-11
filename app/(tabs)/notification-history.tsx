
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Tables } from '@/app/integrations/supabase/types';

type NotificationLog = Tables<'notification_logs'>;

export default function NotificationHistoryScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      console.log('[NotificationHistory] Loading notifications');
      setLoading(true);

      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[NotificationHistory] Error loading notifications:', error);
      } else {
        setNotifications(data || []);
        console.log('[NotificationHistory] Loaded notifications:', data?.length);
      }
    } catch (error) {
      console.error('[NotificationHistory] Exception loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return { name: 'bell.fill', color: '#FF6B6B' };
      case 'document_processed':
        return { name: 'checkmark.circle.fill', color: '#4CAF50' };
      case 'document_failed':
        return { name: 'exclamationmark.triangle.fill', color: colors.error };
      case 'daily_summary':
        return { name: 'sun.max.fill', color: '#FFA07A' };
      case 'weekly_summary':
        return { name: 'calendar', color: '#64B5F6' };
      default:
        return { name: 'bell.fill', color: colors.primary };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Historique des notifications',
            headerShown: Platform.OS !== 'ios',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Notifications',
            headerLargeTitle: true,
          }}
        />
      )}
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="bell.slash.fill" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Aucune notification
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Vous recevrez ici l&apos;historique de toutes vos notifications
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          >
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Historique
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {notifications.length} notification{notifications.length > 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.notificationsList}>
              {notifications.map((notification) => {
                const iconInfo = getNotificationIcon(notification.notification_type);
                
                return (
                  <View
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.notificationIcon,
                        { backgroundColor: iconInfo.color + '20' },
                      ]}
                    >
                      <IconSymbol
                        name={iconInfo.name}
                        size={24}
                        color={iconInfo.color}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={[styles.notificationTitle, { color: colors.text }]}>
                          {notification.title}
                        </Text>
                        {!notification.delivered && (
                          <View style={[styles.failedBadge, { backgroundColor: colors.error + '20' }]}>
                            <Text style={[styles.failedBadgeText, { color: colors.error }]}>
                              Échec
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.notificationBody, { color: colors.textSecondary }]}>
                        {notification.body}
                      </Text>
                      <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                        {formatDate(notification.sent_at || '')}
                      </Text>
                      {notification.error_message && (
                        <Text style={[styles.errorMessage, { color: colors.error }]}>
                          ⚠️ {notification.error_message}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  failedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  failedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  notificationBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
  },
  errorMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
});
