import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface BackgroundImage {
  url: string;
  alt: string;
}

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [searchMode, setSearchMode] = useState<"ai" | "classic">("ai");
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  // Background images from uploaded assets
  const backgrounds: BackgroundImage[] = [
    {
      url: "/attached_assets/diana-cabezas-Ln9YUs7J93Q-unsplash_1753153627479.jpg",
      alt: "Vibrant turquoise door with desert cacti plants against white Mediterranean walls"
    },
    {
      url: "/attached_assets/1.jpg",
      alt: "Rich Victorian interior with red walls and antique furniture"
    },
    {
      url: "/attached_assets/6I4B5772.jpg", 
      alt: "Vintage teal house in desert setting"
    },
    {
      url: "/attached_assets/vault2698-2.jpg",
      alt: "Luxurious vintage lounge with ornate ceiling and mood lighting"
    },
    {
      url: "/attached_assets/hotel27112.jpg",
      alt: "Elegant hotel interior with classical architecture"
    },
    {
      url: "/attached_assets/victorian28972.jpg",
      alt: "Victorian style architectural details with vintage charm"
    }
  ];

  // Preload all images when component mounts
  useEffect(() => {
    const imagePromises = backgrounds.map((bg) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = bg.url;
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    Promise.all(imagePromises)
      .then(() => {
        setImagesLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load images:", error);
        // Still set as loaded to show something rather than nothing
        setImagesLoaded(true);
      });
  }, []);

  // Simple automatic image rotation for reliability
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [imagesLoaded, backgrounds.length]);

  return (
    <div className="relative w-full h-[650px] md:h-[750px] overflow-hidden -mt-[90px]">
      {/* Loading state */}
      {!imagesLoaded && (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Simple fade carousel */}
      {imagesLoaded && (
        <div className="h-full w-full relative">
          {backgrounds.map((image, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out 
                ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src={image.url}
                alt={image.alt}
                className="absolute w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            </div>
          ))}
        </div>
      )}
      
      {/* Content overlay - always on top */}
      <div className="absolute inset-0 flex flex-col items-center justify-end sm:justify-center p-4 sm:p-6 pb-16 sm:pb-4 pt-20 z-10">
        <div className="text-center space-y-2 sm:space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {t("home.heroTitle")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6">
            {t("home.heroSubtitle")}
          </p>
          
          <div className="mt-6 sm:mt-8 w-full max-w-3xl mx-auto bg-white/90 p-3 sm:p-4 rounded-lg">
            <SearchBar onModeChange={setSearchMode} />
            
            {/* Feature search suggestions with improved visibility - only show in AI mode */}
            {searchMode === "ai" && (
            <div className="mt-3 flex flex-col items-center justify-center gap-1">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xs sm:text-sm text-gray-700 font-medium">Try our AI-powered search:</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                {/* First row - visual features */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  onClick={() => {
                    localStorage.setItem('aiSearchQuery', 'couch');
                    window.location.href = "/simple-search?q=couch&mode=ai";
                  }}
                >
                  Couch
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  onClick={() => {
                    localStorage.setItem('aiSearchQuery', 'white walls');
                    window.location.href = "/simple-search?q=white+walls&mode=ai";
                  }}
                >
                  White Walls
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  onClick={() => {
                    localStorage.setItem('aiSearchQuery', 'hardwood floor');
                    window.location.href = "/simple-search?q=hardwood+floor&mode=ai";
                  }}
                >
                  Hardwood Floor
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  onClick={() => {
                    localStorage.setItem('aiSearchQuery', 'high ceiling');
                    window.location.href = "/simple-search?q=high+ceiling&mode=ai";
                  }}
                >
                  High Ceiling
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  onClick={() => {
                    localStorage.setItem('aiSearchQuery', 'natural light');
                    window.location.href = "/simple-search?q=natural+light&mode=ai";
                  }}
                >
                  Natural Light
                </Button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {/* Second row - location types */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  onClick={() => {
                    localStorage.setItem('aiSearchQuery', 'photo studio');
                    window.location.href = "/simple-search?q=studio&mode=ai";
                  }}
                >
                  Photo Studio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  onClick={() => {
                    localStorage.setItem('aiSearchQuery', 'luxury mansion');
                    window.location.href = "/simple-search?q=mansion&mode=ai";
                  }}
                >
                  Luxury Mansion
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  onClick={() => {
                    localStorage.setItem('aiSearchQuery', 'palm trees');
                    window.location.href = "/simple-search?q=palm+trees&mode=ai";
                  }}
                >
                  Palm Trees
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  onClick={() => {
                    localStorage.setItem('aiSearchQuery', 'brick walls');
                    window.location.href = "/simple-search?q=brick+walls&mode=ai";
                  }}
                >
                  Brick Walls
                </Button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}