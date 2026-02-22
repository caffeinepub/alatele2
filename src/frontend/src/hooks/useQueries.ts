import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { type UserProfile, ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useGetUserProfile(principal: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const usersQuery = useQuery<Array<{ 
    principal: Principal; 
    name: string;
    profilePicture?: ExternalBlob;
  }>>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      
      const currentPrincipal = identity.getPrincipal();
      
      // Get all messages to find unique users
      const allMessages = await actor.getAllMessagesForCaller();
      const uniquePrincipals = new Set<string>();
      
      allMessages.forEach(msg => {
        const senderStr = msg.sender.toString();
        // Don't include current user
        if (senderStr !== currentPrincipal.toString()) {
          uniquePrincipals.add(senderStr);
        }
      });

      // Fetch user profiles for each unique principal
      const users = await Promise.all(
        Array.from(uniquePrincipals).map(async (principalStr) => {
          const principal = Principal.fromText(principalStr);
          const profile = await actor.getUserProfile(principal);
          return {
            principal,
            name: profile?.displayName || principalStr.slice(0, 8),
            profilePicture: profile?.profilePicture,
          };
        })
      );

      return users;
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
  };
}
