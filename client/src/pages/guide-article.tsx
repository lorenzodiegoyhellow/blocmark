import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Clock, BarChart3, Share2, Bookmark, ThumbsUp, MessageCircle, ArrowRight, BookOpen, Calendar } from "lucide-react";
import { Link, useParams } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DOMPurify from 'dompurify';

// Category colors
const categoryColors: { [key: string]: string } = {
  photography: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  videography: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  hosting: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "for-hosts": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  ai: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "ai-tools": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  production: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  events: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  "getting-started": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
};

// Difficulty colors
const difficultyColors: { [key: string]: string } = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Advanced: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
};

export default function GuideArticlePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const guideSlug = params?.id;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Fetch guide data
  const { data: guide, isLoading: guideLoading, error } = useQuery({
    queryKey: [`/api/guides/${guideSlug}`],
    enabled: !!guideSlug
  });

  // Fetch related guides from same category
  const { data: relatedGuides = [] } = useQuery({
    queryKey: ['/api/guides', guide?.categoryId],
    queryFn: async () => {
      if (!guide?.categoryId) return [];
      const response = await fetch(`/api/guides?categoryId=${guide.categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch related guides');
      const data = await response.json();
      // Filter out current guide and get only published ones
      return data
        .filter((g: any) => g.id !== guide.id && g.status === 'published')
        .slice(0, 3);
    },
    enabled: !!guide?.categoryId
  });

  const getCategoryColor = (categorySlug?: string) => {
    if (!categorySlug) return categoryColors.default;
    return categoryColors[categorySlug] || categoryColors.default;
  };

  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return difficultyColors.Beginner;
    return difficultyColors[difficulty] || difficultyColors.Beginner;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Sanitize and render HTML content
  const renderContent = (content: string) => {
    // Sanitize the HTML content to prevent XSS
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                     'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'pre', 'code', 'hr', 'table', 
                     'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'style'],
      ALLOW_DATA_ATTR: false
    });
    
    return { __html: sanitizedContent };
  };

  if (guideLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !guide) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Guide Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The guide you're looking for doesn't exist or may have been moved.
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/guides">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Guides
            </Button>
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {guide.categoryTitle && (
              <Badge 
                variant="outline" 
                className={getCategoryColor(guide.categorySlug)}
              >
                {guide.categoryTitle}
              </Badge>
            )}
            <Badge 
              variant="outline"
              className={getDifficultyColor(guide.difficulty)}
            >
              {guide.difficulty || 'Beginner'}
            </Badge>
            {guide.featured && (
              <Badge variant="default" className="bg-yellow-500">
                Featured
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{guide.title}</h1>
          {guide.description && (
            <p className="text-xl text-muted-foreground mb-6">{guide.description}</p>
          )}
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            {guide.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{guide.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{guide.timeToRead || 5} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>{guide.difficulty || 'Beginner'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(guide.createdAt)}</span>
            </div>
          </div>


        </header>

        {/* Featured Image */}
        {guide.coverImage && (
          <div className="mb-8">
            <img 
              src={guide.coverImage} 
              alt={guide.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div dangerouslySetInnerHTML={renderContent(guide.content)} />
        </article>



        {/* Related Guides */}
        {relatedGuides.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedGuides.map((relatedGuide: any) => (
                <Card key={relatedGuide.id} className="hover:shadow-lg transition-shadow">
                  {relatedGuide.coverImage && (
                    <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                      <img 
                        src={relatedGuide.coverImage} 
                        alt={relatedGuide.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {relatedGuide.difficulty || 'Beginner'}
                    </Badge>
                    <h3 className="font-semibold mb-1 line-clamp-2">
                      <Link href={`/guide/${relatedGuide.slug}`} className="hover:text-primary">
                        {relatedGuide.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatedGuide.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{relatedGuide.timeToRead || 5} min</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}