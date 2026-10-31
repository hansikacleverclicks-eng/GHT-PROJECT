import { useLocation } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import SEOHead from './SEOHead';

const SITE_URL = 'https://globalhotelsandtourism.com';

// Maps React Router paths to WP page slugs
// Prefix matches: /city-hotels/* → /global-page, etc.
function resolveSlug(pathname: string): string {
  const exact: Record<string, string> = {
    '/':                              '/home',
    '/hotels':                        '/hotels',
    '/all-hotels':                    '/hotels',
    '/vendors':                       '/vendor',
    '/awards':                        '/awards',
    '/current-affairs':               '/current-affairs',
    '/blogs':                         '/blogs',
    '/premier-destinations-DL-UK':    '/global-page',
    '/join-as-vendor':                '/global-page',
    '/vendor-registration':           '/global-page',
    '/privacy-policy':                '/global-page',
    '/disclaimer':                    '/global-page',
  };

  if (exact[pathname]) return exact[pathname];

  // Dynamic routes — use global-page as fallback
  // e.g. /blog/:slug, /blogs/:slug, /city/:slug, /vendor/:id
  return '/global-page';
}

interface DynamicSEOProps {
  /** Override slug — if not provided, auto-detected from current URL */
  slug?: string;
}

export default function DynamicSEO({ slug: slugProp }: DynamicSEOProps) {
  const { pathname } = useLocation();
  const slug = slugProp || resolveSlug(pathname);
  const pageUrl = `${SITE_URL}${pathname}`;

  const { seo } = useSEO(slug);

  if (!seo) return null;

  const robots = `${seo.index_status || 'index'}, ${seo.follow_status || 'follow'}`;

  // Only pass a value if it's non-empty — SEOHead defaults handle the rest
  const val = (s?: string) => (s && s.trim()) ? s : undefined;


  console.log("val is ",val);
  

  return (
    <SEOHead
      title={val(seo.meta_title)}
      description={val(seo.meta_description)}
      keywords={val(seo.meta_keywords)}
      url={val(seo.canonical_url) || pageUrl}
      type={val(seo.og_type) || 'website'}
      ogTitle={val(seo.og_title)}
      ogDescription={val(seo.og_description)}
      ogImage={val(seo.og_image)}
      twitterCard={val(seo.twitter_card) || 'summary_large_image'}
      twitterTitle={val(seo.twitter_title)}
      twitterDescription={val(seo.twitter_description)}
      twitterImage={val(seo.twitter_image)}
      canonical={val(seo.canonical_url) || pageUrl}
      robots={robots}
      author={val(seo.author)}
      language={val(seo.language) || 'en'}
    />
  );
}
