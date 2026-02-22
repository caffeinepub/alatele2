import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useLanguage } from '../contexts/LanguageContext';
import { useActor } from '../hooks/useActor';

interface UsernameEntryProps {
  onSubmit: (username: string) => void;
}

export default function UsernameEntry({ onSubmit }: UsernameEntryProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();
  const { actor } = useActor();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError(t('login.admin.errorRequired'));
      return;
    }

    // Check if username is reserved
    if (username.trim() === 'Alaie') {
      setError(t('login.guest.reservedUsernameError'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (!actor) {
        setError(t('login.admin.errorInvalid'));
        return;
      }

      // Authenticate guest with backend
      const success = await actor.authenticateGuest(username.trim());
      if (success) {
        onSubmit(username.trim());
      } else {
        setError(t('login.admin.errorInvalid'));
      }
    } catch (err: any) {
      console.error('Guest authentication error:', err);
      if (err.message?.includes('reserved')) {
        setError(t('login.guest.reservedUsernameError'));
      } else if (err.message?.includes('already taken')) {
        setError(t('login.guest.usernameTakenError'));
      } else {
        setError(t('login.admin.errorInvalid'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <CardTitle className="text-2xl">{t('app.name')}</CardTitle>
          <CardDescription>{t('username.title')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('login.admin.username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t('username.placeholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
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
              disabled={isSubmitting || !username.trim()}
            >
              {isSubmitting ? t('login.admin.loggingIn') : t('username.button')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
