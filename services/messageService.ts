import { useState, useEffect, useCallback } from 'react';
import { Message, UserProfile } from '../types';
import { RAW_CSV_DATA } from '../constants';
import { parseCSV, generateMockProfile, calculateUrgency } from '../utils/dataProcessing';

// Simulated database hooks
export const useMessagingSystem = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Data
  useEffect(() => {
    const initialMessages = parseCSV(RAW_CSV_DATA);
    setMessages(initialMessages);

    const initialUsers: Record<string, UserProfile> = {};
    initialMessages.forEach(msg => {
      if (!initialUsers[msg.userId]) {
        initialUsers[msg.userId] = generateMockProfile(msg.userId);
      }
    });
    setUsers(initialUsers);
    setIsLoading(false);
  }, []);

  const addMessage = useCallback((userId: string, body: string, direction: 'inbound' | 'outbound' = 'inbound', agentId?: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      userId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      body,
      direction,
      urgencyScore: direction === 'inbound' ? calculateUrgency(body) : 0,
      isRead: direction === 'outbound', // Outbound is read by default
      status: 'open',
      agentId
    };

    setMessages(prev => [newMessage, ...prev]);

    // Ensure user profile exists
    if (!users[userId]) {
      setUsers(prev => ({
        ...prev,
        [userId]: generateMockProfile(userId)
      }));
    }
    
    return newMessage;
  }, [users]);

  const markAsRead = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
  }, []);

  const resolveMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'resolved' } : m));
  }, []);

  const resolveConversation = useCallback((userId: string) => {
    setMessages(prev => prev.map(m => 
      (m.userId === userId && m.status === 'open') ? { ...m, status: 'resolved' } : m
    ));
  }, []);

  return {
    messages,
    users,
    isLoading,
    addMessage,
    markAsRead,
    resolveMessage,
    resolveConversation
  };
};