import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Message } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';

export function useMessages() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const messagesQuery = useQuery<Message[]>({
    queryKey: ['publicMessages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicMessages();
    },
    enabled: !!actor && !isActorFetching,
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.sendMessage(content, null);
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['publicMessages'] });

      const previousMessages = queryClient.getQueryData<Message[]>(['publicMessages']);

      const optimisticMessage: Message = {
        id: BigInt(Date.now()),
        sender: identity?.getPrincipal() || Principal.anonymous(),
        content,
        timestamp: BigInt(Date.now() * 1_000_000),
      };

      queryClient.setQueryData<Message[]>(['publicMessages'], (old) => 
        [...(old || []), optimisticMessage]
      );

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['publicMessages'], context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['publicMessages'] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendMessage: (content: string) => sendMessageMutation.mutateAsync(content),
    isSending: sendMessageMutation.isPending,
  };
}
