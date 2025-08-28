import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { 
  PlusCircle, 
  Pencil, 
  Trash, 
  ArrowUpDown, 
  MoveUp, 
  MoveDown, 
  Image as ImageIcon, 
  Tag, 
  Check, 
  Star, 
  Calendar, 
  Clock, 
  FileText 
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { BlogArticle } from "@/types/blog-types";
import { blogArticles } from "@/data/blog-articles";

export function BlogManager() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [tempArticle, setTempArticle] = useState<Partial<BlogArticle>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Get unique categories from articles
  const categories = ["All", ...Array.from(new Set(articles.map(article => article.category)))];

  useEffect(() => {
    // Load articles from data file
    setArticles(blogArticles);
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditClick = (article: BlogArticle) => {
    setSelectedArticle(article);
    setTempArticle({...article});
    setIsCreatingNew(false);
    setIsEditModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedArticle(null);
    setTempArticle({
      id: Math.max(0, ...articles.map(a => a.id)) + 1,
      title: "",
      excerpt: "",
      image: "",
      author: "",
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      readTime: "5 min read",
      category: "",
      tags: [],
      content: [""],
      likes: 0,
      commentCount: 0
    });
    setIsCreatingNew(true);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    if (!tempArticle.title || !tempArticle.excerpt || !tempArticle.image) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (title, excerpt, image)",
        variant: "destructive"
      });
      return;
    }
    
    if (isCreatingNew) {
      setArticles([...articles, tempArticle as BlogArticle]);
      toast({
        title: "Article created",
        description: "The new article has been created successfully",
      });
    } else {
      setArticles(articles.map(a => a.id === tempArticle.id ? {...a, ...tempArticle} : a));
      toast({
        title: "Article updated",
        description: "The article has been updated successfully",
      });
    }
    
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedArticle) {
      setArticles(articles.filter(a => a.id !== selectedArticle.id));
      toast({
        title: "Article deleted",
        description: "The article has been deleted successfully",
      });
      setDeleteConfirmOpen(false);
      setIsEditModalOpen(false);
    }
  };

  const onDragEnd = (result: {source: {index: number}, destination: {index: number} | null}) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const reorderedItems = Array.from(filteredArticles);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    // Update the full articles list while preserving the filtered order
    const newArticlesList = [...articles];
    reorderedItems.forEach((item, index) => {
      const originalIndex = newArticlesList.findIndex(a => a.id === item.id);
      if (originalIndex !== -1) {
        // Move the article to maintain the same relative ordering in the full list
        const [articleToMove] = newArticlesList.splice(originalIndex, 1);
        
        // Find where to insert the article in the full list
        const targetIndex = newArticlesList.findIndex(a => {
          const filteredIndex = reorderedItems.findIndex(fa => fa.id === a.id);
          return filteredIndex > index;
        });
        
        if (targetIndex === -1) {
          newArticlesList.push(articleToMove);
        } else {
          newArticlesList.splice(targetIndex, 0, articleToMove);
        }
      }
    });

    setArticles(newArticlesList);
    toast({
      title: "Articles reordered",
      description: "The display order has been updated"
    });
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newArticles = [...filteredArticles];
      const temp = newArticles[index];
      newArticles[index] = newArticles[index - 1];
      newArticles[index - 1] = temp;
      
      // Update the master list based on the new order
      const updatedMaster = [...articles];
      const masterIndexCurrent = updatedMaster.findIndex(a => a.id === filteredArticles[index].id);
      const masterIndexTarget = updatedMaster.findIndex(a => a.id === filteredArticles[index - 1].id);
      
      [updatedMaster[masterIndexCurrent], updatedMaster[masterIndexTarget]] = 
      [updatedMaster[masterIndexTarget], updatedMaster[masterIndexCurrent]];
      
      setArticles(updatedMaster);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < filteredArticles.length - 1) {
      const newArticles = [...filteredArticles];
      const temp = newArticles[index];
      newArticles[index] = newArticles[index + 1];
      newArticles[index + 1] = temp;
      
      // Update the master list based on the new order
      const updatedMaster = [...articles];
      const masterIndexCurrent = updatedMaster.findIndex(a => a.id === filteredArticles[index].id);
      const masterIndexTarget = updatedMaster.findIndex(a => a.id === filteredArticles[index + 1].id);
      
      [updatedMaster[masterIndexCurrent], updatedMaster[masterIndexTarget]] = 
      [updatedMaster[masterIndexTarget], updatedMaster[masterIndexCurrent]];
      
      setArticles(updatedMaster);
    }
  };

  const handleToggleFeatured = (article: BlogArticle) => {
    const updatedArticles = articles.map(a => {
      if (a.id === article.id) {
        return {...a, featured: !a.featured};
      } else if (a.featured && article.id !== a.id && !article.featured) {
        // If this article was featured and we're featuring another, unfeatured this one
        return {...a, featured: false};
      }
      return a;
    });
    
    setArticles(updatedArticles);
    toast({
      title: `Article ${article.featured ? 'unfeatured' : 'featured'}`,
      description: `"${article.title}" is now ${article.featured ? 'no longer' : 'set as'} the featured article`,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      <Card className="p-0">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="articles">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((article, index) => (
                      <Draggable key={article.id} draggableId={article.id.toString()} index={index}>
                        {(provided) => (
                          <TableRow 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <TableCell className="py-1">
                              <div 
                                {...provided.dragHandleProps} 
                                className="cursor-grab"
                              >
                                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium flex items-center gap-2">
                              <div className="w-8 h-8 bg-muted rounded overflow-hidden flex-shrink-0">
                                {article.image ? (
                                  <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <span className="truncate max-w-[200px]">{article.title}</span>
                              {article.featured && (
                                <Badge variant="default" className="ml-2">
                                  <Star className="h-3 w-3 mr-1" /> Featured
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{article.category}</Badge>
                            </TableCell>
                            <TableCell>{article.author}</TableCell>
                            <TableCell>{formatDate(article.date)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={article.id <= 10 ? "default" : "secondary"}
                                className="px-2 py-0.5 text-xs"
                              >
                                {article.id <= 10 ? 'Complete' : 'Basic'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleFeatured(article)}
                                  title={article.featured ? "Remove from featured" : "Set as featured"}
                                >
                                  <Star className={`h-4 w-4 ${article.featured ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveUp(index)}
                                  disabled={index === 0}
                                  title="Move up"
                                >
                                  <MoveUp className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveDown(index)}
                                  disabled={index === filteredArticles.length - 1}
                                  title="Move down"
                                >
                                  <MoveDown className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(article)}
                                  title="Edit article"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                
                                <AlertDialog open={deleteConfirmOpen && selectedArticle?.id === article.id} onOpenChange={setDeleteConfirmOpen}>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedArticle(article);
                                        setDeleteConfirmOpen(true);
                                      }}
                                      title="Delete article"
                                    >
                                      <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the article "{article.title}". This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                </Table>
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        {filteredArticles.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredArticles.length)} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredArticles.length)} of{" "}
              {filteredArticles.length} articles
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {Math.ceil(filteredArticles.length / itemsPerPage)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredArticles.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(filteredArticles.length / itemsPerPage)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreatingNew ? "Create New Article" : "Edit Article"}</DialogTitle>
            <DialogDescription>
              {isCreatingNew 
                ? "Add a new blog article to the platform" 
                : `Editing article #${selectedArticle?.id}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={tempArticle.title || ""}
                  onChange={(e) => setTempArticle({...tempArticle, title: e.target.value})}
                  placeholder="Enter article title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt <span className="text-destructive">*</span></Label>
                <Textarea
                  id="excerpt"
                  value={tempArticle.excerpt || ""}
                  onChange={(e) => setTempArticle({...tempArticle, excerpt: e.target.value})}
                  placeholder="Brief summary of the article"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Featured Image URL <span className="text-destructive">*</span></Label>
                <Input
                  id="image"
                  value={tempArticle.image || ""}
                  onChange={(e) => setTempArticle({...tempArticle, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
                {tempArticle.image && (
                  <div className="mt-2 border rounded-md overflow-hidden aspect-video">
                    <img 
                      src={tempArticle.image} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={tempArticle.author || ""}
                    onChange={(e) => setTempArticle({...tempArticle, author: e.target.value})}
                    placeholder="Author name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={tempArticle.category || ""}
                    onChange={(e) => setTempArticle({...tempArticle, category: e.target.value})}
                    placeholder="E.g., Photography, Tips, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    value={tempArticle.date || ""}
                    onChange={(e) => setTempArticle({...tempArticle, date: e.target.value})}
                    placeholder="Month Day, Year"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readTime">Read Time</Label>
                  <Input
                    id="readTime"
                    value={tempArticle.readTime || ""}
                    onChange={(e) => setTempArticle({...tempArticle, readTime: e.target.value})}
                    placeholder="E.g., 5 min read"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tempArticle.tags?.join(", ") || ""}
                  onChange={(e) => setTempArticle({
                    ...tempArticle, 
                    tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="tag1, tag2, tag3"
                />
                
                {tempArticle.tags && tempArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tempArticle.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={tempArticle.content?.join("\n\n") || ""}
                  onChange={(e) => setTempArticle({
                    ...tempArticle, 
                    content: e.target.value.split("\n\n").filter(Boolean)
                  })}
                  placeholder="Article content..."
                  rows={10}
                />
                <p className="text-sm text-muted-foreground">
                  Separate paragraphs with a blank line (two line breaks).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={!!tempArticle.featured}
                  onChange={(e) => setTempArticle({...tempArticle, featured: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="featured" className="cursor-pointer">Set as featured article</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorBio">Author Bio</Label>
                <Textarea
                  id="authorBio"
                  value={tempArticle.authorBio || ""}
                  onChange={(e) => setTempArticle({...tempArticle, authorBio: e.target.value})}
                  placeholder="Short bio about the author"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="likes">Likes</Label>
                  <Input
                    id="likes"
                    type="number"
                    value={tempArticle.likes || 0}
                    onChange={(e) => setTempArticle({...tempArticle, likes: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commentCount">Comment Count</Label>
                  <Input
                    id="commentCount"
                    type="number"
                    value={tempArticle.commentCount || 0}
                    onChange={(e) => setTempArticle({...tempArticle, commentCount: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex space-x-2 justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="text-destructive mr-1">*</span> Required fields
            </div>
            <div className="flex space-x-2">
              {!isCreatingNew && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this article. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {isCreatingNew ? "Create Article" : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}