import { useState } from 'react';
import { Globe } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { WorldMap } from './components/WorldMap';
import { NewsModal } from './components/NewsModal';
import { useNews } from './hooks/useNews';

export default function App() {
  const [showMap, setShowMap] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [modalInstanceKey, setModalInstanceKey] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { articles, isLoading, error, fetchNews, reset } = useNews();

  const handleStart = (date: string) => {
    setSelectedDate(date);
    setShowMap(true);
  };

  const handleCountryClick = (countryName: string) => {
    reset();
    setModalInstanceKey((prev) => prev + 1);
    setSelectedCountry(countryName);
    setIsModalOpen(true);
    fetchNews(countryName, selectedDate, false);
  };

  const handleFetchMore = () => {
    if (selectedCountry) {
      fetchNews(selectedCountry, selectedDate, true);
    }
  };

  if (!showMap) return <LandingPage onStart={handleStart} />;

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
      <header className="z-[1000] p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
            <Globe size={18} />
          </div>
          <h1 className="text-xs font-black uppercase tracking-tight">
            GeoNews
          </h1>
        </div>
        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border">
          {selectedDate}
        </div>
      </header>

      <WorldMap onCountryClick={handleCountryClick} />

      <NewsModal
        key={modalInstanceKey}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        articles={articles}
        loading={isLoading}
        error={error}
        country={selectedCountry}
        selectedDate={selectedDate}
        onFetchMore={handleFetchMore}
      />
    </div>
  );
}
