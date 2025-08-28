import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Plus, 
  ArrowLeft,
  Pin,
  Lock,
  Edit,
  Trash,
  Clock,
  User
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

export function ForumSection() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<boolean>(false);
  
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
      categoryId: selectedCategory || 0
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
    mutationFn: (data: CreatePostForm) => 
      apiRequest('/api/forum/posts', 'POST', data),
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
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive'
      });
    }
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data: CreateCommentForm) => 
      apiRequest(`/api/forum/posts/${selectedPost?.id}/comments`, 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts', selectedPost?.id] });
      toast({
        title: 'Success',
        description: 'Your comment has been posted'
      });
      createCommentForm.reset();
      refetchPost();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive'
      });
    }
  });

  // Like/unlike mutation
  const toggleLikeMutation = useMutation({
    mutationFn: ({ targetType, targetId }: { targetType: 'post' | 'comment', targetId: number }) =>
      apiRequest('/api/forum/likes', 'POST', { targetType, targetId }),
    onSuccess: () => {
      refetchPost();
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId: number) =>
      apiRequest(`/api/forum/posts/${postId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
      toast({
        title: 'Success',
        description: 'Post deleted successfully'
      });
      setSelectedPost(null);
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      apiRequest(`/api/forum/comments/${commentId}`, 'DELETE'),
    onSuccess: () => {
      refetchPost();
      toast({
        title: 'Success',
        description: 'Comment deleted successfully'
      });
    }
  });

  // Filter posts based on search
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render post list
  const renderPostList = () => (
    <div className="space-y-4">
      {/* Search and Create Post */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>
                Share your thoughts with the community
              </DialogDescription>
            </DialogHeader>
            <Form {...createPostForm}>
              <form onSubmit={createPostForm.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
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
                        <Input {...field} placeholder="Enter post title" />
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
                          placeholder="What's on your mind?" 
                          rows={8}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsCreatePostOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
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

      {/* Category Tabs */}
      <Tabs value={selectedCategory?.toString() || 'all'} onValueChange={(value) => {
        setSelectedCategory(value === 'all' ? null : parseInt(value));
      }}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All Categories</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id.toString()}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Posts List */}
      {postsLoading ? (
        <div className="text-center py-8">Loading posts...</div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <Card 
              key={post.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPost(post)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.isPinned && (
                        <Badge variant="secondary">
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
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.author?.profileImage} />
                          <AvatarFallback>
                            {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{post.author?.username || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render post detail view
  const renderPostDetail = () => {
    if (!postDetails) return null;

    return (
      <div className="space-y-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => setSelectedPost(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Button>

        {/* Post Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {postDetails.isPinned && (
                    <Badge variant="secondary">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  {postDetails.isLocked && (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{postDetails.title}</CardTitle>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={postDetails.author?.profileImage} />
                      <AvatarFallback>
                        {postDetails.author?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {postDetails.author?.username || 'Unknown'}
                      </p>
                      <p className="text-xs">
                        {formatDistanceToNow(new Date(postDetails.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{postDetails.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none mb-6">
              {postDetails.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">{paragraph}</p>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant={postDetails.hasLiked ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLikeMutation.mutate({ targetType: 'post', targetId: postDetails.id })}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {postDetails.likes} {postDetails.likes === 1 ? 'Like' : 'Likes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Comments ({postDetails.comments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment Form */}
            {!postDetails.isLocked && (
              <Form {...createCommentForm}>
                <form onSubmit={createCommentForm.handleSubmit((data) => createCommentMutation.mutate(data))} className="mb-6">
                  <FormField
                    control={createCommentForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Add a comment..." 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="mt-2"
                    disabled={createCommentMutation.isPending}
                  >
                    {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              </Form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {postDetails.comments?.map(comment => (
                <div key={comment.id} className="border-l-2 border-muted pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author?.profileImage} />
                          <AvatarFallback>
                            {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {comment.author?.username || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{comment.content}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={comment.hasLiked ? "default" : "ghost"}
                          size="sm"
                          onClick={() => toggleLikeMutation.mutate({ targetType: 'comment', targetId: comment.id })}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {comment.likes}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(!postDetails.comments || postDetails.comments.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
        <p className="text-muted-foreground">
          Join the discussion and share your experiences with the community
        </p>
      </div>

      {selectedPost ? renderPostDetail() : renderPostList()}
    </div>
  );
}