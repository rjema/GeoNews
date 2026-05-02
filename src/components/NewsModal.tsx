import { useState, useEffect, useRef } from 'react';
import {
  X,
  ExternalLink,
  RefreshCw,
  MapPin,
  Languages,
  AlertTriangle,
} from 'lucide-react';
import type { Article } from '../types';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  loading: boolean;
  error: string | null;
  country: string | null;
  selectedDate: string;
  onFetchMore: () => void;
}

export function NewsModal({
  isOpen,
  onClose,
  articles,
  loading,
  error,
  country,
  selectedDate,
  onFetchMore,
}: NewsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex >= articles.length - 1) {
      onFetchMore();
    }
    setCurrentIndex((prev) => Math.min(prev + 1, articles.length));
  };

  if (!isOpen) return null;

  const article = articles[currentIndex];
  const isFetchingMore = loading && currentIndex >= articles.length;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex-none relative h-28 bg-slate-900 flex items-end p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
          >
            <X size={20} />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <MapPin size={12} /> {country} • {selectedDate}
            </div>
            <h2 className="text-white text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              Archive Entry{' '}
              <span className="text-blue-500 ml-1">#{currentIndex + 1}</span>
            </h2>
          </div>
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth"
        >
          {(loading && articles.length === 0) || isFetchingMore ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
              <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse text-center">
                Fetching more stories...
              </p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <AlertTriangle className="text-amber-500" size={48} />
              <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">
                {error}
              </p>
              <button
                onClick={onClose}
                className="text-blue-600 font-bold text-sm bg-blue-50 px-6 py-2 rounded-full"
              >
                Close Reader
              </button>
            </div>
          ) : article ? (
            <article>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                    {article.source?.name?.[0] ?? 'N'}
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-slate-400 tracking-tighter">
                      Publisher
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                      {article.source?.name ?? 'Archive Source'}
                    </div>
                  </div>
                </div>
                {article.wasTranslated && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase border border-emerald-100">
                    <Languages size={14} /> English Access
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                  {article.title}
                </h1>
                <div className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed space-y-6 font-medium">
                  {article.content
                    ? article.content
                        .split('\n\n')
                        .map((p, i) => <p key={i}>{p}</p>)
                    : <p>{article.description}</p>}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600 text-xs font-bold flex items-center gap-2"
                >
                  <ExternalLink size={14} /> View original
                </a>
              </div>
            </article>
          ) : null}
        </div>

        {/* Footer */}
        {!loading && articles.length > 0 && (
          <div className="flex-none p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className={`flex-1 py-4 px-4 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-600 transition-colors ${
                currentIndex === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-slate-100'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex-[2] py-4 px-6 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              Shuffle Another Story <RefreshCw size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
