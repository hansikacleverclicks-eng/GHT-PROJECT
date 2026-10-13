// Shared blog helpers. Blogs now come from the WordPress install at /seo
// (the same source the live site uses), NOT from current_affairs.php.

export const BLOGS_API = 'https://globalhotelsandtourism.com/seo/wp-json/seo/v1/blogs';

export interface Blog {
  id: string | number;
  slug?: string;
  title: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  image?: string;
  thumbnail?: string;
  category?: string;
  tags?: string | string[];
  author?: string;
  publish_date?: string | null;
  created_at?: string | null;
}

// WordPress returns a plain array; older formats wrapped it in { blogs } or { posts }.
export const extractBlogs = (data: unknown): Blog[] => {
  if (Array.isArray(data)) return data as Blog[];
  const d = data as { blogs?: Blog[]; posts?: Blog[] } | null;
  return d?.blogs || d?.posts || [];
};

export const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

export const getBlogSlug = (blog: Blog) => blog.slug || generateSlug(blog.title);

export const getBlogImage = (blog: Blog) =>
  blog.featured_image || blog.image || blog.thumbnail || '/ght_logo.png';

export const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const getBlogExcerpt = (blog: Blog) => {
  const text = stripHtml(blog.excerpt?.trim() ? blog.excerpt : blog.content || '');
  return text.length > 160 ? `${text.slice(0, 160)}...` : text;
};

export const getBlogTags = (tags?: string | string[]): string[] => {
  if (!tags) return [];
  const list = Array.isArray(tags) ? tags : tags.split(',');
  return list.map(t => String(t).trim()).filter(Boolean);
};

// publish_date is null on some posts, so fall back to created_at.
export const getBlogDate = (blog: Blog) => blog.publish_date || blog.created_at || null;

export const formatBlogDate = (date?: string | null) => {
  if (!date) return '';
  const d = new Date(date.replace(' ', 'T'));
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};