import { useState, useRef } from 'react';
import { Button } from './button';
import { Video, Upload, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoUploaderProps {
  onVideoSelected: (videoUrl: string) => void;
  maxSizeMB?: number;
}

export function VideoUploader({ onVideoSelected, maxSizeMB = 500 }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleVideoUpload = async (file: File) => {
    if (!file) return;

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: "File Too Large",
        description: `Video file must be smaller than ${maxSizeMB}MB. Your file is ${Math.round(file.size / (1024 * 1024))}MB.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a video file (MP4, WebM, OGG, AVI, MOV).",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.url) {
        onVideoSelected(data.url);
        toast({
          title: "Video Uploaded",
          description: `Successfully uploaded ${file.name} (${Math.round(file.size / (1024 * 1024))}MB)`,
        });
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/avi,video/mov,video/quicktime"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-muted-foreground/20 hover:border-muted-foreground/40'
        } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Uploading video...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Upload Video</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your video here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: {maxSizeMB}MB • Supported formats: MP4, WebM, OGG, AVI, MOV
                </p>
              </div>
              
              <Button type="button" variant="outline" className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Choose Video File
              </Button>
            </>
          )}
        </div>
        
        {dragActive && (
          <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <p className="text-sm font-medium text-primary">Drop video to upload</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-start space-x-2 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p>Large video files may take several minutes to upload depending on your internet connection.</p>
          <p>We recommend compressing videos before uploading to reduce file size and upload time.</p>
        </div>
      </div>
    </div>
  );
}