import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuth } from './useAuth';
import { type Message, type MessageInput, ExternalBlob, Role } from '../backend';

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
      video,
      audio
    }: { 
      sender: string; 
      content: string; 
      image?: ExternalBlob; 
      video?: ExternalBlob;
      audio?: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      const messageInput: MessageInput = {
        sender,
        content,
        image,
        video,
        audio,
      };
      
      const messageId = await actor.sendMessage(messageInput);
      return messageId;
    },
    onMutate: async ({ sender, content, image, video, audio }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages'] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>(['messages']);

      // Optimistically update to the new value
      const optimisticMessage: Message = {
        id: BigInt(Date.now()), // Temporary ID
        sender,
        content,
        image,
        video,
        audio,
        timestamp: BigInt(Date.now() * 1_000_000), // Convert to nanoseconds
      };

      queryClient.setQueryData<Message[]>(['messages'], (old) => 
        [...(old || []), optimisticMessage]
      );

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages'], context.previousMessages);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendMessage: (sender: string, content: string, image?: ExternalBlob, video?: ExternalBlob, audio?: ExternalBlob) => 
      sendMessageMutation.mutateAsync({ sender, content, image, video, audio }),
    isSending: sendMessageMutation.isPending,
  };
}

export function useDeleteMessage() {
  const { actor } = useActor();
  const { role } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      if (!role) throw new Error('User role not found');
      await actor.deleteMessage(id, role as Role);
    },
    onSuccess: () => {
      // Invalidate and refetch messages after deleting
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useEditMessage() {
  const { actor } = useActor();
  const { role } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newContent }: { id: bigint; newContent: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      if (!role) throw new Error('User role not found');
      await actor.editMessage(id, newContent, role as Role);
    },
    onSuccess: () => {
      // Invalidate and refetch messages after editing
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
