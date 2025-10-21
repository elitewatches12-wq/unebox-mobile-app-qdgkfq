
import React from 'react';
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'house.fill',
      label: 'Accueil',
    },
    {
      name: 'upload',
      route: '/(tabs)/upload',
      icon: 'arrow.up.doc.fill',
      label: 'Téléverser',
    },
    {
      name: 'documents',
      route: '/(tabs)/documents',
      icon: 'doc.text.fill',
      label: 'Documents',
    },
    {
      name: 'reminders',
      route: '/(tabs)/reminders',
      icon: 'bell.fill',
      label: 'Rappels',
    },
    {
      name: 'ai-assistant',
      route: '/(tabs)/ai-assistant',
      icon: 'sparkles',
      label: 'Assistant',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person.fill',
      label: 'Profil',
    },
  ];

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="(home)">
          <Icon sf="house.fill" drawable="ic_home" />
          <Label>Accueil</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="upload">
          <Icon sf="arrow.up.doc.fill" drawable="ic_upload" />
          <Label>Téléverser</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="documents">
          <Icon sf="doc.text.fill" drawable="ic_documents" />
          <Label>Documents</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="reminders">
          <Icon sf="bell.fill" drawable="ic_reminders" />
          <Label>Rappels</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="ai-assistant">
          <Icon sf="sparkles" drawable="ic_ai" />
          <Label>Assistant</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf="person.fill" drawable="ic_profile" />
          <Label>Profil</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="documents" />
        <Stack.Screen name="reminders" />
        <Stack.Screen name="ai-assistant" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} containerWidth={360} />
    </>
  );
}
