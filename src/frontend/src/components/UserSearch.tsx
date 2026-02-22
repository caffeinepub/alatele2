import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAllUsers } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserSearchProps {
  onSelectUser: (user: Principal) => void;
}

export default function UserSearch({ onSelectUser }: UserSearchProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const { users, isLoading } = useAllUsers();

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {searchQuery && (
        <ScrollArea className="h-[300px] rounded-md border">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('app.loading')}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('search.noResults')}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.principal.toString()}
                  onClick={() => {
                    onSelectUser(user.principal);
                    setSearchQuery('');
                  }}
                  className="w-full p-3 rounded-lg hover:bg-accent/50 transition-colors text-left flex items-center gap-3"
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    {user.profilePicture ? (
                      <AvatarImage 
                        src={user.profilePicture.getDirectURL()} 
                        alt={user.name} 
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
