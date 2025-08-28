import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, MapPin, ThumbsUp } from 'lucide-react';

interface Contributor {
  id: number;
  name: string;
  image?: string;
  approvedLocations: number;
  likesReceived: number;
  badges: string[];
  rank: number;
}

interface TopContributorsProps {
  contributors: Contributor[];
  period?: "weekly" | "monthly" | "all-time";
  onUserClick?: (userId: number) => void;
}

export function TopContributors({ 
  contributors = [], 
  period = "monthly", 
  onUserClick 
}: Partial<TopContributorsProps>) {
  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "Top Explorer":
        return "default";
      case "Local Guide":
        return "secondary";
      case "Photo Master":
        return "destructive";
      default:
        return "outline";
    }
  };
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-700" />;
      default:
        return null;
    }
  };
  
  const getContributorRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-yellow-500 bg-yellow-50";
      case 2:
        return "border-gray-400 bg-gray-50";
      case 3:
        return "border-amber-700 bg-amber-50";
      default:
        return "border-transparent";
    }
  };
  
  return (
    <div className="py-6">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Top Contributors</h2>
          <p className="text-muted-foreground">
            {period === "weekly" ? "This Week's" : 
             period === "monthly" ? "This Month's" : "All-Time"} most active community members
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {contributors.map((contributor) => (
              <div 
                key={contributor.id}
                className={`flex items-center p-3 rounded-lg border ${getContributorRankClass(contributor.rank)} relative cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => onUserClick?.(contributor.id)}
              >
                {contributor.rank <= 3 && (
                  <div className="absolute -top-1 -left-1 h-6 w-6 rounded-full flex items-center justify-center bg-white shadow">
                    {getRankIcon(contributor.rank)}
                  </div>
                )}
                
                <div className="flex-shrink-0 mr-4">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={contributor.image} />
                    <AvatarFallback>{contributor.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{contributor.name}</h3>
                    {contributor.rank > 3 && (
                      <span className="text-sm text-muted-foreground">#{contributor.rank}</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contributor.badges.map((badge, i) => (
                      <Badge key={i} variant={getBadgeVariant(badge)} className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right ml-2">
                  <div className="flex items-center justify-end gap-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-sm font-medium mb-1">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {contributor.approvedLocations}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                        {contributor.likesReceived}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}