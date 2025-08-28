import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { translations as appTranslations, defaultTranslations } from "@/lib/translations";
import type { TranslationKey } from "@/lib/translations";

export type Region = "europe" | "americas" | "asia-pacific";
export type Language = "en" | "de" | "es" | "fr" | "zh" | "ja";

export type RegionLanguage = {
  region: Region;
  language: Language;
  displayName: string;
  countryName: string;
  flagEmoji?: string;
};

// Available language options grouped by region
export const languageOptions: Record<Region, RegionLanguage[]> = {
  europe: [
    { region: "europe", language: "en", displayName: "English", countryName: "United Kingdom", flagEmoji: "🇬🇧" },
    { region: "europe", language: "de", displayName: "Deutsch", countryName: "Deutschland", flagEmoji: "🇩🇪" },
    { region: "europe", language: "es", displayName: "Español", countryName: "España", flagEmoji: "🇪🇸" },
    { region: "europe", language: "fr", displayName: "Français", countryName: "France", flagEmoji: "🇫🇷" },
  ],
  americas: [
    { region: "americas", language: "en", displayName: "English", countryName: "United States", flagEmoji: "🇺🇸" },
    { region: "americas", language: "es", displayName: "Español", countryName: "México", flagEmoji: "🇲🇽" },
  ],
  "asia-pacific": [
    { region: "asia-pacific", language: "en", displayName: "English", countryName: "Australia", flagEmoji: "🇦🇺" },
    { region: "asia-pacific", language: "zh", displayName: "中文", countryName: "中国", flagEmoji: "🇨🇳" },
    { region: "asia-pacific", language: "ja", displayName: "日本語", countryName: "日本", flagEmoji: "🇯🇵" },
  ],
};

// Flatten language options for easier lookup
export const allLanguageOptions = Object.values(languageOptions).flat();

type LanguageContextType = {
  currentLanguage: Language;
  currentRegion: Region;
  setLanguageRegion: (lang: Language, region: Region) => void;
  t: (key: TranslationKey) => string; // translation function
  getCurrentLanguageOption: () => RegionLanguage;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

// Browser language detection helper
function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = Object.keys(appTranslations) as Language[];
  
  return supportedLanguages.includes(browserLang as Language) 
    ? browserLang as Language 
    : 'en'; // Default to English
}

// Detect user's region based on browser locale
function detectUserRegion(): Region {
  const locale = navigator.language.toLowerCase();
  
  // European locales
  if (locale.includes('gb') || locale.includes('de') || locale.includes('es') || 
      locale.includes('fr') || locale.includes('it') || locale.includes('nl')) {
    return 'europe';
  }
  
  // Asian-Pacific locales
  if (locale.includes('cn') || locale.includes('jp') || locale.includes('kr') || 
      locale.includes('au') || locale.includes('nz') || locale.includes('sg')) {
    return 'asia-pacific';
  }
  
  // Default to Americas (includes US, CA, MX, BR)
  return 'americas';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or browser settings
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('preferredLanguage') as Language;
    return savedLang || detectBrowserLanguage();
  });
  
  const [currentRegion, setCurrentRegion] = useState<Region>(() => {
    const savedRegion = localStorage.getItem('preferredRegion') as Region;
    return savedRegion || detectUserRegion();
  });

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('preferredLanguage', currentLanguage);
    localStorage.setItem('preferredRegion', currentRegion);
    
    // Optional: Set HTML lang attribute for accessibility
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, currentRegion]);

  // Translation function
  const t = (key: TranslationKey): string => {
    return appTranslations[currentLanguage][key] || defaultTranslations[key] || key;
  };

  const setLanguageRegion = (lang: Language, region: Region) => {
    setCurrentLanguage(lang);
    setCurrentRegion(region);
  };

  const getCurrentLanguageOption = (): RegionLanguage => {
    // Find the language option that matches current settings
    return allLanguageOptions.find(
      option => option.language === currentLanguage && option.region === currentRegion
    ) || allLanguageOptions[0]; // Fallback to first option
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentRegion,
        setLanguageRegion,
        t,
        getCurrentLanguageOption,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}