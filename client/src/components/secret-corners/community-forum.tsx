import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, MessageSquareText, ThumbsUp, Calendar, Clock, ChevronRight, Edit, SendHorizonal, UserPlus, Reply, Eye } from 'lucide-react';

// Forum post schema
const forumPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  content: z.string().min(20, "Content must be at least 20 characters"),
  categoryId: z.string().min(1, "Please select a category"),
});

// Forum comment schema
const forumCommentSchema = z.object({
  content: z.string().min(5, "Comment must be at least 5 characters"),
});

// Types
interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface ForumUser {
  id: number;
  name: string;
  image?: string;
  role?: "admin" | "moderator" | "user";
}

interface ForumComment {
  id: number;
  content: string;
  user: ForumUser;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: ForumComment[];
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  category: ForumCategory;
  user: ForumUser;
  createdAt: string;
  likes: number;
  views: number;
  comments: number;
  isPinned?: boolean;
  isLocked?: boolean;
  isLiked?: boolean;
}

interface ForumCategoryCardProps {
  category: ForumCategory;
  postsCount: number;
  onClick?: () => void;
}

function ForumCategoryCard({ category, postsCount, onClick }: ForumCategoryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{category.name}</CardTitle>
        <CardDescription className="line-clamp-2">{category.description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-2 text-sm text-muted-foreground">
        <MessageSquare className="w-4 h-4 mr-1" /> {postsCount} {postsCount === 1 ? 'post' : 'posts'}
      </CardFooter>
    </Card>
  );
}

interface ForumPostCardProps {
  post: ForumPost;
  onClick?: () => void;
}

function ForumPostCard({ post, onClick }: ForumPostCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2 space-y-2">
        <div className="flex items-start justify-between">
          <Badge variant="outline">{post.category.name}</Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" /> {post.views}
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" /> {post.comments}
            </div>
          </div>
        </div>
        <CardTitle className="text-lg font-semibold">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
      </CardContent>
      <CardFooter className="pt-2 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={post.user.image} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{post.user.name}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </div>
      </CardFooter>
    </Card>
  );
}

interface ForumPostDetailProps {
  post: ForumPost;
  comments: ForumComment[];
  onAddComment: (comment: string) => void;
  onLikePost: () => void;
  onLikeComment: (commentId: number) => void;
  onReplyToComment: (commentId: number, content: string) => void;
}

function ForumPostDetail({ 
  post, 
  comments, 
  onAddComment, 
  onLikePost, 
  onLikeComment, 
  onReplyToComment 
}: ForumPostDetailProps) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  const commentForm = useForm({
    resolver: zodResolver(forumCommentSchema),
    defaultValues: {
      content: '',
    },
  });
  
  const handleSubmitComment = (data: { content: string }) => {
    onAddComment(data.content);
    commentForm.reset();
  };
  
  const renderComments = (commentsList: ForumComment[], isReplies = false) => {
    return commentsList.map((comment) => (
      <div key={comment.id} className={`mb-4 ${isReplies ? 'ml-8 pl-4 border-l' : ''}`}>
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.image} />
            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-sm">{comment.user.name}</div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => onLikeComment(comment.id)}
              >
                <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.isLiked ? 'fill-primary text-primary' : ''}`} />
                {comment.likes > 0 && comment.likes}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3.5 w-3.5 mr-1" />
                Reply
              </Button>
            </div>
            
            {replyingTo === comment.id && (
              <div className="mt-2 flex gap-2">
                <Input 
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="text-sm h-8"
                />
                <Button 
                  size="sm" 
                  className="h-8"
                  onClick={() => {
                    if (replyContent.trim()) {
                      onReplyToComment(comment.id, replyContent);
                      setReplyContent('');
                      setReplyingTo(null);
                    }
                  }}
                >
                  Reply
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8" 
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {renderComments(comment.replies, true)}
          </div>
        )}
      </div>
    ));
  };
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="mb-2">{post.category.name}</Badge>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Eye className="w-4 h-4 mr-1" />
              {post.views} views
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        
        <div className="flex items-center mb-4">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={post.user.image} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{post.user.name}</span>
        </div>
        
        <div className="py-4 whitespace-pre-line">{post.content}</div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={onLikePost}
          >
            <ThumbsUp className={`h-4 w-4 ${post.isLiked ? 'fill-primary text-primary' : ''}`} />
            <span>{post.likes > 0 && post.likes}</span>
            Like
          </Button>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
        
        <div className="mb-6">
          <Form {...commentForm}>
            <form onSubmit={commentForm.handleSubmit(handleSubmitComment)} className="space-y-3">
              <FormField
                control={commentForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Add a comment..." 
                        {...field} 
                        rows={3} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">Post Comment</Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="space-y-2">
          {comments.length > 0 ? renderComments(comments) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquareText className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof forumPostSchema>) => void;
  categories: ForumCategory[];
}

function CreatePostModal({ isOpen, onClose, onSubmit, categories }: CreatePostModalProps) {
  const form = useForm<z.infer<typeof forumPostSchema>>({
    resolver: zodResolver(forumPostSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
    },
  });
  
  const handleSubmit = (data: z.infer<typeof forumPostSchema>) => {
    onSubmit(data);
    form.reset();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, questions, or experiences with the community.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
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
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a descriptive title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post content here..."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Post</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface CommunityForumProps {
  categories: ForumCategory[];
  posts: ForumPost[];
  currentUser?: ForumUser;
}

export function CommunityForum({ 
  categories = [], 
  posts = [], 
  currentUser 
}: Partial<CommunityForumProps>) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [comments, setComments] = useState<ForumComment[]>([]);
  
  // Filter posts based on active tab or selected category
  const filteredPosts = selectedCategory
    ? posts.filter(post => post.category.id === selectedCategory.id)
    : posts;
  
  const handleCreatePost = (data: z.infer<typeof forumPostSchema>) => {
    console.log('Creating new post:', data);
    // Here you would typically send this data to your API
  };
  
  const handlePostClick = (post: ForumPost) => {
    setSelectedPost(post);
    // In a real app, you would fetch the comments for this post
    // For now, we'll just show an empty array
    setComments([]);
  };
  
  const handleBackToList = () => {
    setSelectedPost(null);
  };
  
  const handleAddComment = (content: string) => {
    console.log('Adding comment:', content);
    // Here you would send the comment to your API
  };
  
  const handleLikePost = () => {
    console.log('Liking post');
    // Here you would send the like to your API
  };
  
  const handleLikeComment = (commentId: number) => {
    console.log('Liking comment:', commentId);
    // Here you would send the like to your API
  };
  
  const handleReplyToComment = (commentId: number, content: string) => {
    console.log('Replying to comment:', commentId, content);
    // Here you would send the reply to your API
  };
  
  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Community Forum</h2>
          <p className="text-muted-foreground">Connect, ask questions, and share tips with fellow explorers</p>
        </div>
        <Button onClick={() => setShowCreatePostModal(true)}>Create Post</Button>
      </div>
      
      {selectedPost ? (
        <div>
          <Button variant="ghost" className="mb-4" onClick={handleBackToList}>
            <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
            Back to forum
          </Button>
          <ForumPostDetail 
            post={selectedPost}
            comments={comments}
            onAddComment={handleAddComment}
            onLikePost={handleLikePost}
            onLikeComment={handleLikeComment}
            onReplyToComment={handleReplyToComment}
          />
        </div>
      ) : selectedCategory ? (
        <div>
          <div className="flex items-center mb-4">
            <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
              <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
              All Categories
            </Button>
            <span className="mx-2 text-muted-foreground">/</span>
            <h3 className="font-semibold">{selectedCategory.name}</h3>
          </div>
          
          <p className="text-muted-foreground mb-6">{selectedCategory.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <ForumPostCard 
                  key={post.id} 
                  post={post} 
                  onClick={() => handlePostClick(post)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <MessageSquareText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-muted-foreground mb-4">No posts in this category yet</p>
                <Button onClick={() => setShowCreatePostModal(true)}>Create First Post</Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <ForumPostCard 
                      key={post.id} 
                      post={post} 
                      onClick={() => handlePostClick(post)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <MessageSquareText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-muted-foreground mb-4">No posts yet</p>
                    <Button onClick={() => setShowCreatePostModal(true)}>Create First Post</Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="categories">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => {
                  const categoryPostsCount = posts.filter(post => post.category.id === category.id).length;
                  return (
                    <ForumCategoryCard
                      key={category.id}
                      category={category}
                      postsCount={categoryPostsCount}
                      onClick={() => setSelectedCategory(category)}
                    />
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="popular">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.sort((a, b) => b.likes - a.likes).slice(0, 6).map(post => (
                  <ForumPostCard 
                    key={post.id} 
                    post={post} 
                    onClick={() => handlePostClick(post)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recent">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6).map(post => (
                  <ForumPostCard 
                    key={post.id} 
                    post={post} 
                    onClick={() => handlePostClick(post)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSubmit={handleCreatePost}
        categories={categories}
      />
    </div>
  );
}