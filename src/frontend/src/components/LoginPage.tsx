import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { useSaveCallerUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';

export default function LoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Show profile setup if authenticated but no profile exists
  const needsProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleLogin = async () => {
    setError('');
    try {
      await login();
      setShowProfileSetup(true);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(t('login.errorInvalid'));
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError(t('login.displayNameRequired'));
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({
        displayName: displayName.trim(),
      });
      setShowProfileSetup(false);
    } catch (err: any) {
      console.error('Profile save error:', err);
      setError(t('login.errorSavingProfile'));
    }
  };

  if (needsProfileSetup || showProfileSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/assets/generated/alpha-logo.dim_256x256.png" 
                alt="Alpha symbol" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <CardTitle className="text-2xl">{t('profile.setup')}</CardTitle>
            <CardDescription>{t('profile.setupDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('profile.displayName')}</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder={t('profile.displayNamePlaceholder')}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={saveProfileMutation.isPending}
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={saveProfileMutation.isPending || !displayName.trim()}
              >
                {saveProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('profile.saving')}
                  </>
                ) : (
                  t('profile.continue')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="fixed bottom-4 right-4">
          <LanguageToggle />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
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

        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
            <CardDescription>
              {t('login.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="button"
              className="w-full h-11 text-base font-semibold"
              onClick={handleLogin}
              disabled={loginStatus === 'logging-in'}
            >
              {loginStatus === 'logging-in' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('login.loggingIn')}
                </>
              ) : (
                t('login.button')
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t('login.info')}
            </div>
          </CardContent>
        </Card>

        <div className="fixed bottom-4 right-4">
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
