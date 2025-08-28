import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertForumCategorySchema, insertForumPostSchema, insertForumCommentSchema } from "@shared/schema";
import { z } from "zod";

export const forumRouter = Router();

// Middleware to check if user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "You must be logged in to perform this action" });
}

// Get all forum categories
forumRouter.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await storage.getForumCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching forum categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Create a new forum category (admin only)
forumRouter.post("/categories", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user.roles?.includes("admin")) {
      return res.status(403).json({ error: "Only admins can create categories" });
    }

    const categoryData = insertForumCategorySchema.parse(req.body);
    const category = await storage.createForumCategory(categoryData);
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid category data", details: error.errors });
    }
    console.error("Error creating forum category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Get all posts (optionally filtered by category)
forumRouter.get("/posts", async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const posts = await storage.getForumPosts(categoryId);
    
    // Fetch user information for each post
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        return {
          ...post,
          author: user ? {
            id: user.id,
            username: user.username,
            profileImage: user.profileImage
          } : null
        };
      })
    );
    
    res.json(postsWithUsers);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Get a specific post with comments
forumRouter.get("/posts/:id", async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    
    // Increment view count
    await storage.incrementForumPostViews(postId);
    
    // Get the post
    const post = await storage.getForumPost(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Get post author
    const author = await storage.getUser(post.userId);
    
    // Get comments
    const comments = await storage.getForumComments(postId);
    
    // Get comment authors
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const commentAuthor = await storage.getUser(comment.userId);
        
        // Check if current user has liked this comment
        let hasLiked = false;
        if (req.isAuthenticated()) {
          hasLiked = await storage.hasUserLikedForumItem(
            (req.user as any).id,
            'comment',
            comment.id
          );
        }
        
        return {
          ...comment,
          author: commentAuthor ? {
            id: commentAuthor.id,
            username: commentAuthor.username,
            profileImage: commentAuthor.profileImage
          } : null,
          hasLiked
        };
      })
    );
    
    // Check if current user has liked this post
    let hasLiked = false;
    if (req.isAuthenticated()) {
      hasLiked = await storage.hasUserLikedForumItem(
        (req.user as any).id,
        'post',
        postId
      );
    }
    
    res.json({
      ...post,
      author: author ? {
        id: author.id,
        username: author.username,
        profileImage: author.profileImage,
        bio: author.bio
      } : null,
      comments: commentsWithAuthors,
      hasLiked
    });
  } catch (error) {
    console.error("Error fetching forum post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Create a new post
forumRouter.post("/posts", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const postData = insertForumPostSchema.parse({
      ...req.body,
      userId
    });
    
    const post = await storage.createForumPost(postData);
    
    // Return post with author info
    const author = await storage.getUser(userId);
    res.status(201).json({
      ...post,
      author: author ? {
        id: author.id,
        username: author.username,
        profileImage: author.profileImage
      } : null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid post data", details: error.errors });
    }
    console.error("Error creating forum post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Update a post
forumRouter.put("/posts/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if user owns the post or is an admin
    const post = await storage.getForumPost(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    if (post.userId !== userId && !(req.user as any).roles?.includes("admin")) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }
    
    const updatedPost = await storage.updateForumPost(postId, req.body);
    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating forum post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Delete a post
forumRouter.delete("/posts/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if user owns the post or is an admin
    const post = await storage.getForumPost(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    if (post.userId !== userId && !(req.user as any).roles?.includes("admin")) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }
    
    await storage.deleteForumPost(postId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting forum post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// Create a comment
forumRouter.post("/posts/:id/comments", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    const commentData = insertForumCommentSchema.parse({
      ...req.body,
      postId,
      userId
    });
    
    const comment = await storage.createForumComment(commentData);
    
    // Return comment with author info
    const author = await storage.getUser(userId);
    res.status(201).json({
      ...comment,
      author: author ? {
        id: author.id,
        username: author.username,
        profileImage: author.profileImage
      } : null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid comment data", details: error.errors });
    }
    console.error("Error creating forum comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// Update a comment
forumRouter.put("/comments/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if user owns the comment or is an admin
    const comment = await storage.getForumComment(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    if (comment.userId !== userId && !(req.user as any).roles?.includes("admin")) {
      return res.status(403).json({ error: "You can only edit your own comments" });
    }
    
    const updatedComment = await storage.updateForumComment(commentId, { content: req.body.content });
    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating forum comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// Delete a comment
forumRouter.delete("/comments/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if user owns the comment or is an admin
    const comment = await storage.getForumComment(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    if (comment.userId !== userId && !(req.user as any).roles?.includes("admin")) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }
    
    await storage.deleteForumComment(commentId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting forum comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Like/unlike a post or comment
forumRouter.post("/likes", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { targetType, targetId } = req.body;
    
    if (!['post', 'comment'].includes(targetType)) {
      return res.status(400).json({ error: "Invalid target type" });
    }
    
    // Check if already liked
    const alreadyLiked = await storage.hasUserLikedForumItem(userId, targetType, targetId);
    
    if (alreadyLiked) {
      // Unlike
      await storage.deleteForumLike(userId, targetType, targetId);
      res.json({ liked: false });
    } else {
      // Like
      await storage.createForumLike({ userId, targetType, targetId });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// Get user's posts
forumRouter.get("/users/:userId/posts", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const posts = await storage.getForumPostsByUser(userId);
    
    // Add author info
    const user = await storage.getUser(userId);
    const postsWithAuthor = posts.map(post => ({
      ...post,
      author: user ? {
        id: user.id,
        username: user.username,
        profileImage: user.profileImage
      } : null
    }));
    
    res.json(postsWithAuthor);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
});

// Admin endpoints for forum moderation

// Delete a post (admin only)
forumRouter.delete("/posts/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Check if user is admin
    if (!user.roles?.includes("admin")) {
      return res.status(403).json({ error: "Only admins can delete posts" });
    }
    
    await storage.deleteForumPost(postId);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// Toggle pin status (admin only)
forumRouter.patch("/posts/:id/pin", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const user = req.user as any;
    
    if (!user.roles?.includes("admin")) {
      return res.status(403).json({ error: "Only admins can pin posts" });
    }
    
    const { isPinned } = req.body;
    const updatedPost = await storage.updateForumPost(postId, { isPinned });
    res.json(updatedPost);
  } catch (error) {
    console.error("Error toggling pin status:", error);
    res.status(500).json({ error: "Failed to update pin status" });
  }
});

// Toggle lock status (admin only)
forumRouter.patch("/posts/:id/lock", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const user = req.user as any;
    
    if (!user.roles?.includes("admin")) {
      return res.status(403).json({ error: "Only admins can lock posts" });
    }
    
    const { isLocked } = req.body;
    const updatedPost = await storage.updateForumPost(postId, { isLocked });
    res.json(updatedPost);
  } catch (error) {
    console.error("Error toggling lock status:", error);
    res.status(500).json({ error: "Failed to update lock status" });
  }
});