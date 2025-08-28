import { Card, CardContent } from "@/components/ui/card";
import { Camera, Compass, Film, Building, BookOpen, ArrowRight, Clock, Users2, BrainCircuit, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";



export function GuideSection() {
  const { t } = useTranslation();
  
  const guides = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: t("guides.studioTitle"),
      description: t("guides.studioDesc"),
      href: "/guides/studio-selection",
      category: t("guides.photographyCategory"),
      readTime: t("guides.readTime12"),
      image: "/attached_assets/6I4B5772.jpg"
    },
    {
      icon: <Compass className="w-8 h-8" />,
      title: t("guides.scoutingTitle"),
      description: t("guides.scoutingDesc"),
      href: "/guides/location-scouting",
      category: t("guides.filmingCategory"),
      readTime: t("guides.readTime15"),
      image: "/attached_assets/6I4B6500.jpg"
    },
    {
      icon: <Users2 className="w-8 h-8" />,
      title: t("guides.eventTitle"),
      description: t("guides.eventDesc"),
      href: "/guides/event-planning",
      category: t("guides.eventsCategory"),
      readTime: t("guides.readTime10"),
      image: "/attached_assets/vault2698-2.jpg"
    },
    {
      icon: <BrainCircuit className="w-8 h-8" />,
      title: t("guides.aiTitle"),
      description: t("guides.aiDesc"),
      href: "/guides/ai-location-selection",
      category: t("guides.technologyCategory"),
      readTime: t("guides.readTime8"), 
      image: "/attached_assets/victorian28972.jpg"
    }
  ];
  
  return (
    <div className="relative py-12 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-white dark:from-background dark:to-background"></div>
      <div className="absolute top-0 right-0 w-1/3 h-40 bg-blue-100/30 dark:bg-blue-900/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-32 bg-slate-100/30 dark:bg-slate-800/10 blur-3xl rounded-full"></div>
      
      {/* Content */}
      <div className="container relative mx-auto px-4">
        {/* Header with interactive badge */}
        <div className="flex flex-col items-center mb-16 relative">
          
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mb-5">
            <BookOpen className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">{t("guides.expertResources")}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-5">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">{t("guides.title")}</span>
          </h2>
          
          <p className="text-center text-slate-700 max-w-3xl mx-auto mb-10">
            {t("guides.subtitle")}
          </p>
          
          <Link href="/guides">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white flex items-center gap-2">
              {t("guides.browseAll")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Featured guides with hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {guides.map((guide, index) => (
            <Link key={index} href={guide.href}>
              <Card className="h-full overflow-hidden group bg-white dark:bg-gray-900 border-0 ring-1 ring-gray-200 dark:ring-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={guide.image} 
                    alt={guide.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 w-full p-4 flex justify-between items-center">
                    <Badge className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white">
                      {guide.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6 flex flex-col space-y-4 relative">
                  <div className="absolute -top-7 right-6 bg-white dark:bg-gray-900 p-2 rounded-full border border-gray-200 dark:border-gray-800 shadow-md">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-2 rounded-full">
                      {guide.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mt-2">{guide.title}</h3>
                  
                  <p className="text-sm text-muted-foreground flex-1">
                    {guide.description}
                  </p>
                  
                  <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-2">
                    <div className="flex items-center gap-1">
                      <Lightbulb className="h-4 w-4 text-blue-900" />
                      <span className="text-xs font-medium text-blue-900">Expert Tips</span>
                    </div>
                    
                    <span className="text-sm text-blue-900 font-medium flex items-center">
                      Read More
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}