
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useNotifications } from '@/contexts/NotificationContext';

const PRESET_COLORS = [
  { name: 'Blue', value: '#64B5F6' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Red', value: '#F44336' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Teal', value: '#009688' },
  { name: 'Indigo', value: '#3F51B5' },
];

export default function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme, primaryColor, setPrimaryColor, colors, isDark } = useTheme();
  const { language, setLanguage, t } = useLocalization();
  const { preferences: notifPrefs, updatePreferences: updateNotifPrefs } = useNotifications();
  
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleLanguageChange = () => {
    Alert.alert(
      t('language.select'),
      '',
      [
        {
          text: t('language.french'),
          onPress: () => setLanguage('fr'),
        },
        {
          text: t('language.english'),
          onPress: () => setLanguage('en'),
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const handleThemeChange = () => {
    Alert.alert(
      t('theme.selectTheme'),
      '',
      [
        {
          text: t('theme.auto'),
          onPress: () => setTheme('auto'),
        },
        {
          text: t('theme.light'),
          onPress: () => setTheme('light'),
        },
        {
          text: t('theme.dark'),
          onPress: () => setTheme('dark'),
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const handleColorSelect = (color: string) => {
    setPrimaryColor(color);
    setShowColorPicker(false);
    Alert.alert(t('common.success'), 'Couleur mise à jour avec succès !');
  };

  const handleSignOut = () => {
    Alert.alert(
      t('auth.signOut'),
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.signOut'),
          style: 'destructive',
          onPress: async () => {
            console.log('[SettingsScreen] Signing out...');
            await signOut();
            Alert.alert('Déconnecté', 'Vous avez été déconnecté avec succès');
          },
        },
      ]
    );
  };

  const getThemeLabel = () => {
    const themes: { [key: string]: string } = {
      auto: t('theme.auto'),
      light: t('theme.light'),
      dark: t('theme.dark'),
    };
    return themes[theme] || t('theme.auto');
  };

  const getLanguageLabel = () => {
    return language === 'fr' ? t('language.french') : t('language.english');
  };

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
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Authentication Section - Only show if not logged in */}
        {!profile && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Authentification</Text>
            <View style={[styles.authCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <IconSymbol name="person.circle.fill" size={48} color={colors.primary} />
              <Text style={[styles.authTitle, { color: colors.text }]}>{t('auth.connectToAccess')}</Text>
              <Text style={[styles.authDescription, { color: colors.textSecondary }]}>
                Sauvegardez vos documents, créez des rappels et synchronisez vos données sur tous vos appareils.
              </Text>
              <View style={styles.authButtons}>
                <Pressable
                  style={[styles.authButtonPrimary, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <Text style={styles.authButtonPrimaryText}>{t('auth.signUp')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.authButtonSecondary, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push('/(auth)/login')}
                >
                  <Text style={[styles.authButtonSecondaryText, { color: colors.primary }]}>{t('auth.signIn')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Profile Section - Only show if logged in */}
        {profile && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.profile')}</Text>
            <View style={styles.settingsList}>
              <Pressable
                style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push('/(tabs)/profile-edit')}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                    <IconSymbol name="person.fill" size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.editProfile')}</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎨 Apparence</Text>
          <View style={styles.settingsList}>
            <Pressable 
              style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={handleLanguageChange}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#4ECDC4' + '20' }]}>
                  <IconSymbol name="globe" size={20} color="#4ECDC4" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.language')}</Text>
                  <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{getLanguageLabel()}</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>

            <Pressable 
              style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={handleThemeChange}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#FFA07A' + '20' }]}>
                  <IconSymbol name="moon.fill" size={20} color="#FFA07A" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.theme')}</Text>
                  <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{getThemeLabel()}</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>

            <Pressable 
              style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => setShowColorPicker(true)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: primaryColor + '20' }]}>
                  <IconSymbol name="paintbrush.fill" size={20} color={primaryColor} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.primaryColor')}</Text>
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorDot, { backgroundColor: primaryColor }]} />
                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{primaryColor}</Text>
                  </View>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🔔 {t('settings.notifications')}</Text>
          <View style={styles.settingsList}>
            <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#98D8C8' + '20' }]}>
                  <IconSymbol name="bell.fill" size={20} color="#98D8C8" />
                </View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.notifications')}</Text>
              </View>
              <Switch
                value={notifPrefs.enabled}
                onValueChange={(value) => updateNotifPrefs({ enabled: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {notifPrefs.enabled && (
              <>
                <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: '#64B5F6' + '20' }]}>
                      <IconSymbol name="doc.fill" size={20} color="#64B5F6" />
                    </View>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.newDocument')}</Text>
                  </View>
                  <Switch
                    value={notifPrefs.newDocument}
                    onValueChange={(value) => updateNotifPrefs({ newDocument: value })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: '#FFA726' + '20' }]}>
                      <IconSymbol name="arrow.clockwise" size={20} color="#FFA726" />
                    </View>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.documentUpdate')}</Text>
                  </View>
                  <Switch
                    value={notifPrefs.documentUpdate}
                    onValueChange={(value) => updateNotifPrefs({ documentUpdate: value })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: '#66BB6A' + '20' }]}>
                      <IconSymbol name="sun.max.fill" size={20} color="#66BB6A" />
                    </View>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.dailyReminder')}</Text>
                  </View>
                  <Switch
                    value={notifPrefs.daily}
                    onValueChange={(value) => updateNotifPrefs({ daily: value })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: '#9C27B0' + '20' }]}>
                      <IconSymbol name="calendar" size={20} color="#9C27B0" />
                    </View>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.weeklyReminder')}</Text>
                  </View>
                  <Switch
                    value={notifPrefs.weekly}
                    onValueChange={(value) => updateNotifPrefs({ weekly: value })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.about')}</Text>
          <View style={styles.settingsList}>
            <Pressable style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#45B7D1' + '20' }]}>
                  <IconSymbol name="info.circle.fill" size={20} color="#45B7D1" />
                </View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.version')}</Text>
              </View>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>1.0.0</Text>
            </Pressable>

            <Pressable style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#FF6B6B' + '20' }]}>
                  <IconSymbol name="questionmark.circle.fill" size={20} color="#FF6B6B" />
                </View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{t('settings.help')}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Sign Out Button - Only show if logged in */}
        {profile && (
          <Pressable 
            style={[styles.signOutButton, { backgroundColor: colors.card, borderColor: '#FF6B6B' }]} 
            onPress={handleSignOut}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FF6B6B" />
            <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
          </Pressable>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowColorPicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('color.selectColor')}</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <Pressable
                  key={color.value}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.value },
                    primaryColor === color.value && styles.colorOptionSelected,
                  ]}
                  onPress={() => handleColorSelect(color.value)}
                >
                  {primaryColor === color.value && (
                    <IconSymbol name="checkmark" size={24} color="#FFFFFF" />
                  )}
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.modalCloseButton, { backgroundColor: colors.border }]}
              onPress={() => setShowColorPicker(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.text }]}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  authCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  authDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  authButtons: {
    width: '100%',
    gap: 12,
  },
  authButtonPrimary: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  authButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authButtonSecondary: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  authButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsList: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
    marginTop: 2,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 18,
    marginBottom: 32,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 24,
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  modalCloseButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
