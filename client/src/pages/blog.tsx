import { AppLayout } from "../components/layout/app-layout";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowRight, Clock, User, CalendarDays, Search } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { blogArticles } from "../data/blog-articles";
import { BlogArticle } from "../types/blog-types";
import { useTranslation } from "../hooks/use-translation";

// Extract all unique categories from blog posts
const allCategories = ["All", ...Array.from(new Set(blogArticles.map(post => post.category)))].sort();

// Number of posts to show per page
const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter posts based on search term and category
  const filteredPosts = useMemo(() => {
    return blogArticles.filter(post => {
      const matchesSearch = searchTerm === "" || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Get featured post
  const featuredPost = useMemo(() => {
    // If there's a featured post in filtered posts, use it
    const featured = filteredPosts.find(post => post.featured);
    // Otherwise, if searching or filtering, don't show a featured post
    if (searchTerm || selectedCategory !== "All") return featured || null;
    // In default view, always show the original featured post
    return blogArticles.find(post => post.featured) || null;
  }, [filteredPosts, searchTerm, selectedCategory]);

  // Calculate posts to display (excluding featured post)
  const regularPosts = useMemo(() => {
    const posts = featuredPost 
      ? filteredPosts.filter(post => post.id !== featuredPost.id)
      : filteredPosts;
    
    // Calculate total visible posts based on current page
    const visiblePosts = posts.slice(0, currentPage * POSTS_PER_PAGE);
    return visiblePosts;
  }, [filteredPosts, featuredPost, currentPage]);

  // Check if there are more posts to load
  const hasMorePosts = filteredPosts.length > (featuredPost ? 1 : 0) + (currentPage * POSTS_PER_PAGE);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Load more posts
  const loadMorePosts = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <header className="mb-16">
          <h1 className="text-4xl font-bold mb-4">{t("blog.title")}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
            {t("blog.subtitle")}
          </p>
          <div className="bg-card/30 backdrop-blur-sm border rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Search Section */}
              <div className="flex-1 max-w-sm">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors group-focus-within:text-primary" />
                  <Input 
                    placeholder={t("blog.searchPlaceholder")}
                    className="pl-9 pr-8 py-2 bg-background/50 border rounded-lg text-sm transition-all duration-200 focus:border-primary focus:shadow-md focus:shadow-primary/10 hover:border-muted-foreground/50"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filter Section - Fill the available space with buttons */}
              <div className="flex items-center gap-2 flex-1 justify-between">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {allCategories.slice(0, 6).map((category, index) => (
                    <Button 
                      key={index}
                      variant={category === selectedCategory ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategorySelect(category)}
                      className={`h-8 px-3 text-xs rounded-full transition-all duration-200 hover:scale-105 ${
                        category === selectedCategory 
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                          : "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                      }`}
                    >
                      {category === "All" ? t("blog.all") : category}
                    </Button>
                  ))}
                  
                  {/* Clear All Button - Only show when filters are active */}
                  {(searchTerm || selectedCategory !== "All") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
                      className="h-8 px-3 text-xs rounded-full text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                
                {/* More Categories Dropdown - Always at the end */}
                {allCategories.length > 6 && (
                  <div className="relative group ml-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 px-3 text-xs rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      More +
                    </Button>
                    <div className="absolute top-full right-0 mt-1 bg-card border rounded-lg shadow-lg p-2 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="grid grid-cols-2 gap-1">
                        {allCategories.slice(6).map((category, index) => (
                          <Button 
                            key={index + 6}
                            variant={category === selectedCategory ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleCategorySelect(category)}
                            className={`h-7 px-2 text-xs justify-start rounded-md ${
                              category === selectedCategory 
                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                : "hover:bg-blue-50 hover:text-blue-700"
                            }`}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Results count when filtering */}
        {(searchTerm || selectedCategory !== "All") && (
          <div className="mb-8">
            <p className="text-muted-foreground">
              Found {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </p>
          </div>
        )}

        {/* Featured Post */}
        {featuredPost && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t("blog.featuredArticle")}</h2>
            <div className="bg-card rounded-xl overflow-hidden shadow-sm border">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-64 md:h-auto">
                  <img 
                    src={featuredPost.image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite callbacks
                      target.src = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                    }}
                  />
                </div>
                <div className="p-8 flex flex-col justify-between">
                  <div className="mb-auto">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{featuredPost.category}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {featuredPost.readTime}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{featuredPost.title}</h3>
                    <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{featuredPost.author}</span>
                      <span>•</span>
                      <CalendarDays className="h-4 w-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <Link href={`/blog/${featuredPost.id}`}>
                      <Button size="sm" className="flex items-center gap-1">
                        {t("blog.readMore")} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* No results message */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-4">No articles found</h3>
            <p className="text-muted-foreground mb-8">
              Try adjusting your search terms or browse all categories to find what you're looking for.
            </p>
            <Button onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}>
              Clear all filters
            </Button>
          </div>
        )}

        {/* Latest Articles */}
        {regularPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {searchTerm || selectedCategory !== "All" ? t("blog.searchResults") : t("blog.latestArticles")}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post: BlogArticle) => (
                <div key={post.id} className="flex flex-col h-full bg-card rounded-xl overflow-hidden shadow-sm border">
                  <div className="h-48 overflow-hidden">
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
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{post.category}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                    <p className="text-muted-foreground mb-6 flex-grow line-clamp-3">{post.excerpt}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> {post.date}
                        </span>
                      </div>
                      <Link href={`/blog/${post.id}`}>
                        <Button size="sm" variant="ghost" className="flex items-center gap-1">
                          {t("blog.read")} <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMorePosts && (
              <div className="mt-12 text-center">
                <Button variant="outline" size="lg" onClick={loadMorePosts}>
                  {t("blog.loadMore")}
                </Button>
              </div>
            )}
          </section>
        )}


      </div>
    </AppLayout>
  );
}