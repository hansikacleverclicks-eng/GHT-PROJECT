import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";
import fs from "fs";

const SEO_API_BASE = 'https://globalhotelsandtourism.com/seo/wp-json/seo/v1';
const SITE_URL = 'https://globalhotelsandtourism.com';

// Route → WP slug map
const ROUTE_SLUGS: Record<string, string> = {
  '/':                                '/home',
  '/hotels':                          '/hotels',
  '/all-hotels':                      '/hotels',
  '/vendors':                         '/vendor',
  '/awards':                          '/awards',
  '/current-affairs':                 '/current-affairs',
  '/blogs':                           '/blogs',
  '/AllCities':                       '/global-page',
  '/allcities':                       '/global-page',
  '/premier-destinations-DL-UK':      '/global-page',
  '/join-as-vendor':                  '/global-page',
  '/vendor-registration':             '/global-page',
  '/privacy-policy':                  '/global-page',
  '/disclaimer':                      '/global-page',
};

// Simple in-memory cache
const seoCache: Record<string, Record<string, string> | null> = {};

// Correct pattern: /wp-json/seo/v1/page/{slug-without-leading-slash}
async function fetchSEO(slug: string): Promise<Record<string, string> | null> {
  if (slug in seoCache) return seoCache[slug];
  const bare = slug.startsWith('/') ? slug.slice(1) : slug;
  try {
    const res  = await fetch(`${SEO_API_BASE}/page/${encodeURIComponent(bare)}`);
    if (!res.ok) {
      if (slug !== '/global-page') return fetchSEO('/global-page');
      seoCache[slug] = null;
      return null;
    }
    const data = await res.json() as unknown;
    const seo  = Array.isArray(data) ? data[0] : data;
    if (seo && (seo as Record<string,string>).meta_title) {
      seoCache[slug] = seo as Record<string, string>;
      return seoCache[slug];
    }
    if (slug !== '/global-page') return fetchSEO('/global-page');
    seoCache[slug] = null;
    return null;
  } catch {
    seoCache[slug] = null;
    return null;
  }
}

function esc(s: string | undefined | null): string {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function buildMetaTags(seo: Record<string, string>, route: string): string {
  const title    = esc(seo.meta_title)          || 'Global Hotels &amp; Tourism';
  const desc     = esc(seo.meta_description)    || '';
  const keywords = esc(seo.meta_keywords)       || '';
  const ogTitle  = esc(seo.og_title)            || title;
  const ogDesc   = esc(seo.og_description)      || desc;
  const ogImage  = (seo.og_image || '').startsWith('http')
    ? esc(seo.og_image) : `${SITE_URL}/ght_logo.png`;
  const ogType   = esc(seo.og_type)             || 'website';
  const twCard   = esc(seo.twitter_card)        || 'summary_large_image';
  const twTitle  = esc(seo.twitter_title)       || ogTitle;
  const twDesc   = esc(seo.twitter_description) || ogDesc;
  const twImage  = (seo.twitter_image || '').startsWith('http')
    ? esc(seo.twitter_image) : ogImage;
  const canonical = seo.canonical_url           || `${SITE_URL}${route}`;
  const robots   = `${seo.index_status || 'index'}, ${seo.follow_status || 'follow'}`;
  const author   = esc(seo.author)              || 'Global Hotels &amp; Tourism';

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}" />`,
    `<meta name="keywords" content="${keywords}" />`,
    `<meta name="author" content="${author}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${ogTitle}" />`,
    `<meta property="og:description" content="${ogDesc}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:site_name" content="Global Hotels &amp; Tourism" />`,
    `<meta name="twitter:card" content="${twCard}" />`,
    `<meta name="twitter:title" content="${twTitle}" />`,
    `<meta name="twitter:description" content="${twDesc}" />`,
    `<meta name="twitter:image" content="${twImage}" />`,
    `<meta name="twitter:site" content="@globalhotelsandtourism" />`,
  ].join('\n    ');
}

function injectSEO(html: string, metaTags: string): string {
  // Strip existing static tags to avoid duplicates
  const stripped = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta name="description"[^>]*>/gi, '')
    .replace(/<meta name="keywords"[^>]*>/gi, '')
    .replace(/<meta name="author"[^>]*>/gi, '')
    .replace(/<meta name="robots"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '')
    .replace(/<meta property="og:[^>]*>/gi, '')
    .replace(/<meta name="twitter:[^>]*>/gi, '');
  return stripped.replace('<head>', `<head>\n    ${metaTags}`);
}

// Vite plugin: uses configureServer to intercept HTML at the correct URL path
function seoInjectPlugin(): Plugin {
  let indexHtmlPath = '';

  return {
    name: 'seo-inject',
    apply: 'serve',

    configResolved(config) {
      indexHtmlPath = path.resolve(config.root, 'index.html');
    },

    configureServer(server) {
      // Run AFTER Vite's own middleware (so HMR etc. still work)
      return () => {
        server.middlewares.use(async (req, res, next) => {
          // Only handle HTML navigation requests (not assets/api)
          const url = req.url || '/';
          const pathname = url.split('?')[0];

          // Skip non-HTML requests
          if (
            pathname.includes('.') ||          // static files
            pathname.startsWith('/@') ||       // vite internals
            pathname.startsWith('/api') ||     // api
            pathname.startsWith('/backend')    // backend proxy
          ) {
            return next();
          }

          // Resolve WP slug from pathname
          const slug = ROUTE_SLUGS[pathname] || '/global-page';
          const seo  = await fetchSEO(slug);

          if (!seo) return next();

          // Read fresh index.html (Vite transforms it)
          try {
            let html = fs.readFileSync(indexHtmlPath, 'utf-8');
            // Let Vite transform it first (applies HMR scripts etc.)
            html = await server.transformIndexHtml(pathname, html);
            const injected = injectSEO(html, buildMetaTags(seo, pathname));

            res.setHeader('Content-Type', 'text/html');
            res.end(injected);
          } catch {
            next();
          }
        });
      };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        '/backend': {
          target: 'https://globalhotelsandtourism.com',
          changeOrigin: true,
          secure: true,
        },
        '^/(blogs|vendors|vendor-images|current-affairs|awards)/.+\\.(png|jpe?g|webp|gif|avif|svg)$': {
          target: 'https://globalhotelsandtourism.com',
          changeOrigin: true,
          secure: true,
        },
        '/seo/wp-content': {
          target: 'https://globalhotelsandtourism.com',
          changeOrigin: true,
          secure: true,
        },
      }
  },
  plugins: [
    react(),
    seoInjectPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
