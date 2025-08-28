import { useState, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Camera, MapPin } from "lucide-react";
import { useLocation } from "wouter";

// Image locations with corresponding data
const locationImages = [
  {
    src: "/attached_assets/6I4B6500.jpg",
    alt: "Vintage diner interior with teal booths and checkered floor",
    title: "Classic American Diner",
    location: "Los Angeles, CA",
    category: "Restaurant",
  },
  {
    src: "/attached_assets/hotel27112.jpg",
    alt: "Rooftop pool with cabanas and city skyline view",
    title: "Downtown Rooftop Oasis",
    location: "New York, NY",
    category: "Hotel",
  },
  {
    src: "/attached_assets/vault2698-2.jpg",
    alt: "Luxurious vintage lounge with ornate ceiling and mood lighting",
    title: "The Vault Lounge",
    location: "Chicago, IL",
    category: "Bar",
  },
  {
    src: "/attached_assets/6I4B5772.jpg",
    alt: "Vintage teal house in desert setting",
    title: "Desert Getaway",
    location: "Joshua Tree, CA",
    category: "Residential",
  },
  {
    src: "/attached_assets/6I4B5955.jpg",
    alt: "Vintage Airstream trailer in desert landscape",
    title: "Retro Desert Trailer",
    location: "Palm Springs, CA",
    category: "Unique Stay",
  },
  {
    src: "/attached_assets/victorian28972.jpg",
    alt: "Rich Victorian-style interior with red walls and antique furniture",
    title: "Victorian Manor",
    location: "San Francisco, CA",
    category: "Historic",
  },
];

export function PhotoCarousel() {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!api) return;
    
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleExplore = useCallback(() => {
    navigate("/search?category=" + locationImages[current - 1]?.category.toLowerCase());
  }, [navigate, current]);

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Inspiring Locations</h3>
          <p className="text-muted-foreground">Discover unique spaces for your next shoot or event</p>
        </div>
        <Button 
          onClick={handleExplore}
          variant="outline" 
          size="sm" 
          className="hidden md:flex items-center gap-2"
        >
          <Camera size={16} /> Explore More
        </Button>
      </div>

      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {locationImages.map((image, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <Card className="border overflow-hidden group">
                <CardContent className="p-0 relative">
                  <AspectRatio ratio={4/3} className="bg-muted">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </AspectRatio>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <Badge className="mb-2 bg-primary/80 hover:bg-primary">
                      {image.category}
                    </Badge>
                    <h4 className="font-semibold text-lg">{image.title}</h4>
                    <div className="flex items-center text-sm opacity-90">
                      <MapPin size={14} className="mr-1" />
                      {image.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {current} / {count}
        </div>
        <Button 
          onClick={handleExplore}
          variant="outline" 
          size="sm" 
          className="md:hidden flex items-center gap-2"
        >
          <Camera size={16} /> Explore More
        </Button>
      </div>
    </div>
  );
}