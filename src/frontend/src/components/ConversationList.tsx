import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, UserPlus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { useConversations } from '../hooks/usePrivateMessages';
import { Principal } from '@dfinity/principal';
import ContactManager from './ContactManager';
import { useState } from 'react';

interface ConversationListProps {
  onSelectConversation: (contact: Principal) => void;
}

export default function ConversationList({ onSelectConversation }: ConversationListProps) {
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const { conversations, isLoading } = useConversations();
  const [showContactManager, setShowContactManager] = useState(false);

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const locale = language === 'fa-IR' ? 'fa-IR' : 'en-US';
    
    if (isToday) {
      return date.toLocaleTimeString(locale, { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString(locale, { 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (showContactManager && isAdmin) {
    return <ContactManager onBack={() => setShowContactManager(false)} />;
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{t('chat.privateMessages')}</CardTitle>
                <CardDescription>{t('chat.conversationsDescription')}</CardDescription>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContactManager(true)}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('contacts.manage')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg mb-2">{t('chat.noConversations')}</p>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? t('chat.noConversationsAdmin') : t('chat.noConversationsGuest')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  // Only show display name for admin contacts
                  const hasDisplayName = !!conversation.contactDisplayName;
                  const displayName = hasDisplayName ? conversation.contactDisplayName : conversation.contactName;
                  
                  return (
                    <button
                      key={conversation.contact.toString()}
                      onClick={() => onSelectConversation(conversation.contact)}
                      className="w-full p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(displayName!)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <div>
                              {hasDisplayName && (
                                <h3 className="font-semibold truncate">{conversation.contactDisplayName}</h3>
                              )}
                              <p className={hasDisplayName ? 'text-xs text-muted-foreground truncate' : 'font-semibold truncate'}>
                                {conversation.contactName}
                              </p>
                            </div>
                            {conversation.lastMessage && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatTimestamp(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.content || t('chat.mediaMessage')}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
