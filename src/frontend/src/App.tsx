import { useState } from 'react';
import DualLoginPage from './components/DualLoginPage';
import UsernameEntry from './components/UsernameEntry';
import MessagingInterface from './components/MessagingInterface';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, loginGuest, logout } = useAuth();
  const [showGuestEntry, setShowGuestEntry] = useState(false);

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
  };

  if (!isAuthenticated) {
    if (showGuestEntry) {
      return <UsernameEntry onSubmit={handleGuestUsernameSubmit} />;
    }
    return <DualLoginPage onGuestClick={handleGuestClick} />;
  }

  return <MessagingInterface onLogout={handleLogout} />;
}

export default App;
