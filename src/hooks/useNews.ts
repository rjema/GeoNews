import { useState, useCallback } from 'react';
import type { Article } from '../types';
import { getTranslatedUrl } from '../lib/utils';

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(
    async (countryName: string, selectedDate: string, append = false) => {
      setIsLoading(true);
      setError(null);
      if (!append) setArticles([]);

      const existingTitles = append
        ? articles.map((a) => a.title)
        : [];

      try {
        const response = await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            countryName,
            selectedDate,
            existingTitles,
          }),
        });

        if (!response.ok) {
          throw new Error('Backend request failed');
        }

        const data = (await response.json()) as { articles?: Article[] };
        const list = Array.isArray(data.articles) ? data.articles : [];
        const processed = list.map((a) => ({
          ...a,
          url: a.wasTranslated
            ? getTranslatedUrl(a.url)
            : a.url ||
              `https://www.google.com/search?q=${encodeURIComponent(a.title)}`,
        }));
        setArticles((prev) => (append ? [...prev, ...processed] : processed));
      } catch {
        setError('Archive retrieval timed out.');
      } finally {
        setIsLoading(false);
      }
    },
    [articles],
  );

  const reset = useCallback(() => {
    setArticles([]);
    setError(null);
  }, []);

  return { articles, isLoading, error, fetchNews, reset };
}
