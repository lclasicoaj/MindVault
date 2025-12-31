import { supabase } from './supabase';
import { Blog, Recap, NewRecapItem, RecapWithBlog } from '../types';

// --- Auth Helpers ---
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

// --- Blog & Recap Actions ---

export const saveBlogEntry = async (title: string, content: string, recaps: NewRecapItem[]) => {
  const user = await getUser();
  if (!user) throw new Error("You must be logged in to save.");

  // 1. Insert the Blog with user_id
  const { data: blogData, error: blogError } = await supabase
    .from('blogs')
    .insert([{ 
      title, 
      content,
      user_id: user.id 
    }])
    .select()
    .single();

  if (blogError) throw blogError;
  if (!blogData) throw new Error("Failed to create blog entry");

  const newBlog = blogData as Blog;

  // 2. Insert Recaps linked to the Blog
  if (recaps.length > 0) {
    const recapsToInsert = recaps.map(r => ({
      blog_id: newBlog.id,
      question: r.question,
      answer: r.answer
    }));

    const { error: recapError } = await supabase
      .from('recaps')
      .insert(recapsToInsert);

    if (recapError) throw recapError;
  }

  return newBlog;
};

// Optimized: Fetches only blogs and the count of recaps (not the recaps themselves)
export const fetchBlogsWithRecapCount = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*, recaps(count)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data || []) as Blog[];
};

// Optimized: Fetches recaps only for a specific blog (Lazy Loading)
export const fetchRecapsByBlogId = async (blogId: number): Promise<Recap[]> => {
  const { data, error } = await supabase
    .from('recaps')
    .select('*')
    .eq('blog_id', blogId)
    .order('id', { ascending: true }); // Keep them in order of creation/ID

  if (error) throw error;
  return (data || []) as Recap[];
};

// Legacy support if needed, but preferred to use separate fetches now
export const fetchAllRecaps = async (): Promise<RecapWithBlog[]> => {
  const { data, error } = await supabase
    .from('recaps')
    .select(`
      *,
      blogs (
        id,
        title,
        content,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as RecapWithBlog[];
};

export const fetchBlogById = async (id: number): Promise<Blog | null> => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching blog", error);
    return null;
  }
  return data as Blog;
};
