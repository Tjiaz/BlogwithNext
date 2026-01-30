export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorImage?: string;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  featuredImage: string;
  isPublished: boolean;
  readingTime: string;
  views: number;
  likes: number;
  comments: Array<{
    user: string;
    text: string;
    createdAt: Date;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "admin" | "editor" | "viewer";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
