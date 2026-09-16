import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, BookOpen, Tag, Home, ChevronRight } from 'lucide-react';
import breadcrumbBg from '@/assets/breadcums.jpeg';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BLOGS_API = '/backend/api/current_affairs.php';

interface Blog { id: string | number; title: string; slug?: string; excerpt?: string; content?: string; created_at?: string | null; image_url?: string; cover_image_url?: string; category?: string; author?: string; tags?: string; }
const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const getImage = (blog: Blog) => blog.cover_image_url || blog.image_url || '/ght_logo.png';

const getBlogHtml = (content = ''): string => {
  const source = content.trim();
  if (!source) return '';
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(source);
  if (looksLikeHtml) {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    doc.body.querySelectorAll('script, style, iframe, object, embed, meta, link, title, base').forEach(el => el.remove());
    doc.body.querySelectorAll<HTMLElement>('*').forEach(el => Array.from(el.attributes).forEach(attr => {
      if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
      if (['href', 'src', 'xlink:href'].includes(attr.name) && /^\s*javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
    }));
    return doc.body.innerHTML;
  }
  return source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').split(/\r?\n\s*\r?\n+/).map(block => `<p>${block.replace(/\r?\n/g, '<br />')}</p>`).join('');
};
const getTags = (tags?: string) => tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>(); const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { if (!slug) return; fetch(BLOGS_API).then(async r => { if (!r.ok) throw new Error('Failed to fetch blogs'); return r.json(); }).then(d => { if (!d?.success || !Array.isArray(d.data)) throw new Error('Invalid API response'); const post = d.data.find((b: Blog) => (b.slug || generateSlug(b.title)) === slug); if (!post) throw new Error('Blog not found'); setBlog(post); }).catch(e => setError(e.message || 'Unable to load blog.')).finally(() => setLoading(false)); }, [slug]);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin w-12 h-12 border-4 border-[#101c34] border-t-transparent rounded-full mx-auto mb-4" /><p className="text-gray-600">Loading article...</p></div></div>;
  if (error || !blog) return <div className="min-h-screen flex items-center justify-center"><div className="text-center max-w-md p-8"><BookOpen className="w-10 h-10 mx-auto mb-4 text-red-500" /><h2 className="text-xl font-semibold text-gray-800 mb-2">Article Not Found</h2><p className="text-gray-600 mb-6">{error}</p><Button onClick={() => navigate('/blogs')}><ArrowLeft className="w-4 h-4 mr-2" />Back to Blogs</Button></div></div>;
  const tags = getTags(blog.tags);
  return <div className="min-h-screen bg-gradient-to-br from-[#f0f2f7] via-white to-blue-50"><div className="relative w-full h-64 md:h-80 overflow-hidden"><img src={breadcrumbBg} alt={blog.title} className="absolute inset-0 w-full h-full object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-t from-[#101c34]/90 via-[#101c34]/55 to-black/25" /><div className="relative h-full flex flex-col justify-end px-6 pb-8 md:px-12 md:pb-10 container mx-auto"><nav className="flex items-center gap-1.5 text-white/70 text-sm mb-3"><Link to="/" className="flex items-center gap-1 hover:text-white"><Home className="w-3.5 h-3.5" />Home</Link><ChevronRight className="w-3.5 h-3.5 text-white/40" /><Link to="/blogs" className="hover:text-white">Blogs</Link><ChevronRight className="w-3.5 h-3.5 text-white/40" /><span className="text-white font-medium line-clamp-1">{blog.title}</span></nav><h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight line-clamp-2">{blog.title}</h1>{blog.category && <p className="text-white/70 mt-2 text-sm md:text-base">{blog.category}</p>}</div></div><article className="container mx-auto px-4 py-8 max-w-4xl"><div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg"><img src={getImage(blog)} alt={blog.title} className="w-full h-64 md:h-96 object-cover" onError={e => { (e.target as HTMLImageElement).src = '/ght_logo.png'; }} /></div><header className="mb-8"><div className="flex flex-wrap items-center gap-3 mb-4">{blog.category && <Badge variant="outline">{blog.category}</Badge>}</div>{blog.excerpt && <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: getBlogHtml(blog.excerpt) }} />}<div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-6 border-b border-gray-200">{blog.author && <div className="flex items-center gap-2"><div className="w-10 h-10 bg-gradient-to-r from-[#101c34] to-[#2a3f6b] rounded-full flex items-center justify-center text-white font-semibold">{blog.author.charAt(0).toUpperCase()}</div><div><p className="font-medium text-gray-900">{blog.author}</p><p className="text-xs text-gray-500">Author</p></div></div>}{blog.created_at && <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{formatDate(blog.created_at)}</span></div>}</div></header><div className="prose prose-lg prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-[#101c34] max-w-none mb-8" dangerouslySetInnerHTML={{ __html: getBlogHtml(blog.content) }} />{tags.length > 0 && <div className="mb-8"><div className="flex items-center gap-2 mb-3"><Tag className="w-4 h-4 text-gray-600" /><h3 className="text-lg font-semibold text-gray-900">Tags</h3></div><div className="flex flex-wrap gap-2">{tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div></div>}<div className="text-center mt-12 mb-4"><Button onClick={() => navigate('/blogs')} className="bg-gradient-to-r from-[#101c34] to-[#2a3f6b] px-8"><ArrowLeft className="w-4 h-4 mr-2" />Back to All Blogs</Button></div></article></div>;
}
