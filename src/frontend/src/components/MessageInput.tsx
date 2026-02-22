import { useState, FormEvent, KeyboardEvent, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Image as ImageIcon, Video, X, Mic, Paperclip } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { Progress } from '@/components/ui/progress';
import AudioRecorder from './AudioRecorder';
import { useLanguage } from '../contexts/LanguageContext';

interface MessageInputProps {
  onSend: (content: string, image?: ExternalBlob, video?: ExternalBlob, audio?: ExternalBlob, file?: ExternalBlob) => Promise<void>;
  isSending: boolean;
}

export default function MessageInput({ onSend, isSending }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string; blob?: ExternalBlob } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ file: File; name: string; blob?: ExternalBlob } | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<Uint8Array | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ file: File; name: string; blob?: ExternalBlob } | null>(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      setSelectedImage({ file, preview });
      // Clear other media
      if (selectedVideo) setSelectedVideo(null);
      if (selectedAudio) setSelectedAudio(null);
      if (selectedFile) setSelectedFile(null);
      setShowAudioRecorder(false);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo({ file, name: file.name });
      // Clear other media
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.preview);
        setSelectedImage(null);
      }
      if (selectedAudio) setSelectedAudio(null);
      if (selectedFile) setSelectedFile(null);
      setShowAudioRecorder(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile({ file, name: file.name });
      // Clear other media
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.preview);
        setSelectedImage(null);
      }
      if (selectedVideo) setSelectedVideo(null);
      if (selectedAudio) setSelectedAudio(null);
      setShowAudioRecorder(false);
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

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAudioRecordingComplete = (audioData: Uint8Array) => {
    setSelectedAudio(audioData);
    setShowAudioRecorder(false);
    // Clear other media
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.preview);
      setSelectedImage(null);
    }
    if (selectedVideo) setSelectedVideo(null);
    if (selectedFile) setSelectedFile(null);
  };

  const handleCancelAudioRecording = () => {
    setShowAudioRecorder(false);
    setSelectedAudio(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedImage || selectedVideo || selectedAudio || selectedFile) && !isSending) {
      const messageContent = message.trim();
      const imageFile = selectedImage;
      const videoFile = selectedVideo;
      const audioData = selectedAudio;
      const fileData = selectedFile;
      
      // Clear form immediately for better perceived performance
      setMessage('');
      removeImage();
      removeVideo();
      removeFile();
      setSelectedAudio(null);
      setUploadProgress(0);

      try {
        let imageBlob: ExternalBlob | undefined;
        let videoBlob: ExternalBlob | undefined;
        let audioBlob: ExternalBlob | undefined;
        let fileBlob: ExternalBlob | undefined;

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
              const buffer = new ArrayBuffer(audioData.byteLength);
              const typedArray = new Uint8Array(buffer);
              typedArray.set(audioData);
              audioBlob = ExternalBlob.fromBytes(typedArray).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
              });
            })()
          );
        }

        if (fileData) {
          conversionPromises.push(
            (async () => {
              const arrayBuffer = await fileData.file.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              fileBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
              });
            })()
          );
        }

        // Wait for all conversions to complete
        await Promise.all(conversionPromises);

        // Send message (optimistic update will show it immediately)
        await onSend(messageContent, imageBlob, videoBlob, audioBlob, fileBlob);
        
        setUploadProgress(0);
      } catch (error) {
        console.error('Error sending message:', error);
        // Restore form on error
        setMessage(messageContent);
        if (imageFile) setSelectedImage(imageFile);
        if (videoFile) setSelectedVideo(videoFile);
        if (audioData) setSelectedAudio(audioData);
        if (fileData) setSelectedFile(fileData);
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

  const hasContent = message.trim() || selectedImage || selectedVideo || selectedAudio || selectedFile;

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

      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
          <Paperclip className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 flex-shrink-0"
            onClick={removeFile}
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

      {/* Audio Preview */}
      {selectedAudio && !showAudioRecorder && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
          <Mic className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm flex-1">{t('message.audioRecorded')}</span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 flex-shrink-0"
            onClick={() => setSelectedAudio(null)}
            disabled={isSending}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-1">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {t('message.uploading')} {uploadProgress}%
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('message.placeholder')}
          className="min-h-[60px] max-h-[200px] resize-none"
          disabled={isSending}
        />
        
        <div className="flex flex-col gap-2">
          {/* Image Upload */}
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
            variant="outline"
            onClick={() => imageInputRef.current?.click()}
            disabled={isSending || !!selectedVideo || !!selectedAudio || !!selectedFile}
            title={t('message.addImage')}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>

          {/* Video Upload */}
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
            variant="outline"
            onClick={() => videoInputRef.current?.click()}
            disabled={isSending || !!selectedImage || !!selectedAudio || !!selectedFile}
            title={t('message.addVideo')}
          >
            <Video className="w-4 h-4" />
          </Button>

          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isSending}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || !!selectedImage || !!selectedVideo || !!selectedAudio}
            title={t('message.addFile')}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          {/* Audio Recorder */}
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setShowAudioRecorder(!showAudioRecorder)}
            disabled={isSending || !!selectedImage || !!selectedVideo || !!selectedFile}
            title={t('message.recordAudio')}
          >
            <Mic className="w-4 h-4" />
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            disabled={!hasContent || isSending}
            className="bg-primary hover:bg-primary/90"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
