
import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, KeyboardAvoidingView, ActivityIndicator, Keyboard } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { Stack, useRouter } from "expo-router";
import { supabase } from "@/app/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/app/integrations/supabase/types";

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  documents?: Tables<'documents'>[];
};

export default function AIAssistantScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour! Je suis votre assistant IA UneBox. Je peux vous aider à rechercher vos documents, analyser vos factures, gérer vos rappels et bien plus encore. Comment puis-je vous aider aujourd\'hui?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickActions = [
    { id: '1', text: 'Mes factures EDF', icon: 'bolt.fill', query: 'facture EDF' },
    { id: '2', text: 'Documents récents', icon: 'clock.fill', query: 'documents récents' },
    { id: '3', text: 'Montants à payer', icon: 'eurosign.circle.fill', query: 'montants à payer' },
    { id: '4', text: 'Contrats actifs', icon: 'doc.text.fill', query: 'contrats' },
  ];

  // Calculate the bottom offset for the tab bar
  // Tab bar height (60) + bottom margin (10 for iOS, 20 for Android) + safe area bottom
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? 10 : 20) + insets.bottom;

  // Scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Handle keyboard show/hide events
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        console.log('Keyboard showing, height:', e.endCoordinates.height);
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        console.log('Keyboard hiding');
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Scroll to bottom when user starts typing
  const handleInputChange = (text: string) => {
    setInputText(text);
    // Scroll to bottom when user types
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const searchDocuments = async (query: string): Promise<Tables<'documents'>[]> => {
    try {
      const lowerQuery = query.toLowerCase();
      
      let queryBuilder = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .eq('processing_status', 'completed');

      // Search in multiple fields
      if (lowerQuery.includes('edf')) {
        queryBuilder = queryBuilder.or(`sender.ilike.%EDF%,title.ilike.%EDF%,ai_summary.ilike.%EDF%`);
      } else if (lowerQuery.includes('facture')) {
        queryBuilder = queryBuilder.eq('document_type', 'Facture');
      } else if (lowerQuery.includes('contrat')) {
        queryBuilder = queryBuilder.eq('document_type', 'Contrat');
      } else if (lowerQuery.includes('récent')) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        queryBuilder = queryBuilder.gte('created_at', sevenDaysAgo.toISOString());
      } else if (lowerQuery.includes('payer') || lowerQuery.includes('montant')) {
        queryBuilder = queryBuilder.not('amount', 'is', null).not('due_date', 'is', null);
      } else {
        // General search
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,sender.ilike.%${query}%,ai_summary.ilike.%${query}%,category.ilike.%${query}%`
        );
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false }).limit(10);

      if (error) {
        console.error('Error searching documents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception searching documents:', error);
      return [];
    }
  };

  const generateAIResponse = async (userText: string): Promise<{ text: string; documents?: Tables<'documents'>[] }> => {
    const lowerText = userText.toLowerCase();

    // Search for relevant documents
    const documents = await searchDocuments(userText);

    if (lowerText.includes('facture') || lowerText.includes('edf')) {
      if (documents.length === 0) {
        return {
          text: 'Je n\'ai trouvé aucune facture EDF dans vos documents. Avez-vous téléversé des factures récemment?',
        };
      }

      const totalAmount = documents.reduce((sum, doc) => sum + (doc.amount || 0), 0);
      let response = `J'ai trouvé ${documents.length} facture(s) EDF:\n\n`;
      
      documents.slice(0, 5).forEach((doc, i) => {
        response += `${i + 1}. ${doc.title}\n`;
        if (doc.amount) response += `   Montant: ${doc.amount.toFixed(2)} ${doc.currency || 'EUR'}\n`;
        if (doc.due_date) response += `   Échéance: ${new Date(doc.due_date).toLocaleDateString('fr-FR')}\n`;
        response += '\n';
      });

      if (totalAmount > 0) {
        response += `\nMontant total: ${totalAmount.toFixed(2)} EUR`;
      }

      return { text: response, documents };
    }

    if (lowerText.includes('contrat')) {
      if (documents.length === 0) {
        return {
          text: 'Je n\'ai trouvé aucun contrat dans vos documents.',
        };
      }

      let response = `Vous avez ${documents.length} contrat(s):\n\n`;
      
      documents.slice(0, 5).forEach((doc, i) => {
        response += `${i + 1}. ${doc.title}\n`;
        if (doc.sender) response += `   Émetteur: ${doc.sender}\n`;
        if (doc.document_date) response += `   Date: ${new Date(doc.document_date).toLocaleDateString('fr-FR')}\n`;
        if (doc.ai_summary) response += `   ${doc.ai_summary.substring(0, 100)}...\n`;
        response += '\n';
      });

      return { text: response, documents };
    }

    if (lowerText.includes('rappel')) {
      const { data: reminders } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user?.id)
        .eq('completed', false)
        .order('due_date', { ascending: true })
        .limit(5);

      if (!reminders || reminders.length === 0) {
        return {
          text: 'Vous n\'avez aucun rappel actif pour le moment. Parfait!',
        };
      }

      let response = `Vous avez ${reminders.length} rappel(s) actif(s):\n\n`;
      
      reminders.forEach((reminder, i) => {
        const daysUntil = Math.ceil((new Date(reminder.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const urgency = daysUntil <= 3 ? '🔴' : daysUntil <= 7 ? '🟡' : '🟢';
        
        response += `${urgency} ${reminder.title}\n`;
        response += `   ${reminder.description}\n`;
        response += `   Échéance: ${new Date(reminder.due_date).toLocaleDateString('fr-FR')} (${daysUntil} jours)\n\n`;
      });

      return { text: response };
    }

    if (lowerText.includes('stockage') || lowerText.includes('espace')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('storage_used, storage_limit')
        .eq('id', user?.id)
        .single();

      if (profile) {
        const usedGB = (profile.storage_used || 0) / (1024 * 1024 * 1024);
        const limitGB = (profile.storage_limit || 0) / (1024 * 1024 * 1024);
        const percentage = ((profile.storage_used || 0) / (profile.storage_limit || 1)) * 100;

        return {
          text: `Votre espace de stockage:\n\n📊 ${usedGB.toFixed(2)} Go utilisés sur ${limitGB.toFixed(0)} Go (${percentage.toFixed(1)}%)\n\n${
            percentage < 50
              ? 'Vous avez encore beaucoup d\'espace disponible!'
              : percentage < 80
              ? 'Votre espace se remplit progressivement.'
              : 'Attention, votre espace de stockage est presque plein!'
          }`,
        };
      }
    }

    if (lowerText.includes('récent') || lowerText.includes('dernier')) {
      if (documents.length === 0) {
        return {
          text: 'Vous n\'avez pas encore téléversé de documents récents.',
        };
      }

      let response = `Vos ${documents.length} documents les plus récents:\n\n`;
      
      documents.slice(0, 5).forEach((doc, i) => {
        response += `${i + 1}. ${doc.title}\n`;
        if (doc.category) response += `   Catégorie: ${doc.category}\n`;
        response += `   Ajouté: ${new Date(doc.created_at || '').toLocaleDateString('fr-FR')}\n\n`;
      });

      return { text: response, documents };
    }

    if (lowerText.includes('payer') || lowerText.includes('montant')) {
      const unpaidDocs = documents.filter(doc => doc.amount && doc.due_date);
      
      if (unpaidDocs.length === 0) {
        return {
          text: 'Aucun document avec montant à payer trouvé. Tout est à jour!',
        };
      }

      const totalToPay = unpaidDocs.reduce((sum, doc) => sum + (doc.amount || 0), 0);
      let response = `Documents avec montants à payer:\n\n`;
      
      unpaidDocs.slice(0, 5).forEach((doc, i) => {
        const daysUntil = Math.ceil((new Date(doc.due_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        response += `${i + 1}. ${doc.title}\n`;
        response += `   Montant: ${doc.amount?.toFixed(2)} ${doc.currency || 'EUR'}\n`;
        response += `   Échéance: ${new Date(doc.due_date!).toLocaleDateString('fr-FR')} (${daysUntil} jours)\n\n`;
      });

      response += `\nTotal à payer: ${totalToPay.toFixed(2)} EUR`;

      return { text: response, documents: unpaidDocs };
    }

    // General search
    if (documents.length > 0) {
      let response = `J'ai trouvé ${documents.length} document(s) correspondant à votre recherche:\n\n`;
      
      documents.slice(0, 5).forEach((doc, i) => {
        response += `${i + 1}. ${doc.title}\n`;
        if (doc.category) response += `   ${doc.category}`;
        if (doc.sender) response += ` - ${doc.sender}`;
        response += '\n';
        if (doc.ai_summary) response += `   ${doc.ai_summary.substring(0, 80)}...\n`;
        response += '\n';
      });

      return { text: response, documents };
    }

    return {
      text: 'Je peux vous aider à:\n\n- Rechercher des documents spécifiques\n- Analyser vos factures et contrats\n- Gérer vos rappels et échéances\n- Suivre vos montants à payer\n- Analyser votre espace de stockage\n\nQue souhaitez-vous faire?',
    };
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await generateAIResponse(text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'ai',
        timestamp: new Date(),
        documents: response.documents,
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  // Calculate the input container bottom position
  const inputContainerBottom = keyboardHeight > 0 ? keyboardHeight : tabBarHeight;

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
        <View style={styles.container}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: inputContainerBottom + 80 } // Add space for input
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <View key={message.id}>
                <View
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

                {/* Show document cards if available */}
                {message.documents && message.documents.length > 0 && (
                  <View style={styles.documentsContainer}>
                    {message.documents.slice(0, 3).map((doc) => (
                      <Pressable
                        key={doc.id}
                        style={styles.documentCard}
                        onPress={() => router.push('/(tabs)/documents')}
                      >
                        <IconSymbol name="doc.fill" size={20} color={colors.primary} />
                        <View style={styles.documentCardInfo}>
                          <Text style={styles.documentCardTitle} numberOfLines={1}>
                            {doc.title}
                          </Text>
                          {doc.amount && (
                            <Text style={styles.documentCardAmount}>
                              {doc.amount.toFixed(2)} {doc.currency || 'EUR'}
                            </Text>
                          )}
                        </View>
                        <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {isProcessing && (
              <View style={styles.processingContainer}>
                <View style={styles.aiAvatar}>
                  <IconSymbol name="sparkles" size={20} color="#FFFFFF" />
                </View>
                <View style={[styles.messageBubble, styles.aiMessageBubble]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.messageText, styles.aiMessageText, { marginTop: 8 }]}>
                    Recherche en cours...
                  </Text>
                </View>
              </View>
            )}

            {messages.length === 1 && (
              <View style={styles.quickActionsContainer}>
                <Text style={styles.quickActionsTitle}>Actions rapides</Text>
                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action) => (
                    <Pressable
                      key={action.id}
                      style={styles.quickActionButton}
                      onPress={() => handleQuickAction(action.query)}
                    >
                      <IconSymbol name={action.icon} size={24} color={colors.primary} />
                      <Text style={styles.quickActionText}>{action.text}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputContainer, { bottom: inputContainerBottom }]}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Posez une question..."
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={handleInputChange}
                onFocus={() => {
                  // Scroll to bottom when input is focused
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 300);
                }}
                multiline
                maxLength={500}
                editable={!isProcessing}
              />
              <Pressable
                style={[
                  styles.sendButton,
                  { backgroundColor: inputText.trim() && !isProcessing ? colors.primary : colors.border }
                ]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isProcessing}
              >
                <IconSymbol name="arrow.up" size={20} color="#FFFFFF" />
              </Pressable>
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
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
  processingContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  documentsContainer: {
    marginLeft: 44,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 1,
  },
  documentCardInfo: {
    flex: 1,
  },
  documentCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  documentCardAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
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
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
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
