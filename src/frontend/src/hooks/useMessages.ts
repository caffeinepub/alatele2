import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Message, type MessageInput, ExternalBlob } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';

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
    mutationFn: async ({ 
      sender, 
      content, 
      image, 
      video,
      audio,
      file
    }: { 
      sender: string; 
      content: string; 
      image?: ExternalBlob; 
      video?: ExternalBlob;
      audio?: ExternalBlob;
      file?: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      if (image || video || audio || file) {
        const messageInput: MessageInput = {
          content,
          image,
          video,
          audio,
          file,
        };
        return actor.sendMessageWithMedia(messageInput, null);
      } else {
        return actor.sendMessage(content, null);
      }
    },
    onMutate: async ({ sender, content, image, video, audio, file }) => {
      await queryClient.cancelQueries({ queryKey: ['publicMessages'] });

      const previousMessages = queryClient.getQueryData<Message[]>(['publicMessages']);

      const optimisticMessage: Message = {
        id: BigInt(Date.now()),
        sender: identity?.getPrincipal() || (sender as any),
        content,
        image,
        video,
        audio,
        file,
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
    sendMessage: (sender: string, content: string, image?: ExternalBlob, video?: ExternalBlob, audio?: ExternalBlob, file?: ExternalBlob) => 
      sendMessageMutation.mutateAsync({ sender, content, image, video, audio, file }),
    isSending: sendMessageMutation.isPending,
  };
}
