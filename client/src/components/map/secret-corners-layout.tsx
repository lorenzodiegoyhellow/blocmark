import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { MainNav } from "@/components/navigation/main-nav";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PlusCircle, User, UserCircle, CircleUser, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/user/notification-dropdown";
import { UserMenu } from "@/components/user/user-menu";
import { Helmet } from "react-helmet";

type Props = {
  children: ReactNode;
};

export function SecretCornersLayout({ children }: Props) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll event listener to track scrolling
  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places"></script>
      </Helmet>
      <header 
        className="sticky top-0 z-50 border-b bg-background"
      >
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="text-xl sm:text-2xl font-bold transition-colors hover:text-primary"
          >
            Blocmark
          </Link>
          <div className="hidden sm:flex-1 sm:flex justify-center">
            {user && <MainNav scrolled={scrolled} />}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <div className="z-[100]">
                  <NotificationDropdown />
                </div>
                {/* Apply increased z-index to UserMenu to ensure it appears above the map */}
                <div className="z-[100]">
                  <UserMenu scrolled={scrolled} />
                </div>
              </>
            ) : (
              <>
                <Link href="/host">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="sm:mr-2 hidden sm:flex"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> List Your Space
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="sm:hidden"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    size="sm" 
                    className="p-2 rounded-full aspect-square transition-all duration-200 hover:scale-110 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
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

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}