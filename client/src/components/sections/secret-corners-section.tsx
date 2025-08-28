import { Map, Award, User, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";

export function SecretCornersSection() {
  const { t } = useTranslation();
  
  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl overflow-hidden">
      <div className="grid md:grid-cols-5 items-center">
        {/* Image Section - 2 columns */}
        <div className="md:col-span-2 h-full">
          <div className="relative h-60 md:h-full">
            <img 
              src="./attached_assets/23566_1754455970807.jpg" 
              alt="Secret beach cove with rock formations" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
          </div>
        </div>
        
        {/* Content Section - 3 columns */}
        <div className="md:col-span-3 p-8 md:p-10">
          <div className="flex items-center gap-2 mb-3">
            <Map className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold">{t("secretCorners.title")}</h2>
          </div>
          
          <p className="text-muted-foreground mb-6 max-w-xl">
            {t("secretCorners.subtitle")}
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-2">
              <Award className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">{t("secretCorners.premiumTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("secretCorners.premiumDesc")}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">{t("secretCorners.memberTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("secretCorners.memberDesc")}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <PlusCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">{t("secretCorners.submitTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("secretCorners.submitDesc")}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Map className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">{t("secretCorners.curatedTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("secretCorners.curatedDesc")}</p>
              </div>
            </div>
          </div>
          
          <Link href="/secret-corners-landing">
            <Button size="lg" className="gap-2">
              <Map className="w-4 h-4" /> Explore Secret Corners
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}