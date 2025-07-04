export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt?: Date;
}

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  mediaType?: 'IMAGE' | 'VIDEO';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: User;
  familyId: string;
  family: Family;
  comments: Comment[];
  likes: Like[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
  authorId: string;
  author: User;
}

export interface Like {
  id: string;
  createdAt: Date;
  postId: string;
  userId: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  family: Family | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthResponse {
  user: User;
  family: Family | null;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  familyName?: string;
  inviteCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UploadedFile {
  originalName: string;
  fileName: string;
  mimetype: string;
  size: number;
  url: string;
  publicId: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  resourceType: 'image' | 'video';
}

export interface FileUploadResponse {
  files: UploadedFile[];
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}