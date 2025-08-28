import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  isVerified?: boolean;
  className?: string;
  badgeClassName?: string;
  badgeSize?: "sm" | "md" | "lg";
}

export function VerifiedAvatar({
  src,
  alt,
  fallback,
  isVerified = false,
  className,
  badgeClassName,
  badgeSize = "md"
}: VerifiedAvatarProps) {
  const badgeSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  const badgeContainerSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <div className="relative inline-block">
      <Avatar className={className}>
        {src ? (
          <AvatarImage src={src} alt={alt} className="object-cover" />
        ) : null}
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      
      {isVerified && (
        <div 
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full bg-blue-500 p-0.5 flex items-center justify-center",
            badgeContainerSizes[badgeSize],
            badgeClassName
          )}
        >
          <ShieldCheck className={cn("text-white", badgeSizes[badgeSize])} />
        </div>
      )}
    </div>
  );
}