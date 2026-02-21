import { useEffect, useRef } from 'react';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { ExternalBlob } from '../backend';

interface MessagingInterfaceProps {
  onLogout: () => void;
}

export default function MessagingInterface({ onLogout }: MessagingInterfaceProps) {
  const { username, displayName } = useAuth();
  const { messages, isLoading, sendMessage, isSending } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(messages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Auto-scroll when messages change
    if (messages.length > previousMessageCountRef.current) {
      scrollToBottom();
    }
    previousMessageCountRef.current = messages.length;
  }, [messages.length]);

  const handleSendMessage = async (content: string, image?: ExternalBlob, video?: ExternalBlob, audio?: ExternalBlob) => {
    if (username) {
      await sendMessage(displayName || username, content, image, video, audio);
      // Immediate scroll after sending
      setTimeout(scrollToBottom, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <Header onLogout={onLogout} />
      
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <MessageList messages={messages} currentUsername={displayName || username || ''} />
        <div ref={messagesEndRef} />
      </main>

      <div className="border-t bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <MessageInput onSend={handleSendMessage} isSending={isSending} />
        </div>
      </div>
    </div>
  );
}
