const testimonials = [
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
  }
];

const Testimonials = () => {
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

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-3xl p-8 shadow-lg border border-[#b8c0d8]/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#c8a96e] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic line-clamp-6">
                "{testimonial.content}"
              </p>

              {/* Read More button */}
              <button 
                onClick={() => {
                  const content = testimonial.content;
                  const isExpanded = document.getElementById(`testimonial-${testimonial.id}`)?.classList.contains('line-clamp-none');
                  const el = document.getElementById(`testimonial-${testimonial.id}`);
                  const btn = document.getElementById(`readmore-${testimonial.id}`);
                  if (el) {
                    if (isExpanded) {
                      el.classList.remove('line-clamp-none');
                      el.classList.add('line-clamp-6');
                      if (btn) btn.textContent = 'Read Full Testimonial →';
                    } else {
                      el.classList.remove('line-clamp-6');
                      el.classList.add('line-clamp-none');
                      if (btn) btn.textContent = 'Show Less ↑';
                    }
                  }
                }}
                id={`readmore-${testimonial.id}`}
                className="text-[#101c34] text-xs font-semibold hover:text-[#2a3f6b] transition-colors mb-4"
              >
                Read Full Testimonial →
              </button>

              {/* Divider */}
              <div className="h-px bg-[#b8c0d8]/40 mb-4" />

              {/* Client Info */}
              <div>
                <h4 className="font-bold text-[#101c34]">{testimonial.name}</h4>
                {testimonial.subtitle && (
                  <p className="text-gray-400 text-xs">{testimonial.subtitle}</p>
                )}
                {testimonial.bride && (
                  <p className="text-gray-400 text-xs">{testimonial.bride}</p>
                )}
                <p className="text-gray-300 text-xs mt-1">{testimonial.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom decorative */}
        <div className="flex items-center justify-center gap-3 mt-16">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#101c34]/20" />
          <div className="w-2 h-2 rounded-full bg-[#101c34]/20" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#101c34]/20" />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;