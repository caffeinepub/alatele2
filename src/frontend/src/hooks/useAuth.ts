import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { Role } from '../backend';

interface AuthState {
  username: string | null;
  displayName: string | null;
  role: Role | null;
}

export function useAuth() {
  const { actor } = useActor();
  const [authState, setAuthState] = useState<AuthState>({
    username: null,
    displayName: null,
    role: null,
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const storedUsername = sessionStorage.getItem('alatele2_username');
    const storedDisplayName = sessionStorage.getItem('alatele2_displayName');
    const storedRole = sessionStorage.getItem('alatele2_role');

    if (storedUsername && storedRole) {
      setAuthState({
        username: storedUsername,
        displayName: storedDisplayName || storedUsername,
        role: storedRole as Role,
      });
    }
  }, []);

  const loginAdmin = async (username: string, password: string, displayName?: string) => {
    if (!actor) throw new Error('Actor not initialized');
    
    setIsAuthenticating(true);
    try {
      const isValid = await actor.authenticateAdmin(username, password);
      
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const finalDisplayName = displayName?.trim() || username;
      
      sessionStorage.setItem('alatele2_username', username);
      sessionStorage.setItem('alatele2_displayName', finalDisplayName);
      sessionStorage.setItem('alatele2_role', Role.admin);

      setAuthState({
        username,
        displayName: finalDisplayName,
        role: Role.admin,
      });

      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginGuest = (username: string) => {
    sessionStorage.setItem('alatele2_username', username);
    sessionStorage.setItem('alatele2_displayName', username);
    sessionStorage.setItem('alatele2_role', Role.guest);

    setAuthState({
      username,
      displayName: username,
      role: Role.guest,
    });
  };

  const logout = () => {
    sessionStorage.removeItem('alatele2_username');
    sessionStorage.removeItem('alatele2_displayName');
    sessionStorage.removeItem('alatele2_role');

    setAuthState({
      username: null,
      displayName: null,
      role: null,
    });
  };

  const isAdmin = authState.role === Role.admin;
  const isGuest = authState.role === Role.guest;
  const isAuthenticated = !!authState.username && !!authState.role;

  return {
    ...authState,
    isAuthenticated,
    isAdmin,
    isGuest,
    isAuthenticating,
    loginAdmin,
    loginGuest,
    logout,
  };
}
