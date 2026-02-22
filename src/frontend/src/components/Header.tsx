import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { type UserProfile } from '../backend';
import LanguageToggle from './LanguageToggle';

interface HeaderProps {
  onLogout: () => void;
  onNavigateToAdmin?: () => void;
}

export default function Header({ onLogout, onNavigateToAdmin }: HeaderProps) {
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

  const username = userProfile?.name || displayName;
  const showDisplayName = isAdmin && userProfile?.displayName;

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/alatele-logo-transparent.dim_256x256.png" 
            alt="Alatele logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('app.name')}</h1>
            <div className="text-xs text-muted-foreground">
              {showDisplayName && (
                <div>{userProfile.displayName}</div>
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
    </header>
  );
}
