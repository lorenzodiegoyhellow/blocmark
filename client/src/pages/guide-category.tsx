import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Book, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useParams } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";

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

// Difficulty colors
const difficultyColors: { [key: string]: string } = {
  Beginner: "bg-green-500",
  Intermediate: "bg-yellow-500",
  Advanced: "bg-red-500"
};

const GUIDES_PER_PAGE = 9;

export default function GuideCategoryPage() {
  const { t } = useTranslation();
  const params = useParams<{ category: string }>();
  const categorySlug = params?.category;
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch category details
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: [`/api/guides/categories/${categorySlug}`],
    enabled: !!categorySlug
  });

  // Fetch guides for this category
  const { data: allGuides = [], isLoading: guidesLoading } = useQuery({
    queryKey: category?.id ? [`/api/guides?categoryId=${category.id}`] : null,
    enabled: !!category?.id
  });

  // Filter for published guides
  const publishedGuides = allGuides.filter((guide: any) => guide.status === 'published');
  
  // Filter guides based on search query
  const filteredGuides = publishedGuides.filter((guide: any) => 
    searchQuery.length === 0 ||
    guide.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredGuides.length / GUIDES_PER_PAGE);
  const startIndex = (currentPage - 1) * GUIDES_PER_PAGE;
  const endIndex = startIndex + GUIDES_PER_PAGE;
  const paginatedGuides = filteredGuides.slice(startIndex, endIndex);
  
  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };
  
  const getCategoryColor = (slug: string) => {
    return categoryColors[slug] || categoryColors.default;
  };

  if (categoryLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
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
        </div>
      </AppLayout>
    );
  }

  if (!category) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The guide category you're looking for doesn't exist.
          </p>
          <Link href="/guides">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Guides
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/guides">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Guides
            </Button>
          </Link>
          
          <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg mb-4 ${getCategoryColor(category.slug)}`}>
            <h1 className="text-3xl font-bold">{category.title}</h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl">
            {category.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Book className="h-4 w-4" />
              <span>{filteredGuides.length} guides</span>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder={`Search ${category.title.toLowerCase()} guides...`}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Guides Grid */}
        {guidesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
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
        ) : filteredGuides.length === 0 ? (
          <div className="text-center py-12">
            <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              {searchQuery 
                ? `No guides found matching "${searchQuery}"`
                : "No guides available in this category yet."}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedGuides.map((guide: any) => (
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
                      <div className={`w-2 h-2 rounded-full ${
                        difficultyColors[guide.difficulty as keyof typeof difficultyColors] || 'bg-green-500'
                      }`} />
                      <span className="text-sm font-medium text-primary">{guide.difficulty || 'Beginner'}</span>
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
                    {guide.author && (
                      <span className="text-xs text-muted-foreground">By {guide.author}</span>
                    )}
                    <Link href={`/guide/${guide.slug}`}>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        Read guide →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="min-w-[40px]"
                      onClick={() => setCurrentPage(Number(page))}
                    >
                      {page}
                    </Button>
                  )
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          </>
        )}

        {/* Empty State CTA */}
        {filteredGuides.length === 0 && !searchQuery && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Check back soon for new guides in this category!
            </p>
            <Link href="/guides">
              <Button variant="outline">
                Browse Other Categories
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}