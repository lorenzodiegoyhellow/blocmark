export type Comment = {
  author: string;
  authorImage?: string;
  date: string;
  content: string;
};

export type Subheading = {
  title: string;
  content: string[];
  image?: string;
};

export type BlogArticle = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  authorImage?: string;
  authorBio?: string;
  date: string;
  readTime: string;
  category: string;
  tags?: string[];
  content?: string[];
  subheadings?: Subheading[];
  featured?: boolean;
  likes?: number;
  commentCount?: number;
  comments?: Comment[];
};

export type RelatedArticle = {
  id: number;
  title: string;
  image: string;
  date: string;
  category: string;
};