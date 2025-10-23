'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { useSessionUser } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatDrawerProps {
  roomId: string;
  hostId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  roomId,
  hostId,
  isOpen,
  onClose
}) => {
  const { user, isAuthenticated } = useSessionUser();
  const { 
    threads, 
    activeThread, 
    setActiveThread, 
    sendMessage, 
    createThread, 
    loading, 
    error 
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  // Find or create thread for this room
  useEffect(() => {
    if (!isAuthenticated || !user || !isOpen) return;

    const existingThread = threads.find(thread => 
      thread.meta.roomId === roomId && 
      thread.meta.userId === user.id && 
      thread.meta.hostId === hostId
    );

    if (existingThread) {
      setActiveThread(existingThread);
    } else {
      // Create new thread
      createThread(roomId, user.id, hostId).then(thread => {
        if (thread) {
          setActiveThread(thread);
        }
      });
    }
  }, [isAuthenticated, user, roomId, hostId, threads, isOpen, createThread, setActiveThread]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeThread || sending) return;

    setSending(true);
    try {
      await sendMessage(activeThread.id, messageText.trim());
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/50 transition-opacity",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Chat</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Content */}
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading chat...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : activeThread ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeThread.messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  activeThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        message.senderRole === user.role ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2",
                        message.senderRole === user.role
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        <div className="flex items-center gap-1 mb-1">
                          {message.senderRole === 'host' ? (
                            <Building2 className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          <span className="text-xs font-medium capitalize">
                            {message.senderRole}
                          </span>
                        </div>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!messageText.trim() || sending}
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Setting up chat...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
