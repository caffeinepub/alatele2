import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useActor } from '../hooks/useActor';
import LanguageToggle from './LanguageToggle';

interface DualLoginPageProps {
  onGuestClick: () => void;
}

export default function DualLoginPage({ onGuestClick }: DualLoginPageProps) {
  const { loginAdmin, loginGuest, isAuthenticating } = useAuth();
  const { t } = useLanguage();
  const { actor } = useActor();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const isAdminUsername = username.trim() === 'Alaie';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError(t('login.admin.errorRequired'));
      return;
    }

    try {
      if (isAdminUsername) {
        // Admin login
        const success = await loginAdmin(username.trim(), displayName.trim());
        if (!success) {
          setError(t('login.admin.errorInvalid'));
        }
      } else {
        // Guest login - check if username is reserved
        if (username.trim() === 'Alaie') {
          setError(t('login.guest.reservedUsernameError'));
          return;
        }
        
        // Call backend to authenticate guest
        if (!actor) {
          setError(t('login.admin.errorInvalid'));
          return;
        }
        
        try {
          const success = await actor.authenticateGuest(username.trim());
          if (success) {
            loginGuest(username.trim());
          } else {
            setError(t('login.admin.errorInvalid'));
          }
        } catch (err: any) {
          console.error('Guest login error:', err);
          if (err.message?.includes('reserved')) {
            setError(t('login.guest.reservedUsernameError'));
          } else if (err.message?.includes('already taken')) {
            setError(t('login.guest.usernameTakenError'));
          } else {
            setError(t('login.admin.errorInvalid'));
          }
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('reserved')) {
        setError(t('login.guest.reservedUsernameError'));
      } else {
        setError(t('login.admin.errorInvalid'));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-5xl">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/generated/alpha-logo.dim_256x256.png" 
              alt="Alpha symbol" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{t('app.name')}</h1>
          <p className="text-muted-foreground">{t('app.tagline')}</p>
        </div>

        {/* Two Login Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Login */}
          <Card className="shadow-2xl border-2">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">{t('login.admin.title')}</CardTitle>
              <CardDescription>
                {t('login.admin.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t('login.admin.username')}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={t('login.admin.usernamePlaceholder')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isAuthenticating}
                    autoComplete="username"
                  />
                </div>

                {isAdminUsername && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName">
                      {t('login.admin.displayName')} <span className="text-muted-foreground text-xs">{t('login.admin.displayNameOptional')}</span>
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder={t('login.admin.displayNamePlaceholder')}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={isAuthenticating}
                    />
                  </div>
                )}

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold"
                  disabled={isAuthenticating || !username.trim()}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('login.admin.loggingIn')}
                    </>
                  ) : (
                    t('login.admin.button')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Guest Login */}
          <Card className="shadow-2xl border-2">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl">{t('login.guest.title')}</CardTitle>
              <CardDescription>
                {t('login.guest.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-center min-h-[240px]">
              <div className="space-y-4">
                <div className="text-center space-y-2 mb-6">
                  <p className="text-sm text-muted-foreground">
                    {t('login.guest.info')}
                  </p>
                </div>

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-base font-semibold"
                  onClick={onGuestClick}
                >
                  {t('login.guest.button')}
                </Button>

                <div className="relative">
                  <Separator className="my-4" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    {t('login.guest.features')}
                  </span>
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>{t('login.guest.feature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>{t('login.guest.feature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>{t('login.guest.feature3')}</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language Toggle - Bottom Right */}
        <div className="fixed bottom-4 right-4">
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
