
import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { Stack } from "expo-router";

export default function ProfileScreen() {
  const theme = useTheme();

  const settingsOptions = [
    { id: '1', title: 'Notifications', icon: 'bell.fill', value: 'Activées' },
    { id: '2', title: 'Langue', icon: 'globe', value: 'Français' },
    { id: '3', title: 'Thème', icon: 'moon.fill', value: 'Clair' },
    { id: '4', title: 'Sécurité', icon: 'lock.fill', value: 'Configurer' },
  ];

  const handleOptionPress = (title: string) => {
    Alert.alert('Option', `${title} - Fonctionnalité à venir`);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Profil",
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
          {/* Profile Header */}
          <View style={[commonStyles.card, styles.profileHeader]}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Image 
                  source={require('@/assets/images/dae78010-3a6a-4e3a-9e43-9351133e928c.png')}
                  style={styles.avatarLogo}
                  resizeMode="contain"
                />
              </View>
              <Pressable style={styles.editAvatarButton}>
                <IconSymbol name="camera.fill" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.userName}>Jean Dupont</Text>
            <Text style={styles.userEmail}>jean.dupont@email.com</Text>
          </View>

          {/* Subscription Card */}
          <View style={[commonStyles.card, styles.subscriptionCard]}>
            <View style={styles.subscriptionHeader}>
              <View>
                <Text style={styles.subscriptionTitle}>Plan Premium</Text>
                <Text style={styles.subscriptionSubtitle}>Actif jusqu&apos;au 15 Fév 2025</Text>
              </View>
              <View style={styles.premiumBadge}>
                <IconSymbol name="star.fill" size={16} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.subscriptionFeatures}>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.secondary} />
                <Text style={styles.featureText}>15 Go de stockage</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.secondary} />
                <Text style={styles.featureText}>IA illimitée</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.secondary} />
                <Text style={styles.featureText}>Support prioritaire</Text>
              </View>
            </View>
            <Pressable style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Gérer l&apos;abonnement</Text>
            </Pressable>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paramètres</Text>
            {settingsOptions.map((option) => (
              <Pressable
                key={option.id}
                style={[commonStyles.card, styles.settingItem]}
                onPress={() => handleOptionPress(option.title)}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                    <IconSymbol name={option.icon} size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>{option.value}</Text>
                  <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                </View>
              </Pressable>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={[commonStyles.card, styles.statsCard]}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>127</Text>
                  <Text style={styles.statLabel}>Documents</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>2.4 Go</Text>
                  <Text style={styles.statLabel}>Utilisés</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>5</Text>
                  <Text style={styles.statLabel}>Rappels</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Pressable style={[commonStyles.card, styles.actionButton]}>
              <IconSymbol name="questionmark.circle.fill" size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>Centre d&apos;aide</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable style={[commonStyles.card, styles.actionButton]}>
              <IconSymbol name="info.circle.fill" size={24} color={colors.secondary} />
              <Text style={styles.actionButtonText}>À propos</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              style={[commonStyles.card, styles.actionButton, styles.logoutButton]}
              onPress={() => Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter?')}
            >
              <IconSymbol name="arrow.right.square.fill" size={24} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>Déconnexion</Text>
            </Pressable>
          </View>

          {/* Version */}
          <Text style={styles.versionText}>UneBox v1.0.0</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarLogo: {
    width: 60,
    height: 60,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  subscriptionCard: {
    marginBottom: 24,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subscriptionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  premiumBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionFeatures: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsCard: {
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  logoutButton: {
    marginTop: 8,
  },
  versionText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
});
