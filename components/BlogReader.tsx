import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Blog } from '../types';
import { fetchBlogById } from '../services/db';

interface BlogReaderProps {
  blogId: number;
  onBack: () => void;
}

export const BlogReader: React.FC<BlogReaderProps> = ({ blogId, onBack }) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchBlogById(blogId);
      setBlog(data);
      setLoading(false);
    };
    load();
  }, [blogId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading entry...</div>;
  if (!blog) return <div className="p-8 text-center text-red-500">Blog not found.</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-[80vh] shadow-sm border border-gray-100 rounded-xl overflow-hidden my-8">
      <div className="p-8 border-b border-gray-100 bg-gray-50">
        <button 
          onClick={onBack}
          className="flex items-center text-sm text-gray-500 hover:text-accent mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Recaps
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{blog.title}</h1>
        <p className="text-sm text-gray-400">
          Posted on {new Date(blog.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="p-8 prose prose-slate max-w-none">
        <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
          {blog.content}
        </div>
      </div>
    </div>
  );
};
