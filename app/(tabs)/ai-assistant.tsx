
import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { Stack } from "expo-router";

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export default function AIAssistantScreen() {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour! Je suis votre assistant IA UneBox. Comment puis-je vous aider aujourd\'hui?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const quickActions = [
    { id: '1', text: 'Montre mes factures EDF', icon: 'bolt.fill' },
    { id: '2', text: 'Résume mes contrats', icon: 'doc.text.fill' },
    { id: '3', text: 'Rappels à venir', icon: 'bell.fill' },
    { id: '4', text: 'Espace de stockage', icon: 'chart.pie.fill' },
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const generateAIResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();

    if (lowerText.includes('facture') && lowerText.includes('edf')) {
      return 'J\'ai trouvé 3 factures EDF dans vos documents:\n\n- Facture EDF - Janvier 2024 (89.50€)\n- Facture EDF - Décembre 2023 (95.20€)\n- Facture EDF - Novembre 2023 (78.90€)\n\nSouhaitez-vous voir plus de détails?';
    }

    if (lowerText.includes('contrat')) {
      return 'Vous avez 2 contrats dans vos documents:\n\n- Contrat de travail CDI (signé le 10 Jan 2024)\n- Contrat d\'assurance habitation (valide jusqu\'en 2024)\n\nVoulez-vous que je résume l\'un d\'entre eux?';
    }

    if (lowerText.includes('rappel')) {
      return 'Vous avez 5 rappels actifs:\n\n🔴 Urgent: Facture EDF à payer (25 Jan)\n🔴 Urgent: Renouvellement assurance (30 Jan)\n🟡 Moyen: Déclaration fiscale (15 Fév)\n\nVoulez-vous plus de détails?';
    }

    if (lowerText.includes('stockage') || lowerText.includes('espace')) {
      return 'Votre espace de stockage:\n\n📊 2.4 Go utilisés sur 15 Go (16%)\n📄 Documents: 1.8 Go\n🖼️ Images: 0.6 Go\n\nVous avez encore beaucoup d\'espace disponible!';
    }

    return 'Je peux vous aider à:\n\n- Rechercher des documents spécifiques\n- Résumer vos contrats et factures\n- Gérer vos rappels\n- Analyser votre espace de stockage\n\nQue souhaitez-vous faire?';
  };

  const handleQuickAction = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Assistant IA",
            headerLargeTitle: true,
          }}
        />
      )}
      <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer,
                ]}
              >
                {message.sender === 'ai' && (
                  <View style={styles.aiAvatar}>
                    <IconSymbol name="sparkles" size={20} color="#FFFFFF" />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    message.sender === 'user' ? styles.userMessageBubble : styles.aiMessageBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      message.sender === 'user' ? styles.userMessageTime : styles.aiMessageTime,
                    ]}
                  >
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}

            {/* Quick Actions */}
            {messages.length === 1 && (
              <View style={styles.quickActionsContainer}>
                <Text style={styles.quickActionsTitle}>Actions rapides</Text>
                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action) => (
                    <Pressable
                      key={action.id}
                      style={styles.quickActionButton}
                      onPress={() => handleQuickAction(action.text)}
                    >
                      <IconSymbol name={action.icon} size={24} color={colors.primary} />
                      <Text style={styles.quickActionText}>{action.text}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Posez une question..."
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <Pressable
                style={[
                  styles.sendButton,
                  { backgroundColor: inputText.trim() ? colors.primary : colors.border }
                ]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim()}
              >
                <IconSymbol name="arrow.up" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiMessageTime: {
    color: colors.textSecondary,
  },
  quickActionsContainer: {
    marginTop: 24,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 1,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 90,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
