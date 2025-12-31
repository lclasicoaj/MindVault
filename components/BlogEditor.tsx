import React, { useState } from 'react';
import { Plus, Trash2, Save, BookOpen, FileJson, X, Check } from 'lucide-react';
import { NewRecapItem } from '../types';
import { saveBlogEntry } from '../services/db';
import { Button } from './Button';

interface BlogEditorProps {
  onSaved: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ onSaved }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recaps, setRecaps] = useState<NewRecapItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // JSON Import State
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const addRecap = () => {
    setRecaps([...recaps, { question: '', answer: '' }]);
  };

  const updateRecap = (index: number, field: keyof NewRecapItem, value: string) => {
    const newRecaps = [...recaps];
    newRecaps[index] = { ...newRecaps[index], [field]: value };
    setRecaps(newRecaps);
  };

  const removeRecap = (index: number) => {
    setRecaps(recaps.filter((_, i) => i !== index));
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("JSON must contain a 'questions' array.");
      }

      const newItems: NewRecapItem[] = parsed.questions.map((q: any) => {
        // Format the answer. If options exist, map the key (e.g., 'c') to the text.
        let answerText = q.answer;
        
        if (q.options && q.answer && q.options[q.answer]) {
          answerText = `${q.answer}) ${q.options[q.answer]}`;
        }

        return {
          question: q.question || "Unknown Question",
          answer: answerText || "No answer provided"
        };
      });

      setRecaps([...recaps, ...newItems]);
      setJsonInput('');
      setShowJsonImport(false);
      setError(null);
    } catch (err: any) {
      setError("Invalid JSON format: " + err.message);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both the title and content.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Filter out empty recaps
      const validRecaps = recaps.filter(r => r.question.trim() && r.answer.trim());
      await saveBlogEntry(title, content, validRecaps);
      
      // Reset form
      setTitle('');
      setContent('');
      setRecaps([]);
      onSaved();
    } catch (err: any) {
      setError(err.message || "Failed to save blog post.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-accent" />
          Write & Reflect
        </h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you learn today?"
              className="w-full text-2xl font-bold border-b-2 border-gray-200 focus:border-accent focus:outline-none py-2 px-1 transition-colors placeholder-gray-400 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blog Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts here..."
              className="w-full h-64 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-accent focus:border-transparent transition-all font-serif leading-relaxed resize-y bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Recap Questions</h3>
          <div className="flex gap-2">
             <Button 
              onClick={() => setShowJsonImport(!showJsonImport)} 
              variant="ghost" 
              className="text-sm border border-dashed border-gray-300 bg-gray-50"
            >
              <FileJson className="w-4 h-4 mr-2" /> 
              {showJsonImport ? 'Cancel JSON' : 'Import JSON'}
            </Button>
            <Button onClick={addRecap} variant="secondary" className="text-sm">
              <Plus className="w-4 h-4 mr-1" /> Add Question
            </Button>
          </div>
        </div>

        {/* JSON Import Panel */}
        {showJsonImport && (
          <div className="bg-slate-50 border-2 border-dashed border-accent/30 rounded-xl p-4 mb-6 animate-fade-in-up">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Paste JSON here
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-40 font-mono text-sm p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-accent focus:outline-none mb-3 bg-white text-gray-900"
              placeholder={'{\n  "questions": [\n    {\n      "question": "Sample?",\n      "options": {"a": "Yes", "b": "No"},\n      "answer": "a"\n    }\n  ]\n}'}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowJsonImport(false)} variant="ghost" className="text-xs">
                Cancel
              </Button>
              <Button onClick={handleJsonImport} variant="primary" className="text-xs">
                <Check className="w-3 h-3 mr-1" /> Parse & Add
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {recaps.length === 0 && !showJsonImport && (
            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              No questions added yet. Import JSON or add them manually!
            </div>
          )}
          
          {recaps.map((recap, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative group animate-fade-in-up">
              <button
                onClick={() => removeRecap(index)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Remove Question"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">Question</label>
                  <input
                    type="text"
                    value={recap.question}
                    onChange={(e) => updateRecap(index, 'question', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-1 focus:ring-accent focus:outline-none bg-white text-gray-900"
                    placeholder="e.g., What is the primary key?"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">Answer</label>
                  <textarea
                    value={recap.answer}
                    onChange={(e) => updateRecap(index, 'answer', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-1 focus:ring-accent focus:outline-none h-20 resize-none bg-white text-gray-900"
                    placeholder="The answer to recall..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-6 flex justify-end">
        <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-100">
            <Button onClick={handleSave} isLoading={isSaving} className="shadow-lg">
                <Save className="w-5 h-5 mr-2" /> Save Entry
            </Button>
        </div>
      </div>
    </div>
  );
};
