import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const { displayName } = useAuth();

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/alpha-logo.dim_256x256.png" 
            alt="Alpha symbol" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alatele</h1>
            <p className="text-xs text-muted-foreground">Logged in as {displayName}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onLogout}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
