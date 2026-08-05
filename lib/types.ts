export type Role = "admin" | "member" | "pending";

export type Profile = {
  id: string;
  username: string;
  bio: string | null;
  role: Role;
  avatar_url: string | null;
  created_at: string;
  email?: string;
};

export type Post = {
  id: string;
  author_id: string;
  title: string;
  location_name: string;
  lat: number;
  lng: number;
  content: string;
  image_urls: string[];
  video_url: string | null;
  status: "published" | "pending";
  tags: string[];
  created_at: string;
  updated_at: string;
  author_username: string;
  like_count: number;
  comment_count: number;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_username: string;
};

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  role: Role;
  created_at: string;
  bio: string | null;
  avatar_url: string | null;
};
