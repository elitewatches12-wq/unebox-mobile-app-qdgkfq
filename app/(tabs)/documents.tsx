
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { Tables } from '@/app/integrations/supabase/types';
import { useDocumentProcessor } from '@/hooks/useDocumentProcessor';

type Document = Tables<'documents'>;

type Category = 'all' | 'recent' | 'images' | 'pdfs' | 'others';

type OrganizedDocuments = {
  recent: Document[];
  images: Document[];
  pdfs: Document[];
  others: Document[];
};

export default function DocumentsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLocalization();
  const { retryProcessing } = useDocumentProcessor();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [organizedDocs, setOrganizedDocs] = useState<OrganizedDocuments>({
    recent: [],
    images: [],
    pdfs: [],
    others: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      console.log('[DocumentsScreen] Loading documents');
      setLoading(true);

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[DocumentsScreen] Error loading documents:', error);
      } else {
        setDocuments(data || []);
        console.log('[DocumentsScreen] Documents loaded:', data?.length);
      }
    } catch (error) {
      console.error('[DocumentsScreen] Exception loading documents:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const organizeDocuments = useCallback(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const organized: OrganizedDocuments = {
      recent: [],
      images: [],
      pdfs: [],
      others: [],
    };

    documents.forEach((doc) => {
      if (doc.created_at && new Date(doc.created_at) > sevenDaysAgo) {
        organized.recent.push(doc);
      }

      const fileType = doc.file_type?.toLowerCase() || '';
      if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) {
        organized.images.push(doc);
      } else if (fileType.includes('pdf')) {
        organized.pdfs.push(doc);
      } else {
        organized.others.push(doc);
      }
    });

    setOrganizedDocs(organized);
  }, [documents]);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, loadDocuments]);

  useEffect(() => {
    organizeDocuments();
  }, [documents, organizeDocuments]);

  // Set up real-time subscription for document updates
  useEffect(() => {
    if (!user) return;

    console.log('[DocumentsScreen] Setting up real-time subscription');

    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[DocumentsScreen] Real-time update:', payload);
          loadDocuments();
        }
      )
      .subscribe();

    return () => {
      console.log('[DocumentsScreen] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, loadDocuments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const handleRetryProcessing = async (documentId: string) => {
    setRetrying(documentId);
    const success = await retryProcessing(documentId);
    setRetrying(null);

    if (success) {
      Alert.alert('Succès', 'Le traitement du document a été relancé');
      await loadDocuments();
    } else {
      Alert.alert('Erreur', 'Impossible de relancer le traitement');
    }
  };

  const getDisplayDocuments = (): Document[] => {
    let docs: Document[] = [];

    switch (selectedCategory) {
      case 'all':
        docs = documents;
        break;
      case 'recent':
        docs = organizedDocs.recent;
        break;
      case 'images':
        docs = organizedDocs.images;
        break;
      case 'pdfs':
        docs = organizedDocs.pdfs;
        break;
      case 'others':
        docs = organizedDocs.others;
        break;
      default:
        docs = documents;
    }

    if (searchQuery) {
      docs = docs.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.ai_summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.sender?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return docs;
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'Énergie': '#FF6B6B',
      'Impôts': '#4ECDC4',
      'Assurance': '#45B7D1',
      'Logement': '#FFA07A',
      'Santé': '#98D8C8',
      'Travail': '#F7DC6F',
      'Banque': '#BB8FCE',
      'Administratif': '#85C1E2',
      'Autre': '#95A5A6',
    };
    return colorMap[category] || colors.primary;
  };

  const getCategoryIcon = (category: string): any => {
    const iconMap: { [key: string]: any } = {
      'Énergie': 'bolt.fill',
      'Impôts': 'doc.text.fill',
      'Assurance': 'shield.fill',
      'Logement': 'house.fill',
      'Santé': 'heart.fill',
      'Travail': 'briefcase.fill',
      'Banque': 'creditcard.fill',
      'Administratif': 'folder.fill',
      'Autre': 'doc.fill',
    };
    return iconMap[category] || 'doc.fill';
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'pending':
        return { name: 'clock.fill', color: colors.textSecondary };
      case 'processing':
        return { name: 'arrow.triangle.2.circlepath', color: colors.primary };
      case 'completed':
        return { name: 'checkmark.circle.fill', color: '#4CAF50' };
      case 'failed':
        return { name: 'exclamationmark.triangle.fill', color: colors.error };
      default:
        return { name: 'doc.fill', color: colors.textSecondary };
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'Analyse en cours...';
      case 'completed':
        return 'Traité';
      case 'failed':
        return 'Erreur';
      default:
        return 'Inconnu';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatAmount = (amount: number | null, currency: string | null): string => {
    if (!amount) return '';
    return `${amount.toFixed(2)} ${currency || 'EUR'}`;
  };

  const displayDocuments = getDisplayDocuments();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('documents.title')}</Text>
          <View style={styles.headerStats}>
            <Text style={[styles.headerStatsText, { color: colors.textSecondary }]}>
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </Text>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('documents.search')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {(['all', 'recent', 'images', 'pdfs', 'others'] as Category[]).map((category) => {
            const isSelected = selectedCategory === category;
            const count =
              category === 'all'
                ? documents.length
                : category === 'recent'
                ? organizedDocs.recent.length
                : category === 'images'
                ? organizedDocs.images.length
                : category === 'pdfs'
                ? organizedDocs.pdfs.length
                : organizedDocs.others.length;

            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {t(`documents.${category}`)} ({count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {displayDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="doc.fill" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>{t('documents.empty')}</Text>
            <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
              {t('documents.emptyDesc')}
            </Text>
          </View>
        ) : (
          <View style={styles.documentsList}>
            {displayDocuments.map((doc) => {
              const statusInfo = getStatusIcon(doc.processing_status);
              
              return (
                <Pressable
                  key={doc.id}
                  style={[styles.documentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    setSelectedDocument(doc);
                    setModalVisible(true);
                  }}
                >
                  <View
                    style={[
                      styles.documentIcon,
                      { backgroundColor: getCategoryColor(doc.category || 'Autre') + '20' },
                    ]}
                  >
                    <IconSymbol
                      name={getCategoryIcon(doc.category || 'Autre')}
                      size={24}
                      color={getCategoryColor(doc.category || 'Autre')}
                    />
                  </View>
                  <View style={styles.documentInfo}>
                    <View style={styles.documentHeader}>
                      <Text style={[styles.documentTitle, { color: colors.text }]} numberOfLines={1}>
                        {doc.title}
                      </Text>
                      <View style={styles.statusBadge}>
                        {doc.processing_status === 'processing' ? (
                          <ActivityIndicator size="small" color={statusInfo.color} />
                        ) : (
                          <IconSymbol name={statusInfo.name} size={16} color={statusInfo.color} />
                        )}
                      </View>
                    </View>
                    
                    {/* Status message */}
                    {doc.processing_status !== 'completed' && (
                      <View style={styles.statusMessage}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                          {getStatusLabel(doc.processing_status)}
                        </Text>
                        {doc.processing_status === 'failed' && (
                          <Pressable
                            style={[styles.retryButton, { backgroundColor: colors.primary }]}
                            onPress={() => handleRetryProcessing(doc.id)}
                            disabled={retrying === doc.id}
                          >
                            {retrying === doc.id ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <IconSymbol name="arrow.clockwise" size={12} color="#FFFFFF" />
                                <Text style={styles.retryButtonText}>Réessayer</Text>
                              </>
                            )}
                          </Pressable>
                        )}
                      </View>
                    )}

                    <View style={styles.documentMeta}>
                      {doc.sender && (
                        <>
                          <Text style={[styles.documentMetaText, { color: colors.textSecondary }]}>
                            {doc.sender}
                          </Text>
                          <Text style={[styles.documentMetaText, { color: colors.textSecondary }]}>•</Text>
                        </>
                      )}
                      <Text style={[styles.documentMetaText, { color: colors.textSecondary }]}>
                        {formatDate(doc.created_at || '')}
                      </Text>
                      {doc.amount && (
                        <>
                          <Text style={[styles.documentMetaText, { color: colors.textSecondary }]}>•</Text>
                          <Text style={[styles.documentMetaText, { color: colors.primary, fontWeight: '600' }]}>
                            {formatAmount(doc.amount, doc.currency)}
                          </Text>
                        </>
                      )}
                    </View>
                    {doc.ai_summary && (
                      <Text style={[styles.documentSummary, { color: colors.textSecondary }]} numberOfLines={2}>
                        {doc.ai_summary}
                      </Text>
                    )}
                    {doc.processing_error && (
                      <Text style={[styles.errorText, { color: colors.error }]} numberOfLines={2}>
                        ⚠️ {doc.processing_error}
                      </Text>
                    )}
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Document Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Détails du document</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedDocument && (
              <>
                <View style={[styles.modalSection, { backgroundColor: colors.card }]}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                    {selectedDocument.title}
                  </Text>
                  {selectedDocument.category && (
                    <View style={styles.modalBadge}>
                      <IconSymbol
                        name={getCategoryIcon(selectedDocument.category)}
                        size={16}
                        color={getCategoryColor(selectedDocument.category)}
                      />
                      <Text style={[styles.modalBadgeText, { color: getCategoryColor(selectedDocument.category) }]}>
                        {selectedDocument.category}
                      </Text>
                    </View>
                  )}
                  
                  {/* Processing Status */}
                  <View style={styles.statusContainer}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Statut</Text>
                    <View style={styles.statusRow}>
                      <IconSymbol 
                        name={getStatusIcon(selectedDocument.processing_status).name} 
                        size={20} 
                        color={getStatusIcon(selectedDocument.processing_status).color} 
                      />
                      <Text style={[styles.statusLabel, { color: colors.text }]}>
                        {getStatusLabel(selectedDocument.processing_status)}
                      </Text>
                    </View>
                    {selectedDocument.processing_status === 'failed' && (
                      <Pressable
                        style={[styles.retryButtonLarge, { backgroundColor: colors.primary }]}
                        onPress={() => {
                          setModalVisible(false);
                          handleRetryProcessing(selectedDocument.id);
                        }}
                      >
                        <IconSymbol name="arrow.clockwise" size={16} color="#FFFFFF" />
                        <Text style={styles.retryButtonLargeText}>Relancer le traitement</Text>
                      </Pressable>
                    )}
                  </View>
                </View>

                {selectedDocument.ai_summary && (
                  <View style={[styles.modalSection, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Résumé IA</Text>
                    <Text style={[styles.modalValue, { color: colors.text }]}>
                      {selectedDocument.ai_summary}
                    </Text>
                  </View>
                )}

                <View style={[styles.modalSection, { backgroundColor: colors.card }]}>
                  <View style={styles.modalRow}>
                    <View style={styles.modalField}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Type</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>
                        {selectedDocument.document_type || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.modalField}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Émetteur</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>
                        {selectedDocument.sender || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalRow}>
                    <View style={styles.modalField}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Date document</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>
                        {selectedDocument.document_date
                          ? new Date(selectedDocument.document_date).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.modalField}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Date limite</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>
                        {selectedDocument.due_date
                          ? new Date(selectedDocument.due_date).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {selectedDocument.amount && (
                    <View style={styles.modalField}>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Montant</Text>
                      <Text style={[styles.modalValue, { color: colors.primary, fontSize: 20, fontWeight: '700' }]}>
                        {formatAmount(selectedDocument.amount, selectedDocument.currency)}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedDocument.classification_path && (
                  <View style={[styles.modalSection, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Chemin de classement</Text>
                    <Text style={[styles.modalValue, { color: colors.text, fontFamily: 'monospace' }]}>
                      {selectedDocument.classification_path}
                    </Text>
                  </View>
                )}

                {selectedDocument.extracted_text && (
                  <View style={[styles.modalSection, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Texte extrait (OCR)</Text>
                    <ScrollView style={styles.extractedTextContainer} nestedScrollEnabled>
                      <Text style={[styles.extractedText, { color: colors.text }]}>
                        {selectedDocument.extracted_text}
                      </Text>
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStatsText: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    gap: 12,
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
    gap: 4,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  documentMetaText: {
    fontSize: 12,
  },
  documentSummary: {
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 12,
  },
  modalBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  retryButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  retryButtonLargeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  modalField: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalValue: {
    fontSize: 16,
  },
  extractedTextContainer: {
    maxHeight: 200,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  extractedText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
