import React, { useEffect, useState } from 'react';
import { BookOpen, Brain, RefreshCw, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { fetchBlogsWithRecapCount, fetchRecapsByBlogId } from '../services/db';
import { Blog, Recap } from '../types';
import { Button } from './Button';
import { FlashcardCarousel } from './FlashcardCarousel';

interface RecapListProps {
  onReadBlog: (blogId: number) => void;
}

export const RecapList: React.FC<RecapListProps> = ({ onReadBlog }) => {
  // State for Headers (Blogs)
  const [blogs, setBlogs] = useState<Blog[]>([]);
  // Cache for Recaps: { blogId: Recap[] }
  const [recapCache, setRecapCache] = useState<Record<number, Recap[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [loadingChapter, setLoadingChapter] = useState<number | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadHeaders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogsWithRecapCount();
      setBlogs(data);
    } catch (err: any) {
      setError("Failed to load your memory bank. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeaders();
  }, []);

  const toggleChapter = async (blogId: number) => {
    const isExpanding = !expandedChapters.has(blogId);
    
    const newSet = new Set(expandedChapters);
    if (!isExpanding) {
      newSet.delete(blogId);
      setExpandedChapters(newSet);
    } else {
      newSet.add(blogId);
      setExpandedChapters(newSet);
      
      // Lazy Load Recaps if not in cache
      if (!recapCache[blogId]) {
        setLoadingChapter(blogId);
        try {
          const cards = await fetchRecapsByBlogId(blogId);
          setRecapCache(prev => ({ ...prev, [blogId]: cards }));
        } catch (err) {
          console.error("Failed to load cards for chapter", blogId);
          // Rollback expansion on error
          newSet.delete(blogId);
          setExpandedChapters(new Set(newSet));
        } finally {
          setLoadingChapter(null);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 text-accent" />
        <p>Loading your memory bank...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 bg-red-50 rounded-xl">
        <p>{error}</p>
        <Button onClick={loadHeaders} variant="secondary" className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
       <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="w-8 h-8 text-accent" />
          Active Recall
        </h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {blogs.length} Chapters
        </span>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No recaps yet</h3>
          <p className="text-gray-500 mt-2">Write a blog entry and add questions to see them here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => {
            const isChapterExpanded = expandedChapters.has(blog.id);
            const isLoadingThis = loadingChapter === blog.id;
            const cardCount = blog.recaps?.[0]?.count || 0;
            const items = recapCache[blog.id] || [];
            
            return (
              <div key={blog.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                {/* Chapter Header */}
                <div 
                    onClick={() => toggleChapter(blog.id)}
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center group"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Layers className="w-4 h-4 text-accent" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chapter</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-accent transition-colors">
                            {blog.title}
                        </h3>
                         <div className="mt-2 text-sm text-gray-500 flex items-center gap-3">
                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="font-medium text-gray-600">{cardCount} Cards</span>
                        </div>
                    </div>
                    <div className="ml-4">
                         {isLoadingThis ? (
                            <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                         ) : isChapterExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" /> 
                         ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Chapter Content (Flashcards) */}
                <div className={`border-t border-gray-100 bg-slate-50/50 transition-all duration-300 ease-in-out ${isChapterExpanded ? 'block' : 'hidden'}`}>
                    <div className="p-4 md:p-8">
                        {isLoadingThis ? (
                          <div className="text-center py-8 text-gray-400">Loading cards...</div>
                        ) : (
                          <>
                            <FlashcardCarousel items={items} chapterTitle={blog.title} />
                            <div className="flex justify-center pt-8 border-t border-gray-200/50 mt-8">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onReadBlog(blog.id); }}
                                    className="text-xs font-medium text-slate-500 hover:text-accent flex items-center px-4 py-2 rounded-full transition-colors hover:bg-white"
                                >
                                    <BookOpen className="w-3 h-3 mr-2" />
                                    Read Source Entry
                                </button>
                            </div>
                          </>
                        )}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
