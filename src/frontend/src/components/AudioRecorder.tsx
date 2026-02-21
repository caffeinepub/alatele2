import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Uint8Array) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function AudioRecorder({ onRecordingComplete, onCancel, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionError('Microphone access denied. Please allow microphone access to record audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleDelete = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const handleSend = async () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      onRecordingComplete(uint8Array);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (permissionError) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-sm text-destructive mb-3">{permissionError}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (audioURL) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={handleAudioEnded}
          className="hidden"
        />
        
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={togglePlayPause}
          className="h-8 w-8 flex-shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">Audio Message</div>
          <div className="text-xs text-muted-foreground">{formatTime(recordingTime)}</div>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleDelete}
          className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive"
          disabled={disabled}
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          className="h-8 w-8 flex-shrink-0"
          disabled={disabled}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
        <div className={cn(
          "w-3 h-3 rounded-full bg-destructive animate-pulse flex-shrink-0"
        )} />
        
        <div className="flex-1">
          <div className="text-sm font-medium">Recording...</div>
          <div className="text-xs text-muted-foreground">{formatTime(recordingTime)}</div>
        </div>

        <Button
          type="button"
          size="icon"
          variant="destructive"
          onClick={stopRecording}
          className="h-8 w-8 flex-shrink-0"
        >
          <Square className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={startRecording}
      disabled={disabled}
      className="gap-2"
    >
      <Mic className="w-4 h-4" />
      Record Audio
    </Button>
  );
}
