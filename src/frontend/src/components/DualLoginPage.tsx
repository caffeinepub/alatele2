import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DualLoginPageProps {
  onGuestClick: () => void;
}

export default function DualLoginPage({ onGuestClick }: DualLoginPageProps) {
  const { loginAdmin, isAuthenticating } = useAuth();
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminDisplayName, setAdminDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setError('Username and password are required');
      return;
    }

    try {
      await loginAdmin(adminUsername.trim(), adminPassword.trim(), adminDisplayName.trim());
    } catch (err) {
      setError('Invalid username or password');
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">Alatele</h1>
          <p className="text-muted-foreground">Choose how you want to join</p>
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
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Login with administrator credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Username</Label>
                  <Input
                    id="admin-username"
                    type="text"
                    placeholder="Enter username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    disabled={isAuthenticating}
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={isAuthenticating}
                    autoComplete="current-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-display-name">
                    Display Name <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="admin-display-name"
                    type="text"
                    placeholder="Enter display name"
                    value={adminDisplayName}
                    onChange={(e) => setAdminDisplayName(e.target.value)}
                    disabled={isAuthenticating}
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold"
                  disabled={isAuthenticating || !adminUsername.trim() || !adminPassword.trim()}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login as Admin'
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
              <CardTitle className="text-2xl">Guest Login</CardTitle>
              <CardDescription>
                Join the conversation as a guest
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-center min-h-[280px]">
              <div className="space-y-4">
                <div className="text-center space-y-2 mb-6">
                  <p className="text-sm text-muted-foreground">
                    No password required. Just choose a username and start chatting!
                  </p>
                </div>

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-base font-semibold"
                  onClick={onGuestClick}
                >
                  Continue as Guest
                </Button>

                <div className="relative">
                  <Separator className="my-4" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    Guest Features
                  </span>
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Send text messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Share images and videos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Send audio messages</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
