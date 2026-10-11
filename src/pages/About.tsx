import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  TrendingUp,
  MapPin,
  Handshake,
  Award,
  Star,
  Hotel,
  Home,
  ChevronRight,
  Globe,
} from 'lucide-react';
import breadcrumbBg from '@/assets/breadcums.jpeg';

/* ─── Data ─────────────────────────────────────────────── */

const stats = [
  { value: '500+',  label: 'Hotels & Venues',    icon: Hotel   },
  { value: '50+',   label: 'Cities Covered',      icon: MapPin  },
  { value: '1000+', label: 'Registered Vendors',  icon: Users   },
  { value: '10+',   label: 'Years of Excellence', icon: Award   },
];

const pillars = [
  {
    icon: Building2,
    title: 'Premium Hospitality Network',
    description:
      "We curate and connect India's finest hotels, resorts, banquets, and venues with event planners, travellers, and corporate clients seeking exceptional experiences.",
  },
  {
    icon: Globe,
    title: 'Pan-India Presence',
    description:
      'From metro cities to scenic destinations, our platform covers 50+ cities — ensuring every client finds the perfect venue regardless of location.',
  },
  {
    icon: Handshake,
    title: 'Trusted Partnerships',
    description:
      'We build long-term, trust-based relationships with hospitality partners by offering verified listings, transparent reviews, and dedicated account support.',
  },
  {
    icon: TrendingUp,
    title: 'Business Growth',
    description:
      'Our platform empowers hotels and vendors to grow their brand presence, attract high-value clients, and increase bookings through targeted digital exposure.',
  },
];

const team = [
  { name: 'Rajiv Sharma',  title: 'Founder & CEO',          role: 'Hospitality Visionary',  bio: '20+ years in luxury hospitality across India and Southeast Asia. Former GM at Taj Hotels.',                                         initials: 'RS' },
  { name: 'Priya Mehta',   title: 'Co-Founder & COO',       role: 'Operations & Strategy',  bio: 'Ex-IHG executive with deep expertise in hotel operations and strategic partnerships.',                                              initials: 'PM' },
  { name: 'Arjun Kapoor',  title: 'Head of Partnerships',   role: 'Vendor Relations',       bio: 'Brings 15 years of experience building hospitality networks across Tier-1 and Tier-2 cities.',                                    initials: 'AK' },
  { name: 'Sunita Rao',    title: 'Head of Marketing',      role: 'Brand & Digital',        bio: 'Digital marketing strategist with a proven track record in travel and luxury lifestyle brands.',                                    initials: 'SR' },
  { name: 'Amit Verma',    title: 'CTO',                    role: 'Technology & Product',   bio: 'Full-stack architect who previously built discovery platforms for travel companies in India and the UAE.',                          initials: 'AV' },
  { name: 'Neha Gupta',    title: 'Head of Client Success', role: 'Customer Experience',    bio: 'Passionate about turning first-time users into lifelong advocates through exceptional service journeys.',                           initials: 'NG' },
];

const faqs = [
  {
    question: 'What is Global Hotels & Tourism?',
    answer:
      'Global Hotels and Tourism – A Royal Affair is a hospitality and wedding industry platform dedicated to connecting hotels, resorts, wedding planners, event professionals, and tourism partners on one powerful network. We focus on promoting excellence in hospitality by bringing together the best venues, vendors, and professionals.',
  },
  {
    question: 'How does GHT support the wedding industry?',
    answer:
      'We empower couples with the finest venue choices and end-to-end wedding planning solutions, while helping hotels and venue partners grow their visibility and bookings. Through innovative strategies and personalised services, we create experiences that are not just events, but lifelong memories.',
  },
  {
    question: 'How can my hotel or venue join the platform?',
    answer:
      'You can register as a vendor through our "Join as Vendor" page. After submitting your details, our partnerships team will reach out within 48 hours to guide you through the onboarding process and set up your verified profile.',
  },
  {
    question: 'What makes GHT different from other listing platforms?',
    answer:
      'GHT is more than a directory — it is a business growth ecosystem. We offer verified listings, expert reviews, industry networking, promotional opportunities, and dedicated account support. Our goal is to increase your credibility, build your reputation, and expand your reach in the hospitality and wedding market.',
  },
];

/* ─── Component ───────────────────────────────────────── */

const About = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Breadcrumb Hero Banner ─────────────────────────────── */}
      <div className="relative w-full h-64 md:h-96 overflow-hidden">
        {/* Background image */}
        <img
          src={breadcrumbBg}
          alt="About Global Hotels & Tourism"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay — dark at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101c34]/90 via-[#101c34]/55 to-black/25" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end px-6 pb-8 md:px-12 md:pb-10 container mx-auto">
          {/* Breadcrumb trail */}
          <nav className="flex items-center gap-1.5 text-white/70 text-sm mb-3">
            <Link to="/" className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <span className="text-white font-medium">About Us</span>
          </nav>

          {/* Page title */}
          <h1
            className="text-3xl md:text-5xl font-extrabold text-white leading-tight"
            style={{ fontFamily: 'var(--font-head)', color: '#ffffff' }}
          >
            About <span className="bg-gradient-to-r from-[#c8a96e] to-[#e8c98e] bg-clip-text text-transparent">Global Hotels</span>
            <br className="hidden md:block" /> &amp; Tourism
          </h1>
          <p className="text-white/70 mt-2 text-sm md:text-base max-w-xl">
            Bridging the Gap Between Property Owners and To-Be-Weds
          </p>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="text-center group cursor-default">
                  <div className="w-14 h-14 rounded-2xl bg-[#f0f2f7] group-hover:bg-gradient-to-br group-hover:from-[#101c34] group-hover:to-[#2a3f6b] flex items-center justify-center mx-auto mb-3 transition-all duration-300">
                    <Icon className="w-7 h-7 text-[#101c34] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-[#101c34]">{s.value}</div>
                  <div className="text-sm text-gray-500 mt-1 font-medium">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Who We Are ────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#f0f2f7]">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-12 bg-gradient-to-r from-white/60 to-transparent" />
              <span className="text-[#101c34]/60 text-xs font-bold tracking-[0.3em] uppercase">Who We Are</span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-black text-[#101c34] leading-tight mb-8"
              style={{ fontFamily: 'var(--font-head)' }}
            >
              A Royal Affair
              <br />
              <span className="bg-gradient-to-r from-[#101c34] to-[#2a3f6b] bg-clip-text text-transparent">
                in Hospitality
              </span>
            </h2>

            <div className="space-y-5 text-gray-600 text-base md:text-lg leading-relaxed">
              <p>
                <strong className="text-[#101c34] font-bold">Global Hotels and Tourism – A Royal Affair</strong> is a hospitality and wedding industry platform dedicated to connecting hotels, resorts, wedding planners, event professionals, and tourism partners on one powerful network. Located in India, Global Hotels and Tourism focuses on promoting excellence in hospitality by bringing together the best venues, vendors, and professionals from the wedding and tourism industry. The platform provides opportunities for business growth, brand visibility, and meaningful industry connections.
              </p>
              <p>
                The main vision of Global Hotels and Tourism is to recognize and celebrate excellence in the wedding, event, and hospitality industry. Through innovation, creativity, and professional collaboration, we aim to inspire industry leaders and create a community of skilled professionals who deliver outstanding experiences and exceptional service to clients across the country.
              </p>
              <p>
                Global Hotels and Tourism also works as a strong business platform where hotels, resorts, event planners, tourism brands, and MICE professionals can showcase their services and connect with potential clients and partners. Through expert reviews, industry networking, and promotional opportunities, the platform helps brands increase credibility, build reputation, and expand their reach in the hospitality and wedding market.
              </p>
              <p>
                With a dedicated team of hospitality strategists, marketing experts, and industry professionals, Global Hotels and Tourism continuously works towards elevating industry standards. Our goal is to create a trusted community where businesses grow together, collaborations happen, and every event, destination, and hospitality experience turns into a memorable story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ──────────────────────────────────── */}
      <section className="py-20 px-4 bg-white overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-12 bg-[#101c34]/20" />
              <span className="text-[#101c34]/60 text-xs font-bold tracking-[0.3em] uppercase">Our Purpose</span>
              <span className="h-px w-12 bg-[#101c34]/20" />
            </div>
            <h2
              className="text-3xl md:text-5xl font-black text-[#101c34]"
              style={{ fontFamily: 'var(--font-head)' }}
            >
              Vision &amp; Mission
            </h2>
          </div>

          {/* Overlapping circles */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-0 max-w-4xl mx-auto">
            {/* Vision — navy */}
            <div className="relative z-10 w-72 h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-[#101c34] to-[#2a3f6b] text-white flex flex-col items-center justify-center text-center p-10 shadow-2xl md:-mr-10">
              <Star className="w-7 h-7 mb-3 text-[#c8a96e]" />
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-head)', color: '#ffffff' }}>Vision</h3>
              <p className="text-white/75 text-sm leading-relaxed">
                To redefine the wedding and hospitality experience by creating a seamless and trusted platform for couples, venue partners, and hospitality brands — bringing together luxury, convenience, and transparency.
              </p>
            </div>

            {/* Mission — light */}
            <div className="relative z-0 w-72 h-72 md:w-80 md:h-80 rounded-full bg-[#f0f2f7] text-[#101c34] flex flex-col items-center justify-center text-center p-10 shadow-xl border-2 border-[#b8c0d8] md:-ml-10 mt-[-40px] md:mt-0">
              <Award className="w-7 h-7 mb-3 text-[#2a3f6b]" />
              <h3 className="text-xl font-bold mb-3 text-[#101c34]" style={{ fontFamily: 'var(--font-head)' }}>Mission</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                To empower couples with the finest venue choices and end-to-end wedding planning solutions while helping hotels and venue partners grow their visibility and bookings through innovation and personalised service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Do ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#f0f2f7]">
        <div className="container mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-12 bg-gradient-to-r from-white/60 to-transparent" />
              <span className="text-[#101c34]/60 text-xs font-bold tracking-[0.3em] uppercase">What We Do</span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-black text-[#101c34] leading-tight"
              style={{ fontFamily: 'var(--font-head)' }}
            >
              Four Pillars of
              <br />
              <span className="bg-gradient-to-r from-[#101c34] to-[#2a3f6b] bg-clip-text text-transparent">
                Our Commitment
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl border border-[#b8c0d8]/30 hover:border-[#101c34]/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#f0f2f7] group-hover:bg-gradient-to-br group-hover:from-[#101c34] group-hover:to-[#2a3f6b] flex items-center justify-center mb-5 transition-all duration-300">
                    <Icon className="w-6 h-6 text-[#101c34] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-xs font-bold text-[#101c34]/40 uppercase tracking-widest mb-2">0{i + 1}</div>
                  <h3 className="font-bold text-[#101c34] text-base mb-2">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-12 bg-[#101c34]/20" />
              <span className="text-[#101c34]/60 text-xs font-bold tracking-[0.3em] uppercase">Our Team</span>
              <span className="h-px w-12 bg-[#101c34]/20" />
            </div>
            <h2
              className="text-3xl md:text-5xl font-black text-[#101c34] mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-head)' }}
            >
              Driven by Experienced
              <br />Industry Leaders
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg">
              Our founding team brings together decades of experience from India's top hotel chains, wedding management companies, and technology firms.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="group bg-white border border-[#b8c0d8]/40 rounded-2xl p-6 flex gap-5 items-start shadow-sm hover:shadow-xl hover:border-[#101c34]/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#101c34] to-[#2a3f6b] text-white flex items-center justify-center flex-shrink-0 font-bold text-base shadow-lg">
                  {member.initials}
                </div>
                <div>
                  <h3 className="font-bold text-[#101c34] text-base leading-tight">{member.name}</h3>
                  <p className="text-[#2a3f6b] text-sm font-semibold mt-0.5">{member.title}</p>
                  <p className="text-gray-400 text-xs mb-2">{member.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-br from-[#101c34] via-[#142440] to-[#2a3f6b]">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="container mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-[#c8a96e]" />
            <span className="text-[#c8a96e] text-xs font-bold uppercase tracking-[0.25em]">Join the Movement</span>
            <span className="h-px w-8 bg-[#c8a96e]" />
          </div>
          <h2
            className="text-3xl md:text-5xl font-extrabold mb-5"
            style={{ fontFamily: 'var(--font-head)', color: '#ffffff' }}
          >
            Be Part of India's Hospitality Movement
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Whether you're a hotel looking to grow, a vendor wanting visibility, or a couple seeking the perfect wedding venue — GHT is your platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/join-as-vendor"
              className="inline-flex items-center bg-white text-[#101c34] font-bold text-base px-8 py-3 rounded-full hover:bg-[#f0f2f7] transition-colors shadow-xl"
            >
              Join as a Partner
            </Link>
            <Link
              to="/inquiry"
              className="inline-flex items-center border-2 border-white/30 text-white font-semibold text-base px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#f0f2f7]">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-12 bg-[#101c34]/20" />
              <span className="text-[#101c34]/60 text-xs font-bold tracking-[0.3em] uppercase">FAQ</span>
              <span className="h-px w-12 bg-[#101c34]/20" />
            </div>
            <h2
              className="text-3xl md:text-4xl font-black text-[#101c34] mb-3"
              style={{ fontFamily: 'var(--font-head)' }}
            >
              A Quick Guide to Understanding GHT
            </h2>
            <p className="text-gray-500 text-base">Answers to the questions we hear most often.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-[#b8c0d8]/40 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#f0f2f7] transition-colors"
                >
                  <span className="font-semibold text-[#101c34] pr-4 text-base">{faq.question}</span>
                  {openFaq === idx
                    ? <ChevronUp className="w-5 h-5 text-[#101c34] flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 pt-1 text-gray-600 leading-relaxed border-t border-[#b8c0d8]/30 bg-[#f8f9fc] text-base">
                    {faq.answer}
                  </div>
                )}
                {/* animated bottom bar */}
                <div className={`h-[2px] bg-gradient-to-r from-[#101c34] to-[#2a3f6b] transition-all duration-500 ${openFaq === idx ? 'w-full' : 'w-0'}`} />
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default About;