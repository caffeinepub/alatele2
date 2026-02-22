import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useConversations } from '../hooks/usePrivateMessages';
import { Principal } from '@dfinity/principal';
import UserSearch from './UserSearch';

interface ConversationListProps {
  onSelectConversation: (contact: Principal) => void;
}

export default function ConversationList({ onSelectConversation }: ConversationListProps) {
  const { t, language } = useLanguage();
  const { conversations, isLoading } = useConversations();

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const locale = language === 'fa' ? 'fa-IR' : 'en-US';
    
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
            <div>
              <CardTitle className="text-2xl">{t('chat.privateMessages')}</CardTitle>
              <CardDescription>{t('chat.conversationsDescription')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UserSearch onSelectUser={onSelectConversation} />

            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg mb-2">{t('chat.noConversations')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('chat.searchToStart')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.contact.toString()}
                    onClick={() => onSelectConversation(conversation.contact)}
                    className="w-full p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        {conversation.profilePicture ? (
                          <AvatarImage 
                            src={conversation.profilePicture.getDirectURL()} 
                            alt={conversation.contactName} 
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(conversation.contactName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h3 className="font-semibold truncate">{conversation.contactName}</h3>
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
