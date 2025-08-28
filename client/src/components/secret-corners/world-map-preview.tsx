import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Eye, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Location {
  id: string;
  name: string;
  region: string;
  type: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  image: string;
  coordinates: string;
  description: string;
  lat: number;
  lng: number;
}

const secretLocations: Location[] = [
  {
    id: "waterfall-pnw",
    name: "Hidden Waterfall",
    region: "Pacific Northwest",
    type: "Waterfall",
    difficulty: "Moderate",
    image: "./attached_assets/6I4B5772.jpg",
    coordinates: "47.6062° N, 122.3321° W",
    description: "A stunning cascading waterfall hidden deep in the old-growth forest, accessible only by a secret trail known to locals.",
    lat: 47.6062,
    lng: -122.3321
  },
  {
    id: "secret-beach",
    name: "Secret Beach",
    region: "California Coast",
    type: "Coastal",
    difficulty: "Easy",
    image: "./attached_assets/vault2698-2.jpg",
    coordinates: "36.5621° N, 121.9231° W",
    description: "An untouched beach cove with dramatic rock formations, hidden from the main coastal highway.",
    lat: 36.5621,
    lng: -121.9231
  },
  {
    id: "mountain-vista",
    name: "Mountain Vista",
    region: "Rocky Mountains",
    type: "Mountain",
    difficulty: "Challenging",
    image: "./attached_assets/3.jpg",
    coordinates: "39.7391° N, 105.4148° W",
    description: "A breathtaking overlook offering 360-degree views of snow-capped peaks, reached by an unmarked alpine route.",
    lat: 39.7391,
    lng: -105.4148
  },
  {
    id: "urban-rooftop",
    name: "Urban Rooftop",
    region: "Downtown LA",
    type: "Urban",
    difficulty: "Easy",
    image: "./attached_assets/hotel27112.jpg",
    coordinates: "34.0522° N, 118.2437° W",
    description: "A forgotten rooftop garden with city views, accessible through a hidden entrance in an old building.",
    lat: 34.0522,
    lng: -118.2437
  },
  {
    id: "desert-oasis",
    name: "Desert Oasis",
    region: "Mojave Desert",
    type: "Desert",
    difficulty: "Moderate",
    image: "./attached_assets/1.jpg",
    coordinates: "35.0178° N, 115.4867° W",
    description: "A hidden spring surrounded by palm trees in the heart of the desert, a true natural miracle.",
    lat: 35.0178,
    lng: -115.4867
  },
  {
    id: "forest-cathedral",
    name: "Forest Cathedral",
    region: "Redwood Forest",
    type: "Forest",
    difficulty: "Easy",
    image: "./attached_assets/victorian28972.jpg",
    coordinates: "41.2132° N, 124.0046° W",
    description: "A circular grove of ancient redwoods creating a natural cathedral with ethereal lighting.",
    lat: 41.2132,
    lng: -124.0046
  },
  {
    id: "alpine-lake",
    name: "Alpine Lake",
    region: "Canadian Rockies",
    type: "Lake",
    difficulty: "Challenging",
    image: "./attached_assets/6I4B6500.jpg",
    coordinates: "51.1784° N, 115.5708° W",
    description: "A pristine glacial lake with turquoise waters, accessible only by a challenging backcountry hike.",
    lat: 51.1784,
    lng: -115.5708
  },
  {
    id: "coastal-cave",
    name: "Coastal Cave",
    region: "Oregon Coast",
    type: "Cave",
    difficulty: "Moderate",
    image: "./attached_assets/diana-cabezas-Ln9YUs7J93Q-unsplash_1753153627479.jpg",
    coordinates: "44.9778° N, 124.0593° W",
    description: "A sea cave with bioluminescent pools that glow at night, accessible only during low tide.",
    lat: 44.9778,
    lng: -124.0593
  }
];

// Create custom marker icon
const createCustomIcon = () => {
  return new L.DivIcon({
    html: `
      <div class="relative">
        <div class="absolute inset-0 w-6 h-6 bg-primary/30 rounded-full animate-ping opacity-75"></div>
        <div class="relative w-4 h-4 bg-primary border-2 border-white rounded-full shadow-lg hover:scale-110 transition-transform"></div>
      </div>
    `,
    className: 'custom-secret-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Custom marker component
function CustomMarker({ location, onClick }: { location: Location; onClick: () => void }) {
  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={createCustomIcon()}
      eventHandlers={{
        click: onClick
      }}
    >
      <Popup>
        <div className="text-center">
          <h3 className="font-bold text-sm">{location.name}</h3>
          <p className="text-xs text-muted-foreground">{location.region}</p>
          <p className="text-xs mt-1">Click marker for details</p>
        </div>
      </Popup>
    </Marker>
  );
}

export function WorldMapPreview() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Fix Leaflet default markers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return <div className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/20 flex items-center justify-center">
      <div className="text-center">Loading map...</div>
    </div>;
  }

  return (
    <div className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Preview Our Secret Locations</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-8">
            Explore hidden gems around the world. Click on the dots to preview exclusive locations available to our members.
          </p>
        </motion.div>

        {/* Interactive World Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Real World Map Container */}
          <div className="relative w-full max-w-6xl mx-auto h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-border">
            <MapContainer
              center={[39.8283, -98.5795]} // Center of North America
              zoom={3}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
              scrollWheelZoom={true}
              dragging={true}
              touchZoom={true}
              doubleClickZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {secretLocations.map((location) => (
                <CustomMarker
                  key={location.id}
                  location={location}
                  onClick={() => setSelectedLocation(location)}
                />
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center items-center gap-6 mt-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <span>Secret Location</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Click to preview</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Drag to explore</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Location Detail Modal */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLocation(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="relative">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={selectedLocation.image}
                    alt={selectedLocation.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  {/* Type badge */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-black/30 text-white backdrop-blur-sm">
                      {selectedLocation.type}
                    </Badge>
                  </div>
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-2xl font-bold mb-1">{selectedLocation.name}</h3>
                    <div className="flex items-center text-white/80">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedLocation.region}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {selectedLocation.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Difficulty</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedLocation.difficulty === 'Easy' ? 'bg-green-500' :
                          selectedLocation.difficulty === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm text-muted-foreground">{selectedLocation.difficulty}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Coordinates</h4>
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-mono">
                          Access Required
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Members only location
                    </div>
                    <Button variant="outline" size="sm">
                      Apply for Access
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}