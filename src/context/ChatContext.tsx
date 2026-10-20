import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '../types';
import { dbService } from '../services/db';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingMessages: boolean;
  isOpen: boolean;
  openChatWithConversation: (conversationId: string) => Promise<void>;
  openChatForClaim: (claimId: string) => Promise<void>;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const refreshConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }
    const convs = await dbService.getConversations(user.id);
    setConversations(convs);
  }, [user]);

  useEffect(() => {
    refreshConversations();
    const interval = setInterval(refreshConversations, 5000);
    return () => clearInterval(interval);
  }, [refreshConversations]);

  const loadMessages = async (convId: string) => {
    setIsLoadingMessages(true);
    const msgs = await dbService.getMessages(convId);
    setMessages(msgs);
    setIsLoadingMessages(false);
  };

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      const interval = setInterval(() => {
        loadMessages(activeConversation.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  const openChatWithConversation = async (conversationId: string) => {
    if (!user) return;
    const all = await dbService.getConversations(user.id);
    const target = all.find((c) => c.id === conversationId);
    if (target) {
      setActiveConversation(target);
      setIsOpen(true);
      await loadMessages(target.id);
    }
  };

  const openChatForClaim = async (claimId: string) => {
    if (!user) return;
    const all = await dbService.getConversations(user.id);
    const target = all.find((c) => c.claimId === claimId);
    if (target) {
      setActiveConversation(target);
      setIsOpen(true);
      await loadMessages(target.id);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const sendMessage = async (content: string) => {
    if (!user || !activeConversation || !content.trim()) return;
    const newMsg = await dbService.sendMessage(activeConversation.id, user.id, user.name, content);
    setMessages((prev) => [...prev, newMsg]);
    refreshConversations();
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isLoadingMessages,
        isOpen,
        openChatWithConversation,
        openChatForClaim,
        closeChat,
        sendMessage,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
