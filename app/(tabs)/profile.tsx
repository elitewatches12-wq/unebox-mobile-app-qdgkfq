
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/app/integrations/supabase/client";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [stats, setStats] = useState({
    documentsCount: 0,
    remindersCount: 0,
    storageUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!user) {
      console.log('[ProfileScreen] No user, skipping stats load');
      setLoading(false);
      return;
    }

    try {
      console.log('[ProfileScreen] Loading stats for user:', user.id);
      
      const [documentsResult, remindersResult] = await Promise.all([
        supabase
          .from('documents')
          .select('id, file_size', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('reminders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', false),
      ]);

      // Calculate real storage from documents
      const totalStorage = documentsResult.data?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;

      console.log('[ProfileScreen] Stats loaded:', {
        documents: documentsResult.count,
        reminders: remindersResult.count,
        storage: totalStorage,
      });

      setStats({
        documentsCount: documentsResult.count || 0,
        remindersCount: remindersResult.count || 0,
        storageUsed: totalStorage,
      });

      // Update profile storage if different
      if (profile && profile.storage_used !== totalStorage) {
        await supabase
          .from('profiles')
          .update({ storage_used: totalStorage })
          .eq('id', user.id);
        await refreshProfile();
      }
    } catch (error) {
      console.error('[ProfileScreen] Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user, profile, refreshProfile]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return '0 Mo';
    const kb = bytes / 1024;
    const mb = bytes / (1024 * 1024);
    const gb = bytes / (1024 * 1024 * 1024);
    
    if (gb >= 1) {
      return `${gb.toFixed(2)} Go`;
    } else if (mb >= 1) {
      return `${mb.toFixed(1)} Mo`;
    } else if (kb >= 1) {
      return `${kb.toFixed(0)} Ko`;
    }
    return `${bytes} octets`;
  };

  const getStoragePercentage = () => {
    if (!profile?.storage_limit) return 0;
    const percentage = (stats.storageUsed / profile.storage_limit) * 100;
    return Math.min(percentage, 100);
  };

  const getInitials = () => {
    if (!profile?.full_name) return 'U';
    const names = profile.full_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return profile.full_name.substring(0, 2).toUpperCase();
  };

  const getPlanName = () => {
    const plan = profile?.subscription_plan || 'free';
    switch (plan) {
      case 'premium':
        return 'Plan Premium';
      case 'pro':
        return 'Plan Pro';
      default:
        return 'Plan Gratuit';
    }
  };

  const handleOptionPress = (route: string) => {
    if (route === 'settings') {
      router.push('/(tabs)/settings');
    } else {
      Alert.alert('Option', `Fonctionnalité à venir`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
              <Pressable style={styles.editAvatarButton}>
                <IconSymbol name="camera.fill" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.userName}>{profile?.full_name || 'Utilisateur'}</Text>
            <Text style={styles.userEmail}>{profile?.email || user?.email}</Text>
          </View>

          {/* Subscription Card */}
          <View style={[commonStyles.card, styles.subscriptionCard]}>
            <View style={styles.subscriptionHeader}>
              <View>
                <Text style={styles.subscriptionTitle}>{getPlanName()}</Text>
                <Text style={styles.subscriptionSubtitle}>
                  {profile?.subscription_end_date
                    ? `Actif jusqu'au ${new Date(profile.subscription_end_date).toLocaleDateString('fr-FR')}`
                    : 'Compte gratuit'}
                </Text>
              </View>
              <View style={styles.premiumBadge}>
                <IconSymbol 
                  name={profile?.subscription_plan === 'premium' ? 'star.fill' : 'folder.fill'} 
                  size={16} 
                  color="#FFFFFF" 
                />
              </View>
            </View>
            
            {/* Storage Progress */}
            <View style={styles.storageSection}>
              <View style={styles.storageHeader}>
                <Text style={styles.storageLabel}>Stockage utilisé</Text>
                <Text style={styles.storageValue}>
                  {formatStorageSize(stats.storageUsed)} / {formatStorageSize(profile?.storage_limit || 5368709120)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getStoragePercentage()}%` }
                  ]} 
                />
              </View>
              <Text style={styles.storagePercentageText}>
                {getStoragePercentage().toFixed(1)}% utilisé
              </Text>
            </View>

            <View style={styles.subscriptionFeatures}>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.secondary} />
                <Text style={styles.featureText}>
                  {formatStorageSize(profile?.storage_limit || 5368709120)} de stockage
                </Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.secondary} />
                <Text style={styles.featureText}>Assistant IA illimité</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.secondary} />
                <Text style={styles.featureText}>OCR automatique</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={16} color={colors.secondary} />
                <Text style={styles.featureText}>Classement intelligent</Text>
              </View>
            </View>
            
            {profile?.subscription_plan === 'free' && (
              <Pressable style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Passer à Premium</Text>
              </Pressable>
            )}
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paramètres</Text>
            
            <Pressable
              style={[commonStyles.card, styles.settingItem]}
              onPress={() => handleOptionPress('settings')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol name="gearshape.fill" size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingTitle}>Paramètres</Text>
              </View>
              <View style={styles.settingRight}>
                <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
              </View>
            </Pressable>

            <Pressable
              style={[commonStyles.card, styles.settingItem]}
              onPress={() => handleOptionPress('notifications')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.secondary + '20' }]}>
                  <IconSymbol name="bell.fill" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.settingTitle}>Notifications</Text>
              </View>
              <View style={styles.settingRight}>
                <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
              </View>
            </Pressable>
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={[commonStyles.card, styles.statsCard]}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.documentsCount}</Text>
                  <Text style={styles.statLabel}>Documents</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {formatStorageSize(stats.storageUsed)}
                  </Text>
                  <Text style={styles.statLabel}>Utilisés</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.remindersCount}</Text>
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
              onPress={handleSignOut}
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
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
  storageSection: {
    marginBottom: 16,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  storageValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  storagePercentageText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
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
