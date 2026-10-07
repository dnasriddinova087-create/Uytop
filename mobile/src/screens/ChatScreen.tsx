import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Conversation, Message } from '../types';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ChatScreenProps {
  initialBrokerId?: number;
  initialPropertyId?: number;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  initialBrokerId,
  initialPropertyId,
  onBack,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchConversations = async () => {
    try {
      const data = await mobileApi.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const data = await mobileApi.getMessages(convId);
      setMessages(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initChat = async () => {
      if (initialBrokerId) {
        try {
          const conv = await mobileApi.startConversation(
            initialBrokerId,
            initialPropertyId,
            "Assalomu alaykum! E'lon bo'yicha bog'lanmoqdaman."
          );
          setActiveConvId(conv.id);
        } catch (err) {
          console.error(err);
        }
      }
      fetchConversations();
    };
    initChat();
  }, [initialBrokerId, initialPropertyId]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      const timer = setInterval(() => fetchMessages(activeConvId), 4000);
      return () => clearInterval(timer);
    }
  }, [activeConvId]);

  const handleSend = async () => {
    if (!activeConvId || !text.trim() || sending) return;
    setSending(true);
    try {
      const msg = await mobileApi.sendMessage(activeConvId, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText('');
      fetchConversations();
    } catch (err: any) {
      Alert.alert('Xatolik', err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F382A" />
      </View>
    );
  }

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const otherUser = activeConv
    ? user?.id === activeConv.client_id
      ? activeConv.broker
      : activeConv.client
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Orqaga</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Xabarlar'}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Conversations horizontal pill list if multiple */}
      {conversations.length > 1 && (
        <ScrollView horizontal style={styles.convScroll} showsHorizontalScrollIndicator={false}>
          {conversations.map((c) => {
            const partner = user?.id === c.client_id ? c.broker : c.client;
            const isSelected = c.id === activeConvId;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.convPill, isSelected && styles.convPillActive]}
                onPress={() => setActiveConvId(c.id)}
              >
                <Text style={[styles.convPillText, isSelected && styles.convPillTextActive]}>
                  {partner?.first_name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Messages Feed */}
      <ScrollView contentContainerStyle={styles.messagesWrap}>
        {messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Xabarlar yo'q. Birinchi xabarni yozing!</Text>
          </View>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === user?.id;
            return (
              <View
                key={m.id}
                style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}
              >
                <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
                  {m.text}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Xabar yozing..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    paddingVertical: 6,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F382A',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  convScroll: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    maxHeight: 48,
  },
  convPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 8,
  },
  convPillActive: {
    backgroundColor: '#0F382A',
  },
  convPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  convPillTextActive: {
    color: '#FFFFFF',
  },
  messagesWrap: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  bubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#0F382A',
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
  },
  bubbleText: {
    fontSize: 13,
    color: '#111827',
  },
  bubbleTextMine: {
    color: '#FFFFFF',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    fontSize: 13,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
