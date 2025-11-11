
import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@react-navigation/native";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, RefreshControl } from "react-native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/app/integrations/supabase/client";
import { Tables } from "@/app/integrations/supabase/types";

type Reminder = Tables<'reminders'>;

export default function RemindersScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReminders = useCallback(async () => {
    if (!user) {
      console.log('[RemindersScreen] No user, skipping load');
      return;
    }

    try {
      console.log('[RemindersScreen] Loading reminders for user:', user.id);
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('[RemindersScreen] Error loading reminders:', error);
      } else {
        console.log('[RemindersScreen] Loaded reminders:', data?.length || 0);
        setReminders(data || []);
      }
    } catch (error) {
      console.error('[RemindersScreen] Exception loading reminders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadReminders();
  }, [user, loadReminders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReminders();
  };

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const newCompleted = !reminder.completed;
    
    const { error } = await supabase
      .from('reminders')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (error) {
      console.error('[RemindersScreen] Error toggling reminder:', error);
    } else {
      setReminders(reminders.map(r => 
        r.id === id ? { ...r, completed: newCompleted } : r
      ));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.accent;
      case 'low': return colors.secondary;
      default: return colors.textSecondary;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return 'Normale';
    }
  };

  const getDaysUntil = (dateString: string) => {
    const now = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `En retard de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    return `Dans ${diffDays} jours`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Rappels",
            headerLargeTitle: true,
          }}
        />
      )}
      <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement des rappels...</Text>
          </View>
        ) : reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="bell.fill" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Aucun rappel</Text>
            <Text style={styles.emptySubtitle}>
              Créez des rappels pour ne jamais oublier vos échéances importantes
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Active Reminders */}
            {activeReminders.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  À venir ({activeReminders.length})
                </Text>
                {activeReminders.map((reminder) => (
                  <Pressable
                    key={reminder.id}
                    style={[commonStyles.card, styles.reminderCard]}
                    onPress={() => toggleReminder(reminder.id)}
                  >
                    <View style={styles.reminderHeader}>
                      <Pressable
                        style={[
                          styles.checkbox,
                          reminder.completed && styles.checkboxChecked,
                        ]}
                        onPress={() => toggleReminder(reminder.id)}
                      >
                        {reminder.completed && (
                          <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </Pressable>
                      <View style={styles.reminderContent}>
                        <Text
                          style={[
                            styles.reminderTitle,
                            reminder.completed && styles.reminderTitleCompleted,
                          ]}
                        >
                          {reminder.title}
                        </Text>
                        {reminder.description && (
                          <Text style={styles.reminderDescription}>
                            {reminder.description}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.reminderFooter}>
                      <View style={styles.reminderMeta}>
                        <IconSymbol name="calendar" size={14} color={colors.textSecondary} />
                        <Text style={styles.reminderMetaText}>
                          {formatDate(reminder.due_date)}
                        </Text>
                      </View>
                      <View style={styles.reminderMeta}>
                        <View
                          style={[
                            styles.priorityDot,
                            { backgroundColor: getPriorityColor(reminder.priority || 'medium') },
                          ]}
                        />
                        <Text style={styles.reminderMetaText}>
                          {getPriorityLabel(reminder.priority || 'medium')}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.daysUntilBadge,
                        {
                          backgroundColor:
                            getDaysUntil(reminder.due_date).includes('retard')
                              ? colors.error + '15'
                              : colors.primary + '15',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.daysUntilText,
                          {
                            color: getDaysUntil(reminder.due_date).includes('retard')
                              ? colors.error
                              : colors.primary,
                          },
                        ]}
                      >
                        {getDaysUntil(reminder.due_date)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Completed Reminders */}
            {completedReminders.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Terminés ({completedReminders.length})
                </Text>
                {completedReminders.map((reminder) => (
                  <Pressable
                    key={reminder.id}
                    style={[commonStyles.card, styles.reminderCard, styles.reminderCardCompleted]}
                    onPress={() => toggleReminder(reminder.id)}
                  >
                    <View style={styles.reminderHeader}>
                      <Pressable
                        style={[styles.checkbox, styles.checkboxChecked]}
                        onPress={() => toggleReminder(reminder.id)}
                      >
                        <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                      </Pressable>
                      <View style={styles.reminderContent}>
                        <Text style={[styles.reminderTitle, styles.reminderTitleCompleted]}>
                          {reminder.title}
                        </Text>
                        {reminder.description && (
                          <Text style={styles.reminderDescription}>
                            {reminder.description}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.reminderFooter}>
                      <View style={styles.reminderMeta}>
                        <IconSymbol name="calendar" size={14} color={colors.textSecondary} />
                        <Text style={styles.reminderMetaText}>
                          {formatDate(reminder.due_date)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
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
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  reminderCard: {
    marginBottom: 12,
    position: 'relative',
  },
  reminderCardCompleted: {
    opacity: 0.6,
  },
  reminderHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  reminderTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  reminderDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reminderFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingLeft: 36,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reminderMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  daysUntilBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  daysUntilText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
