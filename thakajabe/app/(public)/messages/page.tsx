'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Clock, Send } from 'lucide-react';
import Image from 'next/image';

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    timestamp: number;
    senderId: string;
  };
  unreadCount: number;
  updatedAt: string;
  hostName: string;
  hostAvatar?: string;
  roomName: string;
}

export default function MessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch from Firebase or your API
      // const response = await api.messages.getChats();
      
      // Mock data for demo
      const mockChats: Chat[] = [
        {
          id: 'chat_001',
          participants: ['user_001', 'host_001'],
          lastMessage: {
            content: 'Thank you for your booking! Check-in is at 2 PM.',
            timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
            senderId: 'host_001',
          },
          unreadCount: 2,
          updatedAt: new Date().toISOString(),
          hostName: 'Ahmed Rahman',
          roomName: 'Cozy Apartment in Dhanmondi',
        },
        {
          id: 'chat_002',
          participants: ['user_001', 'host_002'],
          lastMessage: {
            content: 'Is the room available for next weekend?',
            timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
            senderId: 'user_001',
          },
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
          hostName: 'Fatima Khan',
          roomName: 'Modern Studio in Gulshan',
        },
      ];
      
      setChats(mockChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };


  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-2">Messages</h1>
          <p className="text-gray-600">Chat with hosts and manage your conversations</p>
        </div>

        {/* Chats List */}
        {chats.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-gray-600 mb-4">
                Start a conversation by booking a room or contacting a host
              </p>
              <Button>Browse Rooms</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <Card key={chat.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    {/* Host Avatar */}
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={chat.hostAvatar || '/placeholder-avatar.jpg'}
                        alt={chat.hostName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg truncate">
                          {chat.hostName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-primary text-white">
                              {chat.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {chat.lastMessage && formatTime(chat.lastMessage.timestamp)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-1 truncate">
                        {chat.roomName}
                      </p>

                      {chat.lastMessage && (
                        <p className="text-sm text-gray-700 truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Message Icon */}
                    <div className="flex-shrink-0">
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-16">
            <div className="text-center">
              <Send className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">New Message</span>
            </div>
          </Button>
          <Button variant="outline" className="h-16">
            <div className="text-center">
              <User className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">Contact Support</span>
            </div>
          </Button>
        </div>
      </div>
      </Layout>
    </ProtectedRoute>
  );
}
