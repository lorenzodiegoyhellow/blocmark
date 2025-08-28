import { AppLayout } from "@/components/layout/app-layout";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Home, 
  Camera, 
  User, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  Heart, 
  Search, 
  Building, 
  BookOpen,
  Info,
  FileText,
  Award,
  Shield,
  Users,
  LineChart,
  Map,
  BookMarked,
  LayoutGrid,
  ArrowRight,
  Briefcase
} from "lucide-react";

// Define sitemap sections
const sitemapSections = [
  {
    title: "Main",
    links: [
      { name: "Home", path: "/", icon: <Home className="h-4 w-4" /> },
      { name: "Search", path: "/search", icon: <Search className="h-4 w-4" /> },
      { name: "Host Dashboard", path: "/listings", icon: <Building className="h-4 w-4" /> },
      { name: "Become a Host", path: "/host", icon: <Building className="h-4 w-4" /> },
    ]
  },
  {
    title: "Account",
    links: [
      { name: "Login / Sign Up", path: "/auth", icon: <User className="h-4 w-4" /> },
      { name: "Dashboard", path: "/dashboard", icon: <LayoutGrid className="h-4 w-4" /> },
      { name: "Messages", path: "/messages", icon: <MessageSquare className="h-4 w-4" /> },
      { name: "Saved Locations", path: "/saved-locations", icon: <Heart className="h-4 w-4" /> },
      { name: "Account Settings", path: "/account-settings", icon: <Settings className="h-4 w-4" /> },
    ]
  },
  {
    title: "Hosting",
    links: [
      { name: "My Listings", path: "/listings", icon: <Building className="h-4 w-4" /> },
      { name: "Add New Listing", path: "/add-listing", icon: <Building className="h-4 w-4" /> },
      { name: "Host Landing Page", path: "/host", icon: <Building className="h-4 w-4" /> },
    ]
  },
  {
    title: "Company",
    links: [
      { name: "About Us", path: "/about", icon: <Info className="h-4 w-4" /> },
      { name: "Blog", path: "/blog", icon: <FileText className="h-4 w-4" /> },
      { name: "Guides", path: "/guides", icon: <BookMarked className="h-4 w-4" /> },
    ]
  },
  {
    title: "Support",
    links: [
      { name: "FAQ", path: "/faq", icon: <HelpCircle className="h-4 w-4" /> },
      { name: "Community", path: "/community", icon: <Users className="h-4 w-4" /> },
      { name: "Guidelines", path: "/guidelines", icon: <BookOpen className="h-4 w-4" /> },
      { name: "Trust & Safety", path: "/trust-safety", icon: <Shield className="h-4 w-4" /> },
      { name: "Help & Support", path: "/help-support", icon: <HelpCircle className="h-4 w-4" /> },
    ]
  },
  {
    title: "Legal",
    links: [
      { name: "Terms & Conditions", path: "/terms", icon: <FileText className="h-4 w-4" /> },
      { name: "Privacy Policy", path: "/privacy", icon: <Shield className="h-4 w-4" /> },
      { name: "Accessibility", path: "/accessibility", icon: <Users className="h-4 w-4" /> },
    ]
  },
  {
    title: "Activities",
    links: [
      { name: "Photo Shoot", path: "/search?activity=photo-shoot", icon: <Camera className="h-4 w-4" /> },
      { name: "Filming", path: "/search?activity=filming", icon: <Camera className="h-4 w-4" /> },
      { name: "Events", path: "/search?activity=events", icon: <Users className="h-4 w-4" /> },
      { name: "Meetings", path: "/search?activity=meetings", icon: <Users className="h-4 w-4" /> },
      { name: "Production", path: "/search?activity=production", icon: <Camera className="h-4 w-4" /> },
    ]
  },
  {
    title: "Space Types",
    links: [
      { name: "Photo Studio", path: "/search?type=photo-studio", icon: <Camera className="h-4 w-4" /> },
      { name: "Film Studio", path: "/search?type=film-studio", icon: <Camera className="h-4 w-4" /> },
      { name: "Event Space", path: "/search?type=event-space", icon: <Users className="h-4 w-4" /> },
      { name: "Office Space", path: "/search?type=office", icon: <Building className="h-4 w-4" /> },
      { name: "Warehouse", path: "/search?type=warehouse", icon: <Building className="h-4 w-4" /> },
    ]
  },
  {
    title: "Cities",
    links: [
      { name: "Los Angeles", path: "/search?city=los-angeles", icon: <Map className="h-4 w-4" /> },
      { name: "New York", path: "/search?city=new-york", icon: <Map className="h-4 w-4" /> },
      { name: "Miami", path: "/search?city=miami", icon: <Map className="h-4 w-4" /> },
      { name: "Chicago", path: "/search?city=chicago", icon: <Map className="h-4 w-4" /> },
      { name: "View All Cities", path: "/search", icon: <Map className="h-4 w-4" /> },
    ]
  }
];

// Briefcase icon is now imported from lucide-react

export default function SitemapPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <h1 className="text-4xl font-bold mb-6">Sitemap</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Find all the pages and resources available on Blocmark in one place.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {sitemapSections.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                {section.title}
              </h2>
              <Separator className="mb-4" />
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.path} className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                      <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-card p-8 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4">Can't find what you're looking for?</h2>
          <p className="text-muted-foreground mb-6">
            If you're having trouble finding a specific page or resource, our support team is here to help.
          </p>
          <Link href="/help-support">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center">
              Contact Support
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}