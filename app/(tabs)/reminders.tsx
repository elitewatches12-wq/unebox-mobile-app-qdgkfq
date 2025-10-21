
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { Stack } from "expo-router";

export default function RemindersScreen() {
  const theme = useTheme();
  const [completedReminders, setCompletedReminders] = useState<string[]>([]);

  const reminders = [
    {
      id: '1',
      title: 'Facture EDF à payer',
      document: 'Facture EDF - Janvier 2024',
      dueDate: '25 Janvier 2024',
      priority: 'high',
      amount: '89.50€',
    },
    {
      id: '2',
      title: 'Renouvellement assurance',
      document: 'Attestation d\'assurance',
      dueDate: '30 Janvier 2024',
      priority: 'high',
      amount: null,
    },
    {
      id: '3',
      title: 'Déclaration fiscale',
      document: 'Documents fiscaux 2023',
      dueDate: '15 Février 2024',
      priority: 'medium',
      amount: null,
    },
    {
      id: '4',
      title: 'Renouvellement carte vitale',
      document: 'Carte vitale',
      dueDate: '28 Février 2024',
      priority: 'low',
      amount: null,
    },
    {
      id: '5',
      title: 'Facture Internet Orange',
      document: 'Facture Internet Orange',
      dueDate: '20 Février 2024',
      priority: 'medium',
      amount: '45.99€',
    },
  ];

  const toggleReminder = (id: string) => {
    if (completedReminders.includes(id)) {
      setCompletedReminders(completedReminders.filter(rid => rid !== id));
    } else {
      setCompletedReminders([...completedReminders, id]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.secondary;
      default: return colors.textSecondary;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Urgent';
      case 'medium': return 'Moyen';
      case 'low': return 'Faible';
      default: return '';
    }
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'En retard';
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    return `Dans ${diffDays} jours`;
  };

  const activeReminders = reminders.filter(r => !completedReminders.includes(r.id));
  const completedRemindersList = reminders.filter(r => completedReminders.includes(r.id));

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
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.statNumber, { color: colors.error }]}>
                {activeReminders.filter(r => r.priority === 'high').length}
              </Text>
              <Text style={styles.statLabel}>Urgents</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>
                {activeReminders.filter(r => r.priority === 'medium').length}
              </Text>
              <Text style={styles.statLabel}>Moyens</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.secondary + '20' }]}>
              <Text style={[styles.statNumber, { color: colors.secondary }]}>
                {completedReminders.length}
              </Text>
              <Text style={styles.statLabel}>Terminés</Text>
            </View>
          </View>

          {/* Active Reminders */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              À faire ({activeReminders.length})
            </Text>

            {activeReminders.length === 0 ? (
              <View style={[commonStyles.card, styles.emptyState]}>
                <IconSymbol name="checkmark.circle.fill" size={64} color={colors.secondary} />
                <Text style={styles.emptyStateTitle}>Tout est à jour!</Text>
                <Text style={styles.emptyStateText}>
                  Vous n&apos;avez aucun rappel en attente
                </Text>
              </View>
            ) : (
              activeReminders.map((reminder) => (
                <Pressable
                  key={reminder.id}
                  style={[commonStyles.card, styles.reminderCard]}
                  onPress={() => toggleReminder(reminder.id)}
                >
                  <View style={styles.reminderHeader}>
                    <Pressable
                      style={styles.checkbox}
                      onPress={() => toggleReminder(reminder.id)}
                    >
                      <View style={[styles.checkboxInner, { borderColor: getPriorityColor(reminder.priority) }]} />
                    </Pressable>
                    <View style={styles.reminderInfo}>
                      <Text style={styles.reminderTitle}>{reminder.title}</Text>
                      <Text style={styles.reminderDocument}>{reminder.document}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(reminder.priority) }]}>
                      <Text style={styles.priorityText}>{getPriorityLabel(reminder.priority)}</Text>
                    </View>
                  </View>

                  <View style={styles.reminderDetails}>
                    <View style={styles.detailItem}>
                      <IconSymbol name="calendar" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{reminder.dueDate}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <IconSymbol name="clock.fill" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{getDaysUntil(reminder.dueDate)}</Text>
                    </View>
                    {reminder.amount && (
                      <View style={styles.detailItem}>
                        <IconSymbol name="eurosign.circle.fill" size={16} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{reminder.amount}</Text>
                      </View>
                    )}
                  </View>

                  <Pressable style={styles.viewDocumentButton}>
                    <IconSymbol name="doc.text.fill" size={16} color={colors.primary} />
                    <Text style={styles.viewDocumentText}>Voir le document</Text>
                  </Pressable>
                </Pressable>
              ))
            )}
          </View>

          {/* Completed Reminders */}
          {completedRemindersList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Terminés ({completedRemindersList.length})
              </Text>

              {completedRemindersList.map((reminder) => (
                <Pressable
                  key={reminder.id}
                  style={[commonStyles.card, styles.reminderCard, styles.completedCard]}
                  onPress={() => toggleReminder(reminder.id)}
                >
                  <View style={styles.reminderHeader}>
                    <Pressable
                      style={styles.checkbox}
                      onPress={() => toggleReminder(reminder.id)}
                    >
                      <View style={[styles.checkboxInner, styles.checkboxChecked]}>
                        <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    </Pressable>
                    <View style={styles.reminderInfo}>
                      <Text style={[styles.reminderTitle, styles.completedText]}>{reminder.title}</Text>
                      <Text style={[styles.reminderDocument, styles.completedText]}>{reminder.document}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
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
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    padding: 4,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  reminderDocument: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reminderDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.highlight,
    gap: 6,
  },
  viewDocumentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  completedCard: {
    opacity: 0.6,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
