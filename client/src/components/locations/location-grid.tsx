import { Location } from "@shared/schema";
import { LocationCard } from "./location-card";

interface LocationGridProps {
  locations: Location[];
  horizontalLayout?: boolean;
}

export function LocationGrid({ locations, horizontalLayout = false }: LocationGridProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((location) => (
        <LocationCard 
          key={location.id} 
          location={location} 
          horizontalLayout={horizontalLayout}
        />
      ))}
    </div>
  );
}
