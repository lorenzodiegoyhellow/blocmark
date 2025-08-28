import React from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useTranslation, 
  languageOptions, 
  type Region,
  type Language,
  type RegionLanguage 
} from "@/hooks/use-translation";

interface LanguageDropdownProps {
  scrolled?: boolean;
  className?: string;
  isHomePage?: boolean;
}

export function LanguageDropdown({ scrolled, className, isHomePage = false }: LanguageDropdownProps) {
  const { 
    currentLanguage, 
    currentRegion, 
    setLanguageRegion, 
    t, 
    getCurrentLanguageOption 
  } = useTranslation();

  const currentOption = getCurrentLanguageOption();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn(
            "relative",
            // Only use white text on homepage when not scrolled (transparent header)
            isHomePage && scrolled === false ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100",
            className
          )}
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          {currentOption.flagEmoji && <span>{currentOption.flagEmoji}</span>}
          <span>{currentOption.displayName}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          {languageOptions.map((option) => (
            <LanguageOption 
              key={`${option.region}-${option.language}`}
              option={option}
              isActive={currentLanguage === option.language && currentRegion === option.region}
              onSelect={() => setLanguageRegion(option.language, option.region)}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface LanguageOptionProps {
  option: RegionLanguage;
  isActive: boolean;
  onSelect: () => void;
}

function LanguageOption({ option, isActive, onSelect }: LanguageOptionProps) {
  return (
    <DropdownMenuItem 
      className={cn(
        "flex items-center gap-2", 
        isActive && "bg-muted font-medium"
      )}
      onClick={onSelect}
    >
      {option.flagEmoji && <span>{option.flagEmoji}</span>}
      <span className="flex-1">{option.displayName}</span>
    </DropdownMenuItem>
  );
}