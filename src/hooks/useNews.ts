import { useState, useCallback } from 'react';
import type { Article } from '../types';
import { GEMINI_URL } from '../lib/config';
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
        ? articles.map((a) => a.title).join(', ')
        : '';

      try {
        const response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `TASK: Find news events that occurred in ${countryName} on ${selectedDate}.

CONTEXT: This is for an endless shuffle mode. Retrieve 3-4 NEW articles DIFFERENT from these: [${existingTitles}].

RULES:
- Full English translation of title, description, and content body.
- Content body must be 3-5 detailed paragraphs.
- Provide real URLs (wrap in translation proxy if non-English).

JSON OUTPUT:
[{"title": "...", "description": "...", "content": "...", "url": "...", "source": {"name": "..."}, "wasTranslated": boolean}]`,
                  },
                ],
              },
            ],
            tools: [{ google_search: {} }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.8,
            },
          }),
        });

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (content) {
          const list: Article[] = JSON.parse(content);
          const processed = list.map((a) => ({
            ...a,
            url: a.wasTranslated
              ? getTranslatedUrl(a.url)
              : a.url ||
                `https://www.google.com/search?q=${encodeURIComponent(a.title)}`,
          }));
          setArticles((prev) => (append ? [...prev, ...processed] : processed));
        }
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
