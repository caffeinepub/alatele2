import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, LogOut } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { usePrivateMessages } from '../hooks/usePrivateMessages';
import { useGetUserProfile } from '../hooks/useQueries';
import { useLanguage } from '../contexts/LanguageContext';
import { Principal } from '@dfinity/principal';
import LanguageToggle from './LanguageToggle';

interface PrivateConversationProps {
  contact: Principal;
  onBack: () => void;
  onLogout: () => void;
}

export default function PrivateConversation({ 
  contact, 
  onBack, 
  onLogout 
}: PrivateConversationProps) {
  const { messages, isLoading, sendPrivateMessage, isSending } = usePrivateMessages(contact);
  const { data: userProfile } = useGetUserProfile(contact);
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
    await sendPrivateMessage(content);
    setTimeout(scrollToBottom, 100);
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const contactName = userProfile?.displayName || contact.toString().slice(0, 8);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Avatar className="w-10 h-10">
                {userProfile?.profilePicture ? (
                  <AvatarImage 
                    src={userProfile.profilePicture.getDirectURL()} 
                    alt={contactName} 
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(contactName)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{contactName}</h1>
                <p className="text-xs text-muted-foreground">{t('chat.privateConversation')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <LanguageToggle />
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('header.logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <MessageList messages={messages} />
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
