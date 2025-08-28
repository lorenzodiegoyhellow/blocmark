import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { UserMenu } from "@/components/user/user-menu";
import { MainNav } from "@/components/navigation/main-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PlusCircle, User, UserCircle, CircleUser, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/user/notification-dropdown";
import { LanguageDropdown } from "@/components/user/language-dropdown";
import { useTranslation } from "@/hooks/use-translation";

type Props = {
  children: ReactNode;
};

export function AppLayout({ children }: Props) {
  const { user } = useAuth();
  const [location] = useLocation();
  const isHomePage = location === "/";
  const isMessagesPage = location === "/messages";
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  // Add scroll event listener to track scrolling
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  return (
    <div className={cn("flex flex-col bg-white m-0 p-0", isMessagesPage ? "h-screen overflow-hidden" : "min-h-screen")}>
      <header 
        className={cn(
          "z-50 transition-all duration-300 w-full m-0 p-0",
          isMessagesPage ? "border-b bg-white flex-shrink-0" : "sticky top-0",
          !isHomePage && !isMessagesPage && "border-b bg-white",
          isHomePage && !scrolled && "bg-transparent border-transparent",
          isHomePage && scrolled && "bg-white/95 backdrop-blur-sm border-b shadow-sm"
        )}
      >
        <div className="w-full py-2 sm:py-3 flex items-center">
          <div className="w-1/4 flex justify-start">
            <Link 
              href="/" 
              className="pl-4 flex items-center"
            >
              <div className="relative h-14 sm:h-16 flex-shrink-0">
                <img 
                  src="/assets/blocmark-logo.png" 
                  alt="Blocmark Logo" 
                  className={cn(
                    "h-full w-auto object-contain transition-opacity", /* Logo maintains aspect ratio */
                    isHomePage && !scrolled ? "hover:opacity-80" : "hover:opacity-90"
                  )}
                  style={{ maxWidth: 'none' }} /* Prevent width constraints */
                />
              </div>
            </Link>
          </div>
          <div className="w-2/4 flex justify-center items-center">
            {user && <MainNav scrolled={scrolled} />}
          </div>
          <div className="w-1/4 flex justify-end items-center gap-2 sm:gap-4 pr-4">
            {/* Language Dropdown - Always visible regardless of auth state */}
            <LanguageDropdown scrolled={scrolled} isHomePage={isHomePage} />
            
            {user ? (
              <>
                <NotificationDropdown className={isHomePage && !scrolled ? "text-white hover:bg-white/10" : ""} />
                <UserMenu scrolled={scrolled} />
              </>
            ) : (
              <>
                <Link href="/host">
                  <Button 
                    variant={isHomePage && !scrolled ? "secondary" : "outline"} 
                    size="sm"
                    className="sm:mr-2 hidden sm:flex"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> {t("listing.addListing")}
                  </Button>
                  <Button 
                    variant={isHomePage && !scrolled ? "secondary" : "outline"}
                    size="sm"
                    className="sm:hidden"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    size="sm" 
                    className={cn(
                      "p-2 rounded-full aspect-square transition-all duration-200 hover:scale-110",
                      isHomePage && !scrolled ? "bg-white/20 hover:bg-white/30 text-white border-white/30" : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                    )}
                    variant="outline"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={cn("bg-white", isMessagesPage ? "flex-1 overflow-hidden" : "flex-1 pb-16 md:pb-0")}>{children}</main>

      {!isMessagesPage && <Footer className="bg-white" />}
      
      {user && !isMessagesPage && <MobileNav />}
    </div>
  );
}