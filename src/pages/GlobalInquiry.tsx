import React, { useState } from 'react'
import boygirlimage from '../assets/boy-girl.png'
import flower from '../assets/flower1.png'
import smallflower from '../assets/smallflower.png'

const GlobalInquiry = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    numberOfGuests: '',
    attending: '',
    mealPreferences: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const API = import.meta.env.MODE === 'development'
        ? 'https://globalhotelsandtourism.com/backend/api/inquiries.php'
        : '/backend/api/inquiries.php'
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setFormData({ name: '', email: '', address: '', numberOfGuests: '', attending: '', mealPreferences: '' })
      } else {
        setSubmitError(data.error || 'Submission failed. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;500&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .gi-page {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 60px 20px;
          font-family: 'Lato', sans-serif;
        }

        /* ── FLORAL RIGHT — original, untouched ── */
    .gi-floral-right {
  position: absolute;
  left: 900px;
  top: 30%;
  transform: translateY(-50%);
  width: 220px;
  max-width: none;
  opacity: 1;
  z-index: 1;
  pointer-events: none;
  user-select: none;
}

        .gi-layout {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        /* ── COUPLE — original, untouched ── */
.gi-couple {
  position: absolute;
  left: -300px;
  bottom: -5%;
  width: 320px;
  height: auto;
  z-index: 6;
  pointer-events: none;
  user-select: none;
}

        /* OUTER FRAME */
.gi-card-outer {
  background: #d9e6ef;
  padding: 14px;
  border-radius: 4px;
  box-shadow: 0 10px 40px rgba(120, 160, 190, 0.15);
}

        /* INNER CARD */
        .gi-card {
          position: relative;
          z-index: 5;
          background: #ffffff;
          border: 1.5px solid #b8cfdf;
          border-radius: 3px;
          padding: 44px 52px 48px 52px;
          width: 100%;
          max-width: 430px;
          box-shadow: 0 4px 32px rgba(90, 130, 160, 0.08);
        }

        .gi-label {
          text-align: center;
          font-family: 'Lato', sans-serif;
          font-weight: 300;
          font-size: 12px;
          letter-spacing: 2.5px;
          color: #7a9db5;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .gi-heading {
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 6px;
          color: #1a3a50;
          text-transform: uppercase;
          line-height: 1.2;
          margin-bottom: 14px;
        }

        .gi-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
        }

        .gi-div-line {
          flex: 1;
          max-width: 90px;
          height: 1px;
          background: #b5cedf;
        }

        .gi-div-flower {
          width: 26px;
          height: auto;
          opacity: 0.9;
        }

        .gi-page {
          background: #f9fbfd;
        }

        .gi-form {
          display: flex;
          flex-direction: column;
        }

        .gi-field {
          position: relative;
          padding-bottom: 2px;
          margin-bottom: 4px;
        }

        .gi-field::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: #c8d9e6;
        }

        .gi-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #5e8eaa;
          transition: width 0.28s ease;
          z-index: 1;
        }

        .gi-field:focus-within .gi-bar { width: 100%; }

        .gi-field input,
        .gi-field select {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #1a3a50;
          padding: 13px 26px 11px 0;
          letter-spacing: 0.2px;
          appearance: none;
          -webkit-appearance: none;
        }

        .gi-field input::placeholder { color: #94b4c6; }
        .gi-field select             { color: #94b4c6; cursor: pointer; }
        .gi-field select.filled      { color: #1a3a50; }

        .gi-arrow {
          position: absolute;
          right: 3px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #94b4c6;
          font-size: 11px;
        }

        .gi-gap { height: 8px; }

        .gi-submit-wrap {
          display: flex;
          justify-content: center;
          margin-top: 28px;
        }

        .gi-submit {
          background: #7fa5be;
          color: #fff;
          border: none;
          border-radius: 3px;
          padding: 14px 0;
          width: 230px;
          font-family: 'Lato', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }

        .gi-submit:hover  { background: #5580a0; transform: translateY(-1px); }
        .gi-submit:active { transform: translateY(0); }

        /* ═══════════════════════════
           TABLET (641px – 1024px)
           Only couple shrinks, floral untouched
        ═══════════════════════════ */
        @media (min-width: 641px) and (max-width: 1024px) {
          .gi-couple {
            left: -150px;
            width: 210px;
          }
          .gi-card {
            padding: 36px 38px 42px 38px;
          }
          .gi-heading {
            font-size: 28px;
            letter-spacing: 4px;
          }
        }

        /* ═══════════════════════════
           MOBILE (≤ 640px)
        ═══════════════════════════ */
        @media (max-width: 640px) {
          .gi-couple,
          .gi-floral-right {
            display: none;
          }
          .gi-layout {
            width: 100%;
          }
          .gi-card-outer {
            padding: 10px;
            width: 100%;
          }
          .gi-card {
            padding: 28px 20px 36px 20px;
            max-width: 100%;
          }
          .gi-heading {
            font-size: 22px;
            letter-spacing: 3px;
          }
          .gi-field input,
          .gi-field select {
            font-size: 14px;
            padding: 14px 26px 12px 0;
          }
          .gi-submit {
            width: 100%;
            font-size: 12px;
            letter-spacing: 2px;
          }
        }
      `}</style>

      <div className="gi-page">

        <img src={flower} alt="" className="gi-floral-right" />

        <div className="gi-layout">

          <img src={boygirlimage} alt="couple" className="gi-couple" />

          <div className="gi-card-outer">
            <div className="gi-card">

              <p className="gi-label">Let's Meet</p>
              <h1 className="gi-heading">Make An Inquiry</h1>

              <div className="gi-divider">
                <div className="gi-div-line" />
                <img src={smallflower} alt="" className="gi-div-flower" />
                <div className="gi-div-line" />
              </div>

              <form className="gi-form" onSubmit={handleSubmit}>

                <div className="gi-field">
                  <input
                    type="text" name="name" placeholder="Name"
                    value={formData.name} onChange={handleChange}
                  />
                  <span className="gi-bar" />
                </div>

                <div className="gi-field">
                  <input
                    type="email" name="email" placeholder="Email"
                    value={formData.email} onChange={handleChange}
                  />
                  <span className="gi-bar" />
                </div>

                <div className="gi-field">
                  <input
                    type="text" name="address" placeholder="Address"
                    value={formData.address} onChange={handleChange}
                  />
                  <span className="gi-bar" />
                </div>

                <div className="gi-gap" />

                <div className="gi-field">
                  <select
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleChange}
                    className={formData.numberOfGuests ? 'filled' : ''}
                  >
                    <option value="">Number Of Guests</option>
                    <option value="1-50">1 – 50</option>
                    <option value="51-100">51 – 100</option>
                    <option value="101-200">101 – 200</option>
                    <option value="200+">200+</option>
                  </select>
                  <span className="gi-arrow">▾</span>
                  <span className="gi-bar" />
                </div>

                <div className="gi-field">
                  <select
                    name="attending"
                    value={formData.attending}
                    onChange={handleChange}
                    className={formData.attending ? 'filled' : ''}
                  >
                    <option value="">What Will Be You Attending</option>
                    <option value="ceremony">Ceremony Only</option>
                    <option value="reception">Reception Only</option>
                    <option value="both">Ceremony &amp; Reception</option>
                  </select>
                  <span className="gi-arrow">▾</span>
                  <span className="gi-bar" />
                </div>

                <div className="gi-field">
                  <select
                    name="mealPreferences"
                    value={formData.mealPreferences}
                    onChange={handleChange}
                    className={formData.mealPreferences ? 'filled' : ''}
                  >
                    <option value="">Meal Preferences</option>
                    <option value="veg">Vegetarian</option>
                    <option value="nonveg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-Free</option>
                  </select>
                  <span className="gi-arrow">▾</span>
                  <span className="gi-bar" />
                </div>

                {submitError && (
                  <p style={{ color: '#c0392b', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>{submitError}</p>
                )}
                {submitted && (
                  <p style={{ color: '#27ae60', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>Thank you! Your inquiry has been sent.</p>
                )}
                <div className="gi-submit-wrap">
                  <button type="submit" disabled={submitting} className="gi-submit">
                    {submitting ? 'Sending...' : 'Send An Inquiry'}
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default GlobalInquiry