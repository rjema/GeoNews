import { useState } from 'react';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { today } from '../lib/utils';

interface LandingPageProps {
  onStart: (date: string) => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [selectedDate, setSelectedDate] = useState(today());

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-blue-100">
          <Sparkles size={14} /> Infinite Discovery Mode
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
            Endless <br />
            <span className="text-blue-600 font-extrabold italic text-4xl md:text-5xl">
              Archive Reader
            </span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            Browse through an unlimited feed of localized history from any point on Earth.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 flex flex-col items-center">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            Pick an archive date
          </label>
          <input
            type="date"
            value={selectedDate}
            max={today()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full max-w-xs px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-bold text-center text-xl cursor-pointer"
          />
        </div>

        <button
          onClick={() => onStart(selectedDate)}
          className="group relative flex items-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-600/20 active:scale-95 mx-auto"
        >
          Start Exploring
          <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
