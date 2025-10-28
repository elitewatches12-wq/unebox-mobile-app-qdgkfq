
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type OnboardingStep = {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
};

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Bienvenue sur UneBox',
    description: 'Votre assistant cloud intelligent pour gérer tous vos documents personnels et professionnels en toute sécurité.',
    icon: 'sparkles',
    color: colors.primary,
  },
  {
    id: 2,
    title: 'Téléversez vos documents',
    description: 'Importez facilement vos PDF, images et fichiers texte. Notre OCR extrait automatiquement le contenu.',
    icon: 'arrow.up.doc.fill',
    color: colors.secondary,
  },
  {
    id: 3,
    title: 'Organisation automatique',
    description: 'L\'IA catégorise vos documents (factures, contrats, pièces d\'identité) et crée des résumés intelligents.',
    icon: 'folder.fill',
    color: colors.accent,
  },
  {
    id: 4,
    title: 'Rappels intelligents',
    description: 'Ne manquez plus jamais une échéance. UneBox vous rappelle les dates importantes automatiquement.',
    icon: 'bell.badge.fill',
    color: '#FF6B6B',
  },
  {
    id: 5,
    title: 'Assistant IA',
    description: 'Posez des questions à votre assistant : "Montre mes factures EDF" ou "Résume mon contrat de travail".',
    icon: 'message.fill',
    color: '#4ECDC4',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useAuth();
  const router = useRouter();
  const progress = useSharedValue(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      progress.value = withSpring((currentStep + 1) / (onboardingSteps.length - 1));
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/(home)');
  };

  const step = onboardingSteps[currentStep];

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${(progress.value * 100)}%`, { duration: 300 }),
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[step.color + '20', colors.background]}
        style={styles.gradient}
      >
        {/* Skip Button */}
        {currentStep < onboardingSteps.length - 1 && (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Passer</Text>
          </Pressable>
        )}

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { backgroundColor: step.color }, progressStyle]} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: step.color + '20' }]}>
            <IconSymbol name={step.icon} size={80} color={step.color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{step.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{step.description}</Text>

          {/* Step Indicators */}
          <View style={styles.indicators}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentStep ? step.color : colors.border,
                    width: index === currentStep ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <Pressable
            style={[styles.button, { backgroundColor: step.color }]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {currentStep === onboardingSteps.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
            <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s ease',
  },
  navigation: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
