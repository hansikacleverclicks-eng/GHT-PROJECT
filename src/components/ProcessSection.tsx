import { Link } from "react-router-dom";

// Recovered from the live Hostinger bundle (the "Our Process" / "Plan Your Wedding" section).
// Replaces the "Our Partners" section on the home page.
// Needs: /ght_logo.png in public/, and the Playfair Display + Inter fonts loaded (see notes).

const steps = [
  { title: "Consult", text: "We understand your vision, priorities, and budget." },
  { title: "Plan", text: "We design a personalized wedding plan with expert insights." },
  { title: "Book", text: "We handle negotiations, confirmations, and contracts." },
  { title: "Manage", text: "We coordinate with all service providers to keep everything on track." },
  { title: "Execute", text: "On your big day, our team ensures every detail goes perfectly." },
];

const icons = ["◌", "✎", "✓", "⚙", "☑"];

const playfair = { fontFamily: "'Playfair Display', serif", fontWeight: 900 };
const inter = (weight: number) => ({ fontFamily: "Inter, sans-serif", fontWeight: weight });

export default function ProcessSection() {
  return (
    <section className="relative overflow-hidden bg-white text-[#0B0B13]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-32 bottom-[-130px] w-[430px] h-[430px] rounded-full border border-[#0B0B13]/[0.06]" />
        <div className="absolute -left-20 bottom-[-80px] w-[300px] h-[300px] rounded-full border-2 border-[#0B0B13]/[0.04]" />
        <div className="absolute -right-32 top-[-140px] w-[430px] h-[430px] rounded-full border border-[#0B0B13]/[0.06]" />
        <div className="absolute -right-20 top-[-100px] w-[300px] h-[300px] rounded-full border-2 border-[#0B0B13]/[0.04]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
        <div className="flex justify-center mb-5 md:mb-6">
          <img
            src="/ght_logo.png"
            alt="Global Hotels & Tourism"
            className="w-24 md:w-28 h-auto object-contain"
          />
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-5 mb-5 md:mb-6">
          <div className="h-px w-10 sm:w-16 md:w-24 bg-[#0B0B13]" />
          <span
            className="text-[#0B0B13] text-[10px] sm:text-xs md:text-sm tracking-[0.35em] md:tracking-[0.45em] uppercase font-bold"
            style={inter(700)}
          >
            Our Process
          </span>
          <div className="h-px w-10 sm:w-16 md:w-24 bg-[#0B0B13]" />
        </div>

        <h2
          className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] font-black text-[#0B0B13] max-w-5xl mx-auto"
          style={playfair}
        >
          Plan Your Wedding
        </h2>

        <p
          className="max-w-4xl mx-auto mt-5 md:mt-6 text-center text-sm sm:text-base md:text-lg leading-relaxed text-[#0B0B13]/70 italic"
          style={inter(400)}
        >
          Discover our trusted partners who bring extraordinary experiences to life — from
          world-class hospitality and breathtaking venues to exquisite décor and curated gifting.
        </p>

        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`group relative rounded-2xl border border-[#0B0B13]/15 bg-white p-5 md:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                i === 3 ? "lg:col-span-2 lg:col-start-2" : "lg:col-span-2"
              }`}
            >
              <div className="flex items-center gap-4 md:gap-5">
                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0B0B13] flex items-center justify-center">
                  <span className="text-2xl md:text-3xl text-white" style={playfair}>
                    {icons[i]}
                  </span>
                </div>
                <div className="border-l border-[#0B0B13]/15 pl-4 md:pl-5">
                  <h3 className="text-xl md:text-2xl lg:text-3xl text-[#0B0B13]" style={playfair}>
                    {step.title}
                  </h3>
                  <p
                    className="mt-2 text-xs sm:text-sm md:text-base leading-relaxed text-[#0B0B13]/65 italic"
                    style={inter(400)}
                  >
                    {step.text}
                  </p>
                </div>
              </div>
              <div className="h-[2px] w-0 group-hover:w-full mt-5 bg-[#0B0B13] transition-all duration-500" />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10 md:mt-12">
          <Link
            to="/join-as-vendor"
            className="inline-flex items-center justify-center gap-5 md:gap-6 min-w-[260px] md:min-w-[390px] rounded-full px-7 md:px-8 py-4 text-base md:text-xl font-bold shadow-lg transition-all duration-300"
            style={{
              fontFamily: "'Inter',sans-serif",
              fontWeight: 700,
              backgroundColor: "#0B0B13",
              color: "#FFFFFF",
              border: "1px solid #0B0B13",
              textDecoration: "none",
              opacity: 1,
              WebkitTextFillColor: "#FFFFFF",
            }}
          >
            Plan My Wedding
            <span
              className="text-2xl md:text-3xl leading-none"
              style={{ color: "#FFFFFF", WebkitTextFillColor: "#FFFFFF" }}
            >
              →
            </span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-5 mt-10 md:mt-12">
          <div className="h-px w-12 sm:w-16 md:w-20 bg-[#0B0B13]" />
          <span className="text-[#0B0B13] text-xl md:text-2xl">♧</span>
          <div className="h-px w-12 sm:w-16 md:w-20 bg-[#0B0B13]" />
        </div>

        <p
          className="text-center text-[9px] sm:text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.45em] text-[#0B0B13]/60 uppercase mt-3"
          style={inter(700)}
        >
          Extraordinary Journeys. Timeless Celebrations.
        </p>
      </div>
    </section>
  );
}
