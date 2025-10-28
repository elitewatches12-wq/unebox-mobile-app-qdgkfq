
import React, { useState, useEffect, useCallback } from "react";
import { Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View, Text, Platform, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, commonStyles } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/app/integrations/supabase/client";
import { Tables } from "@/app/integrations/supabase/types";

type Document = Tables<'documents'>;
type Reminder = Tables<'reminders'>;

interface HomeStats {
  documentsCount: number;
  remindersCount: number;
  storageUsed: number;
  storageLimit: number;
  recentDocuments: Document[];
  upcomingReminders: Reminder[];
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<HomeStats>({
    documentsCount: 0,
    remindersCount: 0,
    storageUsed: 0,
    storageLimit: 5368709120, // 5 GB default
    recentDocuments: [],
    upcomingReminders: [],
  });

  const loadHomeData = useCallback(async () => {
    if (!user) {
      console.log('[HomeScreen] No user, skipping data load');
      setLoading(false);
      return;
    }

    try {
      console.log('[HomeScreen] Loading home data for user:', user.id);

      // Load all data in parallel
      const [documentsResult, remindersResult, recentDocsResult, upcomingRemindersResult] = await Promise.all([
        // Total documents count
        supabase
          .from('documents')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        
        // Active reminders count
        supabase
          .from('reminders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', false),
        
        // Recent documents (last 3)
        supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Upcoming reminders (next 2)
        supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', false)
          .order('due_date', { ascending: true })
          .limit(2),
      ]);

      // Calculate real storage usage from storage.objects
      const { data: storageData } = await supabase.rpc('get_user_storage_usage', {
        user_id_param: user.id
      }).single();

      const realStorageUsed = storageData?.total_bytes || profile?.storage_used || 0;

      console.log('[HomeScreen] Data loaded:', {
        documents: documentsResult.count,
        reminders: remindersResult.count,
        recentDocs: recentDocsResult.data?.length,
        upcomingReminders: upcomingRemindersResult.data?.length,
        storageUsed: realStorageUsed,
      });

      setStats({
        documentsCount: documentsResult.count || 0,
        remindersCount: remindersResult.count || 0,
        storageUsed: realStorageUsed,
        storageLimit: profile?.storage_limit || 5368709120,
        recentDocuments: recentDocsResult.data || [],
        upcomingReminders: upcomingRemindersResult.data || [],
      });

      // Refresh profile to update storage
      await refreshProfile();
    } catch (error) {
      console.error('[HomeScreen] Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, profile, refreshProfile]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHomeData();
  }, [loadHomeData]);

  const getCategoryColor = (category: string | null) => {
    if (!category) return colors.textSecondary;
    switch (category.toLowerCase()) {
      case 'facture':
      case 'invoice':
        return colors.accent;
      case 'contrat':
      case 'contract':
        return colors.primary;
      case 'identité':
      case 'id':
        return colors.secondary;
      case 'relevé':
      case 'statement':
        return '#9C27B0';
      case 'administratif':
      case 'admin':
        return '#FF9800';
      default:
        return colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string | null, documentType: string | null) => {
    if (!category && !documentType) return 'doc.fill';
    
    const cat = (category || documentType || '').toLowerCase();
    
    if (cat.includes('facture') || cat.includes('invoice')) return 'doc.text.fill';
    if (cat.includes('contrat') || cat.includes('contract')) return 'doc.fill';
    if (cat.includes('identité') || cat.includes('id')) return 'person.text.rectangle.fill';
    if (cat.includes('relevé') || cat.includes('statement')) return 'chart.bar.doc.horizontal.fill';
    if (cat.includes('admin')) return 'folder.fill';
    
    return 'doc.fill';
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return '0 Mo';
    const mb = bytes / (1024 * 1024);
    const gb = bytes / (1024 * 1024 * 1024);
    
    if (gb >= 1) {
      return `${gb.toFixed(1)} Go`;
    }
    return `${mb.toFixed(0)} Mo`;
  };

  const getStoragePercentage = () => {
    if (stats.storageLimit === 0) return 0;
    return Math.min((stats.storageUsed / stats.storageLimit) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleUpload = () => {
    router.push('/(tabs)/upload');
  };

  const handleSearch = () => {
    router.push('/(tabs)/documents');
  };

  const handleAI = () => {
    router.push('/(tabs)/ai-assistant');
  };

  const handleViewAllDocuments = () => {
    router.push('/(tabs)/documents');
  };

  const handleViewAllReminders = () => {
    router.push('/(tabs)/reminders');
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.subtitle}>
              {profile?.full_name || 'Bienvenue sur UneBox'}
            </Text>
          </View>

          {/* Storage Card */}
          <View style={[commonStyles.card, styles.storageCard]}>
            <View style={styles.storageHeader}>
              <View>
                <Text style={styles.storageTitle}>Stockage</Text>
                <Text style={styles.storageSubtitle}>
                  {formatStorageSize(stats.storageUsed)} utilisés sur {formatStorageSize(stats.storageLimit)}
                </Text>
              </View>
              <View style={styles.storagePercentage}>
                <Text style={styles.percentageText}>{Math.round(getStoragePercentage())}%</Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${getStoragePercentage()}%` }]}
                />
              </View>
            </View>

            {/* Storage Stats */}
            <View style={styles.storageStats}>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.statText}>Documents: {stats.documentsCount}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: colors.secondary }]} />
                <Text style={styles.statText}>Rappels: {stats.remindersCount}</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleUpload}
            >
              <IconSymbol name="arrow.up.doc.fill" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Téléverser</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={handleSearch}
            >
              <IconSymbol name="magnifyingglass" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Rechercher</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
              onPress={handleAI}
            >
              <IconSymbol name="bubble.left.fill" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Assistant IA</Text>
            </Pressable>
          </View>

          {/* Recent Documents */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Documents récents</Text>
              {stats.documentsCount > 0 && (
                <Pressable onPress={handleViewAllDocuments}>
                  <Text style={styles.seeAllText}>Tout voir</Text>
                </Pressable>
              )}
            </View>

            {stats.recentDocuments.length === 0 ? (
              <View style={[commonStyles.card, styles.emptyState]}>
                <IconSymbol name="doc.fill" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>Aucun document</Text>
                <Text style={styles.emptyStateSubtext}>
                  Commencez par téléverser votre premier document
                </Text>
              </View>
            ) : (
              stats.recentDocuments.map((doc) => (
                <Pressable 
                  key={doc.id} 
                  style={commonStyles.card}
                  onPress={handleViewAllDocuments}
                >
                  <View style={styles.documentCard}>
                    <View style={[styles.documentIcon, { backgroundColor: getCategoryColor(doc.category) + '20' }]}>
                      <IconSymbol 
                        name={getCategoryIcon(doc.category, doc.document_type)} 
                        size={24} 
                        color={getCategoryColor(doc.category)} 
                      />
                    </View>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName} numberOfLines={1}>
                        {doc.title}
                      </Text>
                      <View style={styles.documentMeta}>
                        <Text style={styles.documentType}>
                          {doc.document_type || doc.category || 'Document'}
                        </Text>
                        <Text style={styles.documentDate}> • {formatDate(doc.created_at!)}</Text>
                      </View>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                  </View>
                </Pressable>
              ))
            )}
          </View>

          {/* Reminders */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rappels à venir</Text>
              {stats.remindersCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats.remindersCount}</Text>
                </View>
              )}
            </View>

            {stats.upcomingReminders.length === 0 ? (
              <View style={[commonStyles.card, styles.emptyState]}>
                <IconSymbol name="bell.fill" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>Aucun rappel</Text>
                <Text style={styles.emptyStateSubtext}>
                  Les rappels automatiques apparaîtront ici
                </Text>
              </View>
            ) : (
              stats.upcomingReminders.map((reminder) => (
                <Pressable
                  key={reminder.id}
                  style={[commonStyles.card, styles.reminderCard]}
                  onPress={handleViewAllReminders}
                >
                  <View style={styles.reminderHeader}>
                    <IconSymbol 
                      name="bell.fill" 
                      size={20} 
                      color={reminder.priority === 'high' ? colors.error : colors.warning} 
                    />
                    <Text style={styles.reminderTitle} numberOfLines={1}>
                      {reminder.title}
                    </Text>
                  </View>
                  <Text style={styles.reminderDate}>
                    Échéance: {formatDate(reminder.due_date)}
                  </Text>
                  {reminder.description && (
                    <Text style={styles.reminderDescription} numberOfLines={2}>
                      {reminder.description}
                    </Text>
                  )}
                </Pressable>
              ))
            )}
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  reminderDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
