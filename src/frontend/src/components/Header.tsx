import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import LanguageToggle from './LanguageToggle';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const { t } = useLanguage();
  const { data: userProfile } = useGetCallerUserProfile();

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

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
            {userProfile && (
              <div className="text-xs text-muted-foreground">
                {t('header.loggedInAs')} {userProfile.displayName}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {userProfile && (
            <Avatar className="w-8 h-8">
              {userProfile.profilePicture ? (
                <AvatarImage 
                  src={userProfile.profilePicture.getDirectURL()} 
                  alt={userProfile.displayName} 
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(userProfile.displayName)}
                </AvatarFallback>
              )}
            </Avatar>
          )}
          
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
    </header>
  );
}
