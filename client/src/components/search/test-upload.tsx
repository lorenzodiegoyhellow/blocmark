import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Helper function to resize large images
async function resizeImage(file: Blob, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      // If the image is already smaller, no need to resize
      if (img.width <= maxWidth) {
        resolve(file);
        return;
      }
      
      // Calculate new dimensions
      const ratio = img.height / img.width;
      const newWidth = maxWidth;
      const newHeight = Math.round(newWidth * ratio);
      
      // Create canvas and resize
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Draw resized image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convert back to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        file.type,
        0.85 // quality parameter (0-1)
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    console.log('File selected:', {
      name: selectedFile.name,
      type: selectedFile.type,
      size: `${(selectedFile.size / 1024).toFixed(2)} KB`
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select an image file first',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('Processing file:', file.name);
      
      // Resize large images
      let processedFile = file;
      if (file.size > 1024 * 1024) { // If larger than 1MB
        console.log('Resizing large image...');
        const resizedBlob = await resizeImage(file, 1200);
        processedFile = new File([resizedBlob], file.name, { type: file.type });
        console.log('Image resized:', {
          originalSize: `${(file.size / 1024).toFixed(2)} KB`,
          newSize: `${(processedFile.size / 1024).toFixed(2)} KB`
        });
      }
      
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(processedFile);
      });
      
      console.log('Converted to base64:', {
        length: base64.length,
        preview: base64.substring(0, 50) + '...'
      });
      
      // Extract the base64 data without the prefix
      const base64Data = base64.split(',')[1];
      
      // Send to test endpoint
      const response = await apiRequest('/api/search/test-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64Data })
      });
      
      console.log('Response:', response);
      setResult(response);
      
      if (response.success) {
        toast({
          title: 'Upload successful',
          description: 'Image data validation complete'
        });
      } else {
        toast({
          title: 'Upload issue',
          description: response.message || 'There was a problem with the image data',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Test Image Upload</h3>
      
      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="block w-full text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          
          {file && (
            <div className="mt-2">
              <p className="text-sm">
                Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleUpload} 
          disabled={!file || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Upload and Test'
          )}
        </Button>
      </div>
      
      {result && (
        <div className="p-4 mt-4 overflow-auto border rounded bg-muted/50 max-h-72">
          <h4 className="mb-2 font-medium">Result:</h4>
          <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}