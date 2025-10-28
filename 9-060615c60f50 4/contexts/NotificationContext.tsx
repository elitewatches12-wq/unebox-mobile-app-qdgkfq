
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface NotificationPreferences {
  enabled: boolean;
  newDocument: boolean;
  documentUpdate: boolean;
  daily: boolean;
  weekly: boolean;
  time: string;
}

interface NotificationContextType {
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  sendLocalNotification: (title: string, body: string) => Promise<void>;
  scheduleDailyNotification: () => Promise<void>;
  scheduleWeeklyNotification: () => Promise<void>;
  cancelAllScheduledNotifications: () => Promise<void>;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    newDocument: true,
    documentUpdate: true,
    daily: false,
    weekly: false,
    time: '09:00',
  });
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      console.log('[NotificationContext] Must use physical device for push notifications');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[NotificationContext] Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('[NotificationContext] Push token:', token);

      // Save token to database
      if (user) {
        await supabase
          .from('user_preferences')
          .update({ push_token: token })
          .eq('user_id', user.id);
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#64B5F6',
        });
      }
    } catch (error) {
      console.error('[NotificationContext] Error registering for push notifications:', error);
    }
  }, [user]);

  const loadNotificationPreferences = useCallback(async () => {
    try {
      console.log('[NotificationContext] Loading notification preferences');
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('[NotificationContext] Error loading preferences:', error);
      } else if (data) {
        setPreferences({
          enabled: data.notifications_enabled ?? true,
          newDocument: data.notification_new_document ?? true,
          documentUpdate: data.notification_document_update ?? true,
          daily: data.notification_daily ?? false,
          weekly: data.notification_weekly ?? false,
          time: data.notification_time || '09:00',
        });
        console.log('[NotificationContext] Preferences loaded');

        // Schedule notifications if enabled
        if (data.notification_daily) {
          await scheduleDailyNotification();
        }
        if (data.notification_weekly) {
          await scheduleWeeklyNotification();
        }
      }
    } catch (error) {
      console.error('[NotificationContext] Exception loading preferences:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      registerForPushNotifications();
      loadNotificationPreferences();
    }

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[NotificationContext] Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[NotificationContext] Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user, registerForPushNotifications, loadNotificationPreferences]);

  const updatePreferences = async (prefs: Partial<NotificationPreferences>) => {
    console.log('[NotificationContext] Updating preferences:', prefs);
    const newPreferences = { ...preferences, ...prefs };
    setPreferences(newPreferences);

    if (user) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .update({
            notifications_enabled: newPreferences.enabled,
            notification_new_document: newPreferences.newDocument,
            notification_document_update: newPreferences.documentUpdate,
            notification_daily: newPreferences.daily,
            notification_weekly: newPreferences.weekly,
            notification_time: newPreferences.time,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('[NotificationContext] Error saving preferences:', error);
        } else {
          console.log('[NotificationContext] Preferences saved');

          // Update scheduled notifications
          await cancelAllScheduledNotifications();
          if (newPreferences.daily) {
            await scheduleDailyNotification();
          }
          if (newPreferences.weekly) {
            await scheduleWeeklyNotification();
          }
        }
      } catch (error) {
        console.error('[NotificationContext] Exception saving preferences:', error);
      }
    }
  };

  const sendLocalNotification = async (title: string, body: string) => {
    if (!preferences.enabled) {
      console.log('[NotificationContext] Notifications disabled');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // Send immediately
      });
      console.log('[NotificationContext] Local notification sent');
    } catch (error) {
      console.error('[NotificationContext] Error sending notification:', error);
    }
  };

  const scheduleDailyNotification = async () => {
    try {
      const [hours, minutes] = preferences.time.split(':').map(Number);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rappel quotidien UneBox',
          body: 'N\'oubliez pas de vérifier vos documents et rappels du jour !',
          sound: true,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
      console.log('[NotificationContext] Daily notification scheduled');
    } catch (error) {
      console.error('[NotificationContext] Error scheduling daily notification:', error);
    }
  };

  const scheduleWeeklyNotification = async () => {
    try {
      const [hours, minutes] = preferences.time.split(':').map(Number);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Résumé hebdomadaire UneBox',
          body: 'Consultez votre résumé hebdomadaire de documents et activités !',
          sound: true,
        },
        trigger: {
          weekday: 1, // Monday
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
      console.log('[NotificationContext] Weekly notification scheduled');
    } catch (error) {
      console.error('[NotificationContext] Error scheduling weekly notification:', error);
    }
  };

  const cancelAllScheduledNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[NotificationContext] All scheduled notifications cancelled');
    } catch (error) {
      console.error('[NotificationContext] Error cancelling notifications:', error);
    }
  };

  const value = {
    preferences,
    updatePreferences,
    sendLocalNotification,
    scheduleDailyNotification,
    scheduleWeeklyNotification,
    cancelAllScheduledNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
