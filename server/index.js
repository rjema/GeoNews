import 'dotenv/config';
import cors from 'cors';
import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 8787);
const freeNewsApiKey =
  process.env.FREE_NEWS_API_KEY ?? process.env.VITE_FREE_NEWS_API_KEY;
const FREE_NEWS_BASE_URL = 'https://api.freenewsapi.io/v1';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const COUNTRY_CODE_BY_NAME = {
  canada: 'ca',
  usa: 'us',
  'united states': 'us',
  france: 'fr',
  'united kingdom': 'gb',
  brazil: 'br',
  japan: 'jp',
  germany: 'de',
};

function toCountryCode(countryName) {
  const normalized = String(countryName ?? '').trim().toLowerCase();
  return COUNTRY_CODE_BY_NAME[normalized] ?? '';
}

function startAndEndOfDay(selectedDate) {
  const start = new Date(`${selectedDate}T00:00:00.000Z`);
  const end = new Date(`${selectedDate}T23:59:59.999Z`);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function pickUrl(detail, summary) {
  const candidates = [
    detail?.url,
    detail?.article_url,
    detail?.source_url,
    detail?.original_url,
    detail?.link,
    summary?.url,
    summary?.article_url,
    summary?.source_url,
    summary?.original_url,
    summary?.link,
  ];
  const firstValid = candidates.find(
    (value) => typeof value === 'string' && value.length > 0,
  );
  return firstValid ?? '';
}

function normalizeArticle(summary, detail) {
  const title =
    typeof detail?.title === 'string'
      ? detail.title
      : typeof summary?.title === 'string'
        ? summary.title
        : 'Untitled';
  const description =
    typeof detail?.subtitle === 'string'
      ? detail.subtitle
      : typeof detail?.incipit === 'string'
        ? detail.incipit
      : typeof summary?.subtitle === 'string'
        ? summary.subtitle
        : typeof summary?.incipit === 'string'
          ? summary.incipit
        : '';
  const content =
    typeof detail?.body === 'string'
      ? detail.body
      : typeof summary?.body === 'string'
        ? summary.body
        : description;
  const publisher =
    typeof detail?.publisher === 'string'
      ? detail.publisher
      : typeof summary?.publisher === 'string'
        ? summary.publisher
        : 'Archive Source';

  const languages = Array.isArray(detail?.languages)
    ? detail.languages
    : Array.isArray(summary?.languages)
      ? summary.languages
      : [];
  const isEnglish = languages.some(
    (value) => String(value).toLowerCase().trim() === 'en',
  );

  return {
    title,
    description: description || 'No summary available.',
    content: content || description || 'No article body available.',
    url: pickUrl(detail, summary),
    source: { name: publisher },
    wasTranslated: !isEnglish,
  };
}

function buildListUrl({
  countryCode,
  startIso,
  endIso,
  includeDateRange,
  includeCountry,
  countryName,
}) {
  const url = new URL(`${FREE_NEWS_BASE_URL}/news`);
  url.searchParams.set('language', 'en');
  url.searchParams.set('order_by', 'archive');
  url.searchParams.set('page_size', '20');
  if (includeDateRange) {
    url.searchParams.set('published_after', startIso);
    url.searchParams.set('published_before', endIso);
  }
  if (includeCountry && countryCode) {
    url.searchParams.set('country', countryCode);
  } else if (countryName) {
    url.searchParams.set('in_title', countryName);
  }
  return url;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/news', async (req, res) => {
  if (!freeNewsApiKey) {
    return res.status(500).json({
      error:
        'Missing FREE_NEWS_API_KEY in server environment. Add it to your .env file.',
    });
  }

  const countryName = String(req.body?.countryName ?? '').trim();
  const selectedDate = String(req.body?.selectedDate ?? '').trim();
  const existingTitles = Array.isArray(req.body?.existingTitles)
    ? req.body.existingTitles
        .map((value) => String(value).trim())
        .filter((value) => value.length > 0)
    : [];

  if (!countryName || !selectedDate) {
    return res
      .status(400)
      .json({ error: 'countryName and selectedDate are required.' });
  }

  const countryCode = toCountryCode(countryName);
  const { startIso, endIso } = startAndEndOfDay(selectedDate);

  try {
    const queryPlans = [
      { includeDateRange: true, includeCountry: true },
      { includeDateRange: true, includeCountry: false },
      { includeDateRange: false, includeCountry: true },
      { includeDateRange: false, includeCountry: false },
    ];

    let rawItems = [];
    let lastProviderError = '';

    for (const plan of queryPlans) {
      const listUrl = buildListUrl({
        countryCode,
        startIso,
        endIso,
        includeDateRange: plan.includeDateRange,
        includeCountry: plan.includeCountry,
        countryName,
      });
      const listResponse = await fetch(listUrl, {
        headers: { 'x-api-key': freeNewsApiKey },
      });

      if (!listResponse.ok) {
        lastProviderError = (await listResponse.text()).slice(0, 500);
        continue;
      }

      const listPayload = await listResponse.json();
      const items = Array.isArray(listPayload?.data) ? listPayload.data : [];
      if (items.length > 0) {
        rawItems = items;
        break;
      }
    }

    if (rawItems.length === 0 && lastProviderError) {
      return res.status(502).json({
        error: 'Upstream provider request failed.',
        details: lastProviderError,
      });
    }

    const withoutDuplicates = rawItems.filter((item) => {
      const title = String(item?.title ?? '').trim();
      return title && !existingTitles.includes(title);
    });
    const picked = withoutDuplicates.slice(0, 4);

    const detailResults = await Promise.all(
      picked.map(async (item) => {
        const uuid = String(item?.uuid ?? '').trim();
        if (!uuid) return normalizeArticle(item, null);

        const detailUrl = new URL(`${FREE_NEWS_BASE_URL}/details`);
        detailUrl.searchParams.set('uuid', uuid);

        try {
          const detailResponse = await fetch(detailUrl, {
            headers: { 'x-api-key': freeNewsApiKey },
          });
          if (!detailResponse.ok) {
            return normalizeArticle(item, null);
          }
          const detailPayload = await detailResponse.json();
          return normalizeArticle(item, detailPayload?.data ?? null);
        } catch {
          return normalizeArticle(item, null);
        }
      }),
    );

    const articles = detailResults.filter(
      (item) => item.title && (item.description || item.content),
    );
    return res.json({ articles });
  } catch {
    return res.status(500).json({ error: 'Archive retrieval timed out.' });
  }
});

app.listen(port, () => {
  console.log(`GeoNews backend listening on http://localhost:${port}`);
});
