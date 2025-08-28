import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

interface CategoryBarProps {
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect: (id: string) => void;
  onFilterClick: () => void;
}

// CSS to hide scrollbar
const scrollbarHideStyles = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

export function CategoryBar({ 
  categories, 
  selectedCategory,
  onCategorySelect,
  onFilterClick 
}: CategoryBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to track if we can scroll in each direction
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Function to check scroll state
  const checkScrollState = () => {
    const container = scrollContainerRef.current;
    if (container) {
      // Can scroll left if we're not at the beginning
      const scrollLeft = container.scrollLeft > 10;
      setCanScrollLeft(scrollLeft);
      
      // Can scroll right if we're not at the end
      const scrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10); 
      setCanScrollRight(scrollRight);
    }
  };
  
  // Initialize scroll state when component mounts or categories change
  useEffect(() => {
    // Use a small timeout to ensure the DOM has rendered
    const timer = setTimeout(() => {
      checkScrollState();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [categories]);
  
  // Scroll functions
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200; // Pixels to scroll
      container.scrollLeft -= scrollAmount;
      
      // Update scroll state after animation
      setTimeout(checkScrollState, 300);
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200; // Pixels to scroll
      container.scrollLeft += scrollAmount;
      
      // Update scroll state after animation
      setTimeout(checkScrollState, 300);
    }
  };
  
  // Add scroll event listener to update arrow visibility
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        checkScrollState();
      };
      
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <div className="border-b">
      {/* Add style tag to apply scrollbar hiding CSS */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyles }} />
      
      <div className="container mx-auto px-4 relative" ref={containerRef}>
        <div className="flex items-center relative">
          {/* Left navigation button */}
          {canScrollLeft && (
            <div className="absolute left-0 z-10" style={{ transform: "translateX(-10px)" }}>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-muted bg-background/90 hover:bg-background shadow-sm"
                onClick={scrollLeft}
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          )}
          
          {/* Categories with scrolling */}
          <div 
            ref={scrollContainerRef} 
            className={cn(
              "flex-1 overflow-x-auto py-4 scrollbar-hide",
              canScrollLeft ? "pl-8" : "pl-4",
              "pr-[120px]" // Fixed larger padding to ensure space for filter button
            )}
            style={{ 
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex space-x-4 w-max">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    "flex items-center space-x-2 rounded-full hover:bg-accent",
                    selectedCategory === category.id && "bg-accent"
                  )}
                  onClick={() => onCategorySelect(category.id)}
                >
                  <div className="w-4 h-4 flex items-center justify-center">{category.icon}</div>
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Right navigation and filters - absolutely positioned */}
          <div className="absolute right-0 z-10 flex items-center bg-background">
            {/* Only show right arrow if we can scroll right */}
            {canScrollRight && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 mr-4 rounded-full border-muted bg-background/90 hover:bg-background shadow-sm"
                onClick={scrollRight}
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            
            {/* Filter button with border */}
            <div className="border-l pl-4 h-[40px] flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onFilterClick}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}