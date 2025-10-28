
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from './AuthContext';
import * as Localization from 'expo-localization';

export type Language = 'fr' | 'en';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.documents': 'Documents',
    'nav.upload': 'Télécharger',
    'nav.reminders': 'Rappels',
    'nav.assistant': 'Assistant IA',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',

    // Settings
    'settings.title': 'Paramètres',
    'settings.profile': 'Profil',
    'settings.editProfile': 'Modifier le profil',
    'settings.preferences': 'Préférences',
    'settings.language': 'Langue',
    'settings.theme': 'Thème',
    'settings.primaryColor': 'Couleur principale',
    'settings.notifications': 'Notifications',
    'settings.notificationSettings': 'Paramètres de notification',
    'settings.newDocument': 'Nouveau document',
    'settings.documentUpdate': 'Mise à jour de document',
    'settings.dailyReminder': 'Rappel quotidien',
    'settings.weeklyReminder': 'Rappel hebdomadaire',
    'settings.notificationTime': 'Heure de notification',
    'settings.autoOrganize': 'Organisation automatique',
    'settings.autoOrganizeDesc': 'Organiser automatiquement les documents par type et date',
    'settings.about': 'À propos',
    'settings.version': 'Version',
    'settings.help': 'Aide & Support',
    'settings.signOut': 'Déconnexion',

    // Theme
    'theme.auto': 'Automatique',
    'theme.light': 'Clair',
    'theme.dark': 'Sombre',
    'theme.selectTheme': 'Choisissez votre thème',

    // Language
    'language.french': 'Français',
    'language.english': 'English',
    'language.select': 'Choisissez votre langue',

    // Colors
    'color.blue': 'Bleu',
    'color.purple': 'Violet',
    'color.green': 'Vert',
    'color.orange': 'Orange',
    'color.red': 'Rouge',
    'color.pink': 'Rose',
    'color.selectColor': 'Choisissez votre couleur',

    // Documents
    'documents.title': 'Documents',
    'documents.all': 'Tous',
    'documents.recent': 'Récents',
    'documents.favorites': 'Favoris',
    'documents.images': 'Images',
    'documents.pdfs': 'PDFs',
    'documents.others': 'Autres',
    'documents.search': 'Rechercher des documents...',
    'documents.empty': 'Aucun document',
    'documents.emptyDesc': 'Commencez par télécharger votre premier document',

    // Upload
    'upload.title': 'Télécharger',
    'upload.document': 'Document',
    'upload.image': 'Image',
    'upload.photo': 'Photo',
    'upload.success': 'Téléchargement réussi',
    'upload.error': 'Erreur de téléchargement',

    // Reminders
    'reminders.title': 'Rappels',
    'reminders.empty': 'Aucun rappel',
    'reminders.emptyDesc': 'Créez votre premier rappel',
    'reminders.completed': 'Terminé',
    'reminders.pending': 'En attente',

    // Profile
    'profile.title': 'Profil',
    'profile.edit': 'Modifier',
    'profile.storage': 'Stockage',
    'profile.plan': 'Abonnement',
    'profile.documents': 'Documents',

    // Auth
    'auth.signIn': 'Se connecter',
    'auth.signUp': 'Créer un compte',
    'auth.signOut': 'Déconnexion',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.fullName': 'Nom complet',
    'auth.notConnected': 'Non connecté',
    'auth.connectToAccess': 'Connectez-vous pour accéder à toutes les fonctionnalités',

    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.confirm': 'Confirmer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.back': 'Retour',

    // Notifications
    'notification.newDocument': 'Nouveau document ajouté',
    'notification.documentUpdate': 'Document mis à jour',
    'notification.dailyReminder': 'Rappel quotidien',
    'notification.weeklyReminder': 'Rappel hebdomadaire',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.documents': 'Documents',
    'nav.upload': 'Upload',
    'nav.reminders': 'Reminders',
    'nav.assistant': 'AI Assistant',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',

    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.editProfile': 'Edit Profile',
    'settings.preferences': 'Preferences',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.primaryColor': 'Primary Color',
    'settings.notifications': 'Notifications',
    'settings.notificationSettings': 'Notification Settings',
    'settings.newDocument': 'New document',
    'settings.documentUpdate': 'Document update',
    'settings.dailyReminder': 'Daily reminder',
    'settings.weeklyReminder': 'Weekly reminder',
    'settings.notificationTime': 'Notification time',
    'settings.autoOrganize': 'Auto-organize',
    'settings.autoOrganizeDesc': 'Automatically organize documents by type and date',
    'settings.about': 'About',
    'settings.version': 'Version',
    'settings.help': 'Help & Support',
    'settings.signOut': 'Sign Out',

    // Theme
    'theme.auto': 'Auto',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.selectTheme': 'Choose your theme',

    // Language
    'language.french': 'Français',
    'language.english': 'English',
    'language.select': 'Choose your language',

    // Colors
    'color.blue': 'Blue',
    'color.purple': 'Purple',
    'color.green': 'Green',
    'color.orange': 'Orange',
    'color.red': 'Red',
    'color.pink': 'Pink',
    'color.selectColor': 'Choose your color',

    // Documents
    'documents.title': 'Documents',
    'documents.all': 'All',
    'documents.recent': 'Recent',
    'documents.favorites': 'Favorites',
    'documents.images': 'Images',
    'documents.pdfs': 'PDFs',
    'documents.others': 'Others',
    'documents.search': 'Search documents...',
    'documents.empty': 'No documents',
    'documents.emptyDesc': 'Start by uploading your first document',

    // Upload
    'upload.title': 'Upload',
    'upload.document': 'Document',
    'upload.image': 'Image',
    'upload.photo': 'Photo',
    'upload.success': 'Upload successful',
    'upload.error': 'Upload error',

    // Reminders
    'reminders.title': 'Reminders',
    'reminders.empty': 'No reminders',
    'reminders.emptyDesc': 'Create your first reminder',
    'reminders.completed': 'Completed',
    'reminders.pending': 'Pending',

    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit',
    'profile.storage': 'Storage',
    'profile.plan': 'Plan',
    'profile.documents': 'Documents',

    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.signOut': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.notConnected': 'Not connected',
    'auth.connectToAccess': 'Sign in to access all features',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.back': 'Back',

    // Notifications
    'notification.newDocument': 'New document added',
    'notification.documentUpdate': 'Document updated',
    'notification.dailyReminder': 'Daily reminder',
    'notification.weeklyReminder': 'Weekly reminder',
  },
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('fr');

  const loadLanguagePreference = useCallback(async () => {
    try {
      console.log('[LocalizationContext] Loading language preference');
      const { data, error } = await supabase
        .from('user_preferences')
        .select('language')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('[LocalizationContext] Error loading language:', error);
      } else if (data) {
        setLanguageState((data.language as Language) || 'fr');
        console.log('[LocalizationContext] Language loaded:', data.language);
      }
    } catch (error) {
      console.error('[LocalizationContext] Exception loading language:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadLanguagePreference();
    } else {
      // Use device language as default
      const deviceLanguage = Localization.getLocales()[0]?.languageCode;
      if (deviceLanguage === 'en' || deviceLanguage === 'fr') {
        setLanguageState(deviceLanguage as Language);
      }
    }
  }, [user, loadLanguagePreference]);

  const setLanguage = async (lang: Language) => {
    console.log('[LocalizationContext] Setting language:', lang);
    setLanguageState(lang);

    if (user) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .update({ language: lang, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (error) {
          console.error('[LocalizationContext] Error saving language:', error);
        } else {
          console.log('[LocalizationContext] Language saved successfully');
        }
      } catch (error) {
        console.error('[LocalizationContext] Exception saving language:', error);
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}
