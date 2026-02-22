import { type Message } from '../backend';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Principal } from '@dfinity/principal';
import { type UserProfile } from '../backend';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { t, language } = useLanguage();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  const senderPrincipals = Array.from(new Set(messages.map(m => m.sender.toString())));
  
  const { data: senderProfiles } = useQuery<Map<string, UserProfile | null>>({
    queryKey: ['senderProfiles', ...senderPrincipals],
    queryFn: async () => {
      if (!actor) return new Map();
      
      const profileMap = new Map<string, UserProfile | null>();
      await Promise.all(
        senderPrincipals.map(async (principalStr) => {
          try {
            const principal = Principal.fromText(principalStr);
            const profile = await actor.getUserProfile(principal);
            profileMap.set(principalStr, profile);
          } catch (error) {
            console.error(`Error fetching profile for ${principalStr}:`, error);
            profileMap.set(principalStr, null);
          }
        })
      );
      
      return profileMap;
    },
    enabled: !!actor && senderPrincipals.length > 0,
  });

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-center">
          {t('app.noMessages')}<br />
          <span className="text-sm">{t('app.beFirst')}</span>
        </p>
      </div>
    );
  }

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getSenderInfo = (sender: Principal) => {
    const senderStr = sender.toString();
    const profile = senderProfiles?.get(senderStr);
    
    return {
      name: profile?.displayName || senderStr.slice(0, 8),
      initials: profile?.displayName ? getInitials(profile.displayName) : senderStr.slice(0, 2).toUpperCase(),
      profilePicture: profile?.profilePicture,
    };
  };

  const isOwnMessage = (sender: Principal) => {
    if (!identity) return false;
    return sender.toString() === identity.getPrincipal().toString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {messages.map((message) => {
        const isOwn = isOwnMessage(message.sender);
        const senderInfo = getSenderInfo(message.sender);

        return (
          <div
            key={message.id.toString()}
            className={cn(
              'flex gap-3',
              isOwn ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <Avatar className="w-10 h-10 flex-shrink-0">
              {senderInfo.profilePicture ? (
                <AvatarImage 
                  src={senderInfo.profilePicture.getDirectURL()} 
                  alt={senderInfo.name} 
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {senderInfo.initials}
                </AvatarFallback>
              )}
            </Avatar>

            <div className={cn('flex-1 max-w-[70%]', isOwn && 'flex flex-col items-end')}>
              <div className={cn('text-xs text-muted-foreground mb-1', isOwn && 'text-right')}>
                {senderInfo.name}
              </div>
              <div
                className={cn(
                  'rounded-2xl px-4 py-2 break-words',
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              <div className={cn('text-xs text-muted-foreground mt-1', isOwn && 'text-right')}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
