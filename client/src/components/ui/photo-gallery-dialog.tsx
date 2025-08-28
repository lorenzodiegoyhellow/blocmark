import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  initialImageIndex: number;
  title?: string;
}

export function PhotoGalleryDialog({ 
  open, 
  onOpenChange, 
  images, 
  initialImageIndex = 0,
  title 
}: PhotoGalleryDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  
  // Reset the current image index when the dialog is opened
  React.useEffect(() => {
    if (open) {
      setCurrentImageIndex(initialImageIndex);
    }
  }, [open, initialImageIndex]);
  
  const handlePrevious = () => {
    setCurrentImageIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };
  
  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => Math.min(images.length - 1, prevIndex + 1));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] w-[95vw] h-[90vh] p-0 bg-black/95 border-0 rounded-lg overflow-hidden"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="flex flex-col h-full w-full max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-4 text-white bg-black/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {currentImageIndex + 1} / {images.length}
              </span>
              {title && <span className="text-sm truncate max-w-[300px]">{title}</span>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/30 bg-white/10 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden" style={{ minHeight: '400px' }}>
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={images[currentImageIndex]}
                alt={`Photo ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-md shadow-lg"
              />
            </div>
            
            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
                  disabled={currentImageIndex === images.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="p-4 bg-black/50 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 h-16 w-16 overflow-hidden cursor-pointer transition-all rounded-md ${
                      index === currentImageIndex ? "ring-2 ring-white" : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}