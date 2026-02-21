import { useEffect, useRef } from 'react';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../hooks/useMessages';
import { Loader2 } from 'lucide-react';

interface MessagingInterfaceProps {
  username: string;
  onLogout: () => void;
}

export default function MessagingInterface({ username, onLogout }: MessagingInterfaceProps) {
  const { messages, isLoading, sendMessage, isSending } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(username, content);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header username={username} onLogout={onLogout} />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <MessageList messages={messages} currentUsername={username} />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <div className="border-t bg-card/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <MessageInput onSend={handleSendMessage} isSending={isSending} />
          </div>
        </div>
      </main>

      <footer className="border-t py-3 px-4 text-center text-sm text-muted-foreground bg-card/30">
        <p>
          © {new Date().getFullYear()} • Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'alatele2'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
