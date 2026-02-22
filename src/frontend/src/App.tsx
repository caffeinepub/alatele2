import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './components/LoginPage';
import MessagingInterface from './components/MessagingInterface';
import ChatNavigation from './components/ChatNavigation';
import ConversationList from './components/ConversationList';
import PrivateConversation from './components/PrivateConversation';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { LanguageProvider } from './contexts/LanguageContext';
import { Principal } from '@dfinity/principal';
import { useGetCallerUserProfile } from './hooks/useQueries';

const queryClient = new QueryClient();

type View = 'group-chat' | 'private-messages' | 'private-conversation';

function AppContent() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const [currentView, setCurrentView] = useState<View>('group-chat');
  const [selectedContact, setSelectedContact] = useState<Principal | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setCurrentView('group-chat');
    setSelectedContact(null);
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

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (isAuthenticated && !profileLoading && isFetched && userProfile === null)) {
    return <LoginPage />;
  }

  if (currentView === 'private-conversation' && selectedContact) {
    return (
      <PrivateConversation
        contact={selectedContact}
        onBack={handleBackToConversationList}
        onLogout={handleLogout}
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
      />
      <MessagingInterface />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
