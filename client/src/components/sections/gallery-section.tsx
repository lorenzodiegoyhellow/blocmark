import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  size: "small" | "medium" | "large";
}

const galleryImages: GalleryImage[] = [
  {
    id: "1",
    url: "/attached_assets/1-4_1753129845664.jpg",
    alt: "Cinematic car shoot in desert landscape",
    size: "medium"
  },
  {
    id: "2", 
    url: "/attached_assets/451068557_18447208573053549_4909473034850439737_n_1753129845664.jpg",
    alt: "Executive portrait in luxury study",
    size: "medium"
  },
  {
    id: "3",
    url: "/attached_assets/458387847_1615731838974012_179921365778563497_n_1753129845665.jpg",
    alt: "Fashion magazine cover shoot",
    size: "medium"
  },
  {
    id: "4",
    url: "/attached_assets/472399146_18491849896028118_1465432757336951731_n_1753129845665.jpg",
    alt: "Stylish portrait in vintage hotel",
    size: "medium"
  },
  {
    id: "5",
    url: "/attached_assets/472679629_18497675167008156_2062280238850191722_n_1753129845665.jpg",
    alt: "Fashion photography in period costume",
    size: "medium"
  },
  {
    id: "6",
    url: "/attached_assets/BIGSEAN-01_1753129845665.jpg",
    alt: "Music artist portrait session",
    size: "medium"
  },
  {
    id: "7",
    url: "/attached_assets/FbitkI09_1753129845665.png",
    alt: "Corporate boardroom scene",
    size: "medium"
  },
  {
    id: "8",
    url: "/attached_assets/griff14_1753129845665.jpg",
    alt: "Rooftop performance with city skyline",
    size: "medium"
  },
  {
    id: "9",
    url: "/attached_assets/skt11_1753129845666.jpg",
    alt: "Urban architecture with creative composition",
    size: "medium"
  }
];

export function GallerySection() {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollDirection = 1; // 1 for right, -1 for left
    let animationFrameId: number;

    const autoScroll = () => {
      if (container) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        // Only start scrolling if there's content to scroll
        if (maxScroll <= 0) {
          animationFrameId = requestAnimationFrame(autoScroll);
          return;
        }
        
        // Update scroll position
        container.scrollLeft += scrollDirection * 0.5;
        
        // Reverse direction when reaching edges
        if (container.scrollLeft >= maxScroll) {
          scrollDirection = -1;
        } else if (container.scrollLeft <= 0) {
          scrollDirection = 1;
        }
      }
      
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Start scrolling after a short delay to ensure images are loaded
    const timeoutId = setTimeout(() => {
      autoScroll();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="relative py-24 bg-black overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{
               backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
               backgroundSize: '50px 50px'
             }}>
        </div>
        {/* Subtle gradient overlays */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-cyan-500/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-500/5 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-t from-blue-500/10 to-transparent blur-3xl"></div>
      </div>
      
      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-none">
            <span className="block text-white">{t("gallery.madeWith")}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-pulse">
              Blocmark
            </span>
          </h2>
          
          <p className="text-xl text-white/60 max-w-4xl mx-auto leading-relaxed mb-10">
            {t("gallery.subtitle")}
          </p>
          
          <Link href="/search">
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 px-8 py-3 text-lg font-semibold shadow-xl shadow-cyan-500/25"
            >
              Explore all locations
            </Button>
          </Link>
        </div>

        {/* Gallery Container */}
        <div className="relative">
          {/* Gallery Images with enhanced styling and auto-scroll */}
          <div className="overflow-hidden relative">
            {/* Left gradient fade */}
            <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
            
            {/* Right gradient fade */}
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
            
            <div 
              ref={scrollContainerRef}
              className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide items-end px-4"
            >
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative flex-shrink-0 group"
                >
                  {/* Image container with border and glow effects */}
                  <div className="relative overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl">
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="object-cover transition-all duration-700"
                      style={{ height: '320px', width: 'auto' }}
                    />
                    
                    {/* Gradient overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  

                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom fade effect */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
}