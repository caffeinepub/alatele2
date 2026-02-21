import { useState, useEffect } from 'react';
import UsernameEntry from './components/UsernameEntry';
import MessagingInterface from './components/MessagingInterface';

function App() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if username exists in session storage
    const storedUsername = sessionStorage.getItem('alatele2_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleUsernameSubmit = (name: string) => {
    sessionStorage.setItem('alatele2_username', name);
    setUsername(name);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('alatele2_username');
    setUsername(null);
  };

  if (!username) {
    return <UsernameEntry onSubmit={handleUsernameSubmit} />;
  }

  return <MessagingInterface username={username} onLogout={handleLogout} />;
}

export default App;
