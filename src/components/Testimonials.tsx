import { useCallback, useEffect, useRef, useState } from 'react';

interface Testimonial {
  id: number;
  name: string;
  subtitle?: string;
  bride?: string;
  date: string;
  venue?: string;
  content: string;
}

// Use **double asterisks** around a phrase to show it in bold.
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Syed Shafqat Hussain",
    date: "January 2026",
    content: "Dear Team GH&T (A Unit of Kritika Wedding & Entertainment), I extend my heartfelt gratitude for the exceptional decoration arrangements for our recent event. Despite being a small gathering, your professionalism and creative touch made the setup truly captivating and memorable. Regrettably, we could not meet in person on this occasion, but I look forward to connecting with you in the future for upcoming events. Additionally, I deeply appreciate your prompt assistance in arranging a photographer and makeup artist at the last minute. Your support was invaluable and greatly contributed to the success of the event. May you and your loved ones continue to be blessed by the Almighty, and may we honor the cherished memories of those we have lost.",
  },
  {
    id: 2,
    name: "Dr. Ashok Sharma & Ms. Sapna Sharma",
    subtitle: "Parents of Dr. Aditi Sharma",
    bride: "Dr. Aditi Sharma & Mr. Harshit",
    date: "January 2026",
    content: "We are truly grateful to GHT (A Unit of Kritika Wedding & Entertainment) for making our daughter Dr. Aditi Sharma's wedding a beautiful and memorable celebration. From planning to execution, every detail was handled with professionalism, creativity, and care. The hospitality, décor, and specially curated food exceeded our expectations, and our guests thoroughly enjoyed the entire experience. The team's dedication and attention to detail allowed us to celebrate stress-free and create memories that will last a lifetime. Thank you for making this special occasion so seamless and unforgettable.",
  },
  {
    id: 3,
    name: "Ms. Sonalika & Mr. Navdeep",
    subtitle: "Bride & Groom",
    date: "Wedding: 20th June 2026",
    venue: "ITC Welcom Dwarka",
    content: "We had a wonderful experience with Global Hotels and Tourism for our wedding on 20th June 2026 at ITC Welcom Dwarka. The team was professional, supportive, and attentive to every detail, making our special day truly memorable. They understood our requirements, managed everything smoothly, and helped us plan a beautiful wedding within our budget. If you are looking for the **best wedding planning** services and **top wedding planning on a budget**, we highly recommend Global Hotels and Tourism. Thank you to the entire team for making our wedding so special and stress-free!",
  },
  {
    id: 4,
    name: "Mr. Malhotra",
    subtitle: "Host",
    bride: "Ms. Sabarpreet Kaur & Mr. Raj Kunwar Singh",
    date: "Reception: 1st July 2026",
    venue: "Hyatt Centric, Janakpuri",
    content: "We had a wonderful experience with Global Hotels and Tourism for our reception at Hyatt Centric, Janakpuri. The team managed everything professionally and helped us plan a beautiful celebration within our budget. Highly recommended for the **best wedding planning** and **top wedding planning on a budget**. Thank you for making our special occasion memorable!",
  },
  {
    id: 5,
    name: "Mr. Bobby Duggal",
    subtitle: "Host",
    bride: "Ms. Jasleen Kaur & Mr. Bobby Duggal",
    date: "Wedding: 22nd July 2026",
    venue: "Hyatt Centric, Janakpuri",
    content: "Our wedding at Hyatt Centric, Janakpuri, was a truly memorable experience with Global Hotels and Tourism. The team handled every detail professionally and helped us create a beautiful celebration within our budget. Highly recommended for the **best wedding planning** services and **top wedding planning on a budget**. Thank you for making our special day so wonderful!",
  },
  {
    id: 6,
    name: "Mr. Amardeep Duggal",
    subtitle: "Host",
    bride: "Ms. Harnoor & Mr. Arpan",
    date: "Sagan: 20th September 2026",
    venue: "ITC Welcom Dwarka",
    content: "Celebrating our Sagan ceremony at ITC Welcom Dwarka with Global Hotels and Tourism was a wonderful experience. The team ensured everything was organised smoothly and helped us create a beautiful celebration within our budget. Highly recommended for the **best wedding planning** services and **top wedding planning on a budget**. Thank you for making our special occasion truly memorable!",
  },
];

const AUTO_PLAY_MS = 7000;

// Turns **text** into bold text
const renderContent = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-[#101c34] not-italic">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );

// 2 cards per slide on tablets/desktop, 1 on phones
const usePerView = () => {
  const [perView, setPerView] = useState(1);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setPerView(mq.matches ? 2 : 1);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return perView;
};

const Testimonials = () => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const perView = usePerView();
  const touchStartX = useRef<number | null>(null);

  const pages = Math.ceil(testimonials.length / perView);
  const anyExpanded = Object.values(expanded).some(Boolean);

  // Keep the current page valid when the screen size changes
  useEffect(() => {
    setPage((p) => Math.min(p, pages - 1));
  }, [pages]);

  const goTo = useCallback((p: number) => setPage(((p % pages) + pages) % pages), [pages]);

  // Auto-advance (stops while hovering, or while someone is reading an expanded card)
  useEffect(() => {
    if (paused || anyExpanded || pages < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setPage((p) => (p + 1) % pages), AUTO_PLAY_MS);
    return () => clearInterval(t);
  }, [paused, anyExpanded, pages]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) goTo(page + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="py-20 px-4 bg-[#f0f2f7]">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-12 bg-[#101c34]/20" />
            <span className="text-[#101c34]/60 text-xs font-bold tracking-[0.3em] uppercase">
              Client Testimonials
            </span>
            <span className="h-px w-12 bg-[#101c34]/20" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#101c34]" style={{ fontFamily: 'var(--font-head)' }}>
            What Our Clients Say
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto mt-3 text-base">
            Real feedback from our valued clients who trusted us with their special moments.
          </p>
        </div>

        {/* Slider */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="overflow-hidden -mx-4 px-0 py-6 -my-6">
            <div
              className="flex items-stretch transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => {
                const isOpen = !!expanded[testimonial.id];
                const visible = Math.floor(index / perView) === page;
                return (
                  <div
                    key={testimonial.id}
                    className="shrink-0 grow-0 px-4"
                    style={{ flexBasis: `${100 / perView}%` }}
                    aria-hidden={!visible}
                  >
                    <div className="h-full bg-white rounded-3xl p-8 shadow-lg border border-[#b8c0d8]/30 hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-[#c8a96e] fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      {/* Content */}
                      <p className={`text-gray-600 text-sm leading-relaxed mb-5 italic ${isOpen ? '' : 'line-clamp-6'}`}>
                        "{renderContent(testimonial.content)}"
                      </p>

                      {/* Read More button */}
                      <button
                        onClick={() => setExpanded((prev) => ({ ...prev, [testimonial.id]: !prev[testimonial.id] }))}
                        tabIndex={visible ? 0 : -1}
                        className="self-start text-[#101c34] text-xs font-semibold hover:text-[#2a3f6b] transition-colors mb-4"
                      >
                        {isOpen ? 'Show Less ↑' : 'Read Full Testimonial →'}
                      </button>

                      {/* Divider */}
                      <div className="h-px bg-[#b8c0d8]/40 mb-4 mt-auto" />

                      {/* Client Info */}
                      <div>
                        <h4 className="font-bold text-[#101c34]">{testimonial.name}</h4>
                        {testimonial.subtitle && <p className="text-gray-400 text-xs">{testimonial.subtitle}</p>}
                        {testimonial.bride && <p className="text-gray-400 text-xs">{testimonial.bride}</p>}
                        {testimonial.venue && <p className="text-gray-400 text-xs">{testimonial.venue}</p>}
                        <p className="text-gray-300 text-xs mt-1">{testimonial.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-5 mt-10">
              <button
                onClick={() => goTo(page - 1)}
                aria-label="Previous testimonials"
                className="w-10 h-10 rounded-full border border-[#101c34]/20 bg-white text-[#101c34] flex items-center justify-center hover:bg-[#101c34] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.5 4.5 7 10l5.5 5.5" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === page}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === page ? 'w-6 bg-[#101c34]' : 'w-2 bg-[#101c34]/25 hover:bg-[#101c34]/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => goTo(page + 1)}
                aria-label="Next testimonials"
                className="w-10 h-10 rounded-full border border-[#101c34]/20 bg-white text-[#101c34] flex items-center justify-center hover:bg-[#101c34] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7.5 4.5 13 10l-5.5 5.5" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Bottom decorative */}
        <div className="flex items-center justify-center gap-3 mt-12">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#101c34]/20" />
          <div className="w-2 h-2 rounded-full bg-[#101c34]/20" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#101c34]/20" />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
