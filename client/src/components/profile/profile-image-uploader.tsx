import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileImageUploaderProps {
  currentImage?: string;
  username: string;
  onImageChange: (imageUrl: string) => void;
}

export function ProfileImageUploader({ 
  currentImage, 
  username,
  onImageChange 
}: ProfileImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Show preview immediately
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload the file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading profile image...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Ensure cookies are sent
      });

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to upload image';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, try to get text
          const text = await response.text();
          console.error('Upload error response:', text);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      
      // Update the image
      onImageChange(data.url);
      
      // Clear preview
      setPreviewUrl(null);
      
      // Don't show toast here - let the parent component handle it after save
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Reset preview on error
      setPreviewUrl(null);
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const displayImage = previewUrl || currentImage;

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-32 w-32">
        {displayImage ? (
          <AvatarImage 
            src={displayImage} 
            alt={username}
            className="object-cover"
          />
        ) : (
          <AvatarFallback className="text-2xl">
            {username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="relative">
        <Input
          id="profile-image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('profile-image-upload')?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Change Photo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}