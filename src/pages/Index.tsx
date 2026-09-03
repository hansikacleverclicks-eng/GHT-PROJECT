import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Hotel as HotelIcon, Users, Lightbulb, Award, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { fetchHotels, type Hotel, slugify } from '@/data/hotelData'
import { fetchVendors, type Vendor } from '@/data/vendorData'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { getImageUrl } from '@/utils/imageUtils'
import styles from './CategorySelector.module.css'
import SeoKeywordsSection from '@/seo/SeoKeywordsSection'
import EnhancedSearch from '@/components/EnhancedSearch'
import { Carousel } from '@/components/Carousel'
import { MarqueeSlideshow } from '@/components/MarqueeSlideshow'
import '@/styles/FlipCard.css'
import { Helmet } from 'react-helmet-async'
import GlobalInquiry from './GlobalInquiry';
import SecondTopHeader from '@/components/SecondTopHeader';
import SecondNavBar from '@/components/SecondNavBar';
import SecondHeroBanner from '@/components/SecondHeroBanner';
import FeaturedPartners from '@/components/FeaturedPartners';
import Testimonials from '@/components/Testimonials';

// Add custom CSS for search dropdown layering
const searchDropdownStyle = `
  /* Hero section should create a new stacking context */
  .hero-parallax {
    position: relative;
    z-index: 20;
  }

  /* Search container needs to be above other content */
  .hero-search {
    position: relative;
    z-index: 30;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 1rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 768px) {
    .hero-search {
      max-width: 42rem;
      padding: 0;
    }
  }

  /* Dropdown styling */
  .hero-search [data-search-dropdown] {
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    transform: none !important;
    z-index: 40 !important;
    margin-top: 0.5rem !important;
    margin-left: auto !important;
    margin-right: auto !important;
    max-height: 80vh !important;
    overflow-y: auto !important;
  }

  @media (max-width: 767px) {
    .hero-search [data-search-dropdown] {
      width: calc(100% - 2rem) !important;
      left: 1rem !important;
      right: 1rem !important;
    }
  }

  .destinations-section {
    position: relative;
    z-index: 10;
  }
`

const cities = [
  { name: 'New Delhi', slug: 'new-delhi', description: 'Capital of hospitality and grandeur', image: '/city-images/delhi.jpg' },
  { name: 'Uttarakhand', slug: 'uttarakhand', description: 'The Land of Gods and serene mountains', image: '/city-images/uttarakhand.jpg' },
  { name: 'Jim Corbett', slug: 'jim-corbett', description: 'Wildlife retreats and serene nature', image: '/city-images/jim-corbett.jpg' },
  { name: 'Agra', slug: 'agra', description: 'Taj City heritage venues', image: '/city-images/agra.jpg' },
  { name: 'Goa', slug: 'goa', description: 'Coastal charm and vibrant celebrations', image: '/city-images/goa.jpg' },
  { name: 'Kerela', slug: 'kerela', description: 'God\'s Own Country, backwaters and beaches', image: '/city-images/kerela.jpg' },
  { name: 'Jaipur', slug: 'jaipur', description: 'Pink City royal venues', image: '/city-images/jaipur.jpg' },
  { name: 'View All', slug: 'all', description: 'Explore all our destinations', isViewAll: true }
];

const internationalCities = [
  { name: 'UAE', slug: 'uae', description: 'Luxury and modern marvels', image: '/internationalDestination/UAE.jpg' },
  { name: 'Sri Lanka', slug: 'sri-lanka', description: 'Island of serendipity', image: '/internationalDestination/SriLanka.webp' },
  { name: 'Malaysia', slug: 'malaysia', description: 'Truly Asia', image: '/internationalDestination/malasiya.jpeg' },
  { name: 'Thailand', slug: 'thailand', description: 'Land of smiles', image: '/internationalDestination/thiland.jpeg' },
  { name: 'Vietnam', slug: 'vietnam', description: 'Timeless charm', image: '/internationalDestination/vietnam.jpeg' },
  { name: 'Maldives', slug: 'maldives', description: 'Sunny side of life', image: '/internationalDestination/maldives.jpeg' },
  { name: 'Oman', slug: 'oman', description: 'Arabian beauty', image: '/internationalDestination/Oman.jpeg' },
  { name: 'Turkey', slug: 'turkey', description: 'Crossroads of continents', image: '/internationalDestination/Turkey.jpg' }
];

const categories = [
  { name: 'Hotels & Resorts', icon: '🏨', count: '700+' },
  { name: 'Caterers', icon: '🍽️', count: '400+' },
  { name: 'Event Planners', icon: '📋', count: '150+' },
]

type SearchResult =
  | { type: 'Hotel'; label: string; description: string; image: string; link: string; hotel: Hotel }
  | { type: 'Vendor'; label: string; description: string; link: string; vendor: Vendor }
  | { type: 'City'; label: string; description: string; link: string }
  | { type: 'Parent Company'; label: string; description: string; link: string }

export default function Index() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Global Hotels & Tourism",
    "url": "https://globalhotelsandtourism.com",
    "logo": "https://globalhotelsandtourism.com/ght_logo.png",
    "description": "India's premier platform for luxury wedding venues, event planners, and hospitality services",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://www.facebook.com/globalhotelsandtourism",
      "https://www.instagram.com/globalhotelsandtourism"
    ]
  };

  const [selectedCity, setSelectedCity] = useState('')
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([])
  const [allHotels, setAllHotels] = useState<Hotel[]>([])
  const [imageBackedHotels, setImageBackedHotels] = useState<Hotel[]>([])
  const [popularIndex, setPopularIndex] = useState(0)
  const [showHotelModal, setShowHotelModal] = useState(false)
  const [modalHotel, setModalHotel] = useState<Hotel | null>(null)
  const [showWeddingRoseModal, setShowWeddingRoseModal] = useState(false)
  const carouselInterval = useRef<NodeJS.Timeout | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [activeVideo, setActiveVideo] = useState('/hospitality.mp4');

  const checkImage = useCallback((url: string, timeout = 3000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url) return resolve(false)
      try {
        const img = new Image()
        let done = false
        const timer = setTimeout(() => {
          if (!done) { done = true; resolve(false) }
        }, timeout)
        img.onload = () => {
          if (!done) { done = true; clearTimeout(timer); resolve(true) }
        }
        img.onerror = () => {
          if (!done) { done = true; clearTimeout(timer); resolve(false) }
        }
        img.src = url
      } catch (e) {
        resolve(false)
      }
    })
  }, [])

  useEffect(() => {
    async function loadVendors() {
      const v = await fetchVendors()
      setVendors(v)
      console.log('Vendors loaded:', v)
    }
    loadVendors()
  }, [])

  useEffect(() => {
    async function loadFeaturedHotels() {
      try {
        const allHotels = await fetchHotels()
        setAllHotels(allHotels)
        const candidates = allHotels.filter(h => h['Hero Image'] && String(h['Hero Image']).trim())

        const validation = await Promise.all(candidates.map(async (h) => {
          const ok = await checkImage(h['Hero Image'])
          return ok ? h : null
        }))
        const validated = validation.filter(Boolean) as Hotel[]

        setImageBackedHotels(validated)
        const shuffled = validated.sort(() => 0.5 - Math.random())
        setFeaturedHotels(shuffled.slice(0, 7))
      } catch (error) {
        console.error('❌ Failed to load featured hotels:', error)
      }
    }
    loadFeaturedHotels()
  }, [checkImage])

  useEffect(() => {
    const popularHotels = allHotels.filter(h => h['Hero Image'] && String(h['Hero Image']).trim())
    if (carouselInterval.current) clearInterval(carouselInterval.current)
    if (popularHotels.length === 0) {
      setPopularIndex(0)
      return
    }
    setPopularIndex((prev) => prev % popularHotels.length)

    carouselInterval.current = setInterval(() => {
      setPopularIndex((prev) => (prev + 3) % popularHotels.length)
    }, 5000)
    return () => {
      if (carouselInterval.current) clearInterval(carouselInterval.current)
    }
  }, [allHotels])

  function openHotelModal(hotel: Hotel) {
    setModalHotel(hotel)
    setShowHotelModal(true)
  }
  function closeHotelModal() {
    setShowHotelModal(false)
    setModalHotel(null)
  }

  const handleVideoChange = (option: string) => {
    switch (option) {
      case 'hotels':
        setActiveVideo('/hospitality.mp4');
        break;
      case 'planners':
        setActiveVideo('/wedding.mp4');
        break;
      case 'mice':
        setActiveVideo('/tourism.mp4');
        break;
      default:
        setActiveVideo('/homepage.mp4');
    }
  };

  const featuredVendor = vendors.find(v => v.vendorName.trim().toLowerCase() === 'the wedding rose'.toLowerCase());

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      </Helmet>
      <SeoKeywordsSection />
      <div className="min-h-screen bg-white pb-0">
        <style dangerouslySetInnerHTML={{ __html: searchDropdownStyle }} />
        <style dangerouslySetInnerHTML={{
          __html: `
        header {
          box-shadow: none !important;
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
          border: none !important;
        }
        header + div.bg-gradient-to-r {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          border: none !important;
        }
        body {
          overflow-x: hidden;
        }
        html {
          scroll-behavior: smooth;
        }
        .main-content {
          transition: padding-top 0.3s ease;
        }
        header.current-affairs-header {
          top: 0 !important;
          position: fixed !important;
        }
      `}} />
        
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-[#b8c0d8] z-50 flex md:hidden justify-around items-center py-1.5 shadow-2xl rounded-t-xl">
          <Link to="/hotels" className="flex flex-col items-center text-xs text-gray-700 hover:text-[#101c34] font-medium px-2">
            <HotelIcon className="w-6 h-6 mb-0.5" />
            Venues
          </Link>
          <Link to="/vendors" className="flex flex-col items-center text-xs text-gray-700 hover:text-[#101c34] font-medium px-2">
            <Users className="w-6 h-6 mb-0.5" />
            Vendors
          </Link>
          <Link to="/inspiration" className="flex flex-col items-center text-xs text-gray-700 hover:text-[#101c34] font-medium px-2">
            <Lightbulb className="w-6 h-6 mb-0.5" />
            Inspiration
          </Link>
          <Link to="/awards" className="flex flex-col items-center text-xs text-gray-700 hover:text-[#101c34] font-medium px-2">
            <Award className="w-6 h-6 mb-0.5" />
            Awards
          </Link>
          <Link to="/join-as-vendor" className="flex flex-col items-center text-xs text-[#101c34] font-bold px-2">
            <UserPlus className="w-6 h-6 mb-0.5" />
            Join
          </Link>
        </nav>

        <div className="w-full px-4 py-4">
  <img
    src="/uttarakhand-wedding-banner.png"
    alt="Uttarakhand Destination Wedding"
    className="block w-full h-auto rounded-xl"
  />
</div>

        <div className="bg-[#101c34] py-3 relative overflow-hidden cursor-pointer border-0 mt-0" onClick={() => window.open('https://theweddingrose.com', '_blank')}>
          <div className="container mx-auto">
            <div className="flex items-center justify-center">
              <div className="hidden md:flex items-center justify-center w-8 h-8 bg-white rounded-full mr-3">
                <span className="text-[#101c34] font-bold text-lg">✦</span>
              </div>
              <p className="font-medium text-white text-center hidden md:block">
               A Unit of Kritika Wedding-n-Entertainment 
              </p>
              <div className="overflow-hidden w-full md:hidden">
                <div className="whitespace-nowrap animate-[scroll_15s_linear_infinite]">
                  <p className="font-medium text-white inline-block">
                    A Unit of Kritika Wedding-n-Entertainment 
                  </p>
                  <span className="inline-block px-4">•</span>
                  <p className="font-medium text-white inline-block">
             A Unit of Kritika Wedding-n-Entertainment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Wedding & Gifting Partners */}
        <FeaturedPartners />

        {/* Testimonials Section */}
        <Testimonials />

        {/* Explore Premier Destinations */}
        <section className="py-8 md:py-16 px-4 bg-gray-50 relative z-10">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-4 tracking-wide leading-tight">
                Explore Premier Destinations
              </h3>
              <p className="text-gray-600 text-base mx-auto max-w-[600px] leading-relaxed mb-8 text-left md:text-center">
                Discover exceptional venues across India's most sought-after locations
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
              {cities.map((city) => (
                city.isViewAll ? (
                  <Link
                    key={city.slug}
                    to="/allcities"
                    className="group flex flex-col items-center justify-center rounded-2xl border border-gray-300 bg-white shadow-md hover:shadow-lg transition-all p-6 text-center h-full aspect-square"
                    style={{ minHeight: '140px' }}
                  >
                    <span className="text-lg font-bold text-gray-800 mb-2">
                      {city.name}
                    </span>
                    <span className="text-sm text-gray-500 mb-2">
                      {city.description}
                    </span>
                    <ArrowRight className="w-6 h-6 text-gray-700 mt-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link key={city.slug} to={`/city-hotels/${city.slug}`}
                    className="block">
                    <Card className="group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white overflow-hidden card-anim border-0 aspect-square flex flex-col justify-end relative" style={{ minHeight: '140px' }}>
                      <div className="relative w-full h-full">
                        <img
                          src={getImageUrl(city.image, 'CITY')}
                          alt={city.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-2xl"
                          loading="lazy"
                          style={{ aspectRatio: '1/1' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== getImageUrl(undefined, 'CITY')) {
                              target.src = getImageUrl(undefined, 'CITY');
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-2xl" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 flex flex-col items-start">
                          <h4 className="font-extrabold text-xl mb-1 drop-shadow-lg leading-tight">{city.name}</h4>
                          <p className="text-sm text-white/90 font-light leading-snug drop-shadow-md line-clamp-2 hidden md:block">{city.description}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              ))}
            </div>
          </div>
        </section>

        {/* International Destinations */}
        <section className="py-8 md:py-16 px-4 bg-gray-50 relative z-10">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-4 tracking-wide leading-tight">
                International Destinations
              </h3>
              <p className="text-gray-600 text-base mx-auto max-w-[600px] leading-relaxed mb-8 text-left md:text-center">
                Explore breathtaking venues in stunning international locations
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
              {internationalCities.map((city) => (
                <Link key={city.slug} to={`/city-hotels/${city.slug}`} className="block">
                  <Card className="group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white overflow-hidden card-anim border-0 aspect-square flex flex-col justify-end relative" style={{ minHeight: '140px' }}>
                    <div className="relative w-full h-full">
                      <img
                        src={getImageUrl(city.image, 'CITY')}
                        alt={city.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-2xl"
                        loading="lazy"
                        style={{ aspectRatio: '1/1' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== getImageUrl(undefined, 'CITY')) {
                            target.src = getImageUrl(undefined, 'CITY');
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-2xl" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 flex flex-col items-start">
                        <h4 className="font-extrabold text-xl mb-1 drop-shadow-lg leading-tight">{city.name}</h4>
                        <p className="text-sm text-white/90 font-light leading-snug drop-shadow-md line-clamp-2 hidden md:block">{city.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Our Featured Properties */}
        <section className="py-8 md:py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Our Featured Properties
              </h3>
              <p className="text-gray-600 text-lg">
                A selection of our finest partner hotels and resorts
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {featuredHotels.map((hotel, i) => (
                <div
                  key={i}
                  className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer card-anim premium-border"
                  onClick={() => openHotelModal(hotel)}
                >
                  <div className="relative h-48">
                    <img
                      src={hotel['Hero Image']}
                      alt={hotel['Hotel Name']}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <h4 className="text-white text-lg font-semibold">
                        {hotel['Hotel Name']}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
              <Link
                to="/all-hotels"
                className="group flex w-full rounded-xl border-2 border-dashed border-gray-300 hover:bg-gray-100 transition-colors p-6 items-center justify-center"
              >
                <span className="text-lg font-semibold text-gray-700">
                  See All Properties →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Picks */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50 overflow-y-hidden">
          <div className="container mx-auto">
            <div className="text-center mb-10 md:mb-14 px-4">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Popular Picks
              </h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Discover our most celebrated venues and service providers
              </p>
            </div>
            {(() => {
              const popularHotels = allHotels.filter(h => h['Hero Image'] && String(h['Hero Image']).trim());
              if (popularHotels.length === 0) return null;

              return (
                <div className="w-full max-w-full mx-auto px-2">
                  <MarqueeSlideshow hotels={popularHotels} onHotelClick={openHotelModal} />
                </div>
              );
            })()}
          </div>
        </section>

        {/* Hotel Modal */}
        {showHotelModal && modalHotel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
                onClick={closeHotelModal}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-2">{modalHotel['Hotel Name']}</h2>
              <p className="mb-2 text-gray-600">{modalHotel.City} • {modalHotel['Parent Company']}</p>
              <img
                src={getImageUrl(modalHotel['Hero Image'], 'HOTEL')}
                alt={modalHotel['Hotel Name']}
                className="w-full h-56 object-cover rounded mb-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg";
                }}
              />
              <p className="mb-4 text-gray-700">{modalHotel.Description}</p>
              <Button onClick={() => window.open(modalHotel['Official Website'], '_blank')} className="w-full bg-gradient-to-r from-[#101c34] to-[#2a3f6b] hover:bg-[#0d1829] btn-anim" >
                Visit Website
              </Button>
              <Button variant="outline" className="w-full" onClick={closeHotelModal}>
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Wedding Rose Modal */}
        {featuredVendor && (
          <Dialog open={showWeddingRoseModal} onOpenChange={setShowWeddingRoseModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="/logos/weddingrose.png"
                    alt={featuredVendor.vendorName}
                    className="w-20 h-20 object-contain bg-white p-2 rounded-lg border"
                  />
                  <div>
                    <DialogTitle className="text-2xl font-bold text-[#101c34]">
                      {featuredVendor.vendorName}
                    </DialogTitle>
                    <p className="text-gray-600">{featuredVendor.city}</p>
                  </div>
                </div>
              </DialogHeader>

              <DialogDescription asChild>
                <div className="space-y-4">
                  <div className="text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      Wedding Rose is powered by a passionate team of hospitality experts from prestigious IHM backgrounds,
                      having worked with some of India's most renowned hotels including The Oberoi, Hyatt, Best Western Surya,
                      Taj Group, Welcome Group, and The Imperial. With deep expertise in theme parties and extensive experience
                      hosting events for well-known personalities across the country, we bring unmatched professionalism and
                      creativity to every celebration.
                    </p>
                    <p className="mb-4">
                      Founded in 2001, our 25+ years in the industry have firmly established us as one of the leading names
                      in wedding and event planning. While quality is our signature, it is our excellence in service and
                      priceless experience that set us apart.
                    </p>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">We specialize in:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>Designer Weddings</li>
                        <li>Corporate Events</li>
                        <li>Theme Decorations</li>
                        <li>Chowki & Bhajan Sandhya</li>
                        <li>Birthdays & Anniversaries</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="text-sm">
                      <strong>Contact:</strong> {featuredVendor.contactPersonName}
                    </div>
                    <div className="text-sm">
                      <strong>Email:</strong> {featuredVendor.email}
                    </div>
                    <div className="text-sm">
                      <strong>Phone:</strong> {featuredVendor.phone}
                    </div>
                    {featuredVendor.websiteUrl && (
                      <div className="pt-2">
                        <Button asChild className="bg-gradient-to-r from-[#101c34] to-[#2a3f6b] hover:bg-[#0d1829]">
                          <a
                            href={featuredVendor.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Website →
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )}

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gray-50 section-anim">
          <div className="container mx-auto text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-4xl font-bold text-gray-800 mb-6">
                Ready to Join Our Network?
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Become part of India's most trusted hospitality platform and
                connect with thousands of event planners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-[#101c34] to-[#2a3f6b] hover:bg-[#0d1829] px-8 py-3"
                >
                  <Link to="/vendor-registration">Register as Vendor</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-[#101c34] text-[#101c34] hover:bg-[#e8ebf3] px-8 py-3"
                >
                  <Link to="/join-as-vendor">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <GlobalInquiry />

        <div className="sticky-footer-cta md:hidden">
          <button className="cta-btn" onClick={() => window.location.href = '/vendor-registration'}>
            Register as Vendor
          </button>
        </div>
      </div>
    </>
  )
}
