import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CalendarRange, Camera, Clock, Map, Trophy, Upload } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface WeeklyChallengeProps {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image?: string;
  previousWinner?: {
    id: number;
    locationName: string;
    userName: string;
    image: string;
  };
  onSubmitClick: () => void;
}

export function WeeklyChallenge(props: Partial<WeeklyChallengeProps>) {
  const {
    id = 1,
    title = "Weekly Photo Challenge",
    description = "Submit your best photos for this week's challenge! The winner will be featured on our platform.",
    startDate = new Date().toISOString(),
    endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    image,
    previousWinner,
    onSubmitClick = () => console.log("Submit clicked")
  } = props;
  const timeRemaining = () => {
    const end = new Date(endDate);
    const now = new Date();
    if (now > end) return "Challenge ended";
    return formatDistanceToNow(end, { addSuffix: true });
  };
  
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6">Weekly Challenge</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        {/* Current Challenge */}
        <Card className="overflow-hidden">
          <div className="relative">
            {image && (
              <AspectRatio ratio={16/9} className="bg-muted">
                <img 
                  src={image} 
                  alt={title} 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </AspectRatio>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <Badge className="bg-primary mb-2">Active Challenge</Badge>
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
          </div>
          
          <CardContent className="pt-6">
            <p className="mb-4">{description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center text-sm">
                <CalendarRange className="h-4 w-4 mr-2 text-primary" />
                <div>
                  <p className="font-medium">Challenge Period</p>
                  <p className="text-muted-foreground">
                    {format(new Date(startDate), 'MMM d')} - {format(new Date(endDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <div>
                  <p className="font-medium">Time Remaining</p>
                  <p className="text-muted-foreground">{timeRemaining()}</p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4">
            <Button className="gap-2" onClick={onSubmitClick}>
              <Upload className="h-4 w-4" />
              Submit Location
            </Button>
          </CardFooter>
        </Card>
        
        {/* Previous Winner */}
        {previousWinner && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Previous Winner
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pb-0">
              <AspectRatio ratio={4/3} className="rounded-md overflow-hidden bg-muted mb-4">
                <img 
                  src={previousWinner.image} 
                  alt={previousWinner.locationName} 
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
              
              <h4 className="font-medium mb-1">{previousWinner.locationName}</h4>
              <p className="text-sm text-muted-foreground mb-3">By {previousWinner.userName}</p>
              
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`/secret-corners/location/${previousWinner.id}`}>
                  <Map className="h-4 w-4 mr-2" />
                  View Location
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}