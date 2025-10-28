
import React from 'react';
import { Redirect } from 'expo-router';

export default function ResetPasswordScreen() {
  // Rediriger vers l'écran d'inscription car il n'y a plus de mot de passe
  return <Redirect href="/(auth)/register" />;
}
