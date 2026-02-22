import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
}

export default function MessageInput({ onSend, isSending }: MessageInputProps) {
  const [content, setContent] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isSending) return;

    const messageContent = content.trim();
    setContent('');
    
    try {
      await onSend(messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
      setContent(messageContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('chat.messagePlaceholder')}
        disabled={isSending}
        className="min-h-[60px] max-h-[200px] resize-none"
        rows={2}
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={!content.trim() || isSending}
        className="h-[60px] w-[60px] flex-shrink-0"
      >
        {isSending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </form>
  );
}
