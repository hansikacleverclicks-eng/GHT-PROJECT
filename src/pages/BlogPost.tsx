import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, BookOpen, Heart, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { getCurrentAffairs, type BlogPost as BlogPostType } from '@/data/currentAffairsData';
import { Helmet } from 'react-helmet-async';
import { articleSchema } from '@/components/seo/schemas';

const BlogPost = () => {
	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();
	const [blogPost, setBlogPost] = useState<BlogPostType | null>(null);
	const [content, setContent] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		const loadBlogPost = async () => {
			if (!slug) {
				setError('Blog post not found');
				setLoading(false);
				return;
			}

			// Find the blog post metadata
			const allPosts = await getCurrentAffairs();
			const post = allPosts.find(p => p.slug === slug);
			
			if (!post) {
				setError('Blog post not found');
				setLoading(false);
				return;
			}

			setBlogPost(post);

			try {
				// First try to get from localStorage (dynamically added content)
				const localContent = localStorage.getItem(`blog_${slug}`);
				if (localContent) {
					setContent(localContent);
					setLoading(false);
					return;
				}

				// Fallback to markdown files
				const response = await fetch(`/blogs/${slug}.md`);
				if (response.ok) {
					const markdownContent = await response.text();
					setContent(markdownContent);
				} else {
					setError('Blog content not available');
				}
			} catch (err) {
				console.error('Error loading blog content:', err);
				setError('Error loading blog content');
			} finally {
				setLoading(false);
			}
		};

		loadBlogPost();
	}, [slug]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[#f0f2f7] via-white to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-12 h-12 bg-[#e8ebf3] rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
						<BookOpen className="w-6 h-6 text-[#101c34]" />
					</div>
					<p className="text-gray-600">Loading article...</p>
				</div>
			</div>
		);
	}

	if (error || !blogPost) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[#f0f2f7] via-white to-blue-50 flex items-center justify-center">
				<div className="text-center max-w-md mx-auto p-8">
					<div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
						<BookOpen className="w-8 h-8 text-red-600" />
					</div>
					<h2 className="text-xl font-semibold text-gray-800 mb-2">Article Not Found</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<Button onClick={() => navigate('/current-affairs')} className="bg-gradient-to-r from-[#101c34] to-[#2a3f6b] hover:bg-[#0d1829]">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Articles
					</Button>
				</div>
			</div>
		);
	}

	const articleLd = blogPost ? articleSchema({
		title: blogPost.title,
		description: blogPost.excerpt || blogPost.content || undefined,
		authorName: blogPost.author,
		datePublished: blogPost.publishedAt,
		dateModified: blogPost.publishedAt,
		url: `https://globalhotelsandtourism.com/blog/${blogPost.slug}`,
		image: blogPost.image ? `https://globalhotelsandtourism.com${blogPost.image}` : undefined
	}) : undefined;

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#f0f2f7] via-white to-blue-50">
			{blogPost && (
				<Helmet>
					<title>{blogPost.title} | Global Hotels &amp; Tourism</title>
					<meta name="description" content={blogPost.excerpt || blogPost.content || ''} />
					<meta name="keywords" content={(blogPost.tags || []).join(', ')} />
					<meta property="og:title" content={`${blogPost.title} | Global Hotels & Tourism`} />
					<meta property="og:description" content={blogPost.excerpt || ''} />
					<meta property="og:image" content={blogPost.image ? `https://globalhotelsandtourism.com${blogPost.image}` : 'https://globalhotelsandtourism.com/ght_logo.png'} />
					<meta property="og:url" content={`https://globalhotelsandtourism.com/blog/${blogPost.slug}`} />
					<meta property="og:type" content="article" />
					<meta name="twitter:card" content="summary_large_image" />
					<meta name="twitter:title" content={`${blogPost.title} | Global Hotels & Tourism`} />
					<meta name="twitter:description" content={blogPost.excerpt || ''} />
					<link rel="canonical" href={`https://globalhotelsandtourism.com/blog/${blogPost.slug}`} />
					{articleLd && <script type="application/ld+json">{JSON.stringify(articleLd)}</script>}
				</Helmet>
			)}
			{/* Header */}
			<div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
				<div className="container mx-auto px-4 py-4">
					<Button
						onClick={() => navigate('/current-affairs')}
						variant="ghost"
						className="hover:bg-[#f0f2f7]"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Articles
					</Button>
				</div>
			</div>

			{/* Article Content */}
			<article className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Hero Image */}
				<div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
					<img
						src={blogPost.image}
						alt={blogPost.title}
						className="w-full h-64 md:h-96 object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
					{blogPost.featured && (
						<Badge className="absolute top-6 left-6 bg-gradient-to-r from-[#101c34] to-[#2a3f6b] text-white">
							Featured Article
						</Badge>
					)}
				</div>

				{/* Article Header */}
				<header className="mb-8">
					<div className="flex flex-wrap items-center gap-3 mb-4">
						<Badge variant="outline" className="bg-[#f0f2f7] text-[#101c34] border-[#b8c0d8]">
							{blogPost.category}
						</Badge>
						<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
							{blogPost.city}
						</Badge>
					</div>

					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
						{blogPost.title}
					</h1>

					<p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
						{blogPost.excerpt}
					</p>

					{/* Meta Information */}
					<div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-6 border-b border-gray-200">
						<div className="flex items-center gap-2">
							<div className="w-10 h-10 bg-gradient-to-r from-[#101c34] to-[#2a3f6b] rounded-full flex items-center justify-center text-white font-semibold text-sm">
								{blogPost.author.charAt(0)}
							</div>
							<div>
								<p className="font-medium text-gray-900">{blogPost.author}</p>
								<p className="text-xs text-gray-500">Author</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							<span>{new Date(blogPost.publishedAt).toLocaleDateString('en-US', { 
								year: 'numeric', 
								month: 'long', 
								day: 'numeric' 
							})}</span>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="w-4 h-4" />
							<span>{blogPost.readTime}</span>
						</div>
						<div className="flex items-center gap-2">
							<Eye className="w-4 h-4" />
							<span>{blogPost.views.toLocaleString()} views</span>
						</div>
					</div>
				</header>

				{/* Article Content */}
				<div className="prose prose-lg prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-[#101c34] hover:prose-a:text-[#101c34] max-w-none mb-8">
					<ReactMarkdown>
						{content}
					</ReactMarkdown>
				</div>

				{/* Tags */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
					<div className="flex flex-wrap gap-2">
						{blogPost.tags.map(tag => (
							<Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
								{tag}
							</Badge>
						))}
					</div>
				</div>

				{/* Social Actions */}
				<div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border">
					<div className="flex items-center gap-4">
						<Button variant="outline" size="sm" className="hover:bg-red-50 hover:border-red-200">
							<Heart className="w-4 h-4 mr-2" />
							Like
						</Button>
						<Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
							<Share2 className="w-4 h-4 mr-2" />
							Share
						</Button>
					</div>
					<div className="text-sm text-gray-600">
						Was this article helpful?
					</div>
				</div>

				{/* Back to Articles */}
				<div className="text-center mt-12">
					<Button 
						onClick={() => navigate('/current-affairs')}
						className="bg-gradient-to-r from-[#101c34] to-[#2a3f6b] hover:bg-[#0d1829] px-8"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to All Articles
					</Button>
				</div>
			</article>
		</div>
	);
};

export default BlogPost;