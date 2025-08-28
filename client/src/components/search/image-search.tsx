import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Search, Upload, Image as ImageIcon } from 'lucide-react';

// Function to resize an image before uploading
async function resizeImage(file: File, maxWidth: number): Promise<File> {
  return new Promise((resolve, reject) => {
    // Create an image to be drawn in canvas
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      // Only resize if the image is larger than maxWidth
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw and get as blob with reduced quality
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Convert blob to File
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        },
        'image/jpeg',
        0.85  // 85% quality JPEG
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };
    
    // Create object URL for the file
    img.src = URL.createObjectURL(file);
  });
}

export function ImageSearch({ onResults }: { onResults: (results: any) => void }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }
    
    // Store the file object directly
    setUploadedFile(file);
    
    // Also create a temporary URL for display purposes
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);

    
    console.log("Image uploaded:", { 
      name: file.name,
      type: file.type, 
      size: (file.size / 1024).toFixed(2) + " KB" 
    });
  };

  const handleSearch = async () => {
    // Determine which image to use
    if (!uploadedFile) {
      toast({
        title: 'No image selected',
        description: 'Please upload an image',
        variant: 'destructive',
      });
      return;
    }

    console.log("Starting image search with:", {
      uploadedFile: uploadedFile ? `${uploadedFile.name} (${uploadedFile.type})` : "No"
    });

    setIsLoading(true);
    try {
      // For uploaded images, we'll need to convert to base64
      let base64Data = '';
      try {
          const reader = new FileReader();
          
          console.log("Processing uploaded file directly:", {
            name: uploadedFile.name,
            size: (uploadedFile.size / 1024).toFixed(2) + " KB", 
            type: uploadedFile.type
          });
          
          // If image is too large, resize it first
          let imageToProcess = uploadedFile;
          if (uploadedFile.size > 1024 * 1024) { // If larger than 1MB
            console.log("Image is large, resizing before upload");
            imageToProcess = await resizeImage(uploadedFile, 1200); // Max width of 1200px
            console.log("Image resized to", 
              (imageToProcess.size / 1024).toFixed(2) + " KB");
          }
          
          console.log("Converting image to base64...");
          
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error("FileReader result is not a string"));
              }
            };
            reader.onerror = (event) => {
              console.error("FileReader error:", event);
              reject(new Error("Failed to read image"));
            };
            reader.readAsDataURL(imageToProcess);
          });
          
          // Keep the full data URL including the prefix
          base64Data = base64;
          
          if (!base64Data || base64Data.length < 100) {
            console.error("Base64 data invalid:", base64Data ? base64Data.length : 0);
            throw new Error("Image conversion failed");
          }
          
          console.log("Successfully converted image to base64, length:", 
            base64Data.length, "bytes");
          
          const requestData = { 
            imageData: base64Data,
            metadata: {
              fileName: uploadedFile.name,
              fileType: uploadedFile.type,
              fileSize: uploadedFile.size
            }
          };
          // Use our proper image search endpoint
          const endpoint = '/api/search/image';
          
          console.log("Sending uploaded image search request with base64 data", {
            fileName: uploadedFile.name,
            fileSize: (uploadedFile.size / 1024).toFixed(2) + "KB",
            base64Length: base64Data.length
          });
          
          const results = await apiRequest({
            url: endpoint,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
          });
          
          // If successful, pass results back and close dialog
          console.log("Search results:", results);
          
          if (results.matches && results.matches.length > 0) {
            onResults(results);
            toast({
              title: 'Search complete',
              description: `Found ${results.matches.length} location${results.matches.length !== 1 ? 's' : ''} matching your image`,
            });
          } else {
            onResults(results);
            toast({
              title: 'No exact matches found',
              description: 'We couldn\'t find exact matches for your image, but here are some recommendations',
              variant: 'default',
            });
          }
        } catch (error) {
          console.error("Error processing uploaded image:", error);
          throw new Error("Failed to process the image. Please try a different image.");
        }
      } catch (error) {
        console.error('Image search error:', error);
        toast({
          title: 'Search failed',
          description: 'Unable to analyze image. Please try a different image.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        
        // Clean up any created object URLs
        if (uploadedImage) {
          URL.revokeObjectURL(uploadedImage);
        }
      }
  };

  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle>Search by Image</DialogTitle>
        <DialogDescription>
          Upload an image to find locations with similar visual features
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
               onClick={() => fileInputRef.current?.click()}>
            {!uploadedImage ? (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="font-medium">Upload an image</p>
                <p className="text-sm text-muted-foreground">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WEBP (max. 5MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded image" 
                  className="max-h-[250px] mx-auto rounded-md object-contain"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedImage(null);
                    setUploadedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                    console.log("Image removed");
                  }}
                >
                  ×
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

      {uploadedImage && (
        <div className="flex items-center gap-3 mt-1">
          <ImageIcon className="h-5 w-5 text-primary" />
          <p className="text-sm">
            <span>Your uploaded image is ready for search</span>
          </p>
        </div>
      )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button 
          onClick={handleSearch}
          disabled={!uploadedFile || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Image...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Find Similar Locations
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}