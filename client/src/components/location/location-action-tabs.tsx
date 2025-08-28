import React from 'react';
import { PenSquare, PartyPopper, Play, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LocationActionTabsProps {
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export function LocationActionTabs({ 
  selectedTab = 'create', 
  onTabChange,
  className = ''
}: LocationActionTabsProps) {
  // Define tabs with their icons and labels
  const tabs = [
    {
      id: 'create',
      icon: <PenSquare className="h-5 w-5" />,
      label: 'Create'
    },
    {
      id: 'celebrate',
      icon: <PartyPopper className="h-5 w-5" />,
      label: 'Celebrate'
    },
    {
      id: 'play',
      icon: <Play className="h-5 w-5" />,
      label: 'Play'
    },
    {
      id: 'meet',
      icon: <Users className="h-5 w-5" />,
      label: 'Meet'
    }
  ];

  return (
    <div className={`bg-card rounded-full shadow-sm flex ${className}`}>
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={selectedTab === tab.id ? "default" : "ghost"}
          className={`flex-1 gap-2 rounded-full transition-all ${
            selectedTab === tab.id 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-transparent"
          }`}
          onClick={() => onTabChange && onTabChange(tab.id)}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </Button>
      ))}
    </div>
  );
}