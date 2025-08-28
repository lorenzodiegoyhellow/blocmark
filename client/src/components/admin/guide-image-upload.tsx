import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GuideImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | undefined) => void;
}

export function GuideImageUpload({ currentImage, onImageChange }: GuideImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Step 1: Get upload URL from server
      console.log("Getting upload URL...");
      const uploadUrlResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!uploadUrlResponse.ok) {
        const errorText = await uploadUrlResponse.text();
        console.error("Failed to get upload URL:", errorText);
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL } = await uploadUrlResponse.json();
      console.log("Got upload URL:", uploadURL);

      // Step 2: Upload file directly to the storage URL
      console.log("Uploading file to storage...");
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadResponse.ok) {
        console.error("Upload failed with status:", uploadResponse.status);
        throw new Error('Failed to upload file');
      }

      console.log("File uploaded successfully");

      // Step 3: Process the uploaded image URL
      console.log("Processing uploaded image...");
      const processResponse = await fetch('/api/admin/guides/image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ imageURL: uploadURL })
      });

      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        console.error("Failed to process image:", errorText);
        throw new Error('Failed to process image');
      }

      const { objectPath } = await processResponse.json();
      console.log("Image processed, path:", objectPath);

      // Update the preview and notify parent
      setPreviewUrl(objectPath);
      onImageChange(objectPath);

      toast({
        title: "Success",
        description: "Cover image uploaded successfully"
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onImageChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl.startsWith('/') ? previewUrl : `/${previewUrl}`}
            alt="Cover"
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              console.error("Failed to load image:", previewUrl);
              e.currentTarget.src = '/api/placeholder/800/400';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 mx-auto mb-2 animate-spin text-gray-400" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload cover image</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}