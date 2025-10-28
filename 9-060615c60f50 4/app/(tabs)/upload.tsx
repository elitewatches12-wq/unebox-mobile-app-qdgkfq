
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, Alert, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { Stack, useRouter } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useDocumentProcessor } from '@/hooks/useDocumentProcessor';
import { useLocalization } from '@/contexts/LocalizationContext';

export default function UploadScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useLocalization();
  const { uploadAndProcess, processing, progress, error: processingError } = useDocumentProcessor();
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [processedCount, setProcessedCount] = useState(0);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'text/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles(result.assets);
        console.log('Documents sélectionnés:', result.assets);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du document:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le document');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles(result.assets);
        console.log('Images sélectionnées:', result.assets);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert('Permission requise', 'L\'accès à la caméra est nécessaire pour prendre une photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles(result.assets);
        console.log('Photo prise:', result.assets);
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre une photo');
    }
  };

  const processDocuments = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Aucun fichier', 'Veuillez sélectionner un fichier à téléverser');
      return;
    }

    setProcessedCount(0);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      console.log(`Processing file ${i + 1}/${selectedFiles.length}:`, file.name);

      const result = await uploadAndProcess({
        uri: file.uri,
        name: file.name || `document-${i + 1}.pdf`,
        type: file.mimeType || file.type || 'application/pdf',
        size: file.size,
      });

      if (result?.success) {
        setProcessedCount(i + 1);
        console.log('Document processed successfully:', result.documentId);
      } else {
        console.error('Failed to process document:', result?.error);
        Alert.alert(
          'Erreur de traitement',
          `Échec du traitement de ${file.name}: ${result?.error || 'Erreur inconnue'}`
        );
        break;
      }
    }

    if (processedCount === selectedFiles.length) {
      Alert.alert(
        'Succès!',
        `${selectedFiles.length} document(s) téléversé(s) et analysé(s) avec succès!\n\nL'IA a automatiquement:\n✓ Extrait le texte (OCR)\n✓ Classifié les documents\n✓ Généré des résumés\n✓ Créé des rappels`,
        [
          {
            text: 'Voir mes documents',
            onPress: () => router.push('/(tabs)/documents'),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
      setSelectedFiles([]);
      setProcessedCount(0);
    }
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Téléverser",
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
          {/* Upload Zone */}
          <View style={styles.uploadZone}>
            <View style={styles.uploadIconContainer}>
              <IconSymbol name="arrow.up.doc.fill" size={64} color={colors.primary} />
            </View>
            <Text style={styles.uploadTitle}>Téléverser vos documents</Text>
            <Text style={styles.uploadSubtitle}>
              PDF, images, ou fichiers texte
            </Text>

            {/* Upload Buttons */}
            <View style={styles.uploadButtons}>
              <Pressable 
                style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                onPress={pickDocument}
                disabled={processing}
              >
                <IconSymbol name="doc.fill" size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Choisir un fichier</Text>
              </Pressable>

              <Pressable 
                style={[styles.uploadButton, { backgroundColor: colors.secondary }]}
                onPress={pickImage}
                disabled={processing}
              >
                <IconSymbol name="photo.fill" size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Galerie photo</Text>
              </Pressable>

              <Pressable 
                style={[styles.uploadButton, { backgroundColor: colors.accent }]}
                onPress={takePhoto}
                disabled={processing}
              >
                <IconSymbol name="camera.fill" size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Prendre une photo</Text>
              </Pressable>
            </View>
          </View>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <View style={styles.selectedFilesContainer}>
              <Text style={styles.selectedFilesTitle}>
                Fichiers sélectionnés ({selectedFiles.length})
              </Text>
              {selectedFiles.map((file, index) => (
                <View key={index} style={[commonStyles.card, styles.fileCard]}>
                  <IconSymbol name="doc.fill" size={32} color={colors.primary} />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name || `Fichier ${index + 1}`}
                    </Text>
                    <Text style={styles.fileSize}>
                      {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Taille inconnue'}
                    </Text>
                  </View>
                  {!processing && (
                    <Pressable onPress={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}>
                      <IconSymbol name="xmark.circle.fill" size={24} color={colors.error} />
                    </Pressable>
                  )}
                </View>
              ))}

              {/* Processing Status */}
              {processing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.processingText}>
                    Traitement en cours... ({processedCount}/{selectedFiles.length})
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{progress}%</Text>
                  <Text style={styles.processingSteps}>
                    {progress < 30 && '📤 Téléversement du fichier...'}
                    {progress >= 30 && progress < 50 && '💾 Enregistrement...'}
                    {progress >= 50 && progress < 80 && '🤖 Analyse IA en cours...'}
                    {progress >= 80 && '✅ Finalisation...'}
                  </Text>
                </View>
              )}

              {/* Error Display */}
              {processingError && (
                <View style={styles.errorContainer}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.error} />
                  <Text style={styles.errorText}>{processingError}</Text>
                </View>
              )}

              {/* Upload Button */}
              {!processing && (
                <Pressable
                  style={[
                    styles.confirmButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={processDocuments}
                >
                  <IconSymbol name="sparkles" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>
                    Téléverser et analyser avec l'IA
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>🤖 Traitement automatique par IA</Text>
            <Text style={styles.featuresSubtitle}>
              Chaque document est automatiquement analysé en quelques secondes
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                  <IconSymbol name="text.viewfinder" size={24} color={colors.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Extraction OCR</Text>
                  <Text style={styles.featureDescription}>
                    Extraction complète du texte, même sur des scans
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.secondary + '20' }]}>
                  <IconSymbol name="sparkles" size={24} color={colors.secondary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Classification intelligente</Text>
                  <Text style={styles.featureDescription}>
                    Type, catégorie, émetteur détectés automatiquement
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.accent + '20' }]}>
                  <IconSymbol name="doc.text.fill" size={24} color={colors.accent} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Résumé automatique</Text>
                  <Text style={styles.featureDescription}>
                    Résumé clair du contenu et des actions à effectuer
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: '#FF6B6B20' }]}>
                  <IconSymbol name="bell.badge.fill" size={24} color="#FF6B6B" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Rappels intelligents</Text>
                  <Text style={styles.featureDescription}>
                    Détection des échéances et création automatique de rappels
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: '#4ECDC420' }]}>
                  <IconSymbol name="folder.fill" size={24} color="#4ECDC4" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Classement automatique</Text>
                  <Text style={styles.featureDescription}>
                    Organisation logique par type et catégorie
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: '#FFA07A20' }]}>
                  <IconSymbol name="eurosign.circle.fill" size={24} color="#FFA07A" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Extraction de données</Text>
                  <Text style={styles.featureDescription}>
                    Montants, dates, références extraits automatiquement
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Padding for Tab Bar */}
          <View style={{ height: 100 }} />
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
    padding: 16,
  },
  uploadZone: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  uploadIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  uploadButtons: {
    width: '100%',
    gap: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedFilesContainer: {
    marginBottom: 24,
  },
  selectedFilesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  processingContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  processingSteps: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuresContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  featuresSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
