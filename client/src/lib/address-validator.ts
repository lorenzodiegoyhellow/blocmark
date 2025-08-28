import { apiRequest } from "./queryClient";

const US_STATES = {
  "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
  "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
  "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
  "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
  "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
  "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
  "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
  "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
  "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
  "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
  "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
  "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
  "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia"
};

export function validateAddress(addressData: {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}): {
  isValid: boolean;
  formattedAddress: string;
  message?: string;
} {
  console.log("Starting address validation for:", addressData);
  const errors: string[] = [];

  // Basic street address validation
  const streetAddress = addressData.streetAddress.trim();
  if (!streetAddress) {
    errors.push("Street address is required");
  } else if (!/\d+/.test(streetAddress)) {
    errors.push("Street address must include a number");
  }

  // City validation
  const city = addressData.city.trim();
  if (!city) {
    errors.push("City is required");
  } else if (!/^[A-Za-z\s]+$/.test(city)) {
    errors.push("City name can only contain letters and spaces");
  }

  // State validation
  const state = addressData.state.trim().toUpperCase();
  if (!state) {
    errors.push("State is required");
  } else if (!Object.keys(US_STATES).includes(state) && 
             !Object.values(US_STATES).map(s => s.toUpperCase()).includes(state)) {
    errors.push("Invalid state. Please use a valid state code (e.g., CA) or full name");
  }

  // ZIP code validation
  const zipCode = addressData.zipCode.trim();
  if (!zipCode) {
    errors.push("ZIP code is required");
  } else if (!/^\d{5}$/.test(zipCode)) {
    errors.push("ZIP code must be exactly 5 digits");
  }

  console.log("Validation errors:", errors);

  if (errors.length > 0) {
    return {
      isValid: false,
      formattedAddress: "",
      message: errors.join(". ")
    };
  }

  // Format the address
  const formattedState = Object.keys(US_STATES).includes(state) ? state : 
    Object.entries(US_STATES).find(([_, name]) => name.toUpperCase() === state)?.[0] || state;

  const formattedAddress = `${streetAddress}, ${city}, ${formattedState} ${zipCode}`;
  console.log("Validation successful, formatted address:", formattedAddress);

  return {
    isValid: true,
    formattedAddress,
    message: "Address verified"
  };
}