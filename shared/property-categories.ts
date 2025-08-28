// Shared property categories configuration used across the application
// This ensures consistency between listing creation and search filters

import { BiCamera, BiMoviePlay, BiStore, BiImage, BiHome, BiBuilding } from "react-icons/bi";
import { MdRestaurant, MdApartment, MdLocalHospital, MdFitnessCenter, MdDirectionsCar } from "react-icons/md";
import { FaWarehouse, FaChurch, FaHotel, FaSchool, FaPlane } from "react-icons/fa";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";

export interface PropertyCategory {
  id: string;
  name: string;
  mainCategory: string;
  subCategory: string;
  icon: IconType | LucideIcon;
}

// Map the property categories structure to match what's used in add-listing-page
export const propertyCategories = {
  Residential: [
    "Apartment",
    "Condo",
    "Farm",
    "House",
    "Loft",
    "Mansion or Estate",
    "Penthouse",
    "Pool",
    "Ranch"
  ],
  Commercial: [
    "Airport", "Bank", "Bar", "Barber Shop", "Brewery",
    "Cafe", "Cemetery", "Church", "Club", "Concert Venue", "Dance Studio",
    "Doctor's Office", "Dormitory", "Entertainment Venue", "Event Space",
    "Farm", "Gallery", "Hangar", "Hospital",
    "Hotel", "Industrial Buildings", "Museum", "Office", "Open Space",
    "Outdoor Venue", "Pool", "Private Dining Room",
    "Private Function Room", "Private Party Room", "Ranch", "Restaurant",
    "Retail", "Salon", "School", "Small Business", "Spa",
    "Temple", "Theater", "University", "Warehouse", "Winery"
  ],
  Sports: [
    "Basketball Court",
    "Fitness Studio",
    "Gym",
    "Pickleball Court",
    "Sports Venue",
    "Tennis Court"
  ],
  Studio: [
    "Film Studio", "Loft Studio", "Photography Studio", "Recording Studio",
    "Stage Studio", "TV Studio"
  ],
  Transportation: [
    "Aviation", "Boat", "Bus", "Car", "Motorcycle", "RV", "Train",
    "Truck", "Van"
  ]
};

// Icon mapping for main categories and some popular subcategories
export const propertyIcons: { [key: string]: IconType | LucideIcon } = {
  // Main categories
  "Residential": BiHome,
  "Commercial": BiBuilding,
  "Sports": MdFitnessCenter,
  "Studio": BiCamera,
  "Transportation": MdDirectionsCar,
  
  // Popular subcategories
  "Photography Studio": BiCamera,
  "Film Studio": BiMoviePlay,
  "Warehouse": FaWarehouse,
  "Gallery": BiImage,
  "Restaurant": MdRestaurant,
  "Mansion or Estate": BiBuilding,
  "House": BiHome,
  "Apartment": MdApartment,
  "Hospital": MdLocalHospital,
  "Hotel": FaHotel,
  "Church": FaChurch,
  "School": FaSchool,
  "Airport": FaPlane,
  "Office": BiBuilding,
  "Event Space": BiBuilding,
  "Gym": MdFitnessCenter,
  "Fitness Studio": MdFitnessCenter,
};

// Convert property categories to filter format
export function getPropertyFilters(): PropertyCategory[] {
  const filters: PropertyCategory[] = [];
  
  // Add most popular property types first for better UX
  const popularTypes = [
    { main: "Studio", sub: "Photography Studio" },
    { main: "Studio", sub: "Film Studio" },
    { main: "Commercial", sub: "Warehouse" },
    { main: "Commercial", sub: "Gallery" },
    { main: "Commercial", sub: "Restaurant" },
    { main: "Residential", sub: "Mansion or Estate" },
    { main: "Residential", sub: "House" },
    { main: "Residential", sub: "Apartment" },
    { main: "Commercial", sub: "Event Space" },
    { main: "Commercial", sub: "Office" },
    { main: "Sports", sub: "Gym" },
    { main: "Sports", sub: "Fitness Studio" },
  ];
  
  // Add popular types first
  popularTypes.forEach(({ main, sub }) => {
    const id = sub.toLowerCase().replace(/\s+/g, '-');
    const icon = propertyIcons[sub] || propertyIcons[main] || BiBuilding;
    
    filters.push({
      id,
      name: sub,
      mainCategory: main,
      subCategory: sub,
      icon
    });
  });
  
  return filters;
}

// Get icon for a property type
export function getPropertyIcon(mainCategory: string, subCategory?: string): IconType | LucideIcon {
  // Try subcategory first, then main category, then default
  if (subCategory && propertyIcons[subCategory]) {
    return propertyIcons[subCategory];
  }
  return propertyIcons[mainCategory] || BiBuilding;
}