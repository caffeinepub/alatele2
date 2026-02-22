import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, UserPlus, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useContacts, useAllUsers } from '../hooks/useContacts';
import { Principal } from '@dfinity/principal';

interface ContactManagerProps {
  onBack: () => void;
}

export default function ContactManager({ onBack }: ContactManagerProps) {
  const { t } = useLanguage();
  const { contacts, isLoading: contactsLoading, addContact, isAdding } = useContacts();
  const { users, isLoading: usersLoading } = useAllUsers();
  const [addingContact, setAddingContact] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const handleAddContact = async (contactPrincipal: Principal) => {
    setAddingContact(contactPrincipal.toString());
    try {
      await addContact(contactPrincipal);
    } finally {
      setAddingContact(null);
    }
  };

  const isContact = (principal: Principal) => {
    return contacts.some(c => c.toString() === principal.toString());
  };

  const availableUsers = users.filter(user => !isContact(user.principal));

  if (contactsLoading || usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl">{t('contacts.manage')}</CardTitle>
                <CardDescription>{t('contacts.manageDescription')}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>{t('contacts.myContacts')}</CardTitle>
            <CardDescription>{t('contacts.myContactsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('contacts.noContacts')}
              </p>
            ) : (
              <div className="space-y-2">
                {contacts.map((contactPrincipal) => {
                  const user = users.find(u => u.principal.toString() === contactPrincipal.toString());
                  const name = user?.name || contactPrincipal.toString().slice(0, 8);
                  
                  return (
                    <div
                      key={contactPrincipal.toString()}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{name}</p>
                        <p className="text-xs text-muted-foreground">{contactPrincipal.toString().slice(0, 16)}...</p>
                      </div>
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('contacts.addContacts')}</CardTitle>
            <CardDescription>{t('contacts.addContactsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {availableUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('contacts.noAvailableUsers')}
              </p>
            ) : (
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <div
                    key={user.principal.toString()}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-muted font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.principal.toString().slice(0, 16)}...</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddContact(user.principal)}
                      disabled={isAdding || addingContact === user.principal.toString()}
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      {addingContact === user.principal.toString() ? t('contacts.adding') : t('contacts.add')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
