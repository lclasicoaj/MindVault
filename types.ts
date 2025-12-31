export interface Blog {
  id: number;
  user_id?: string;
  title: string;
  content: string;
  created_at: string;
  // Helper for lazy loading count
  recaps?: { count: number }[];
}

export interface Recap {
  id: number;
  blog_id: number;
  question: string;
  answer: string;
  created_at?: string;
}

export interface RecapWithBlog extends Recap {
  blogs: Blog | null; 
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
