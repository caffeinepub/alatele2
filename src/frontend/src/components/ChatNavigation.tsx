import { Button } from '@/components/ui/button';
import { LogOut, Shield, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { type UserProfile } from '../backend';
import LanguageToggle from './LanguageToggle';

interface ChatNavigationProps {
  currentView: 'group-chat' | 'private-messages';
  onNavigateToGroupChat: () => void;
  onNavigateToPrivateMessages: () => void;
  onLogout: () => void;
  onNavigateToAdmin?: () => void;
}

export default function ChatNavigation({
  currentView,
  onNavigateToGroupChat,
  onNavigateToPrivateMessages,
  onLogout,
  onNavigateToAdmin,
}: ChatNavigationProps) {
  const { displayName, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { actor } = useActor();

  const { data: userProfile } = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor,
  });

  const displayNameToShow = userProfile?.displayName || displayName;
  const username = userProfile?.name || displayName;

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/alatele-logo-transparent.dim_256x256.png" 
              alt="Alatele logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('app.name')}</h1>
              <div className="text-xs text-muted-foreground">
                {userProfile?.displayName && (
                  <div>{displayNameToShow}</div>
                )}
                <div>{t('header.loggedInAs')} {username}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageToggle />
            
            {isAdmin && onNavigateToAdmin && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onNavigateToAdmin}
                className="gap-2"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.panel')}</span>
              </Button>
            )}
            
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

        <div className="flex gap-2">
          <Button
            variant={currentView === 'group-chat' ? 'default' : 'outline'}
            size="sm"
            onClick={onNavigateToGroupChat}
            className="gap-2 flex-1"
          >
            <Users className="w-4 h-4" />
            {t('chat.groupChat')}
          </Button>
          <Button
            variant={currentView === 'private-messages' ? 'default' : 'outline'}
            size="sm"
            onClick={onNavigateToPrivateMessages}
            className="gap-2 flex-1"
          >
            <MessageSquare className="w-4 h-4" />
            {t('chat.privateMessages')}
          </Button>
        </div>
      </div>
    </header>
  );
}
