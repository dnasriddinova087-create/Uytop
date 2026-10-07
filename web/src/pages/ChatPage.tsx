import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, User as UserIcon, MessageSquare, Building } from 'lucide-react';
import { Conversation, Message } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSkeleton';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(
    searchParams.get('conversationId') ? Number(searchParams.get('conversationId')) : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (!activeConvId && data.length > 0) {
        setActiveConvId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const data = await api.getMessages(convId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      const interval = setInterval(() => {
        fetchMessages(activeConvId);
      }, 4000); // Poll for new messages every 4s
      return () => clearInterval(interval);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !messageText.trim() || sending) return;

    setSending(true);
    try {
      const newMsg = await api.sendMessage(activeConvId, messageText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setMessageText('');
      fetchConversations(); // update last message preview
    } catch (err: any) {
      alert('Xabar yuborishda xatolik: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner text="Suhbatlar yuklanmoqda..." />;

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const otherParticipant = activeConv
    ? user?.id === activeConv.client_id
      ? activeConv.broker
      : activeConv.client
    : null;

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '5rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F382A', marginBottom: '1.5rem' }}>
        Xabarlar va Suhbatlar
      </h1>

      {conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
          <MessageSquare size={48} color="#9CA3AF" />
          <h3 style={{ marginTop: '1rem', color: '#111827' }}>Hozircha hech qanday suhbat mavjud emas</h3>
          <p style={{ color: '#6B7280', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Uy e'lonlari sahifasida "Xabar yozish" tugmasini bosib makler yoki uy egasi bilan muloqot boshlang.
          </p>
          <Link to="/catalog" className="btn btn-primary">
            Uylarni ko'rish
          </Link>
        </div>
      ) : (
        <div className="chat-window">
          {/* Conversation List Sidebar */}
          <div className="chat-list">
            {conversations.map((conv) => {
              const other = user?.id === conv.client_id ? conv.broker : conv.client;
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  className={`chat-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveConvId(conv.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#ECFDF5',
                      color: '#0F382A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}>
                      {other?.first_name ? other.first_name[0] : 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {other?.first_name} {other?.last_name}
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>{conv.unread_count}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.last_message?.text || 'Yangi suhbat'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Chat Conversation */}
          <div className="chat-messages">
            {activeConv && (
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FFFFFF',
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0F382A', fontSize: '1.05rem' }}>
                    {otherParticipant?.first_name} {otherParticipant?.last_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    {otherParticipant?.phone}
                  </div>
                </div>

                {activeConv.property && (
                  <Link
                    to={`/properties/${activeConv.property.id}`}
                    style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Building size={16} /> Uy e'loni: {activeConv.property.title}
                  </Link>
                )}
              </div>
            )}

            <div className="chat-body">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9CA3AF', margin: 'auto' }}>
                  Bu suhbatda hali xabarlar yo'q. Birinchi xabarni yuboring!
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender_id === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`message-bubble ${isMine ? 'message-outgoing' : 'message-incoming'}`}
                    >
                      <div>{m.text}</div>
                      <div style={{
                        fontSize: '0.7rem',
                        marginTop: '4px',
                        textAlign: 'right',
                        opacity: 0.75,
                      }}>
                        {new Date(m.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-bar">
              <input
                type="text"
                placeholder="Xabaringizni yozing..."
                className="form-input"
                style={{ flex: 1 }}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending || !messageText.trim()}
                id="btn-chat-send"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
