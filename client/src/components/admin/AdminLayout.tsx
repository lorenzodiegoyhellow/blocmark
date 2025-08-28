import { ReactNode } from "react";
import { 
  Users, 
  Map, 
  Calendar, 
  MessageSquare, 
  ClipboardList,
  Shield,
  Home,
  Sparkles,
  FileText,
  Compass,
  Mail
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  // Check if a path is active
  const isActive = (path: string) => {
    return location === path;
  };

  // Get the active tab from the current location
  const getActiveTab = () => {
    if (location === "/admin/security") return "security";
    if (location.includes("/admin")) return "dashboard";
    return "";
  };
  
  return (
    <div className="w-full min-h-screen bg-gray-50/30">
      <div className="container mx-auto py-6 px-4 max-w-full">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{title}</h1>
              {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
            </div>
            <Button asChild variant="outline" size="sm" className="whitespace-nowrap">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Return to Site
              </Link>
            </Button>
          </div>

        <div className="flex flex-wrap gap-2 border-b pb-3">
          <Button 
            asChild 
            variant={isActive("/admin") ? "default" : "ghost"} 
            size="sm"
            className="gap-1 whitespace-nowrap"
          >
            <Link href="/admin">
              <Users className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          <Button 
            asChild 
            variant={isActive("/admin/security") ? "default" : "ghost"} 
            size="sm" 
            className="gap-1 whitespace-nowrap"
          >
            <Link href="/admin/security">
              <Shield className="h-4 w-4" />
              Security
            </Link>
          </Button>

          <Button 
            asChild 
            variant={isActive("/admin/emails") ? "default" : "ghost"} 
            size="sm" 
            className="gap-1 whitespace-nowrap"
          >
            <Link href="/admin/emails">
              <Mail className="h-4 w-4" />
              Emails
            </Link>
          </Button>
        </div>

          <div className="w-full overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}