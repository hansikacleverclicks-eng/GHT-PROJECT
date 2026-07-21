import { useState } from "react";

const partners = [
  // {
  //   name: "The Wedding Rose",
  //   subtitle: "Wedding Planner",
  //   tagline: "A Unit of Kritika Weddings & Entertainment",
  //   logo: "/logos/weddingrose.png",
  //   location: "New Delhi",
  //   contactPerson: "Monica Dhyani",
  //   phone: "8076885774",
  //   email: "wedding16roses@gmail.com",
  //   website: "https://theweddingrose.com",
  //   number: "01",
  // },
  // {
  //   name: "Danish Patisserie",
  //   subtitle: "Bakery & Confectionery",
  //   tagline: "Crafting sweetness for your special day",
  //   logo: "/logos/danis.jpg",
  //   location: "New Delhi",
  //   contactPerson: "Monica Dhyani",
  //   phone: "8076885774",
  //   email: "wedding16roses@gmail.com",
  //   website: "https://danishpatisserie.in",
  //   number: "02",
  // },
];

const FeaturedPartners = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <section className="relative py-20 md:py-16 overflow-hidden">
      {/* White background */}
      <div className="absolute inset-0 bg-white" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(#101c34 1px, transparent 1px), linear-gradient(90deg, #101c34 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Floating orbs */}
      <div className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#101c34]/5 blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 -right-20 w-[300px] h-[300px] rounded-full bg-[#101c34]/5 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-white/60 to-transparent" />
              <span className="text-[#101c34]/60 text-xs font-bold tracking-[0.3em] uppercase">
                Our Partners
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#101c34] leading-[0.9] tracking-tight">
              Featured
              <br />
              <span className="bg-gradient-to-r from-[#101c34] to-[#2a3f6b] bg-clip-text text-transparent">
                Wedding &amp; Gifting
              </span>
              <br />
              Partners
            </h2>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-sm md:text-right leading-relaxed">
            Spotlight on our premium wedding and event planning partners who make your celebrations unforgettable.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="group relative cursor-pointer"
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Card glow */}
              <div className="absolute -inset-[2px] bg-gradient-to-r from-[#101c34]/20 to-[#101c34]/10 rounded-3xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700" />

              <div className="relative rounded-3xl overflow-hidden bg-white backdrop-blur-sm border border-gray-200 group-hover:border-[#101c34]/40 shadow-md hover:shadow-xl transition-all duration-700 group-hover:-translate-y-2">
                {/* Large number watermark */}
                <span className="absolute -top-6 -right-4 text-[180px] md:text-[220px] font-black text-[#101c34]/[0.04] group-hover:text-[#101c34]/[0.08] transition-all duration-700 leading-none select-none pointer-events-none">
                  {partner.number}
                </span>

                <div className="relative p-6 sm:p-8 md:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 min-h-[220px] md:min-h-[260px]">
                  {/* Logo */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl bg-white flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-500 shadow-2xl">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className={`w-full h-full object-contain ${partner.name === "Danish Patisserie" ? "rounded-full object-cover" : ""}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#101c34] mb-1">
                      {partner.name}
                    </h3>
                    <p className="text-sm font-semibold tracking-wider uppercase mb-1 text-[#101c34]/60">
                      {partner.subtitle}
                    </p>
                    <p className="text-gray-500 text-sm leading-relaxed mb-2">
                      {partner.tagline}
                    </p>
                    <p className="text-gray-400 text-xs mb-5">{partner.location}</p>

                    {/* Contact info — visible on hover */}
                    <div className="space-y-1 mb-5 opacity-0 group-hover:opacity-100 transition-all duration-500 max-h-0 group-hover:max-h-20 overflow-hidden">
                      <p className="text-gray-500 text-xs">📞 {partner.phone}</p>
                      <p className="text-gray-500 text-xs">✉️ {partner.email}</p>
                    </div>

                    {/* CTA */}
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-all duration-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#101c34]/60 group-hover:text-[#101c34] transition-colors">
                        Explore Partner
                      </span>
                      <div className="w-8 h-[1px] bg-[#101c34]/30 group-hover:w-12 group-hover:bg-[#101c34] transition-all duration-500" />
                      <svg className="w-4 h-4 text-[#101c34]/50 group-hover:text-[#101c34] group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Bottom line animation */}
                <div className="h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-[#101c34] to-[#2a3f6b] transition-all duration-700 ease-out" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom decorative */}
        <div className="flex items-center justify-center gap-3 mt-16 md:mt-20">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#101c34]/20" />
          <div className="w-2 h-2 rounded-full bg-[#101c34]/20" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#101c34]/20" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedPartners;
