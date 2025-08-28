import { useState } from "react";
import { Star, Key, Headphones, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { ConciergeDialog } from "@/components/dialogs/concierge-dialog";

export function ConciergeSection() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div className="relative py-16 px-0 md:px-10 bg-black text-white rounded-2xl overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="./attached_assets/6I4B6500.jpg" 
          alt="Concierge helping with location booking" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/90" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto">
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
          {/* Left side - Main content */}
          <div className="md:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">{t("concierge.premiumService")}</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {t("concierge.title")}
            </h2>
            
            <p className="text-gray-300 text-lg max-w-xl mb-6">
              {t("concierge.subtitle")}
            </p>
            
            <div className="mt-8">
              <Button 
                size="lg" 
                className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black border-0"
                onClick={() => setIsDialogOpen(true)}
              >
                <Star className="w-4 h-4" /> {t("concierge.requestHelp")}
              </Button>
            </div>
          </div>
          
          {/* Right side - Features cards */}
          <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4">
              <div className="flex flex-col items-start gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-full">
                  <Key className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white">{t("concierge.unlockSpaceTitle")}</h3>
                <p className="text-sm text-gray-300">{t("concierge.unlockSpaceDesc")}</p>
              </div>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4">
              <div className="flex flex-col items-start gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-full">
                  <FileText className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white">{t("concierge.permitTitle")}</h3>
                <p className="text-sm text-gray-300">{t("concierge.permitDesc")}</p>
              </div>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4">
              <div className="flex flex-col items-start gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-full">
                  <Headphones className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white">{t("concierge.supportTitle")}</h3>
                <p className="text-sm text-gray-300">{t("concierge.supportDesc")}</p>
              </div>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4">
              <div className="flex flex-col items-start gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-full">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white">{t("concierge.teamTitle")}</h3>
                <p className="text-sm text-gray-300">{t("concierge.teamDesc")}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <ConciergeDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </div>
  );
}