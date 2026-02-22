import { useState, useEffect } from 'react';
import DualLoginPage from './components/DualLoginPage';
import UsernameEntry from './components/UsernameEntry';
import MessagingInterface from './components/MessagingInterface';
import AdminPanel from './components/AdminPanel';
import ChatNavigation from './components/ChatNavigation';
import ConversationList from './components/ConversationList';
import PrivateConversation from './components/PrivateConversation';
import { useAuth } from './hooks/useAuth';
import { LanguageProvider } from './contexts/LanguageContext';
import { Principal } from '@dfinity/principal';

type View = 'messaging' | 'admin' | 'group-chat' | 'private-messages' | 'private-conversation';

function AppContent() {
  const { isAuthenticated, loginGuest, logout } = useAuth();
  const [showGuestEntry, setShowGuestEntry] = useState(false);
  const [currentView, setCurrentView] = useState<View>('group-chat');
  const [selectedContact, setSelectedContact] = useState<Principal | null>(null);

  const handleGuestClick = () => {
    setShowGuestEntry(true);
  };

  const handleGuestUsernameSubmit = (username: string) => {
    loginGuest(username);
    setShowGuestEntry(false);
  };

  const handleLogout = () => {
    logout();
    setShowGuestEntry(false);
    setCurrentView('group-chat');
    setSelectedContact(null);
  };

  const handleNavigateToAdmin = () => {
    setCurrentView('admin');
  };

  const handleBackToMessaging = () => {
    setCurrentView('group-chat');
  };

  const handleNavigateToGroupChat = () => {
    setCurrentView('group-chat');
    setSelectedContact(null);
  };

  const handleNavigateToPrivateMessages = () => {
    setCurrentView('private-messages');
    setSelectedContact(null);
  };

  const handleSelectConversation = (contact: Principal) => {
    setSelectedContact(contact);
    setCurrentView('private-conversation');
  };

  const handleBackToConversationList = () => {
    setCurrentView('private-messages');
    setSelectedContact(null);
  };

  if (!isAuthenticated) {
    if (showGuestEntry) {
      return <UsernameEntry onSubmit={handleGuestUsernameSubmit} />;
    }
    return <DualLoginPage onGuestClick={handleGuestClick} />;
  }

  if (currentView === 'admin') {
    return <AdminPanel onBack={handleBackToMessaging} />;
  }

  if (currentView === 'private-conversation' && selectedContact) {
    return (
      <PrivateConversation
        contact={selectedContact}
        onBack={handleBackToConversationList}
        onLogout={handleLogout}
        onNavigateToAdmin={handleNavigateToAdmin}
      />
    );
  }

  if (currentView === 'private-messages') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
        <ChatNavigation
          currentView="private-messages"
          onNavigateToGroupChat={handleNavigateToGroupChat}
          onNavigateToPrivateMessages={handleNavigateToPrivateMessages}
          onLogout={handleLogout}
          onNavigateToAdmin={handleNavigateToAdmin}
        />
        <ConversationList onSelectConversation={handleSelectConversation} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <ChatNavigation
        currentView="group-chat"
        onNavigateToGroupChat={handleNavigateToGroupChat}
        onNavigateToPrivateMessages={handleNavigateToPrivateMessages}
        onLogout={handleLogout}
        onNavigateToAdmin={handleNavigateToAdmin}
      />
      <MessagingInterface />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
