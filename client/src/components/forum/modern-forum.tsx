import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Plus, 
  ArrowLeft,
  Pin,
  Lock,
  Clock,
  User,
  TrendingUp,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

// Form schemas
const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  categoryId: z.number().min(1, 'Please select a category')
});

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty')
});

type CreatePostForm = z.infer<typeof createPostSchema>;
type CreateCommentForm = z.infer<typeof createCommentSchema>;

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

interface ForumPost {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  content: string;
  views: number;
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    profileImage?: string;
  } | null;
  hasLiked?: boolean;
  comments?: ForumComment[];
  category?: ForumCategory;
}

interface ForumComment {
  id: number;
  userId: number;
  postId: number;
  parentId?: number;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    profileImage?: string;
  } | null;
  hasLiked?: boolean;
}

export function ModernForum() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'mostViewed' | 'mostCommented'>('newest');
  const [filterTimeRange, setFilterTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const postsPerPage = 9; // 3x3 grid
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch categories
  const { data: categories = [] } = useQuery<ForumCategory[]>({
    queryKey: ['/api/forum/categories'],
    staleTime: 5 * 60 * 1000
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<ForumPost[]>({
    queryKey: selectedCategory 
      ? ['/api/forum/posts', { categoryId: selectedCategory }]
      : ['/api/forum/posts'],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/forum/posts?categoryId=${selectedCategory}`
        : '/api/forum/posts';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  // Fetch single post with comments
  const { data: postDetails, refetch: refetchPost } = useQuery<ForumPost>({
    queryKey: ['/api/forum/posts', selectedPost?.id],
    queryFn: async () => {
      const response = await fetch(`/api/forum/posts/${selectedPost?.id}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      return response.json();
    },
    enabled: !!selectedPost
  });

  // Create post form
  const createPostForm = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: selectedCategory || 1
    }
  });

  // Create comment form
  const createCommentForm = useForm<CreateCommentForm>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: ''
    }
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      console.log('Creating post with data:', data);
      return apiRequest({
        url: '/api/forum/posts',
        method: 'POST',
        body: data
      });
    },
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
      toast({
        title: 'Success',
        description: 'Your post has been created'
      });
      setIsCreatePostOpen(false);
      createPostForm.reset();
      setSelectedPost(newPost);
    },
    onError: (error: any) => {
      console.error('Failed to create post:', error);
      const message = error?.message || 'Failed to create post. Please make sure you are logged in.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    }
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data: CreateCommentForm) => 
      apiRequest({
        url: `/api/forum/posts/${selectedPost?.id}/comments`,
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts', selectedPost?.id] });
      toast({
        title: 'Success',
        description: 'Your comment has been posted'
      });
      createCommentForm.reset();
      refetchPost();
    },
    onError: (error: any) => {
      console.error('Failed to post comment:', error);
      const message = error?.message || 'Failed to post comment. Please make sure you are logged in.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    }
  });

  // Like/unlike mutation
  const toggleLikeMutation = useMutation({
    mutationFn: ({ targetType, targetId }: { targetType: 'post' | 'comment', targetId: number }) =>
      apiRequest({
        url: '/api/forum/likes',
        method: 'POST',
        body: { targetType, targetId }
      }),
    onSuccess: () => {
      if (selectedPost) {
        refetchPost();
      }
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId: number) =>
      apiRequest({
        url: `/api/forum/posts/${postId}`,
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
      toast({
        title: 'Success',
        description: 'Your post has been deleted'
      });
      setSelectedPost(null); // Go back to forum list
    },
    onError: (error: any) => {
      console.error('Failed to delete post:', error);
      const message = error?.message || 'Failed to delete post';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    }
  });

  // Filter posts based on search and time range
  let filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply time range filter
  if (filterTimeRange !== 'all') {
    const now = new Date();
    const timeRanges = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    
    filteredPosts = filteredPosts.filter(post => {
      const postDate = new Date(post.createdAt);
      return now.getTime() - postDate.getTime() < timeRanges[filterTimeRange];
    });
  }

  // Apply sorting
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return b.likes - a.likes;
      case 'mostViewed':
        return b.views - a.views;
      case 'mostCommented':
        return (b.comments?.length || 0) - (a.comments?.length || 0);
      default:
        return 0;
    }
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Get category info
  const getCategoryInfo = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId);
  };

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="hover:bg-blue-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(1)}
              className="w-10"
            >
              1
            </Button>
            {startPage > 2 && <span className="text-gray-400">...</span>}
          </>
        )}

        {pageNumbers.map(number => (
          <Button
            key={number}
            variant={currentPage === number ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(number)}
            className="w-10"
          >
            {number}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              className="w-10"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="hover:bg-blue-50"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  if (selectedPost && postDetails) {
    // Post Detail View
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto px-4 py-8"
      >
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setSelectedPost(null)}
          className="mb-6 hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Post Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {postDetails.isPinned && (
                      <Badge className="mb-3 bg-yellow-500 text-black">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    <CardTitle className="text-3xl mb-4">{postDetails.title}</CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 border-2 border-white">
                          <AvatarImage src={postDetails.author?.profileImage} />
                          <AvatarFallback className="bg-white text-blue-600">
                            {postDetails.author?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {postDetails.author?.username || 'Anonymous'}
                          </p>
                          <p className="text-xs opacity-90">
                            {formatDistanceToNow(new Date(postDetails.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Post Actions Dropdown - Only show for post author */}
                  {user && postDetails.author && user.id === postDetails.author.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setPostToDelete(postDetails.id);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600 hover:text-red-700 focus:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  {postDetails.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t">
                  <Button
                    variant={postDetails.hasLiked ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLikeMutation.mutate({ targetType: 'post', targetId: postDetails.id })}
                    className="hover:scale-105 transition-transform"
                  >
                    <ThumbsUp className={`h-4 w-4 mr-2 ${postDetails.hasLiked ? 'fill-current' : ''}`} />
                    {postDetails.likes} {postDetails.likes === 1 ? 'Like' : 'Likes'}
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    {postDetails.views} views
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    {postDetails.comments?.length || 0} comments
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({postDetails.comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Add Comment Form */}
                {user && !postDetails.isLocked && (
                  <Form {...createCommentForm}>
                    <form onSubmit={createCommentForm.handleSubmit((data) => createCommentMutation.mutate(data))} className="mb-8">
                      <FormField
                        control={createCommentForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Share your thoughts..." 
                                rows={4}
                                className="resize-none focus:ring-2 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={createCommentMutation.isPending}
                      >
                        {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </form>
                  </Form>
                )}

                {/* Comments List */}
                <AnimatePresence>
                  <div className="space-y-6">
                    {postDetails.comments?.map((comment, index) => (
                      <motion.div 
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-lg p-6"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author?.profileImage} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-sm">
                                {comment.author?.username || 'Anonymous'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <p className="text-gray-700 mb-3">{comment.content}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLikeMutation.mutate({ targetType: 'comment', targetId: comment.id })}
                              className="h-8 px-2"
                            >
                              <ThumbsUp className={`h-3 w-3 mr-1 ${comment.hasLiked ? 'fill-current text-blue-600' : ''}`} />
                              {comment.likes}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>

                {(!postDetails.comments || postDetails.comments.length === 0) && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Post Stats */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-lg">Post Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-bold text-xl">{postDetails.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-bold text-xl">{postDetails.likes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-bold text-xl">{postDetails.comments?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Category Info */}
            {postDetails.categoryId && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="px-3 py-1">
                    {getCategoryInfo(postDetails.categoryId)?.name || 'General'}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Forum List View
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Community Forum
        </h1>
        <p className="text-gray-600 text-lg">
          Connect, share, and learn from fellow explorers
        </p>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg border-2 focus:border-blue-500"
          />
        </div>
        <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
          <DialogTrigger asChild>
            {user ? (
              <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-5 w-5 mr-2" />
                New Discussion
              </Button>
            ) : (
              <Button 
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={(e) => {
                  e.preventDefault();
                  toast({
                    title: 'Login Required',
                    description: 'Please log in to create a new discussion',
                    variant: 'destructive'
                  });
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                New Discussion
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
            </DialogHeader>
            <Form {...createPostForm}>
              <form onSubmit={createPostForm.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-6">
                <FormField
                  control={createPostForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createPostForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="What's your topic?" className="text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createPostForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Share your thoughts, tips, or questions..." 
                          rows={10}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsCreatePostOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sort and Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="mostViewed">Most Viewed</option>
            <option value="mostCommented">Most Commented</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Show:</label>
          <select
            value={filterTimeRange}
            onChange={(e) => setFilterTimeRange(e.target.value as any)}
            className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {(searchQuery || filterTimeRange !== 'all' || sortBy !== 'newest') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setFilterTimeRange('all');
              setSortBy('newest');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="rounded-full"
        >
          All Topics
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="rounded-full"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Posts Grid */}
      {postsLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="h-48 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : sortedPosts.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">No discussions yet</p>
            <p className="text-gray-500">Be the first to start a conversation!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {paginatedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-lg h-full"
                  onClick={() => setSelectedPost(post)}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      {post.isPinned && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {post.isLocked && (
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {getCategoryInfo(post.categoryId)?.name || 'General'}
                      </Badge>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 line-clamp-3 mb-4 flex-1">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author?.profileImage} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{post.author?.username || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments?.length || 0}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
          
          {/* Pagination Controls */}
          <PaginationControls />
          
          {/* Results Info */}
          <div className="text-center mt-4 text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedPosts.length)} of {sortedPosts.length} discussions
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
              All comments on this post will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setPostToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (postToDelete) {
                  deletePostMutation.mutate(postToDelete);
                  setShowDeleteDialog(false);
                  setPostToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}