import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Eye, Search, Filter, Book, Clock, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { GuideForm } from "./guide-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

const statusColors = {
  published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
};

const difficultyColors = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Advanced: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
};

interface GuideFormData {
  title: string;
  description: string;
  categoryId: string;
  difficulty: string;
  timeToRead: string;
  author: string;
  content: string;
  featured: boolean;
  status: string;
  coverImage?: string;
}

export function GuidesManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<any>(null);

  const [formData, setFormData] = useState<GuideFormData>({
    title: "",
    description: "",
    categoryId: "",
    difficulty: "",
    timeToRead: "",
    author: "",
    content: "",
    featured: false,
    status: "draft"
  });

  // Fetch guides from backend - enabled by default now
  const { data: guides = [], isLoading, error: guidesError, refetch: refetchGuides } = useQuery({
    queryKey: ['/api/admin/guides'],
    retry: 1
  });
  
  const { data: categoriesData = [], error: categoriesError, refetch: refetchCategories } = useQuery({
    queryKey: ['/api/admin/guides/categories'],
    retry: 1
  });
  
  console.log("GuidesManager rendering with guides:", guides.length, "categories:", categoriesData.length);
  console.log("Categories data:", categoriesData);
  console.log("Sample guide data:", guides[0]);
  
  // Mutations for create, update, delete
  const createGuideMutation = useMutation({
    mutationFn: (data: any) => apiRequest({
      url: '/api/admin/guides',
      method: 'POST',
      body: data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guides'] });
      toast({
        title: "Success",
        description: "Guide created successfully"
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create guide",
        variant: "destructive"
      });
    }
  });

  const updateGuideMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest({
        url: `/api/admin/guides/${id}`,
        method: 'PUT',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guides'] });
      toast({
        title: "Success",
        description: "Guide updated successfully"
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update guide",
        variant: "destructive"
      });
    }
  });

  const deleteGuideMutation = useMutation({
    mutationFn: (id: number) => apiRequest({
      url: `/api/admin/guides/${id}`,
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guides'] });
      toast({
        title: "Success",
        description: "Guide deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete guide",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      categoryId: "",
      difficulty: "",
      timeToRead: "",
      author: "",
      content: "",
      featured: false,
      status: "draft",
      coverImage: undefined
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleCreateGuide = () => {
    if (!formData.title || !formData.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Creating guide with formData:", formData);
    console.log("FormData coverImage:", formData.coverImage);
    
    // Prepare data with proper field names and types
    const guideData = {
      title: formData.title,
      slug: generateSlug(formData.title),
      description: formData.description || null,
      content: formData.content || '',
      categoryId: parseInt(formData.categoryId),
      author: formData.author || null,
      difficulty: formData.difficulty || 'Beginner',
      timeToRead: formData.timeToRead ? parseInt(formData.timeToRead) : 5,
      featured: formData.featured || false,
      status: formData.status || 'draft',
      coverImage: formData.coverImage || null
    };
    
    console.log("Guide data to send:", guideData);
    createGuideMutation.mutate(guideData);
  };

  const handleUpdateGuide = () => {
    if (!editingGuide || !formData.title || !formData.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Debug logging
    console.log("FormData categoryId:", formData.categoryId, typeof formData.categoryId);
    console.log("Parsed categoryId:", parseInt(formData.categoryId), typeof parseInt(formData.categoryId));
    
    // Prepare data with proper field names and types
    const guideData = {
      title: formData.title,
      slug: generateSlug(formData.title),
      description: formData.description || null,
      content: formData.content || '',
      categoryId: parseInt(formData.categoryId),
      author: formData.author || null,
      difficulty: formData.difficulty || 'Beginner',
      timeToRead: formData.timeToRead ? parseInt(formData.timeToRead) : 5,
      featured: formData.featured || false,
      status: formData.status || 'draft',
      coverImage: formData.coverImage || null
    };
    
    console.log("Guide data to send:", guideData);
    console.log("Cover image value:", guideData.coverImage);
    updateGuideMutation.mutate({ id: editingGuide.id, data: guideData });
  };

  const handleDeleteGuide = (id: number) => {
    if (confirm("Are you sure you want to delete this guide?")) {
      deleteGuideMutation.mutate(id);
    }
  };

  const handleEditGuide = (guide: any) => {
    setEditingGuide(guide);
    setFormData({
      title: guide.title,
      description: guide.description || "",
      categoryId: guide.categoryId?.toString() || "",
      difficulty: guide.difficulty || "",
      timeToRead: guide.timeToRead || "",
      author: guide.author || "",
      content: guide.content || "",
      featured: guide.featured || false,
      status: guide.status || "draft",
      coverImage: guide.coverImage
    });
    setIsEditDialogOpen(true);
  };

  // Filter guides based on search and filters
  const filteredGuides = guides.filter((guide: any) => {
    const matchesSearch = !searchTerm || 
      guide.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
      guide.categoryId?.toString() === selectedCategory;
    
    const matchesStatus = selectedStatus === "all" || 
      guide.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get stats
  const totalGuides = guides.length;
  const publishedGuides = guides.filter((g: any) => g.status === "published").length;
  const totalViews = guides.reduce((acc: number, g: any) => acc + (g.views || 0), 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Loading guides...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (guidesError || categoriesError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              {guidesError ? `Error loading guides: ${guidesError.message}` : ''}
              {categoriesError ? `Error loading categories: ${categoriesError.message}` : ''}
            </p>
            <Button onClick={() => {
              refetchGuides();
              refetchCategories();
            }}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main UI
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Guides Manager</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Guide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Guide</DialogTitle>
                </DialogHeader>
                <GuideForm 
                  formData={formData}
                  setFormData={setFormData}
                  categories={categoriesData}
                  difficultyLevels={difficultyLevels}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGuide} disabled={createGuideMutation.isPending}>
                    {createGuideMutation.isPending ? "Creating..." : "Create Guide"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Guides</p>
                    <p className="text-2xl font-bold">{totalGuides}</p>
                  </div>
                  <Book className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Published</p>
                    <p className="text-2xl font-bold">{publishedGuides}</p>
                  </div>
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesData.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No guides found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuides.map((guide: any) => (
                    <TableRow key={guide.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{guide.title}</p>
                          {guide.featured && (
                            <Badge variant="secondary" className="mt-1">Featured</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {categoriesData.find((c: any) => c.id === guide.categoryId)?.title || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[guide.status as keyof typeof statusColors] || ""}>
                          {guide.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {guide.difficulty && (
                          <Badge variant="outline" className={difficultyColors[guide.difficulty as keyof typeof difficultyColors] || ""}>
                            {guide.difficulty}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{guide.views || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGuide(guide)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGuide(guide.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Guide</DialogTitle>
          </DialogHeader>
          <GuideForm 
            formData={formData}
            setFormData={setFormData}
            categories={categoriesData}
            difficultyLevels={difficultyLevels}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGuide} disabled={updateGuideMutation.isPending}>
              {updateGuideMutation.isPending ? "Updating..." : "Update Guide"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
