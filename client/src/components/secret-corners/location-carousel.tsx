import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MapPin, Bookmark, User } from "lucide-react";

interface LocationCardProps {
  id: number;
  name: string;
  image: string;
  location: string;
  tags: string[];
  contributor: {
    id: number;
    name: string;
    image?: string;
  };
  bookmarked?: boolean;
  onBookmark?: (id: number) => void;
  label?: "New" | "Popular" | "Editor's Pick";
  onClick?: () => void;
}

export function LocationCard({
  id,
  name, 
  image, 
  location, 
  tags,
  contributor,
  bookmarked = false,
  onBookmark,
  label,
  onClick
}: LocationCardProps) {
  return (
    <Card className="overflow-hidden group h-full cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-0 relative h-full flex flex-col">
        <AspectRatio ratio={4/3} className="bg-muted w-full">
          <img 
            src={image} 
            alt={name} 
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {label && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant={
                  label === "Popular" ? "default" : 
                  label === "Editor's Pick" ? "secondary" : 
                  "outline"
                }
                className={
                  label === "New" ? "bg-green-500 hover:bg-green-600 text-white" : ""
                }
              >
                {label}
              </Badge>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 left-2 text-white hover:bg-black/20 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.(id);
            }}
          >
            <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-white' : ''}`} />
          </Button>
        </AspectRatio>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold text-lg line-clamp-2">{name}</h3>
          <div className="flex items-center text-sm mt-1 opacity-90">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex flex-wrap gap-1 max-w-[70%]">
              {tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-black/20 border-none text-white text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="bg-black/20 border-none text-white text-xs">+{tags.length - 3}</Badge>
              )}
            </div>
            
            <div className="flex items-center">
              <Avatar className="h-6 w-6 border border-white/20">
                <AvatarImage src={contributor.image} />
                <AvatarFallback>{contributor.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LocationCarouselProps {
  title: string;
  description?: string;
  locations: LocationCardProps[];
  viewAllLink?: string;
}

export function LocationCarousel({ 
  title, 
  description, 
  locations,
  viewAllLink
}: LocationCarouselProps) {
  return (
    <div className="py-6">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {viewAllLink && (
          <Button variant="link" className="font-medium" asChild>
            <a href={viewAllLink}>View All</a>
          </Button>
        )}
      </div>
      
      <Carousel className="w-full">
        <CarouselContent>
          {locations.map((location) => (
            <CarouselItem key={location.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-4">
              <LocationCard {...location} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}