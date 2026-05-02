export function getTranslatedUrl(originalUrl: string): string {
  if (!originalUrl) return '#';
  try {
    const url = new URL(originalUrl);
    const domain = url.hostname.replace(/\./g, '-');
    return `https://${domain}.translate.goog${url.pathname}${url.search}&_x_tr_sl=auto&_x_tr_tl=en`;
  } catch {
    return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(originalUrl)}`;
  }
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}
