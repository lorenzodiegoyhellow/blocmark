import { Link, useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { SiInstagram, SiFacebook } from "react-icons/si";
import { ArrowRight, Check, Globe, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation, Region, Language, allLanguageOptions } from "@/hooks/use-translation";

const socialLinks = [
  { icon: <SiFacebook className="w-5 h-5" />, href: "https://www.facebook.com/blocmarkhq", label: "Facebook" },
  { icon: <SiInstagram className="w-5 h-5" />, href: "https://www.instagram.com/blocmarkhq/", label: "Instagram" },
];

function LanguageSelector() {
  const { currentLanguage, currentRegion, setLanguageRegion, getCurrentLanguageOption } = useTranslation();
  const [open, setOpen] = useState(false);
  
  // Create a unique ID for each language option based on language and region
  const getOptionId = (language: Language, region: Region) => `${language}:${region}`;
  
  // Current selected option ID
  const selectedOptionId = getOptionId(currentLanguage, currentRegion);
  
  // Current language option for display
  const currentOption = getCurrentLanguageOption();
  
  const handleLanguageChange = (value: string) => {
    // Parse the selected value to get language and region
    const [language, region] = value.split(':') as [Language, Region];
    // Update language context
    setLanguageRegion(language, region);
    // Close dialog
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-700 transition-colors">
          <Globe className="w-4 h-4" />
          <span>{currentOption.displayName}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a language</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedOptionId}
            onValueChange={handleLanguageChange}
            className="grid gap-4 grid-cols-1 sm:grid-cols-2"
          >
            {allLanguageOptions.map((option) => {
              const optionId = getOptionId(option.language, option.region);
              return (
                <div key={optionId} className="flex items-center space-x-2">
                  <RadioGroupItem value={optionId} id={optionId} />
                  <Label 
                    htmlFor={optionId} 
                    className="flex items-center cursor-pointer text-sm font-medium py-1.5 pl-2"
                  >
                    <span className="mr-2">{option.flagEmoji}</span>
                    <div>
                      <div>{option.displayName}</div>
                      <div className="text-xs text-muted-foreground">{option.countryName}</div>
                    </div>
                    {selectedOptionId === optionId && (
                      <Check className="ml-auto h-4 w-4 text-gray-600" />
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function Footer({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const isHomePage = location === "/";
  const isLocationDetailsPage = location.startsWith("/locations/");
  const showDetailedFooter = isHomePage || isLocationDetailsPage;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would integrate with a newsletter service
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  // Render a detailed footer for the home page and location details pages, and a minimal footer for other pages
  if (showDetailedFooter) {
    return (
      <footer className={`border-t bg-white ${className || ''}`}>
        <div className="container mx-auto px-4 py-16">
          {/* Top section with logo and newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            <div className="space-y-6">
              <Link href="/">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-800">Blocmark</span>
                </div>
              </Link>
              <p className="text-muted-foreground max-w-md">
                {t("footer.description")}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Los Angeles, CA</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  <a href="mailto:info@blocmark.com" className="hover:text-gray-700">info@blocmark.com</a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t("footer.stayUpdated")}</h3>
              <p className="text-muted-foreground">
                {t("footer.newsletterDesc")}
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder={t("footer.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="sm:w-64"
                  required
                />
                <Button type="submit" className="shrink-0">
                  {subscribed ? t("footer.subscribed") : t("footer.subscribe")}
                  {!subscribed && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>

          {/* Main footer content */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 gap-y-10">
            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">{t("footer.company")}</h3>
              <ul className="space-y-2.5">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.about")}</Link></li>
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.blog")}</Link></li>
                <li><Link href="/guides" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.guides")}</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">{t("footer.support")}</h3>
              <ul className="space-y-2.5">
                <li><Link href="/help-support" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">Help & Support</Link></li>
                <li><Link href="/host" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.listSpace")}</Link></li>
                <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.faq")}</Link></li>
                <li><Link href="/guidelines" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.guidelines")}</Link></li>
              </ul>
            </div>

            {/* Activities */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">{t("footer.activities")}</h3>
              <ul className="space-y-2.5">
                <li><Link href="/search?activity=photo-shoot" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.photoShoot")}</Link></li>
                <li><Link href="/search?activity=filming" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.filming")}</Link></li>
                <li><Link href="/search?activity=events" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.events")}</Link></li>
                <li><Link href="/search?activity=meetings" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.meetings")}</Link></li>
                <li><Link href="/search?activity=production" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.production")}</Link></li>
              </ul>
            </div>

            {/* Types */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">{t("footer.types")}</h3>
              <ul className="space-y-2.5">
                <li><Link href="/search?type=photo-studio" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.photoStudio")}</Link></li>
                <li><Link href="/search?type=film-studio" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.filmStudio")}</Link></li>
                <li><Link href="/search?type=event-space" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.eventSpace")}</Link></li>
                <li><Link href="/search?type=office" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.officeSpace")}</Link></li>
                <li><Link href="/search?type=warehouse" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.warehouse")}</Link></li>
              </ul>
            </div>

            {/* Cities */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">{t("footer.cities")}</h3>
              <ul className="space-y-2.5">
                <li><Link href="/search?city=los-angeles" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.losAngeles")}</Link></li>
                <li><Link href="/search?city=new-york" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.newYork")}</Link></li>
                <li><Link href="/search?city=miami" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.miami")}</Link></li>
                <li><Link href="/search?city=chicago" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.chicago")}</Link></li>
                <li><Link href="/search" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">{t("footer.viewAll")}</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">{t("footer.connect")}</h3>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-gray-100 text-muted-foreground hover:text-gray-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-10" />

          {/* Bottom section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 Blocmark. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <LanguageSelector />
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">Terms</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">Privacy</Link>
              <Link href="/sitemap" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">Sitemap</Link>
              <Link href="/accessibility" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  } else {
    // Minimal footer for non-home pages
    return (
      <footer className={`border-t bg-white ${className || ''}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 Blocmark. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <LanguageSelector />
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">Terms</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">Privacy</Link>
              <Link href="/accessibility" className="text-sm text-muted-foreground hover:text-gray-700 transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}
