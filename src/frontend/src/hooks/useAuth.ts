import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { UserRole } from '../backend';

interface AuthState {
  username: string | null;
  displayName: string | null;
  role: UserRole | null;
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
        role: storedRole as UserRole,
      });
    }
  }, []);

  const loginAdmin = async (username: string, displayName?: string) => {
    if (!actor) throw new Error('Actor not initialized');
    
    setIsAuthenticating(true);
    try {
      // Call backend authentication method with username only
      const isAuthenticated = await actor.authenticateAdmin(username);
      
      if (!isAuthenticated) {
        throw new Error('Invalid credentials');
      }

      // Save user profile with display name if provided
      if (displayName) {
        await actor.saveCallerUserProfile({
          name: username,
          displayName: displayName,
        });
      }

      sessionStorage.setItem('alatele2_username', username);
      sessionStorage.setItem('alatele2_displayName', displayName || username);
      sessionStorage.setItem('alatele2_role', UserRole.admin);

      setAuthState({
        username,
        displayName: displayName || username,
        role: UserRole.admin,
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
    sessionStorage.setItem('alatele2_role', UserRole.guest);

    setAuthState({
      username,
      displayName: username,
      role: UserRole.guest,
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

  const isAdmin = authState.role === UserRole.admin;
  const isGuest = authState.role === UserRole.guest;
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
