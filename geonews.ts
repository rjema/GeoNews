import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Globe, X, ExternalLink, RefreshCw, Info, MapPin, ChevronRight, Languages, Calendar, AlertTriangle, BookOpen, Clock, Sparkles } from 'lucide-react';

// --- Configuration ---
const API_KEY = ""; 
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'world-news-infinite-v5';

// Simplified GeoJSON for main regions
const COUNTRIES_GEOJSON = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "name": "Canada", "id": "CAN" }, "geometry": { "type": "Polygon", "coordinates": [[[-141,69],[-141,60],[-130,55],[-124,48],[-115,49],[-100,49],[-83,42],[-75,45],[-67,45],[-60,46],[-52,47],[-55,52],[-60,60],[-70,75],[-100,80],[-130,75],[-141,69]]] } },
    { "type": "Feature", "properties": { "name": "USA", "id": "USA" }, "geometry": { "type": "Polygon", "coordinates": [[[-125,48],[-100,49],[-80,48],[-67,45],[-75,25],[-82,25],[-100,26],[-117,32],[-125,48]]] } },
    { "type": "Feature", "properties": { "name": "France", "id": "FRA" }, "geometry": { "type": "Polygon", "coordinates": [[[-5,48],[8,49],[7,43],[-2,43],[-5,48]]] } },
    { "type": "Feature", "properties": { "name": "United Kingdom", "id": "GBR" }, "geometry": { "type": "Polygon", "coordinates": [[[-8,55],[-5,59],[2,59],[2,51],[-5,50],[-8,55]]] } },
    { "type": "Feature", "properties": { "name": "Brazil", "id": "BRA" }, "geometry": { "type": "Polygon", "coordinates": [[[-70,-10],[-60,5],[-45,0],[-35,-10],[-40,-30],[-60,-30],[-70,-10]]] } },
    { "type": "Feature", "properties": { "name": "Japan", "id": "JPN" }, "geometry": { "type": "Polygon", "coordinates": [[[130,30],[145,30],[145,45],[130,45],[130,30]]] } },
    { "type": "Feature", "properties": { "name": "Germany", "id": "DEU" }, "geometry": { "type": "Polygon", "coordinates": [[[6,50],[15,50],[15,55],[6,55],[6,50]]] } }
  ]
};

const getTranslatedUrl = (originalUrl) => {
  if (!originalUrl) return "#";
  try {
    const url = new URL(originalUrl);
    const domain = url.hostname.replace(/\./g, '-');
    return `https://${domain}.translate.goog${url.pathname}${url.search}&_x_tr_sl=auto&_x_tr_tl=en`;
  } catch (e) {
    return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(originalUrl)}`;
  }
};

const LandingPage = ({ onStart }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-blue-100">
          <Sparkles size={14} /> Infinite Discovery Mode
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
            Endless <br />
            <span className="text-blue-600 font-extrabold italic text-4xl md:text-5xl">Archive Reader</span>
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
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full max-w-xs px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-bold text-center text-xl cursor-pointer"
          />
        </div>

        <button 
          onClick={() => onStart(selectedDate)}
          className="group relative flex items-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
        >
          Start Exploring
          <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const NewsModal = ({ isOpen, onClose, articles, loading, error, country, selectedDate, onFetchMore }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo(0, 0);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex === articles.length - 1) {
      onFetchMore();
    }
    setCurrentIndex(prev => (prev + 1) % (articles.length + 1)); // allow logic to hit loading state if needed
  };

  if (!isOpen) return null;

  const article = articles[currentIndex];
  const isLastKnown = currentIndex >= articles.length;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex-none relative h-28 bg-slate-900 flex items-end p-6">
          <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors">
            <X size={20} />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <MapPin size={12} /> {country} • {selectedDate}
            </div>
            <h2 className="text-white text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              Archive Entry <span className="text-blue-500 ml-1">#{currentIndex + 1}</span>
            </h2>
          </div>
        </div>

        {/* Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
          {(loading && articles.length === 0) || (loading && isLastKnown) ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
              <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse text-center">
                Fetching more stories...
              </p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <AlertTriangle className="text-amber-500" size={48} />
              <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">{error}</p>
              <button onClick={onClose} className="text-blue-600 font-bold text-sm bg-blue-50 px-6 py-2 rounded-full">Close Reader</button>
            </div>
          ) : article ? (
            <article className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                    {article.source?.name?.[0] || 'N'}
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-slate-400 tracking-tighter">Publisher</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">{article.source?.name || 'Archive Source'}</div>
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
                  {article.content ? article.content.split('\n\n').map((p, i) => <p key={i}>{p}</p>) : <p>{article.description}</p>}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 text-xs font-bold flex items-center gap-2">
                  <ExternalLink size={14} /> View original
                </a>
              </div>
            </article>
          ) : null}
        </div>

        {/* Footer */}
        {!loading && articles.length > 0 && (
          <div className="flex-none p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <button 
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className={`flex-1 py-4 px-4 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-600 transition-colors ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
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
};

export default function App() {
  const [showMap, setShowMap] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  const fetchNews = useCallback(async (countryName, append = false) => {
    setIsLoading(true);
    if (!append) setArticles([]);
    
    const existingTitles = articles.map(a => a.title).join(", ");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `TASK: Find news events that occurred in ${countryName} on ${selectedDate}.
              
              CONTEXT: This is for an endless shuffle mode. Retrieve 3-4 NEW articles DIFFERENT from these: [${existingTitles}].
              
              RULES:
              - Full English translation of title, description, and content body.
              - Content body must be 3-5 detailed paragraphs.
              - Provide real URLs (wrap in translation proxy if non-English).
              
              JSON OUTPUT:
              [{"title": "...", "description": "...", "content": "...", "url": "...", "source": {"name": "..."}, "wasTranslated": boolean}]` 
            }] 
          }],
          tools: [{ google_search: {} }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.8 }
        })
      });

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        const list = JSON.parse(content);
        const processed = list.map(a => ({
          ...a,
          url: a.wasTranslated ? getTranslatedUrl(a.url) : (a.url || `https://www.google.com/search?q=${encodeURIComponent(a.title)}`)
        }));

        setArticles(prev => append ? [...prev, ...processed] : processed);
      }
    } catch (err) {
      setError("Archive retrieval timed out.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, articles]);

  useEffect(() => {
    if (!showMap) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      if (!mapRef.current || leafletMap.current) return;
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, minZoom: 2 }).setView([20, 0], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
      L.geoJSON(COUNTRIES_GEOJSON, {
        style: { fillColor: "#3b82f6", weight: 1, color: '#e2e8f0', fillOpacity: 0.05, cursor: 'pointer' },
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: (e) => e.target.setStyle({ fillOpacity: 0.2, color: '#3b82f6' }),
            mouseout: (e) => e.target.setStyle({ fillOpacity: 0.05, color: '#e2e8f0' }),
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedCountry(feature.properties.name);
              setIsModalOpen(true);
              fetchNews(feature.properties.name, false);
            }
          });
        }
      }).addTo(map);
      leafletMap.current = map;
    };
    document.head.appendChild(script);
  }, [showMap, fetchNews]);

  if (!showMap) return <LandingPage onStart={(d) => { setSelectedDate(d); setShowMap(true); }} />;

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
      <header className="z-[1000] p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white"><Globe size={18} /></div>
          <h1 className="text-xs font-black uppercase tracking-tight">Infinite Archive</h1>
        </div>
        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border">
          {selectedDate}
        </div>
      </header>
      <div ref={mapRef} className="flex-1 relative" />
      <NewsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        articles={articles}
        loading={isLoading}
        error={error}
        country={selectedCountry}
        selectedDate={selectedDate}
        onFetchMore={() => fetchNews(selectedCountry, true)}
      />
    </div>
  );
}s