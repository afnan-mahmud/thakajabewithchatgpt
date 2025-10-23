'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageSquare,
  User,
  Home,
  Send,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatThread {
  id: string;
  roomId: string;
  roomTitle: string;
  userId: string;
  userName: string;
  hostId: string;
  hostName: string;
  lastMessageAt: string;
  messageCount: number;
  isActive: boolean;
  lastMessage: {
    text: string;
    senderRole: 'user' | 'host' | 'admin';
    timestamp: string;
    blocked?: boolean;
    reason?: string;
  };
}

interface Message {
  id: string;
  text: string;
  senderRole: 'user' | 'host' | 'admin';
  timestamp: string;
  blocked?: boolean;
  reason?: string;
}

export default function AdminChat() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  // Mock data - replace with actual API calls
  const mockThreads: ChatThread[] = [
    {
      id: '1',
      roomId: 'room1',
      roomTitle: 'Luxury Apartment in Gulshan',
      userId: 'user1',
      userName: 'John Doe',
      hostId: 'host1',
      hostName: 'Jane Smith',
      lastMessageAt: '2024-01-20T10:30:00Z',
      messageCount: 15,
      isActive: true,
      lastMessage: {
        text: 'Thank you for the quick response!',
        senderRole: 'user',
        timestamp: '2024-01-20T10:30:00Z',
      },
    },
    {
      id: '2',
      roomId: 'room2',
      roomTitle: 'Cozy Studio in Dhanmondi',
      userId: 'user2',
      userName: 'Mike Johnson',
      hostId: 'host2',
      hostName: 'Sarah Wilson',
      lastMessageAt: '2024-01-19T14:20:00Z',
      messageCount: 8,
      isActive: true,
      lastMessage: {
        text: 'Is the WiFi working properly?',
        senderRole: 'user',
        timestamp: '2024-01-19T14:20:00Z',
      },
    },
    {
      id: '3',
      roomId: 'room3',
      roomTitle: 'Family House in Uttara',
      userId: 'user3',
      userName: 'Alice Brown',
      hostId: 'host3',
      hostName: 'David Lee',
      lastMessageAt: '2024-01-18T16:45:00Z',
      messageCount: 23,
      isActive: false,
      lastMessage: {
        text: 'Please contact me at +8801234567890',
        senderRole: 'user',
        timestamp: '2024-01-18T16:45:00Z',
        blocked: true,
        reason: 'Contact information detected',
      },
    },
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      text: 'Hello! I\'m interested in booking your room.',
      senderRole: 'user',
      timestamp: '2024-01-20T09:00:00Z',
    },
    {
      id: '2',
      text: 'Hi! I\'d be happy to help you with that. What dates are you looking for?',
      senderRole: 'host',
      timestamp: '2024-01-20T09:05:00Z',
    },
    {
      id: '3',
      text: 'I need it for January 25-27. Is it available?',
      senderRole: 'user',
      timestamp: '2024-01-20T09:10:00Z',
    },
    {
      id: '4',
      text: 'Yes, those dates are available! The total would be ৳16,000 for 2 nights.',
      senderRole: 'host',
      timestamp: '2024-01-20T09:15:00Z',
    },
    {
      id: '5',
      text: 'Perfect! How do I proceed with the booking?',
      senderRole: 'user',
      timestamp: '2024-01-20T09:20:00Z',
    },
    {
      id: '6',
      text: 'You can book directly through the platform. I\'ll send you the booking link.',
      senderRole: 'host',
      timestamp: '2024-01-20T09:25:00Z',
    },
    {
      id: '7',
      text: 'Thank you for the quick response!',
      senderRole: 'user',
      timestamp: '2024-01-20T10:30:00Z',
    },
  ];

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    filterThreads();
  }, [threads, searchTerm]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      // Mock API call
      setThreads(mockThreads);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      // Mock API call
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const filterThreads = () => {
    let filtered = threads;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(thread =>
        thread.roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.hostName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredThreads(filtered);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    try {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        senderRole: 'admin',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Mock API call to send message
      console.log('Sending admin message:', message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getSenderBadge = (role: string) => {
    const variants = {
      user: 'bg-blue-100 text-blue-800',
      host: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={variants[role as keyof typeof variants]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat Monitoring</h1>
          <p className="text-gray-600">Monitor and manage customer conversations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threads List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedThread?.id === thread.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedThread(thread)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {thread.roomTitle}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {thread.userName} ↔ {thread.hostName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {thread.lastMessage.text}
                        </p>
                      </div>
                      <div className="ml-2 flex flex-col items-end">
                        <Badge variant={thread.isActive ? 'default' : 'secondary'} className="text-xs">
                          {thread.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-gray-500 mt-1">
                          {format(new Date(thread.lastMessageAt), 'MMM dd')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {thread.messageCount} msgs
                        </span>
                      </div>
                    </div>
                    {thread.lastMessage.blocked && (
                      <div className="flex items-center mt-2 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Blocked: {thread.lastMessage.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedThread.roomTitle}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {selectedThread.userName} ↔ {selectedThread.hostName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedThread.isActive ? 'default' : 'secondary'}>
                      {selectedThread.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Room
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderRole === 'admin' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderRole === 'admin'
                            ? 'bg-blue-600 text-white'
                            : message.senderRole === 'host'
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {getSenderBadge(message.senderRole)}
                          {message.blocked && (
                            <Badge variant="destructive" className="text-xs">
                              Blocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(message.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message as admin..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Messages sent as admin will be visible to both user and host
                </p>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
