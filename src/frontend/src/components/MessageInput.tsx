import { useState, FormEvent, KeyboardEvent, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Image as ImageIcon, Video, X } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { Progress } from '@/components/ui/progress';

interface MessageInputProps {
  onSend: (content: string, image?: ExternalBlob, video?: ExternalBlob) => Promise<void>;
  isSending: boolean;
}

export default function MessageInput({ onSend, isSending }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string; blob?: ExternalBlob } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ file: File; name: string; blob?: ExternalBlob } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      setSelectedImage({ file, preview });
      // Clear video if image is selected
      if (selectedVideo) {
        setSelectedVideo(null);
      }
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo({ file, name: file.name });
      // Clear image if video is selected
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.preview);
        setSelectedImage(null);
      }
    }
  };

  const removeImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.preview);
      setSelectedImage(null);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedImage || selectedVideo) && !isSending) {
      setUploadProgress(0);
      
      let imageBlob: ExternalBlob | undefined;
      let videoBlob: ExternalBlob | undefined;

      try {
        // Convert image to ExternalBlob if present
        if (selectedImage) {
          const arrayBuffer = await selectedImage.file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
            setUploadProgress(percentage);
          });
        }

        // Convert video to ExternalBlob if present
        if (selectedVideo) {
          const arrayBuffer = await selectedVideo.file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          videoBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
            setUploadProgress(percentage);
          });
        }

        await onSend(message.trim(), imageBlob, videoBlob);
        
        // Clear form
        setMessage('');
        removeImage();
        removeVideo();
        setUploadProgress(0);
      } catch (error) {
        console.error('Error sending message:', error);
        setUploadProgress(0);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasContent = message.trim() || selectedImage || selectedVideo;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Image Preview */}
      {selectedImage && (
        <div className="relative inline-block">
          <img 
            src={selectedImage.preview} 
            alt="Preview" 
            className="max-h-32 rounded-lg border border-border"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={removeImage}
            disabled={isSending}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Video Preview */}
      {selectedVideo && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
          <Video className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm flex-1 truncate">{selectedVideo.name}</span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 flex-shrink-0"
            onClick={removeVideo}
            disabled={isSending}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {isSending && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-1">
          <Progress value={uploadProgress} className="h-1" />
          <p className="text-xs text-muted-foreground text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        <div className="flex gap-1 flex-shrink-0">
          {/* Image Upload Button */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isSending}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-[52px] w-[52px]"
            onClick={() => imageInputRef.current?.click()}
            disabled={isSending || !!selectedVideo}
            title="Attach image"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>

          {/* Video Upload Button */}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleVideoSelect}
            className="hidden"
            disabled={isSending}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-[52px] w-[52px]"
            onClick={() => videoInputRef.current?.click()}
            disabled={isSending || !!selectedImage}
            title="Attach video"
          >
            <Video className="w-5 h-5" />
          </Button>
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          className="min-h-[52px] max-h-32 resize-none flex-1"
          disabled={isSending}
          rows={1}
        />
        
        <Button 
          type="submit" 
          size="icon"
          className="h-[52px] w-[52px] flex-shrink-0"
          disabled={!hasContent || isSending}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </form>
  );
}
