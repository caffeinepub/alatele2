import { useState, FormEvent, KeyboardEvent, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Image as ImageIcon, Video, X, Mic } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { Progress } from '@/components/ui/progress';
import AudioRecorder from './AudioRecorder';

interface MessageInputProps {
  onSend: (content: string, image?: ExternalBlob, video?: ExternalBlob, audio?: ExternalBlob) => Promise<void>;
  isSending: boolean;
}

export default function MessageInput({ onSend, isSending }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string; blob?: ExternalBlob } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ file: File; name: string; blob?: ExternalBlob } | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<Uint8Array | null>(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      setSelectedImage({ file, preview });
      // Clear video and audio if image is selected
      if (selectedVideo) {
        setSelectedVideo(null);
      }
      if (selectedAudio) {
        setSelectedAudio(null);
        setShowAudioRecorder(false);
      }
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo({ file, name: file.name });
      // Clear image and audio if video is selected
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.preview);
        setSelectedImage(null);
      }
      if (selectedAudio) {
        setSelectedAudio(null);
        setShowAudioRecorder(false);
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

  const handleAudioRecordingComplete = (audioData: Uint8Array) => {
    setSelectedAudio(audioData);
    setShowAudioRecorder(false);
    // Clear image and video if audio is selected
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.preview);
      setSelectedImage(null);
    }
    if (selectedVideo) {
      setSelectedVideo(null);
    }
  };

  const handleCancelAudioRecording = () => {
    setShowAudioRecorder(false);
    setSelectedAudio(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedImage || selectedVideo || selectedAudio) && !isSending) {
      const messageContent = message.trim();
      const imageFile = selectedImage;
      const videoFile = selectedVideo;
      const audioData = selectedAudio;
      
      // Clear form immediately for better perceived performance
      setMessage('');
      removeImage();
      removeVideo();
      setSelectedAudio(null);
      setUploadProgress(0);

      try {
        let imageBlob: ExternalBlob | undefined;
        let videoBlob: ExternalBlob | undefined;
        let audioBlob: ExternalBlob | undefined;

        // Convert files to ExternalBlob in parallel for faster processing
        const conversionPromises: Promise<void>[] = [];

        if (imageFile) {
          conversionPromises.push(
            (async () => {
              const arrayBuffer = await imageFile.file.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
              });
            })()
          );
        }

        if (videoFile) {
          conversionPromises.push(
            (async () => {
              const arrayBuffer = await videoFile.file.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              videoBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
              });
            })()
          );
        }

        if (audioData) {
          conversionPromises.push(
            (async () => {
              // Create a new Uint8Array with ArrayBuffer to satisfy type requirements
              const buffer = new ArrayBuffer(audioData.byteLength);
              const typedArray = new Uint8Array(buffer);
              typedArray.set(audioData);
              audioBlob = ExternalBlob.fromBytes(typedArray).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
              });
            })()
          );
        }

        // Wait for all conversions to complete
        await Promise.all(conversionPromises);

        // Send message (optimistic update will show it immediately)
        await onSend(messageContent, imageBlob, videoBlob, audioBlob);
        
        setUploadProgress(0);
      } catch (error) {
        console.error('Error sending message:', error);
        // Restore form on error
        setMessage(messageContent);
        if (imageFile) {
          setSelectedImage(imageFile);
        }
        if (videoFile) {
          setSelectedVideo(videoFile);
        }
        if (audioData) {
          setSelectedAudio(audioData);
        }
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

  const hasContent = message.trim() || selectedImage || selectedVideo || selectedAudio;

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

      {/* Audio Recorder */}
      {showAudioRecorder && (
        <AudioRecorder
          onRecordingComplete={handleAudioRecordingComplete}
          onCancel={handleCancelAudioRecording}
          disabled={isSending}
        />
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-1">
          <Progress value={uploadProgress} className="h-1" />
          <p className="text-xs text-muted-foreground text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] max-h-[200px] resize-none pr-24"
            disabled={isSending}
          />
          
          {/* Attachment Buttons */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isSending}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => imageInputRef.current?.click()}
              disabled={isSending || !!selectedVideo || !!selectedAudio || showAudioRecorder}
              title="Attach image"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
              disabled={isSending}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => videoInputRef.current?.click()}
              disabled={isSending || !!selectedImage || !!selectedAudio || showAudioRecorder}
              title="Attach video"
            >
              <Video className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setShowAudioRecorder(true)}
              disabled={isSending || !!selectedImage || !!selectedVideo || showAudioRecorder}
              title="Record audio"
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          size="icon"
          className="h-[60px] w-[60px] flex-shrink-0"
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
