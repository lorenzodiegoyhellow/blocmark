import { useParams, Link } from "wouter";
import { AppLayout } from "../components/layout/app-layout";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  Share2, 
  Clock, 
  User, 
  CalendarDays, 
  ArrowLeft, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { blogArticles } from "../data/blog-articles";
import { useEffect, useState } from "react";
import { BlogArticle as BlogArticleType, RelatedArticle } from "../types/blog-types";

export default function BlogArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<BlogArticleType | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Find the article with the matching ID
    const foundArticle = blogArticles.find((article: BlogArticleType) => article.id === parseInt(id));
    
    if (foundArticle) {
      setArticle(foundArticle);
      
      // Find related articles in the same category
      const related = blogArticles
        .filter((a: BlogArticleType) => a.category === foundArticle.category && a.id !== foundArticle.id)
        .slice(0, 3)
        .map((a: BlogArticleType) => ({
          id: a.id,
          title: a.title,
          image: a.image,
          date: a.date,
          category: a.category
        }));
      
      setRelatedArticles(related);
    }
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 w-3/4 bg-muted mb-4 rounded"></div>
            <div className="h-4 w-1/4 bg-muted mb-12 rounded"></div>
            <div className="h-96 bg-muted mb-8 rounded-lg"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 w-5/6 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!article) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Back button and category */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Button>
          </Link>
          <Badge variant="secondary">{article.category}</Badge>
        </div>

        {/* Article Title */}
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

        {/* Author and Date Info */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={article.authorImage || ""} alt={article.author} />
              <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{article.readTime}</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-lg overflow-hidden mb-8">
          <img
            src={article.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
            alt={article.title}
            className="w-full h-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite callbacks
              target.src = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
            }}
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {article.content && article.content.map((paragraph: string, index: number) => (
            <p key={index} className="mb-6 leading-relaxed">{paragraph}</p>
          ))}

          {article.subheadings && article.subheadings.map((subheading: any, index: number) => (
            <div key={index} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 mt-10">{subheading.title}</h2>
              {subheading.content.map((paragraph: string, pIndex: number) => (
                <p key={pIndex} className="mb-6 leading-relaxed">{paragraph}</p>
              ))}
              {subheading.image && (
                <div className="rounded-lg overflow-hidden my-8">
                  <img
                    src={subheading.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                    alt={subheading.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite callbacks
                      target.src = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-3">Tagged with:</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Social Sharing */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Share this article:</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Share on Facebook">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Share on Twitter">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Share on LinkedIn">
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Copy link">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" /> 
              <span>{article.likes || 0}</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" /> 
              <span>{article.commentCount || 0}</span>
            </Button>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Author Bio */}
        <div className="bg-card rounded-lg p-6 mb-12 border">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={article.authorImage || ""} alt={article.author} />
              <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold mb-2">About {article.author}</h3>
              <p className="text-muted-foreground mb-3">
                {article.authorBio || `Professional writer with expertise in photography and creative space booking. ${article.author} has been writing for Blocmark since 2023.`}
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">View Profile</Button>
                <Button variant="outline" size="sm">Follow</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((post: RelatedArticle) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <div className="flex flex-col h-full bg-card rounded-xl overflow-hidden shadow-sm border">
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={post.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite callbacks
                          target.src = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2">{post.category}</Badge>
                      <h3 className="font-semibold hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{post.date}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-6">Comments ({article.commentCount || 0})</h2>
          
          {/* Comment Form */}
          <div className="mb-8">
            <textarea 
              className="w-full border rounded-md p-3 mb-3" 
              rows={4} 
              placeholder="Leave a comment..."
            ></textarea>
            <Button>Post Comment</Button>
          </div>
          
          {/* Sample Comments */}
          {article.comments ? (
            <div className="space-y-6">
              {article.comments.map((comment: {
                author: string;
                authorImage?: string;
                date: string;
                content: string;
              }, index: number) => (
                <div key={index} className="flex gap-4 pb-6 border-b last:border-b-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.authorImage || ""} alt={comment.author} />
                    <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-sm text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex gap-4 mt-2">
                      <button className="text-xs text-muted-foreground">Reply</button>
                      <button className="text-xs text-muted-foreground">Like</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Be the first to comment on this article!</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}