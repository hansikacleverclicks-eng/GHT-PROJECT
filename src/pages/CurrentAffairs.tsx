import { useState, useEffect } from 'react';
import { Search, Calendar, Tag, Eye, ArrowRight, BookOpen, ArrowLeft, Home, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import breadcrumbBg from '@/assets/breadcums.jpeg';
import './current-affairs.css';
import { getCurrentAffairs, getCategories, getCities, type BlogPost } from '@/data/currentAffairsData';

// Custom styles for horizontal scrollbars
import { cn } from '@/lib/utils';

const CurrentAffairs = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [selectedCity, setSelectedCity] = useState('All Cities');
	const [displayedCount, setDisplayedCount] = useState(6); // Number of articles to display
	const [refreshKey, setRefreshKey] = useState(0); // To force re-render when data changes
	const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
	const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
	const [cities, setCities] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const authenticated = true; // Replace with actual authentication logic
	const navigate = useNavigate();

	// Load data from database and static sources
	const loadData = async () => {
		setLoading(true);
		try {
			console.log('=== Loading current affairs data from database ===');
			
			const [posts, cats, citiesList] = await Promise.all([
				getCurrentAffairs(),
				getCategories(),
				getCities()
			]);
			
			console.log('Data loaded:', {
				posts: posts.length,
				categories: cats.length,
				cities: citiesList.length
			});
			
			setBlogPosts(posts);
			setCategories(cats);
			setCities(citiesList);
		} catch (error) {
			console.error('Error loading current affairs data:', error);
			// Fallback to empty arrays on error
			setBlogPosts([]);
			setCategories([{ name: 'All', count: 0 }]);
			setCities(['All Cities']);
		} finally {
			setLoading(false);
		}
	};

	// Initial data load
	useEffect(() => {
		loadData();
	}, []);

	// Reload data when refreshKey changes (e.g., after admin updates)
	useEffect(() => {
		if (refreshKey > 0) { // Skip initial load (refreshKey = 0)
			loadData();
		}
	}, [refreshKey]);
	
	// Add body class to manage specific styling for Current Affairs page
	useEffect(() => {
		document.body.classList.add('current-affairs-page');
		return () => {
			document.body.classList.remove('current-affairs-page');
		};
	}, []);

	// Listen for data changes (when admin adds new current affairs)
	useEffect(() => {
		const handleStorageChange = () => {
			setRefreshKey(prev => prev + 1);
		};
		
		window.addEventListener('currentAffairsUpdated', handleStorageChange);
		return () => {
			window.removeEventListener('currentAffairsUpdated', handleStorageChange);
		};
	}, []);



	// Handle blog selection - navigate to styled blog page
	const handleBlogSelect = (blog: BlogPost) => {
		// Navigate to the styled blog page
		navigate(`/blog/${blog.slug}`);
	};

	// Handle Load More button click
	const handleLoadMore = () => {
		setDisplayedCount(prev => prev + 6); // Load 6 more articles
	};

	// Reset displayed count when filters change
	useEffect(() => {
		setDisplayedCount(6); // Reset to initial count when filters change
	}, [searchTerm, selectedCategory, selectedCity]);

	const allFilteredPosts = blogPosts.filter(post => {
		const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
						 post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
						 post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
		const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
		const matchesCity = selectedCity === 'All Cities' || post.city === selectedCity;
		
		return matchesSearch && matchesCategory && matchesCity;
	});

	// Display only the first 'displayedCount' articles
	const filteredPosts = allFilteredPosts.slice(0, displayedCount);
	
	// Check if there are more articles to load
	const hasMoreArticles = allFilteredPosts.length > displayedCount;

	const featuredPosts = filteredPosts.filter(post => post.featured);
	const regularPosts = filteredPosts.filter(post => !post.featured);

	// Show loading state while data is being fetched
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[#f0f2f7] via-white to-blue-50 overflow-x-hidden pt-6">
				{/* Back Button */}
				<Button
					onClick={() => navigate('/')}
					className="fixed top-8 left-6 z-50 bg-gradient-to-r from-[#101c34] to-[#2a3f6b] hover:bg-[#0d1829] text-white shadow-md border-0"
					size="sm"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				
				{/* Loading State */}
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<div className="animate-spin w-12 h-12 border-4 border-[#101c34] border-t-transparent rounded-full mx-auto mb-4"></div>
						<h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Current Affairs</h2>
						<p className="text-gray-500">Fetching the latest articles from database...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#f0f2f7] via-white to-blue-50 overflow-x-hidden">

			{/* Breadcrumb Hero Banner */}
			<div className="relative w-full h-64 md:h-80 overflow-hidden">
				<img src={breadcrumbBg} alt="Current Affairs" className="absolute inset-0 w-full h-full object-cover object-center" />
				<div className="absolute inset-0 bg-gradient-to-t from-[#101c34]/90 via-[#101c34]/55 to-black/25" />
				<div className="relative h-full flex flex-col justify-end px-6 pb-8 md:px-12 md:pb-10 container mx-auto">
					<nav className="flex items-center gap-1.5 text-white/70 text-sm mb-3">
						<Link to="/" className="flex items-center gap-1 hover:text-white transition-colors">
							<Home className="w-3.5 h-3.5" /><span>Home</span>
						</Link>
						<ChevronRight className="w-3.5 h-3.5 text-white/40" />
						<span className="text-white font-medium">Current Affairs</span>
					</nav>
					<h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight" style={{ fontFamily: 'var(--font-head)', color: '#ffffff' }}>
						Current Affairs
					</h1>
					<p className="text-white/70 mt-2 text-sm md:text-base max-w-xl">
						Discover the latest news, trends, and updates from India's hospitality experts.
					</p>
				</div>
			</div>

			{/* Search and Filters */}
			<section className="py-4 md:py-8 px-4 bg-white/60">
				<div className="container mx-auto">
					<div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-4 md:p-6">
						<div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
								<Input
									type="text"
									placeholder="Search articles, news, updates..."
									className="pl-10 py-2 md:py-3 text-sm md:text-base w-full"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
							<div className="w-full md:w-48">
								<select 
									className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#101c34] focus:border-[#101c34] focus:outline-none bg-white"
									value={selectedCity}
									onChange={(e) => setSelectedCity(e.target.value)}
								>
									{cities.map(city => (
										<option key={city} value={city}>{city}</option>
									))}
								</select>
							</div>
						</div>

						{/* Category Filters */}
						<div className="pb-1">
							<div className={cn(
								"flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0",
								"scrollbar-hide -mx-1 px-1" // Add padding and negative margin for better scrolling on mobile
							)}>
								{categories.map(category => (
									<Button
										key={category.name}
										variant={selectedCategory === category.name ? "default" : "outline"}
										size="sm"
										onClick={() => setSelectedCategory(category.name)}
										className={cn(
											selectedCategory === category.name 
												? "bg-gradient-to-r from-[#101c34] to-[#2a3f6b]" 
												: "border-[#b8c0d8] text-[#101c34] hover:bg-[#f0f2f7]",
											"text-xs md:text-sm whitespace-nowrap flex-shrink-0 transition-all"
										)}
									>
										{category.name} ({category.count})
									</Button>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Articles Grid */}
			<section className="py-6 md:py-12 px-4">
				<div className="container mx-auto">
					{filteredPosts.length > 0 ? (
						<>
							<h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-8 text-center">Latest Articles</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 card-grid">
								{filteredPosts.map(post => (
									<Card 
										key={post.id} 
										className="group hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm cursor-pointer overflow-hidden h-full flex flex-col"
										onClick={() => handleBlogSelect(post)}
									>
										<div className="relative">
											<img 
												src={post.image} 
												alt={post.title} 
												className="w-full h-40 md:h-48 object-cover" 
												loading="lazy"
											/>
											<div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs md:text-sm">
												{post.readTime}
											</div>
										</div>
										<CardHeader className="pb-2 pt-4 px-4">
											<div className="flex items-center flex-wrap gap-2 mb-2">
												<Badge variant="outline" className="text-xs">{post.category}</Badge>
												<Badge variant="outline" className="text-xs">{post.city}</Badge>
											</div>
											<CardTitle className="text-base md:text-lg group-hover:text-[#101c34] transition-colors line-clamp-2">
												{post.title}
											</CardTitle>
											<CardDescription className="text-xs md:text-sm line-clamp-2">{post.excerpt}</CardDescription>
										</CardHeader>
										<CardContent className="px-4 pb-4 flex-grow flex flex-col justify-between">
											<div>
												<div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-3">
													<span className="truncate">By {post.author}</span>
													<span className="flex items-center whitespace-nowrap">
														<Eye className="w-3 h-3 mr-1" />
														{post.views}
													</span>
												</div>
												<div className="flex flex-wrap gap-1 mb-4 overflow-hidden">
													{post.tags.slice(0, 2).map(tag => (
														<Badge key={tag} variant="secondary" className="text-xs bg-gray-100 truncate max-w-[120px]">
															{tag}
														</Badge>
													))}
												</div>
											</div>
											<Button variant="outline" size="sm" className="w-full group-hover:bg-[#f0f2f7] group-hover:border-[#101c34] text-xs md:text-sm mt-auto">
												Read Article
												<ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						</>
					) : (
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
								<Search className="w-8 h-8 text-gray-400" />
							</div>
							<h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
							<p className="text-gray-500">Check back later for the latest updates.</p>
						</div>
					)}

					{/* Load More */}
					{filteredPosts.length > 0 && hasMoreArticles && (
						<div className="text-center mt-8 md:mt-12">
							<Button 
								variant="outline" 
								size="sm" 
								className="px-6 md:px-12 border-[#101c34] text-[#101c34] hover:bg-[#f0f2f7] md:text-base transition-all hover:shadow-md"
								onClick={handleLoadMore}
							>
								Load More Articles ({allFilteredPosts.length - displayedCount} remaining)
							</Button>
						</div>
					)}
					
					{/* Show total count */}
					{filteredPosts.length > 0 && (
						<div className="text-center mt-4 text-sm text-gray-600">
							Showing {filteredPosts.length} of {allFilteredPosts.length} articles
						</div>
					)}
				</div>
			</section>

			


		</div>
	);
};

export default CurrentAffairs;
