
import React from "react";
import { Stack } from "expo-router";
import { ScrollView, StyleSheet, View, Text, Platform, Pressable, Image } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, commonStyles } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const theme = useTheme();

  const recentDocuments = [
    { id: '1', name: 'Facture EDF - Janvier 2024', type: 'Facture', date: '15 Jan 2024', category: 'invoice' },
    { id: '2', name: 'Contrat de travail', type: 'Contrat', date: '10 Jan 2024', category: 'contract' },
    { id: '3', name: 'Carte d\'identité', type: 'Pièce d\'identité', date: '05 Jan 2024', category: 'id' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'invoice': return colors.accent;
      case 'contract': return colors.primary;
      case 'id': return colors.secondary;
      default: return colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'invoice': return 'doc.text.fill';
      case 'contract': return 'doc.fill';
      case 'id': return 'person.text.rectangle.fill';
      default: return 'doc.fill';
    }
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "UneBox",
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
          {/* Logo and Header */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/dae78010-3a6a-4e3a-9e43-9351133e928c.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.subtitle}>Bienvenue sur UneBox</Text>
          </View>

          {/* Storage Card */}
          <View style={[commonStyles.card, styles.storageCard]}>
            <View style={styles.storageHeader}>
              <View>
                <Text style={styles.storageTitle}>Stockage</Text>
                <Text style={styles.storageSubtitle}>2.4 Go utilisés sur 15 Go</Text>
              </View>
              <View style={styles.storagePercentage}>
                <Text style={styles.percentageText}>16%</Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: '16%' }]}
                />
              </View>
            </View>

            {/* Storage Stats */}
            <View style={styles.storageStats}>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.statText}>Documents: 1.8 Go</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: colors.secondary }]} />
                <Text style={styles.statText}>Images: 0.6 Go</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable style={[styles.actionButton, { backgroundColor: colors.primary }]}>
              <IconSymbol name="arrow.up.doc.fill" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Téléverser</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
              <IconSymbol name="magnifyingglass" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Rechercher</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, { backgroundColor: colors.accent }]}>
              <IconSymbol name="bubble.left.fill" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Assistant IA</Text>
            </Pressable>
          </View>

          {/* Recent Documents */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Documents récents</Text>
              <Pressable>
                <Text style={styles.seeAllText}>Tout voir</Text>
              </Pressable>
            </View>

            {recentDocuments.map((doc) => (
              <Pressable key={doc.id} style={commonStyles.card}>
                <View style={styles.documentCard}>
                  <View style={[styles.documentIcon, { backgroundColor: getCategoryColor(doc.category) + '20' }]}>
                    <IconSymbol name={getCategoryIcon(doc.category)} size={24} color={getCategoryColor(doc.category)} />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{doc.name}</Text>
                    <View style={styles.documentMeta}>
                      <Text style={styles.documentType}>{doc.type}</Text>
                      <Text style={styles.documentDate}> • {doc.date}</Text>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </Pressable>
            ))}
          </View>

          {/* Reminders */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rappels à venir</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>

            <View style={[commonStyles.card, styles.reminderCard]}>
              <View style={styles.reminderHeader}>
                <IconSymbol name="bell.fill" size={20} color={colors.warning} />
                <Text style={styles.reminderTitle}>Facture EDF à payer</Text>
              </View>
              <Text style={styles.reminderDate}>Échéance: 25 Janvier 2024</Text>
            </View>

            <View style={[commonStyles.card, styles.reminderCard]}>
              <View style={styles.reminderHeader}>
                <IconSymbol name="bell.fill" size={20} color={colors.error} />
                <Text style={styles.reminderTitle}>Renouvellement assurance</Text>
              </View>
              <Text style={styles.reminderDate}>Échéance: 30 Janvier 2024</Text>
            </View>
          </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  storageCard: {
    marginBottom: 20,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  storageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  storageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  storagePercentage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  storageStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentType: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  documentDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reminderCard: {
    marginBottom: 8,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  reminderDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
