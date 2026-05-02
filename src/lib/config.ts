// Set VITE_GEMINI_API_KEY in a .env file at the project root
export const GEMINI_API_KEY: string = import.meta.env.VITE_GEMINI_API_KEY ?? '';

export const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
