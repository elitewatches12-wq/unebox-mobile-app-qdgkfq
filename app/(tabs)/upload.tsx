
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { Stack } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function UploadScreen() {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

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

  const simulateUpload = () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Aucun fichier', 'Veuillez sélectionner un fichier à téléverser');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          Alert.alert('Succès', 'Fichiers téléversés avec succès!');
          setSelectedFiles([]);
          return 0;
        }
        return prev + 10;
      });
    }, 200);
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
        <View style={styles.container}>
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
              >
                <IconSymbol name="doc.fill" size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Choisir un fichier</Text>
              </Pressable>

              <Pressable 
                style={[styles.uploadButton, { backgroundColor: colors.secondary }]}
                onPress={pickImage}
              >
                <IconSymbol name="photo.fill" size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Galerie photo</Text>
              </Pressable>

              <Pressable 
                style={[styles.uploadButton, { backgroundColor: colors.accent }]}
                onPress={takePhoto}
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
                  <Pressable onPress={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}>
                    <IconSymbol name="xmark.circle.fill" size={24} color={colors.error} />
                  </Pressable>
                </View>
              ))}

              {/* Upload Progress */}
              {uploading && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{uploadProgress}%</Text>
                </View>
              )}

              {/* Upload Button */}
              <Pressable
                style={[
                  styles.confirmButton,
                  { backgroundColor: colors.primary },
                  uploading && styles.disabledButton
                ]}
                onPress={simulateUpload}
                disabled={uploading}
              >
                <Text style={styles.confirmButtonText}>
                  {uploading ? 'Téléversement en cours...' : 'Téléverser les fichiers'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Fonctionnalités automatiques</Text>
            <View style={styles.featureItem}>
              <IconSymbol name="text.viewfinder" size={24} color={colors.primary} />
              <Text style={styles.featureText}>Extraction OCR automatique</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="sparkles" size={24} color={colors.secondary} />
              <Text style={styles.featureText}>Catégorisation par IA</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="bell.badge.fill" size={24} color={colors.accent} />
              <Text style={styles.featureText}>Rappels intelligents</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  progressContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  progressBar: {
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
    textAlign: 'center',
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  featuresContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
  },
});
