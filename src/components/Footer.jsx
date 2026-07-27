import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logoremove.png'

const HAS_LOGO = true;

const Footer = () => (
  <footer style={{
    background: 'linear-gradient(135deg, #9b8ea8 0%, #a594b0 40%, #8e7f9c 100%)',
    width: '100%',
  }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

      .gft * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }

      /* ── Wrapper ── */
      .gft-wrap {
        max-width: 1140px;
        margin: 0 auto;
        padding: 3.5rem 2rem 1.75rem;
      }

      /* ══ MAIN GRID: 3 equal cols ══ */
      .gft-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 2.5rem;
        align-items: start;
      }

      /* ── Section headings ── */
      .gft-heading {
        font-size: 1.65rem;
        font-weight: 700;
        color: #fff;
        margin: 0 0 1.3rem 0;
        line-height: 1.2;
      }

      /* ══ LINKS ══ */
      .gft-links-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0 1rem;
      }
      .gft-link {
        display: block;
        color: rgba(255,255,255,0.82);
        text-decoration: none;
        font-size: 0.9rem;
        padding: 0.3rem 0;
        transition: color 0.2s;
      }
      .gft-link:hover { color: #fff; text-decoration: underline; }

      /* ══ BRAND (centre) ══ */
      .gft-brand {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.8rem;
      }
      .gft-brand-a {
        text-decoration: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.45rem;
      }
      .gft-logo {
        height: 68px;
        width: auto;
        object-fit: contain;
      }
      .gft-brand-name {
        font-size: 1.45rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
      }
      .gft-tagline {
        color: rgba(255,255,255,0.78);
        font-size: 0.875rem;
        line-height: 1.7;
        width: 100%;
        max-width: 240px;
        margin: 0 auto;
        text-align: center;
        word-break: normal;
        overflow-wrap: break-word;
        hyphens: auto;
      }
      .gft-socials {
        display: flex;
        gap: 0.65rem;
        justify-content: center;
      }
      .gft-soc {
        width: 38px; height: 38px; min-width: 38px;
        border-radius: 50%;
        border: 1.5px solid rgba(255,255,255,0.5);
        background: transparent;
        display: flex; align-items: center; justify-content: center;
        text-decoration: none;
        flex-shrink: 0;
        transition: background 0.2s, border-color 0.2s;
      }
      .gft-soc:hover { background: rgba(255,255,255,0.18); border-color: #fff; }

      /* ══ CONTACT ══ */
      .gft-contact {
        display: flex;
        flex-direction: column;
        align-items: flex-start; /* left-align the whole block */
      }
      .gft-citems {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
      }

      /*
        Contact row: ICON always on LEFT, TEXT on RIGHT
        Simple left-to-right flex — no order tricks needed
      */
      .gft-crow {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        color: rgba(255,255,255,0.88);
        font-size: 0.875rem;
        line-height: 1.45;
        transition: color 0.2s;
        width: 100%;
      }
      .gft-crow:hover { color: #fff; }

      /* Icon circle — always first child (left) */
      .gft-cicon {
        width: 36px; height: 36px; min-width: 36px;
        border-radius: 50%;
        border: 1.5px solid rgba(255,255,255,0.5);
        background: transparent;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: background 0.25s, border-color 0.25s;
      }
      .gft-crow:hover .gft-cicon {
        background: rgba(255,255,255,0.92);
        border-color: #fff;
      }
      .gft-cicon svg { display: block; }
      .gft-cicon .si { stroke: white; fill: none; transition: stroke 0.25s; }
      .gft-cicon .fi { fill: white; transition: fill 0.25s; }
      .gft-crow:hover .gft-cicon .si { stroke: #7a6b8a; }
      .gft-crow:hover .gft-cicon .fi { fill: #7a6b8a; }

      /* Label — always second child (right of icon) */
      .gft-clabel {
        text-align: left;
        word-break: break-word;
        flex: 1;
      }

      /* ══ DIVIDER + BOTTOM ══ */
      .gft-hr {
        border: none;
        border-top: 1px solid rgba(255,255,255,0.2);
        margin: 2.25rem 0 1.25rem;
      }
      .gft-bottom {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .gft-copy { color: rgba(255,255,255,0.68); font-size: 0.8rem; margin: 0; }
      .gft-legal { display: flex; gap: 1.25rem; }
      .gft-legal a { color: rgba(255,255,255,0.68); font-size: 0.8rem; text-decoration: underline; }

      /* ══ TABLET 768–1023px ══ */
      @media (min-width: 768px) and (max-width: 1023px) {
        .gft-grid {
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .gft-brand {
          grid-column: 1 / -1;
          order: -1;
        }
        .gft-tagline {
          max-width: 380px;
          font-size: 0.9rem;
        }
        .gft-links-col { text-align: left; }
        .gft-contact   { align-items: flex-start; }
      }

      /* ══ MOBILE < 768px ══ */
      @media (max-width: 767px) {
        .gft-wrap { padding: 2.5rem 1.25rem 1.25rem; }
        .gft-grid { grid-template-columns: 1fr; gap: 2rem; }

        .gft-brand { order: -1; }

        .gft-tagline {
          max-width: 100%;
          font-size: 0.88rem;
          padding: 0 0.5rem;
          text-align: center;
        }

        .gft-links-col { text-align: center; }
        .gft-heading   { text-align: center; }

        .gft-contact   { align-items: center; }
        .gft-citems    { align-items: flex-start; display: inline-flex; width: auto; }
        .gft-crow      { width: auto; }

        .gft-bottom { flex-direction: column; text-align: center; }
        .gft-legal  { justify-content: center; }
      }

      /* ══ Very small < 400px ══ */
      @media (max-width: 400px) {
        .gft-link  { font-size: 0.84rem; }
        .gft-crow  { font-size: 0.82rem; }
        .gft-heading { font-size: 1.35rem; }
      }
    `}</style>

    <div className="gft">
      <div className="gft-wrap">
        <div className="gft-grid">

          {/* ═══ LINKS ═══ */}
          <div className="gft-links-col">
            <p className="gft-heading">Links</p>
            <div className="gft-links-grid">
              <div>
                <Link to="/city-hotels/new-delhi"   className="gft-link">New Delhi</Link>
                <Link to="/city-hotels/uttarakhand"  className="gft-link">Uttarakhand</Link>
                <Link to="/city-hotels/jim-corbett"  className="gft-link">Jim Corbett</Link>
                <Link to="/city-hotels/agra"         className="gft-link">Agra</Link>
                <Link to="/city-hotels/goa"          className="gft-link">Goa</Link>
                <Link to="/blogs"                    className="gft-link">Blogs</Link>
              </div>
              <div>
                <Link to="/vendors/event-planners"   className="gft-link">Event Planners</Link>
                <Link to="/vendors/caterers"         className="gft-link">Caterers</Link>
                <Link to="/vendors/decorators"       className="gft-link">Decorators</Link>
                <Link to="/vendors/photography"      className="gft-link">Photography</Link>
                <Link to="/vendors/entertainment"    className="gft-link">Entertainment</Link>
                <Link to="/vendors"                  className="gft-link">All Vendors</Link>
              </div>
            </div>
          </div>

          {/* ═══ BRAND ═══ */}
          <div className="gft-brand">
            <a href="/" className="gft-brand-a">
              <img src={logo} alt="GHT Logo" className="gft-logo" />
              {!HAS_LOGO && <p className="gft-brand-name">Global Hotels &amp; Tourism.</p>}
            </a>
            <p className="gft-tagline">
              Where Venue, Event &amp; Wedding Planners Unite — your trusted partner for every celebration.
            </p>
            <div className="gft-socials">
              <a href="https://www.facebook.com/profile.php?id=61591995456171" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="gft-soc">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="gft-soc">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/global_hotelsandtourism/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="gft-soc">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>

          {/* ═══ CONTACT ═══ */}
          <div className="gft-contact">
            <p className="gft-heading">Contact</p>
            <div className="gft-citems">

              {/* ICON (left) → TEXT (right) — always */}
              <a href="mailto:contact@globalhotelsandtourism.com" className="gft-crow">
                <span className="gft-cicon">
                  <svg width="15" height="15" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect className="si" width="20" height="16" x="2" y="4" rx="2"/>
                    <path className="si" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <span className="gft-clabel">contact@globalhotelsandtourism.com</span>
              </a>

              <a href="tel:+919810261007" className="gft-crow">
                <span className="gft-cicon">
                  <svg width="15" height="15" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path className="si" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12 19.79 19.79 0 0 1 1.04 3.41 2 2 0 0 1 3 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <span className="gft-clabel">+91-9810261007</span>
              </a>

              <a href="https://wa.me/918076885774" target="_blank" rel="noopener noreferrer" className="gft-crow">
                <span className="gft-cicon">
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path className="fi" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
                <span className="gft-clabel">+91-8076885774 (WhatsApp)</span>
              </a> 
              
              <a href="https://www.facebook.com/profile.php?id=61591995456171" target="_blank" rel="noopener noreferrer" className="gft-crow">
                <span className="gft-cicon">
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path className="fi" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </span>
                <span className="gft-clabel">Facebook</span>
              </a>

              <a href="https://www.instagram.com/global_hotelsandtourism/?hl=en" target="_blank" rel="noopener noreferrer" className="gft-crow">
                <span className="gft-cicon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect className="si" x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path className="si" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line className="si" x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </span>
                <span className="gft-clabel">Instagram</span>
              </a>


            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <hr className="gft-hr" />
        <div className="gft-bottom">
          <p className="gft-copy">© {new Date().getFullYear()} Global Hotels &amp; Tourism. All rights reserved.</p>
          <div className="gft-legal">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/disclaimer">Disclaimer</Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;