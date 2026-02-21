import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Message, type MessageInput, ExternalBlob } from '../backend';

export function useMessages() {
  const { actor, isFetching: isActorFetching } = useActor();
  const queryClient = useQueryClient();

  const messagesQuery = useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      const allMessages = await actor.getAllMessages();
      
      // Filter out subscription/membership prompt messages
      return allMessages.filter(message => {
        const content = message.content.toLowerCase();
        return !(
          content.includes('membership') ||
          content.includes('subscription') ||
          content.includes('purchase') ||
          content.includes('complex+')
        );
      });
    },
    enabled: !!actor && !isActorFetching,
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      sender, 
      content, 
      image, 
      video 
    }: { 
      sender: string; 
      content: string; 
      image?: ExternalBlob; 
      video?: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      const messageInput: MessageInput = {
        sender,
        content,
        image,
        video,
      };
      
      await actor.sendMessage(messageInput);
    },
    onSuccess: () => {
      // Invalidate and refetch messages after sending
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendMessage: (sender: string, content: string, image?: ExternalBlob, video?: ExternalBlob) => 
      sendMessageMutation.mutateAsync({ sender, content, image, video }),
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
