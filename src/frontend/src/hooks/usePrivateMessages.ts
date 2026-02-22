import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type Message, ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from './useInternetIdentity';

export function usePrivateMessages(contact: Principal) {
  const { actor, isFetching: isActorFetching } = useActor();
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
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.sendMessage(content, contact);
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['privateMessages', contact.toString()] });

      const previousMessages = queryClient.getQueryData<Message[]>(['privateMessages', contact.toString()]);

      const optimisticMessage: Message = {
        id: BigInt(Date.now()),
        sender: identity?.getPrincipal() || Principal.anonymous(),
        recipient: contact,
        content,
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
    sendPrivateMessage: (content: string) => sendMessageMutation.mutateAsync(content),
    isSending: sendMessageMutation.isPending,
  };
}

export function useConversations() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const conversationsQuery = useQuery<Array<{
    contact: Principal;
    contactName: string;
    profilePicture?: ExternalBlob;
    lastMessage: Message | null;
  }>>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor || !identity) return [];

      const currentPrincipal = identity.getPrincipal();
      const allMessages = await actor.getAllMessagesForCaller();
      
      const privateMessages = allMessages.filter(msg => msg.recipient !== undefined);

      const contactMap = new Map<string, Message[]>();
      
      for (const msg of privateMessages) {
        const contactPrincipal = msg.sender.toString() === currentPrincipal.toString()
          ? msg.recipient! 
          : msg.sender;
        
        const contactKey = contactPrincipal.toString();
        if (!contactMap.has(contactKey)) {
          contactMap.set(contactKey, []);
        }
        contactMap.get(contactKey)!.push(msg);
      }

      const conversations = await Promise.all(
        Array.from(contactMap.entries()).map(async ([contactKey, messages]) => {
          const contact = Principal.fromText(contactKey);
          const profile = await actor.getUserProfile(contact);
          
          const sortedMessages = messages.sort((a, b) => 
            Number(a.timestamp - b.timestamp)
          );
          const lastMessage = sortedMessages[sortedMessages.length - 1] || null;

          return {
            contact,
            contactName: profile?.displayName || contactKey.slice(0, 8),
            profilePicture: profile?.profilePicture,
            lastMessage,
          };
        })
      );

      return conversations.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return Number(b.lastMessage.timestamp - a.lastMessage.timestamp);
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
