import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuth } from './useAuth';
import { type Message, type MessageInput, ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from './useInternetIdentity';

export function usePrivateMessages(contact: Principal) {
  const { actor, isFetching: isActorFetching } = useActor();
  const { displayName, username } = useAuth();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const messagesQuery = useQuery<Message[]>({
    queryKey: ['privateMessages', contact.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPrivateMessages(contact);
    },
    enabled: !!actor && !isActorFetching,
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      content, 
      image, 
      video,
      audio,
      file
    }: { 
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
        return actor.sendMessageWithMedia(messageInput, contact);
      } else {
        return actor.sendMessage(content, contact);
      }
    },
    onMutate: async ({ content, image, video, audio, file }) => {
      await queryClient.cancelQueries({ queryKey: ['privateMessages', contact.toString()] });

      const previousMessages = queryClient.getQueryData<Message[]>(['privateMessages', contact.toString()]);

      const optimisticMessage: Message = {
        id: BigInt(Date.now()),
        sender: identity?.getPrincipal() || Principal.anonymous(),
        recipient: contact,
        content,
        image,
        video,
        audio,
        file,
        timestamp: BigInt(Date.now() * 1_000_000),
      };

      queryClient.setQueryData<Message[]>(['privateMessages', contact.toString()], (old) => 
        [...(old || []), optimisticMessage]
      );

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['privateMessages', contact.toString()], context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['privateMessages', contact.toString()] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendPrivateMessage: (content: string, image?: ExternalBlob, video?: ExternalBlob, audio?: ExternalBlob, file?: ExternalBlob) => 
      sendMessageMutation.mutateAsync({ content, image, video, audio, file }),
    isSending: sendMessageMutation.isPending,
  };
}

export function useConversations() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { isAdmin } = useAuth();
  const { identity } = useInternetIdentity();

  const conversationsQuery = useQuery<Array<{
    contact: Principal;
    contactName: string;
    contactDisplayName?: string;
    lastMessage: Message | null;
  }>>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor || !identity) return [];

      const currentPrincipal = identity.getPrincipal();

      // Get all messages for the caller
      const allMessages = await actor.getAllMessagesForCaller();
      
      // Filter private messages only
      const privateMessages = allMessages.filter(msg => msg.recipient !== undefined);

      // Group by contact
      const contactMap = new Map<string, Message[]>();
      
      for (const msg of privateMessages) {
        // Determine the contact (the other person in the conversation)
        const contactPrincipal = msg.sender.toString() === currentPrincipal.toString()
          ? msg.recipient! 
          : msg.sender;
        
        const contactKey = contactPrincipal.toString();
        
        if (!contactMap.has(contactKey)) {
          contactMap.set(contactKey, []);
        }
        contactMap.get(contactKey)!.push(msg);
      }

      // Create conversation objects
      const conversations = await Promise.all(
        Array.from(contactMap.entries()).map(async ([contactKey, messages]) => {
          const contact = Principal.fromText(contactKey);
          const profile = await actor.getUserProfile(contact);
          
          // Sort messages by timestamp and get the last one
          const sortedMessages = messages.sort((a, b) => 
            Number(a.timestamp) - Number(b.timestamp)
          );
          const lastMessage = sortedMessages[sortedMessages.length - 1];

          return {
            contact,
            contactName: profile?.name || contactKey.slice(0, 8),
            contactDisplayName: profile?.displayName,
            lastMessage,
          };
        })
      );

      // Sort conversations by last message timestamp
      return conversations.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return Number(b.lastMessage.timestamp) - Number(a.lastMessage.timestamp);
      });
    },
    enabled: !!actor && !isActorFetching && !!identity,
    refetchInterval: 3000,
  });

  return {
    conversations: conversationsQuery.data || [],
    isLoading: conversationsQuery.isLoading,
  };
}
