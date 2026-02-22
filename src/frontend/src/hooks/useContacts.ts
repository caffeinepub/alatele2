import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import { type UserProfile } from '../backend';

export function useContacts() {
  const { actor, isFetching: isActorFetching } = useActor();
  const queryClient = useQueryClient();

  const contactsQuery = useQuery<Principal[]>({
    queryKey: ['contacts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContacts();
    },
    enabled: !!actor && !isActorFetching,
  });

  const addContactMutation = useMutation({
    mutationFn: async (contact: Principal) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addContact(contact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    contacts: contactsQuery.data || [],
    isLoading: contactsQuery.isLoading,
    addContact: (contact: Principal) => addContactMutation.mutateAsync(contact),
    isAdding: addContactMutation.isPending,
  };
}

export function useAllUsers() {
  const { actor, isFetching: isActorFetching } = useActor();

  const usersQuery = useQuery<Array<{ principal: Principal; name: string }>>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Get all users by fetching all messages and extracting unique senders
      const allMessages = await actor.getAllMessagesForCaller();
      const uniquePrincipals = new Set<string>();
      
      allMessages.forEach(msg => {
        uniquePrincipals.add(msg.sender.toString());
      });

      // Fetch user profiles for each unique principal
      const users = await Promise.all(
        Array.from(uniquePrincipals).map(async (principalStr) => {
          const principal = Principal.fromText(principalStr);
          const profile = await actor.getUserProfile(principal);
          return {
            principal,
            name: profile?.name || principalStr.slice(0, 8),
          };
        })
      );

      return users;
    },
    enabled: !!actor && !isActorFetching,
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
  };
}

export function useUserProfile(principal: Principal) {
  const { actor, isFetching: isActorFetching } = useActor();

  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isActorFetching,
  });

  return {
    userProfile: profileQuery.data,
    isLoading: profileQuery.isLoading,
  };
}
