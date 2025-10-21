
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { Stack } from "expo-router";

type Category = 'all' | 'invoice' | 'contract' | 'id' | 'statement' | 'admin';

export default function DocumentsScreen() {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Tous', icon: 'square.grid.2x2.fill', color: colors.text },
    { id: 'invoice', label: 'Factures', icon: 'doc.text.fill', color: colors.accent },
    { id: 'contract', label: 'Contrats', icon: 'doc.fill', color: colors.primary },
    { id: 'id', label: 'Identité', icon: 'person.text.rectangle.fill', color: colors.secondary },
    { id: 'statement', label: 'Relevés', icon: 'chart.bar.doc.horizontal.fill', color: colors.warning },
    { id: 'admin', label: 'Admin', icon: 'folder.fill', color: colors.error },
  ];

  const documents = [
    {
      id: '1',
      name: 'Facture EDF - Janvier 2024',
      category: 'invoice',
      date: '15 Jan 2024',
      size: '245 KB',
      summary: 'Facture d\'électricité pour le mois de janvier. Montant: 89.50€. Échéance: 25 janvier.',
    },
    {
      id: '2',
      name: 'Contrat de travail CDI',
      category: 'contract',
      date: '10 Jan 2024',
      size: '1.2 MB',
      summary: 'Contrat à durée indéterminée signé le 10 janvier 2024. Poste: Développeur Senior.',
    },
    {
      id: '3',
      name: 'Carte d\'identité nationale',
      category: 'id',
      date: '05 Jan 2024',
      size: '890 KB',
      summary: 'Copie de la carte d\'identité nationale. Valide jusqu\'en 2029.',
    },
    {
      id: '4',
      name: 'Relevé bancaire - Décembre',
      category: 'statement',
      date: '01 Jan 2024',
      size: '456 KB',
      summary: 'Relevé de compte bancaire pour le mois de décembre 2023.',
    },
    {
      id: '5',
      name: 'Attestation d\'assurance',
      category: 'admin',
      date: '28 Déc 2023',
      size: '320 KB',
      summary: 'Attestation d\'assurance habitation valide jusqu\'au 31 décembre 2024.',
    },
    {
      id: '6',
      name: 'Facture Internet Orange',
      category: 'invoice',
      date: '20 Déc 2023',
      size: '198 KB',
      summary: 'Facture mensuelle internet et téléphone. Montant: 45.99€.',
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || colors.textSecondary;
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || 'doc.fill';
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Documents",
            headerLargeTitle: true,
          }}
        />
      )}
      <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un document..."
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

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && [
                    styles.categoryChipActive,
                    { backgroundColor: category.color }
                  ]
                ]}
                onPress={() => setSelectedCategory(category.id as Category)}
              >
                <IconSymbol
                  name={category.icon}
                  size={18}
                  color={selectedCategory === category.id ? '#FFFFFF' : category.color}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextActive
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Documents Grid */}
          <ScrollView
            style={styles.documentsContainer}
            contentContainerStyle={styles.documentsContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.resultsText}>
              {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''}
            </Text>

            {filteredDocuments.map((doc) => (
              <Pressable key={doc.id} style={[commonStyles.card, styles.documentCard]}>
                <View style={styles.documentHeader}>
                  <View style={[styles.documentIconContainer, { backgroundColor: getCategoryColor(doc.category) + '20' }]}>
                    <IconSymbol name={getCategoryIcon(doc.category)} size={28} color={getCategoryColor(doc.category)} />
                  </View>
                  <View style={styles.documentHeaderInfo}>
                    <Text style={styles.documentName} numberOfLines={2}>{doc.name}</Text>
                    <View style={styles.documentMeta}>
                      <Text style={styles.documentMetaText}>{doc.date}</Text>
                      <Text style={styles.documentMetaText}> • </Text>
                      <Text style={styles.documentMetaText}>{doc.size}</Text>
                    </View>
                  </View>
                </View>

                {/* AI Summary */}
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryHeader}>
                    <IconSymbol name="sparkles" size={16} color={colors.primary} />
                    <Text style={styles.summaryLabel}>Résumé IA</Text>
                  </View>
                  <Text style={styles.summaryText} numberOfLines={3}>{doc.summary}</Text>
                </View>

                {/* Actions */}
                <View style={styles.documentActions}>
                  <Pressable style={styles.actionButton}>
                    <IconSymbol name="eye.fill" size={18} color={colors.primary} />
                    <Text style={styles.actionButtonText}>Voir</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton}>
                    <IconSymbol name="square.and.arrow.up.fill" size={18} color={colors.secondary} />
                    <Text style={styles.actionButtonText}>Partager</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton}>
                    <IconSymbol name="ellipsis.circle.fill" size={18} color={colors.textSecondary} />
                    <Text style={styles.actionButtonText}>Plus</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    gap: 8,
    marginRight: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 1,
  },
  categoryChipActive: {
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
    elevation: 3,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  documentsContainer: {
    flex: 1,
  },
  documentsContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  documentCard: {
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  documentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
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
  documentMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
