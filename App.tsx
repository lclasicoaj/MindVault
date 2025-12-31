import React, { useState, useEffect } from 'react';
import { PenTool, Layers, LogOut } from 'lucide-react';
import { supabase } from './services/supabase';
import { signOut } from './services/db';
import { BlogEditor } from './components/BlogEditor';
import { RecapList } from './components/RecapList';
import { BlogReader } from './components/BlogReader';
import { Auth } from './components/Auth';
import { ViewState } from './types';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.WRITE);
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReadBlog = (id: number) => {
    setSelectedBlogId(id);
    setCurrentView(ViewState.READING);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.WRITE:
        return <BlogEditor onSaved={() => setCurrentView(ViewState.RECAP)} />;
      case ViewState.RECAP:
        return <RecapList onReadBlog={handleReadBlog} />;
      case ViewState.READING:
        return (
          <BlogReader 
            blogId={selectedBlogId!} 
            onBack={() => setCurrentView(ViewState.RECAP)} 
          />
        );
      default:
        return <BlogEditor onSaved={() => setCurrentView(ViewState.RECAP)} />;
    }
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-gray-400">Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentView(ViewState.WRITE)}>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                MindVault
              </span>
            </div>
            
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentView(ViewState.WRITE)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  currentView === ViewState.WRITE
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Write
              </button>
              <button
                onClick={() => setCurrentView(ViewState.RECAP)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  currentView === ViewState.RECAP || currentView === ViewState.READING
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4 mr-2" />
                Recap
              </button>
              
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              
              <button
                onClick={() => signOut()}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto py-6 px-4 text-center text-xs text-gray-400">
          <p>Private Local Instance • Stored in Supabase</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
