import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { translations, defaultTranslations, TranslationKey } from "@/lib/translations";

export type Region = "europe" | "americas" | "asia-pacific";
export type Language = "en" | "it";

export type RegionLanguage = {
  region: Region;
  language: Language;
  displayName: string;
  countryName: string;
  flagEmoji?: string;
};

// Available language options - simplified to English and Italian only
export const languageOptions: RegionLanguage[] = [
  { region: "europe", language: "en", displayName: "English", countryName: "United Kingdom", flagEmoji: "🇬🇧" },
  { region: "europe", language: "it", displayName: "Italiano", countryName: "Italia", flagEmoji: "🇮🇹" },
];

// All language options (already flattened)
export const allLanguageOptions = languageOptions;

type TranslationContextType = {
  currentLanguage: Language;
  currentRegion: Region;
  setLanguageRegion: (lang: Language, region: Region) => void;
  t: (key: TranslationKey) => string; // typed translation function
  getCurrentLanguageOption: () => RegionLanguage;
};

// Browser language detection helper
function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0];
  return (browserLang as Language) || 'en'; // Default to English
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

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
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
    
    // Set HTML lang attribute for accessibility
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, currentRegion]);

  // Translation function
  const t = (key: TranslationKey): string => {
    return translations[currentLanguage]?.[key] || defaultTranslations[key] || key;
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
    <TranslationContext.Provider
      value={{
        currentLanguage,
        currentRegion,
        setLanguageRegion,
        t,
        getCurrentLanguageOption,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}