import { supabase } from './supabase';
import { Blog, Recap, NewRecapItem, RecapWithBlog } from '../types';

export const saveBlogEntry = async (title: string, content: string, recaps: NewRecapItem[]) => {
  // 1. Insert the Blog
  const { data: blogData, error: blogError } = await supabase
    .from('blogs')
    .insert([{ title, content }])
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
  
  // Cast the joined data manually because Supabase TS types generation is separate
  // In a real app we'd use generated types, but here we cast for simplicity.
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
