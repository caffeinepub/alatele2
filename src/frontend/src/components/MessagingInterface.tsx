import { useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../hooks/useMessages';
import { useLanguage } from '../contexts/LanguageContext';

export default function MessagingInterface() {
  const { messages, isLoading, sendMessage, isSending } = useMessages();
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(messages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > previousMessageCountRef.current) {
      scrollToBottom();
    }
    previousMessageCountRef.current = messages.length;
  }, [messages.length]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
    setTimeout(scrollToBottom, 100);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </main>

      <div className="border-t bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <MessageInput onSend={handleSendMessage} isSending={isSending} />
        </div>
      </div>
    </>
  );
}
