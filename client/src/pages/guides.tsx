import { AppLayout } from "@/components/layout/app-layout";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowRight, Book, Camera, Video, Building, BrainCircuit, Film, Users, Clock, TrendingUp, Star, Sparkles, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// Icon mapping for categories
const categoryIcons: { [key: string]: JSX.Element } = {
  photography: <Camera className="h-6 w-6" />,
  videography: <Video className="h-6 w-6" />,
  hosting: <Building className="h-6 w-6" />,
  "for-hosts": <Building className="h-6 w-6" />,
  ai: <BrainCircuit className="h-6 w-6" />,
  "ai-tools": <BrainCircuit className="h-6 w-6" />,
  production: <Film className="h-6 w-6" />,
  events: <Users className="h-6 w-6" />,
  "getting-started": <Book className="h-6 w-6" />,
  default: <Book className="h-6 w-6" />
};

// Color mapping for categories
const categoryColors: { [key: string]: string } = {
  photography: "bg-blue-100 dark:bg-blue-900/30",
  videography: "bg-purple-100 dark:bg-purple-900/30",
  hosting: "bg-green-100 dark:bg-green-900/30",
  "for-hosts": "bg-green-100 dark:bg-green-900/30",
  ai: "bg-orange-100 dark:bg-orange-900/30",
  "ai-tools": "bg-orange-100 dark:bg-orange-900/30",
  production: "bg-red-100 dark:bg-red-900/30",
  events: "bg-teal-100 dark:bg-teal-900/30",
  "getting-started": "bg-indigo-100 dark:bg-indigo-900/30",
  default: "bg-gray-100 dark:bg-gray-900/30"
};

export default function GuidesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch guide categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/guides/categories']
  });

  // Fetch featured guides
  const { data: featuredGuides = [], isLoading: featuredLoading } = useQuery({
    queryKey: ['/api/guides/featured']
  });

  // Fetch all guides
  const { data: allGuides = [], isLoading: guidesLoading } = useQuery({
    queryKey: ['/api/guides']
  });
  
  // Filter for published guides and sort by date for recent guides
  const publishedGuides = allGuides.filter((guide: any) => guide.status === 'published');
  const recentGuides = publishedGuides
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // Filter guides based on search query
  const filteredGuides = publishedGuides.filter((guide: any) => 
    searchQuery.length === 0 ||
    guide.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getCategoryIcon = (slug: string) => {
    return categoryIcons[slug] || categoryIcons.default;
  };
  
  const getCategoryColor = (slug: string) => {
    return categoryColors[slug] || categoryColors.default;
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <header className="mb-16">
          <h1 className="text-4xl font-bold mb-4">{t("guides.title")}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
            {t("guides.subtitle")}
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder={t("guides.searchPlaceholder")}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Search Results */}
        {searchQuery && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Search Results</h2>
            {filteredGuides.length === 0 ? (
              <p className="text-muted-foreground">No guides found matching "{searchQuery}"</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGuides.map((guide: any) => (
                  <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {guide.categoryTitle || 'Guide'}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{guide.timeToRead || 5} min</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        <Link href={`/guide/${guide.slug}`} className="hover:text-primary">
                          {guide.title}
                        </Link>
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {guide.description}
                      </p>
                      
                      <Link href={`/guide/${guide.slug}`}>
                        <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                          Read more <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Categories */}
        {!searchQuery && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t("guides.browseByCategory")}</h2>
            {categoriesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-6 mb-3" />
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category: any) => (
                  <Card key={category.id} className="overflow-hidden hover:bg-accent transition-colors cursor-pointer">
                    <Link href={`/guides/category/${category.slug}`} className="block">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${getCategoryColor(category.slug)}`}>
                            {getCategoryIcon(category.slug)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{category.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {category.description}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs text-primary font-medium">
                                View guides
                              </span>
                              <ArrowRight className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Featured Guides */}
        {!searchQuery && featuredGuides.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              Featured Guides
            </h2>
            {featuredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-5 w-24 mb-3" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredGuides.map((guide: any) => (
                  <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {guide.coverImage && (
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                        <img 
                          src={guide.coverImage} 
                          alt={guide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <Badge variant="outline" className="text-xs">Featured</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{guide.timeToRead || 5} min</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        <Link href={`/guide/${guide.slug}`} className="hover:text-primary">
                          {guide.title}
                        </Link>
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {guide.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {guide.author && (
                            <>
                              <span>By {guide.author}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{guide.difficulty || 'Beginner'}</span>
                        </div>
                        <Link href={`/guide/${guide.slug}`}>
                          <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                            Read <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Recent Guides */}
        {!searchQuery && recentGuides.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Recent Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentGuides.map((guide: any) => (
                <Card key={guide.id} className="hover:shadow-lg hover:bg-accent transition-all cursor-pointer">
                  <Link href={`/guide/${guide.slug}`} className="block">
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-3 text-xs">
                        {guide.categoryTitle || 'Guide'}
                      </Badge>
                      
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {guide.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{guide.timeToRead || 5} min</span>
                        </div>
                        <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}


      </div>
    </AppLayout>
  );
}