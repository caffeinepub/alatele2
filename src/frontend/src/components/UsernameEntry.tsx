import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UsernameEntryProps {
  onSubmit: (username: string) => void;
}

export default function UsernameEntry({ onSubmit }: UsernameEntryProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <img 
              src="/assets/generated/alpha-logo.dim_256x256.png" 
              alt="Alpha symbol" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight">Alatele</CardTitle>
          <CardDescription className="text-base">
            Enter a username to join the conversation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Choose your username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-base"
                autoFocus
                maxLength={30}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={!username.trim()}
            >
              Enter Chat
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
