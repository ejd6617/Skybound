import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import SkyboundText from '@components/ui/SkyboundText';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ChatMessage {
  id: string;
  from: 'user' | 'ai' | 'typing';
  text: string;
}

const TypingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const animated = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animated, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(animated, {
          toValue: 0.2,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated, delay]);

  return <Animated.View style={[styles.typingDot, { opacity: animated }]} />;
};

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'intro',
      from: 'ai',
      text: 'Hi traveler! Ask me anything about your flights or bookings.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const displayMessages = useMemo(() => {
    if (isTyping) {
      return [...messages, { id: 'typing', from: 'typing', text: '' }];
    }
    return messages;
  }, [isTyping, messages]);

  const scrollToEnd = () => {
    requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newMessage: ChatMessage = { id: Date.now().toString(), from: 'user', text: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    scrollToEnd();
    setIsTyping(true);
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-ai`,
          from: 'ai',
          text: 'Feature still in progress, come back later :)',
        },
      ]);
      setIsTyping(false);
      scrollToEnd();
    }, 1200);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.from === 'typing') {
      return (
        <View style={[styles.messageRow, styles.aiRow]}>
          <View style={styles.aiBubble}>
            <View style={styles.typingRow}>
              <TypingDot delay={0} />
              <TypingDot delay={150} />
              <TypingDot delay={300} />
            </View>
          </View>
        </View>
      );
    }

    const isUser = item.from === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons name="airplane" size={16} color="#FFFFFF" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <SkyboundText
            variant="primary"
            size={15}
            style={{ color: isUser ? '#0B1220' : '#F8FAFC' }}
            accessabilityLabel={`${item.from} message ${item.text}`}
          >
            {item.text}
          </SkyboundText>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={[ '#CBE4FF', '#8BBEF8', '#0F172A' ]} style={styles.gradient}>
        <View style={styles.header}>
          <SkyboundText variant="primaryBold" size={24} accessabilityLabel="Skybound AI title">
            Skybound AI
          </SkyboundText>
          <SkyboundText variant="secondary" size={13} accessabilityLabel="Skybound AI subtitle">
            Calm skies, instant answers.
          </SkyboundText>
        </View>
        <FlatList
          ref={flatListRef}
          data={displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <View style={[styles.inputBar, { backgroundColor: 'rgba(15,23,42,0.7)' }]}> 
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about trips, billing, anything..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={styles.input}
              multiline
            />
            <Pressable
              accessibilityRole="button"
              onPress={sendMessage}
              style={({ pressed }) => [styles.sendButton, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiBubble: {
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typingRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  inputBar: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2F97FF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
