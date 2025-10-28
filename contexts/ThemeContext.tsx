
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  background: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  card: string;
  highlight: string;
  error: string;
  success: string;
  warning: string;
  border: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  primaryColor: string;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setPrimaryColor: (color: string) => Promise<void>;
}

const lightColors: ThemeColors = {
  background: '#F9F9F9',
  text: '#212121',
  textSecondary: '#757575',
  primary: '#64B5F6',
  secondary: '#A5D6A7',
  accent: '#FFB74D',
  card: '#FFFFFF',
  highlight: '#BBDEFB',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  border: '#E0E0E0',
};

const darkColors: ThemeColors = {
  background: '#121212',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  primary: '#64B5F6',
  secondary: '#A5D6A7',
  accent: '#FFB74D',
  card: '#1E1E1E',
  highlight: '#2C2C2C',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  border: '#333333',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { user, profile } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [primaryColor, setPrimaryColorState] = useState<string>('#64B5F6');
  const [loading, setLoading] = useState(true);

  // Determine if dark mode should be active
  const isDark = theme === 'dark' || (theme === 'auto' && systemColorScheme === 'dark');

  // Get current colors with custom primary color
  const colors: ThemeColors = {
    ...(isDark ? darkColors : lightColors),
    primary: primaryColor,
  };

  const loadThemePreferences = useCallback(async () => {
    try {
      console.log('[ThemeContext] Loading theme preferences');
      const { data, error } = await supabase
        .from('user_preferences')
        .select('theme, primary_color')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('[ThemeContext] Error loading preferences:', error);
      } else if (data) {
        setThemeState((data.theme as ThemeMode) || 'auto');
        setPrimaryColorState(data.primary_color || '#64B5F6');
        console.log('[ThemeContext] Theme preferences loaded:', data.theme, data.primary_color);
      }
    } catch (error) {
      console.error('[ThemeContext] Exception loading preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadThemePreferences();
    } else {
      setLoading(false);
    }
  }, [user, loadThemePreferences]);

  const setTheme = async (newTheme: ThemeMode) => {
    console.log('[ThemeContext] Setting theme:', newTheme);
    setThemeState(newTheme);

    if (user) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .update({ theme: newTheme, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (error) {
          console.error('[ThemeContext] Error saving theme:', error);
        } else {
          console.log('[ThemeContext] Theme saved successfully');
        }
      } catch (error) {
        console.error('[ThemeContext] Exception saving theme:', error);
      }
    }
  };

  const setPrimaryColor = async (color: string) => {
    console.log('[ThemeContext] Setting primary color:', color);
    setPrimaryColorState(color);

    if (user) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .update({ primary_color: color, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (error) {
          console.error('[ThemeContext] Error saving color:', error);
        } else {
          console.log('[ThemeContext] Color saved successfully');
        }
      } catch (error) {
        console.error('[ThemeContext] Exception saving color:', error);
      }
    }
  };

  const value = {
    theme,
    isDark,
    colors,
    primaryColor,
    setTheme,
    setPrimaryColor,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
