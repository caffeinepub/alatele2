import { useState } from 'react';
import { type Message, type UserProfile } from '../backend';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, Check, X, Download, Paperclip } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Principal } from '@dfinity/principal';

interface MessageListProps {
  messages: Message[];
  currentUsername: string;
}

export default function MessageList({ messages, currentUsername }: MessageListProps) {
  const [editingMessageId, setEditingMessageId] = useState<bigint | null>(null);
  const [editContent, setEditContent] = useState('');
  const { t, language } = useLanguage();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  // Fetch user profiles for all message senders
  const senderPrincipals = Array.from(new Set(messages.map(m => m.sender.toString())));
  
  const { data: senderProfiles } = useQuery<Map<string, UserProfile | null>>({
    queryKey: ['senderProfiles', ...senderPrincipals],
    queryFn: async () => {
      if (!actor) return new Map();
      
      const profileMap = new Map<string, UserProfile | null>();
      await Promise.all(
        senderPrincipals.map(async (principalStr) => {
          try {
            const principal = Principal.fromText(principalStr);
            const profile = await actor.getUserProfile(principal);
            profileMap.set(principalStr, profile);
          } catch (error) {
            console.error(`Error fetching profile for ${principalStr}:`, error);
            profileMap.set(principalStr, null);
          }
        })
      );
      
      return profileMap;
    },
    enabled: !!actor && senderPrincipals.length > 0,
  });

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-center">
          {t('app.noMessages')}<br />
          <span className="text-sm">{t('app.beFirst')}</span>
        </p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const locale = language === 'fa-IR' ? 'fa-IR' : 'en-US';
    
    if (isToday) {
      return date.toLocaleTimeString(locale, { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString(locale, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const getSenderDisplayInfo = (sender: Principal) => {
    const senderStr = sender.toString();
    const profile = senderProfiles?.get(senderStr);
    
    // Check if sender is admin by checking if they have a displayName
    const isAdminSender = !!profile?.displayName;
    
    return {
      name: profile?.name || senderStr.slice(0, 8),
      displayName: isAdminSender ? profile?.displayName : undefined,
      initials: profile?.name ? getInitials(profile.name) : senderStr.slice(0, 2).toUpperCase(),
    };
  };

  const handleEditClick = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (messageId: bigint) => {
    if (editContent.trim()) {
      setEditingMessageId(null);
      setEditContent('');
    }
  };

  const handleDelete = async (messageId: bigint) => {
    // Note: Delete functionality would need backend support
  };

  const handleDeleteFile = async (messageId: bigint) => {
    if (!actor || !isAdmin) return;
    try {
      await actor.deleteMessageFile(messageId);
      queryClient.invalidateQueries({ queryKey: ['publicMessages'] });
      queryClient.invalidateQueries({ queryKey: ['privateMessages'] });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleEditFile = async (messageId: bigint) => {
    if (!actor || !isAdmin) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const { ExternalBlob } = await import('../backend');
          const fileBlob = ExternalBlob.fromBytes(uint8Array);
          await actor.editMessageFile(messageId, fileBlob);
          queryClient.invalidateQueries({ queryKey: ['publicMessages'] });
          queryClient.invalidateQueries({ queryKey: ['privateMessages'] });
        } catch (error) {
          console.error('Error editing file:', error);
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {messages.map((message, index) => {
        const senderInfo = getSenderDisplayInfo(message.sender);
        const isOwnMessage = identity ? message.sender.toString() === identity.getPrincipal().toString() : false;
        const isEditing = editingMessageId === message.id;
        const hasImage = !!message.image;
        const hasVideo = !!message.video;
        const hasAudio = !!message.audio;
        const hasFile = !!message.file;
        
        return (
          <div
            key={`${message.id}-${index}`}
            className={cn(
              'flex gap-3 items-start',
              isOwnMessage && 'flex-row-reverse'
            )}
          >
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarFallback className={cn(
                'text-xs font-semibold',
                isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}>
                {senderInfo.initials}
              </AvatarFallback>
            </Avatar>
            
            <div className={cn(
              'flex flex-col gap-1 max-w-[70%]',
              isOwnMessage && 'items-end'
            )}>
              <div className={cn(
                'text-xs font-medium',
                isOwnMessage ? 'text-primary' : 'text-muted-foreground'
              )}>
                {senderInfo.displayName && (
                  <div className="font-semibold">{senderInfo.displayName}</div>
                )}
                <div className={senderInfo.displayName ? 'text-[10px]' : ''}>{senderInfo.name}</div>
              </div>
              
              <div className={cn(
                'rounded-2xl px-4 py-2 break-words',
                isOwnMessage 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              )}>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] bg-background"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(message.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {message.content && (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    {hasImage && message.image && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <img 
                            src={message.image.getDirectURL()} 
                            alt="Shared image" 
                            className="mt-2 rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: '300px' }}
                          />
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <img 
                            src={message.image.getDirectURL()} 
                            alt="Shared image" 
                            className="w-full h-auto"
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {hasVideo && message.video && (
                      <video 
                        controls 
                        className="mt-2 rounded-lg max-w-full"
                        style={{ maxHeight: '300px' }}
                      >
                        <source src={message.video.getDirectURL()} />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    
                    {hasAudio && message.audio && (
                      <audio 
                        controls 
                        className="mt-2 w-full"
                      >
                        <source src={message.audio.getDirectURL()} />
                        Your browser does not support the audio tag.
                      </audio>
                    )}
                    
                    {hasFile && message.file && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm flex-1">{t('message.fileAttached')}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = message.file!.getDirectURL();
                            link.download = 'file';
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditFile(message.id)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteFile(message.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <span className="text-[10px] text-muted-foreground px-1">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
