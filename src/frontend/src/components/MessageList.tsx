import { useState } from 'react';
import { type Message } from '../backend';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useDeleteMessage, useEditMessage } from '../hooks/useMessages';

interface MessageListProps {
  messages: Message[];
  currentUsername: string;
}

export default function MessageList({ messages, currentUsername }: MessageListProps) {
  const [editingMessageId, setEditingMessageId] = useState<bigint | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const deleteMessageMutation = useDeleteMessage();
  const editMessageMutation = useEditMessage();

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-center">
          No messages yet.<br />
          <span className="text-sm">Be the first to say hello!</span>
        </p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
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
      await editMessageMutation.mutateAsync({ id: messageId, newContent: editContent.trim() });
      setEditingMessageId(null);
      setEditContent('');
    }
  };

  const handleDelete = async (messageId: bigint) => {
    await deleteMessageMutation.mutateAsync(messageId);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {messages.map((message, index) => {
        const isOwnMessage = message.sender === currentUsername;
        const isEditing = editingMessageId === message.id;
        const hasImage = !!message.image;
        const hasVideo = !!message.video;
        
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
                {getInitials(message.sender)}
              </AvatarFallback>
            </Avatar>
            
            <div className={cn(
              'flex flex-col gap-1 max-w-[70%]',
              isOwnMessage && 'items-end'
            )}>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  'text-sm font-semibold',
                  isOwnMessage && 'order-2'
                )}>
                  {message.sender}
                </span>
                <span className={cn(
                  'text-xs text-muted-foreground',
                  isOwnMessage && 'order-1'
                )}>
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              
              {isEditing ? (
                <div className="w-full space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={editMessageMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(message.id)}
                      disabled={editMessageMutation.isPending || !editContent.trim()}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={cn(
                    'rounded-2xl overflow-hidden',
                    isOwnMessage 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted rounded-tl-sm'
                  )}>
                    {/* Image Display */}
                    {hasImage && message.image && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <img
                            src={message.image.getDirectURL()}
                            alt="Shared image"
                            className="max-w-full max-h-80 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl w-auto p-0 border-0">
                          <img
                            src={message.image.getDirectURL()}
                            alt="Shared image"
                            className="w-full h-auto"
                          />
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Video Display */}
                    {hasVideo && message.video && (
                      <video
                        src={message.video.getDirectURL()}
                        controls
                        className="max-w-full max-h-80 rounded"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}

                    {/* Text Content */}
                    {message.content && (
                      <div className="px-4 py-2.5">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {isOwnMessage && (
                    <div className="flex gap-1 mt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleEditClick(message)}
                        disabled={deleteMessageMutation.isPending || editMessageMutation.isPending}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDelete(message.id)}
                        disabled={deleteMessageMutation.isPending || editMessageMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
