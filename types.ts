export interface Blog {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface Recap {
  id: number;
  blog_id: number;
  question: string;
  answer: string;
  created_at?: string;
}

export interface RecapWithBlog extends Recap {
  blogs: Blog | null; // Joined data from Supabase
}

export enum ViewState {
  WRITE = 'WRITE',
  RECAP = 'RECAP',
  READING = 'READING'
}

export interface NewRecapItem {
  question: string;
  answer: string;
}
