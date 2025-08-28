import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageSelected: (imageUrls: string[]) => void;
  defaultImage?: string;
  multiple?: boolean;
}

export function ImageUploader({ 
  onImageSelected, 
  defaultImage,
  multiple = true // Default to true for backward compatibility
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(defaultImage ? [defaultImage] : []);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // If not multiple, only use the first file
    const filesToProcess = multiple ? files : [files[0]];

    // Show previews immediately
    const newPreviewUrls = filesToProcess.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => multiple ? [...prev, ...newPreviewUrls] : newPreviewUrls);

    // Start upload
    setIsUploading(true);
    try {
      const uploadPromises = filesToProcess.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const { url } = await response.json();
        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImageSelected(uploadedUrls);
    } catch (error) {
      console.error('Upload failed:', error);
      // Reset previews on error
      setPreviewUrls(defaultImage ? [defaultImage] : []);
      
      // Show user-friendly error message
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <label 
          htmlFor="image-upload"
          className={`
            w-full relative flex flex-col items-center justify-center p-6 
            border-2 border-dashed rounded-lg transition-all duration-200 
            ${isUploading 
              ? 'border-primary/50 bg-primary/5' 
              : 'border-muted-foreground/20 hover:border-primary/30 hover:bg-muted/50 bg-muted/20'
            }
            cursor-pointer
          `}
        >
          <div className="flex flex-col items-center text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary mb-2 animate-spin" />
                <h3 className="text-base font-medium">Uploading...</h3>
                <p className="text-sm text-muted-foreground">This may take a moment</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-base font-medium">Drop your images here</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-2">
                  {multiple 
                    ? "Upload multiple photos by selecting them all at once" 
                    : "Select a single image to upload"
                  }
                </p>
                <div className="text-sm text-primary font-medium mt-2 flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Browse files
                </div>
              </>
            )}
          </div>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}