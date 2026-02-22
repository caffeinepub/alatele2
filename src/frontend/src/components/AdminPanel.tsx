import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, Users, Key, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import ContactManager from './ContactManager';
import { useState, FormEvent } from 'react';
import { useChangePassword } from '../hooks/useAdminPassword';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [showContactManager, setShowContactManager] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const changePasswordMutation = useChangePassword();

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t('admin.password.errorRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('admin.password.errorMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t('admin.password.errorTooShort'));
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.message || t('admin.password.errorGeneric'));
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
        <Card className="w-full max-w-md shadow-2xl border-2">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('admin.accessDenied')}</CardTitle>
            <CardDescription className="text-base">
              {t('admin.accessDeniedMessage')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full" variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('admin.backToChat')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showContactManager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <ContactManager onBack={() => setShowContactManager(false)} />
      </div>
    );
  }

  if (showPasswordChange) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowPasswordChange(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('admin.backToPanel')}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">{t('admin.password.title')}</h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">{t('admin.password.changeTitle')}</CardTitle>
              <CardDescription>{t('admin.password.changeDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t('admin.password.current')}</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder={t('admin.password.currentPlaceholder')}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={changePasswordMutation.isPending}
                    autoComplete="current-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('admin.password.new')}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder={t('admin.password.newPlaceholder')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={changePasswordMutation.isPending}
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('admin.password.confirm')}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder={t('admin.password.confirmPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={changePasswordMutation.isPending}
                    autoComplete="new-password"
                  />
                </div>

                {passwordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert className="bg-success/10 text-success border-success/20">
                    <AlertDescription>{t('admin.password.success')}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('admin.password.changing')}
                    </>
                  ) : (
                    t('admin.password.changeButton')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('admin.backToChat')}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">{t('admin.panel')}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{t('admin.title')}</CardTitle>
            <CardDescription>{t('admin.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => setShowContactManager(true)}
              >
                <Users className="w-8 h-8" />
                <span className="font-semibold">{t('contacts.manage')}</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => setShowPasswordChange(true)}
              >
                <Key className="w-8 h-8" />
                <span className="font-semibold">{t('admin.password.manage')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
