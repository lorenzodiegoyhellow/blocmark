import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
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
import { GuideForm } from "@/components/admin/guide-form";

// Sample guides data - this would come from your backend
const guides = [
  {
    id: 1,
    title: "The Complete Guide to Location Scouting",
    description: "Learn the essential steps for finding and evaluating the perfect shooting location.",
    category: "Photography",
    categoryId: "photography",
    difficulty: "Intermediate",
    timeToRead: "15 min",
    author: "Sarah Chen",
    publishedDate: "March 15, 2024",
    status: "published",
    views: 1247,
    featured: true
  },
  {
    id: 2,
    title: "Maximizing Your Space as a Host",
    description: "Turn your property into a sought-after creative space with these proven strategies.",
    category: "For Hosts",
    categoryId: "hosting",
    difficulty: "Beginner",
    timeToRead: "12 min",
    author: "Marcus Rodriguez",
    publishedDate: "March 12, 2024",
    status: "published",
    views: 892,
    featured: true
  },
  {
    id: 3,
    title: "Natural Lighting Techniques for Indoor Shoots",
    description: "Master the art of using natural light to create stunning indoor photography.",
    category: "Photography",
    categoryId: "photography",
    difficulty: "Advanced",
    timeToRead: "20 min",
    author: "Elena Vasquez",
    publishedDate: "March 10, 2024",
    status: "published",
    views: 1834,
    featured: true
  },
  {
    id: 4,
    title: "Equipment Checklist for On-Location Filming",
    description: "Essential gear and backup equipment for successful video shoots.",
    category: "Videography",
    categoryId: "videography",
    difficulty: "Intermediate",
    timeToRead: "10 min",
    author: "David Park",
    publishedDate: "March 8, 2024",
    status: "draft",
    views: 0,
    featured: false
  }
];

const categories = [
  { id: "photography", title: "Photography" },
  { id: "videography", title: "Videography" },
  { id: "hosting", title: "For Hosts" },
  { id: "ai", title: "AI Tools" },
  { id: "production", title: "Production" },
  { id: "events", title: "Events" }
];

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

export default function GuidesManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<typeof guides[0] | null>(null);

  const [formData, setFormData] = useState<GuideFormData>({
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

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || guide.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === "all" || guide.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddGuide = () => {
    // Here you would typically make an API call to create the guide
    console.log("Adding guide:", formData);
    setIsAddDialogOpen(false);
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

  const handleEditGuide = (guide: typeof guides[0]) => {
    setEditingGuide(guide);
    setFormData({
      title: guide.title,
      description: guide.description,
      categoryId: guide.categoryId,
      difficulty: guide.difficulty,
      timeToRead: guide.timeToRead,
      author: guide.author,
      content: "", // Would load from backend
      featured: guide.featured,
      status: guide.status,
      coverImage: undefined // Would load from backend
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGuide = () => {
    // Here you would typically make an API call to update the guide
    console.log("Updating guide:", editingGuide?.id, formData);
    setIsEditDialogOpen(false);
    setEditingGuide(null);
  };

  const handleDeleteGuide = (guideId: number) => {
    if (confirm("Are you sure you want to delete this guide?")) {
      // Here you would typically make an API call to delete the guide
      console.log("Deleting guide:", guideId);
    }
  };

  // Use the GuideForm component

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Guides Management</h1>
          <p className="text-muted-foreground">Manage and organize your platform guides</p>
        </div>

        <Tabs defaultValue="all-guides" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all-guides">All Guides</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="all-guides" className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search guides..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Guide</DialogTitle>
                  </DialogHeader>
                  <GuideForm 
                    formData={formData}
                    setFormData={setFormData}
                    categories={categories}
                    difficultyLevels={difficultyLevels}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddGuide}>
                      Create Guide
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Guides Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuides.map((guide) => (
                      <TableRow key={guide.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{guide.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {guide.timeToRead}
                              {guide.featured && (
                                <Badge variant="outline" className="text-xs">Featured</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{guide.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[guide.status as keyof typeof statusColors]}>
                            {guide.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={difficultyColors[guide.difficulty as keyof typeof difficultyColors]}>
                            <BarChart3 className="h-3 w-3 mr-1" />
                            {guide.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>{guide.views.toLocaleString()}</TableCell>
                        <TableCell>{guide.author}</TableCell>
                        <TableCell>{guide.publishedDate}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Link href={`/guides/article/${guide.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {filteredGuides.length === 0 && (
              <div className="text-center py-12">
                <Book className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No guides found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first guide to get started"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Guides</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guides.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +3 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {guides.filter(g => g.status === 'published').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    75% of total guides
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {guides.reduce((sum, guide) => sum + guide.views, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Featured</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {guides.filter(g => g.featured).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently featured
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Most Popular Guides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guides
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((guide, index) => (
                      <div key={guide.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{guide.title}</div>
                            <div className="text-sm text-muted-foreground">{guide.category}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{guide.views.toLocaleString()} views</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Guide</DialogTitle>
            </DialogHeader>
            <GuideForm 
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              difficultyLevels={difficultyLevels}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateGuide}>
                Update Guide
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}