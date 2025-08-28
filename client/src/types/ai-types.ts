export type LocationRecommendation = {
  type: string;
  features: string[];
  priceRange: { min: number; max: number };
  description: string;
  suitability: number;
  idealFor: string[];
  nearbyAmenities: string[];
  bestTimeToBook: string[];
  photographyTips?: string[];
};

export type AISearchResults = {
  matches: LocationRecommendation[];
  userPreferences: {
    budget: { min: number; max: number };
    style: string[];
    requirements: string[];
  };
};

export type PersonalizedRecommendations = {
  recommendations: LocationRecommendation[];
  explanation: string;
};