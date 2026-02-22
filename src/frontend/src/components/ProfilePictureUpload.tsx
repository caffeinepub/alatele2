import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, X } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfilePictureUploadProps {
  onImageSelect: (image: ExternalBlob | null) => void;
  currentImage?: ExternalBlob;
  disabled?: boolean;
}

export default function ProfilePictureUpload({ 
  onImageSelect, 
  currentImage,
  disabled 
}: ProfilePictureUploadProps) {
  const { t } = useLanguage();
  const [preview, setPreview] = useState<string | null>(
    currentImage ? currentImage.getDirectURL() : null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('profile.invalidImageType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('profile.imageTooLarge'));
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Pass blob to parent
      onImageSelect(blob);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(t('profile.uploadError'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          {preview ? (
            <AvatarImage src={preview} alt="Profile picture" />
          ) : (
            <AvatarFallback className="bg-primary/10">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
        
        {preview && !disabled && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || uploading}
        className="gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('profile.uploading')} {uploadProgress}%
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            {preview ? t('profile.changePhoto') : t('profile.uploadPhoto')}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        {t('profile.photoHint')}
      </p>
    </div>
  );
}
