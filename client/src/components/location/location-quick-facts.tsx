import React from 'react';
import { Clock, Users, LayoutPanelTop } from 'lucide-react';
import { Location } from '@shared/schema';
import { Separator } from '@/components/ui/separator';

interface LocationQuickFactsProps {
  location: Location;
}

interface QuickFactProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

function QuickFact({ icon, title, value }: QuickFactProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 rounded-full p-3">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function LocationQuickFacts({ location }: LocationQuickFactsProps) {
  return (
    <div className="w-full space-y-6">
      {/* Quick Facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        <QuickFact 
          icon={<Clock className="h-5 w-5 text-primary" />} 
          title="Min booking length" 
          value={`${location.minHours || 1} hr minimum`} 
        />
        <QuickFact 
          icon={<LayoutPanelTop className="h-5 w-5 text-primary" />} 
          title="Square footage" 
          value={`${location.size} sq/ft`} 
        />
      </div>
      
      <Separator />
    </div>
  );
}