'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Minus,
  Send,
  ArrowLeft,
  Search,
  Check,
  CheckCheck,
} from 'lucide-react';
import { AuthUser } from '@/types';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  role: string;
  roleName: string;
  specialty?: string | null;
  lastMessage?: {
    content: string;
    createdAt: string;
    isSender: boolean;
    isRead: boolean;
  } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

interface MessengerWidgetProps {
  currentUser: AuthUser;
}

export default function MessengerWidget({ currentUser }: MessengerWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Synchronous ref to prevent stale closures and race conditions
  const selectedContactRef = useRef<Contact | null>(null);
  const isOpenRef = useRef(false);
  const isMinimizedRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep refs in sync with state
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    isMinimizedRef.current = isMinimized;
  }, [isMinimized]);

  // Fetch contacts list
  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
        setTotalUnread(data.totalUnread || 0);

        // Only update selectedContact if one is actively selected in the ref
        if (selectedContactRef.current) {
          const currentId = selectedContactRef.current.id;
          const updated = data.contacts.find((c: Contact) => c.id === currentId);
          if (updated && selectedContactRef.current && selectedContactRef.current.id === currentId) {
            setSelectedContact(updated);
            selectedContactRef.current = updated;
          }
        }
      }
    } catch {
      // Ignore background fetch errors
    }
  }, []);

  // Fetch messages for active conversation
  const fetchActiveMessages = useCallback(async (contactId: string, markRead = true) => {
    try {
      const res = await fetch(`/api/chat/messages?recipientId=${contactId}`);
      if (res.ok) {
        const data = await res.json();
        // Only set messages if still chatting with this contact
        if (selectedContactRef.current?.id === contactId) {
          setMessages(data.messages || []);
        }
        if (markRead && selectedContactRef.current?.id === contactId) {
          setTotalUnread((prev) => Math.max(0, prev - (selectedContactRef.current?.unreadCount || 0)));
        }
      }
    } catch {
      // Ignore background errors
    }
  }, []);

  // Background polling heartbeat
  useEffect(() => {
    fetchContacts();

    const interval = setInterval(() => {
      fetchContacts();
      const current = selectedContactRef.current;
      if (isOpenRef.current && !isMinimizedRef.current && current) {
        fetchActiveMessages(current.id, false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchContacts, fetchActiveMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && selectedContact) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, selectedContact]);

  // Open conversation with a contact
  const handleOpenConversation = (contact: Contact) => {
    selectedContactRef.current = contact;
    setSelectedContact(contact);
    setLoadingMessages(true);
    fetchActiveMessages(contact.id, true).finally(() => {
      setLoadingMessages(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    });
  };

  // Back to contact list (INSTANT RESET)
  const handleBackToList = () => {
    selectedContactRef.current = null;
    setSelectedContact(null);
    setMessages([]);
    fetchContacts();
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const current = selectedContactRef.current;
    if (!current || !newMessage.trim() || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: current.id,
      content: textToSend,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: current.id,
          content: textToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
        );
        fetchContacts();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const q = searchQuery.toLowerCase();
    return (
      fullName.includes(q) ||
      c.role.toLowerCase().includes(q) ||
      (c.specialty && c.specialty.toLowerCase().includes(q))
    );
  });

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* 1. FLOATING CHAT BUBBLE (Messenger Button) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {totalUnread > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-lg border border-slate-200 text-xs font-semibold text-slate-700 animate-bounce">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>
                {totalUnread} nouveau{totalUnread > 1 ? 'x' : ''} message{totalUnread > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
            title="Messagerie interne"
          >
            <MessageCircle className="w-7 h-7" />

            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 border-2 border-white text-white text-[11px] font-extrabold flex items-center justify-center shadow-md">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 2. MESSENGER DOCKED CHAT WINDOW */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[360px] sm:w-[390px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[540px]'
          }`}
        >
          {/* HEADER */}
          <div className="h-14 bg-gradient-to-r from-blue-600 to-sky-600 text-white px-4 flex items-center justify-between shrink-0 shadow-sm select-none">
            {selectedContact ? (
              // Conversation Header with Retour button
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBackToList();
                  }}
                  className="p-1.5 -ml-1 rounded-lg text-white hover:bg-white/20 active:bg-white/30 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                  title="Retour aux discussions"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-xs border border-white/30">
                    {selectedContact.firstName[0]}
                    {selectedContact.lastName[0]}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
                </div>

                <div className="min-w-0 leading-tight">
                  <div className="text-xs font-bold truncate">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </div>
                  <div className="text-[10px] text-blue-100 truncate">
                    {selectedContact.role} {selectedContact.specialty ? `• ${selectedContact.specialty}` : ''}
                  </div>
                </div>
              </div>
            ) : (
              // Main Contacts Header
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold">Discussions Clinique</div>
                  <div className="text-[10px] text-blue-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Personnel connecté</span>
                  </div>
                </div>
              </div>
            )}

            {/* Window Controls: Minimize & Close */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                title={isMinimized ? 'Agrandir' : 'Réduire'}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  selectedContactRef.current = null;
                  setSelectedContact(null);
                }}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* BODY (when not minimized) */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
              {/* VIEW 1: CONTACTS LIST (when selectedContact is null) */}
              {!selectedContact ? (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Search Bar */}
                  <div className="p-3 border-b border-slate-100 bg-white">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Rechercher un collègue, médecin..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Contacts List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {filteredContacts.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs px-4">
                        Aucun collègue trouvé
                      </div>
                    ) : (
                      filteredContacts.map((contact) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => handleOpenConversation(contact)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-slate-100/80 active:bg-slate-200/60 transition-colors text-left group cursor-pointer"
                        >
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
                              {contact.firstName[0]}
                              {contact.lastName[0]}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                          </div>

                          {/* Info & Last snippet */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                {contact.firstName} {contact.lastName}
                              </span>
                              {contact.lastMessage && (
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {formatMessageTime(contact.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-[11px] text-slate-500 truncate">
                                {contact.lastMessage ? (
                                  <>
                                    <span className="text-slate-400">
                                      {contact.lastMessage.isSender ? 'Vous : ' : ''}
                                    </span>
                                    {contact.lastMessage.content}
                                  </>
                                ) : (
                                  <span className="italic text-slate-400 text-[10px]">
                                    {contact.role}
                                  </span>
                                )}
                              </p>

                              {contact.unreadCount > 0 && (
                                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {contact.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* VIEW 2: ACTIVE CONVERSATION */
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                  {/* Messages Bubble Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
                    {loadingMessages ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        Chargement des messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs px-4">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-blue-500" />
                        <span>Démarrez votre échange avec {selectedContact.firstName}.</span>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.senderId === currentUser.id;
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
                                isMe
                                  ? 'bg-blue-600 text-white rounded-br-xs'
                                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                              }`}
                            >
                              {m.content}
                            </div>

                            <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 px-1">
                              <span>{formatMessageTime(m.createdAt)}</span>
                              {isMe && (
                                m.isRead ? (
                                  <span title="Lu"><CheckCheck className="w-3 h-3 text-blue-500" /></span>
                                ) : (
                                  <span title="Envoyé"><Check className="w-3 h-3 text-slate-300" /></span>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Box */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Écrivez un message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
                    />

                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors shrink-0 shadow-sm cursor-pointer"
                      title="Envoyer (Entrée)"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
