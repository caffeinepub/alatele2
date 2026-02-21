import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Message } from '../backend';

export function useMessages() {
  const { actor, isFetching: isActorFetching } = useActor();
  const queryClient = useQueryClient();

  const messagesQuery = useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMessages();
    },
    enabled: !!actor && !isActorFetching,
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ sender, content }: { sender: string; content: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.sendMessage(sender, content);
    },
    onSuccess: () => {
      // Invalidate and refetch messages after sending
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendMessage: (sender: string, content: string) => 
      sendMessageMutation.mutateAsync({ sender, content }),
    isSending: sendMessageMutation.isPending,
  };
}

export function useDeleteMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteMessage(id);
    },
    onSuccess: () => {
      // Invalidate and refetch messages after deleting
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useEditMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newContent }: { id: bigint; newContent: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.editMessage(id, newContent);
    },
    onSuccess: () => {
      // Invalidate and refetch messages after editing
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
