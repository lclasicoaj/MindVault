import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, Repeat, CheckCircle } from 'lucide-react';
import { Recap } from '../types';
import { Button } from './Button';

interface FlashcardCarouselProps {
  items: Recap[]; // Changed from RecapWithBlog[] to Recap[] to support decoupled fetching
  chapterTitle: string;
}

export const FlashcardCarousel: React.FC<FlashcardCarouselProps> = ({ items, chapterTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset when chapter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [items]);

  const currentCard = items[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, 150);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (items.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, items.length]);

  if (!currentCard) return null;

  return (
    <div className="flex flex-col items-center justify-center py-4 select-none outline-none w-full">
      
      {/* Main Card Container */}
      <div 
        className="relative w-full max-w-4xl aspect-[16/10] md:aspect-[2/1] group mx-auto"
        style={{ perspective: '1000px' }}
      >
        
        {/* Navigation Arrows (Absolute positioned outside) */}
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-accent transition-colors hidden md:block z-10"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-accent transition-colors hidden md:block z-10"
        >
          <ChevronRight className="w-10 h-10" />
        </button>

        {/* The Card */}
        <div 
          className="relative w-full h-full transition-transform duration-500 cursor-pointer"
          onClick={handleFlip}
          style={{ 
            transformStyle: 'preserve-3d', 
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
          }}
        >
          
          {/* FRONT */}
          <div 
            className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl border-t-8 border-accent flex flex-col items-center justify-center p-8 md:p-12"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden', 
              transform: 'rotateY(0deg)' 
            }}
          >
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 md:mb-8 shadow-sm border border-blue-100">
              {chapterTitle} • Card {currentIndex + 1} / {items.length}
            </div>
            
            <h3 className="text-xl md:text-3xl font-bold text-gray-900 text-center leading-tight font-serif max-h-[60%] overflow-y-auto no-scrollbar flex-grow flex items-center justify-center">
              {currentCard.question}
            </h3>

            <div className="mt-8 md:absolute md:bottom-10 flex flex-col items-center gap-3 w-full">
               <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                Click or Press Space to Flip
              </p>
              <Button 
                onClick={(e) => { e.stopPropagation(); handleFlip(); }} 
                className="rounded-full px-6 py-2.5 shadow-lg shadow-blue-500/30 text-sm md:text-base"
              >
                <Eye className="w-4 h-4 mr-2" /> Reveal Answer
              </Button>
            </div>
          </div>

          {/* BACK */}
          <div 
            className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl border-t-8 border-green-500 flex flex-col items-center justify-center p-8 md:p-12"
            style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)' 
            }}
          >
             <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 md:mb-8 shadow-sm border border-green-100">
              Answer
            </div>

            <div className="text-base md:text-lg text-gray-800 leading-relaxed text-center font-serif max-h-[60%] overflow-y-auto w-full prose flex-grow flex items-center justify-center">
              {currentCard.answer}
            </div>

             <div className="mt-8 md:absolute md:bottom-10 flex flex-col items-center gap-3 w-full">
               <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                Did you recall this correctly?
              </p>
              <div className="flex gap-3">
                 <Button onClick={(e) => { e.stopPropagation(); handleNext(); }} variant="secondary" className="rounded-full border-gray-300 text-sm">
                    <Repeat className="w-3 h-3 mr-2" /> Review Later
                 </Button>
                 <Button onClick={(e) => { e.stopPropagation(); handleNext(); }} variant="primary" className="rounded-full bg-green-600 hover:bg-green-700 border-transparent shadow-lg shadow-green-500/30 text-sm">
                    <CheckCircle className="w-3 h-3 mr-2" /> I knew it
                 </Button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Keyboard Hint Footer */}
      <div className="mt-8 flex items-center gap-8 text-sm text-gray-400 font-medium opacity-60">
        <span className="flex items-center gap-2"><kbd className="bg-gray-200 px-2 py-1 rounded text-gray-600 font-sans text-xs">Space</kbd> Flip</span>
        <span className="hidden md:flex items-center gap-2"><kbd className="bg-gray-200 px-2 py-1 rounded text-gray-600 font-sans text-xs">←</kbd> Prev</span>
        <span className="hidden md:flex items-center gap-2"><kbd className="bg-gray-200 px-2 py-1 rounded text-gray-600 font-sans text-xs">→</kbd> Next</span>
      </div>

       {/* Mobile Controls */}
      <div className="flex md:hidden gap-4 mt-6 w-full px-4 max-w-sm">
         <Button onClick={handlePrev} variant="secondary" className="flex-1">Prev</Button>
         <Button onClick={handleNext} variant="secondary" className="flex-1">Next</Button>
      </div>

    </div>
  );
};
