import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet icons
const FixLeafletIcons = () => {
  useEffect(() => {
    delete (Icon.Default.prototype as any)._getIconUrl;
    Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);
  return null;
};

type Location = {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  coords: LatLngExpression;
  comments: number;
  image: string;
};

interface SecretCornersMapProps {
  locations: Location[];
  center: LatLngExpression;
  zoom: number;
}

export function SecretCornersMap({ locations, center, zoom }: SecretCornersMapProps) {
  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden">
      <FixLeafletIcons />
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map(location => (
          <Marker 
            key={location.id} 
            position={location.coords}
          >
            <Popup>
              <div className="w-[250px]">
                <div className="w-full h-32 overflow-hidden rounded-t-md">
                  <img 
                    src={location.image} 
                    alt={location.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium">{location.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{location.location}</p>
                  <p className="text-xs mb-3">{location.description}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}