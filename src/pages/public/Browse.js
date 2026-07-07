import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Logo from '../../components/Logo';
import HelixBackground from '../../components/HelixBackground';

export default function Browse() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/public/businesses');
        setBusinesses(data.businesses || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (businesses.length < 2) return;
    timerRef.current = setInterval(() => {
      setCarouselIdx(prev => (prev + 1) % businesses.length);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [businesses.length]);

  const filtered = businesses.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase())
  );

  const carouselBiz = businesses[carouselIdx];

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <HelixBackground />

      <nav style={{
        position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '14px 24px',
      }}>
        <Logo iconSize={24} fontSize={12} />
        <div className="flex items-center gap-2.5">
          <Link to="/login" className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>
            Business Login
          </Link>
          <Link to="/register" className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
            Sign Up
          </Link>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-20" style={{ zIndex: 10 }}>
        {/* Hero: title left, carousel right */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 48,
          marginBottom: 48, flexWrap: 'wrap',
        }}>
          {/* Left: big title */}
          <div style={{ flex: '1 1 280px' }}>
            <h1 style={{
              fontSize: 'clamp(3.5rem, 10vw, 7rem)',
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: '#fff',
              margin: 0,
            }}>
              Browse
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Businesses
              </span>
            </h1>
            <p style={{
              marginTop: 20, fontSize: 14, lineHeight: 1.6,
              color: 'rgba(255,255,255,0.35)', maxWidth: 320,
            }}>
              Find a business and book an appointment — no account needed.
            </p>
          </div>

          {/* Right: carousel */}
          {carouselBiz && (
            <div style={{ flex: '0 0 320px', minHeight: 200 }}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
                <Link to={`/book/${carouselBiz.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="glass" style={{
                    padding: 24,
                    animation: 'carouselIn 0.45s ease',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.12))',
                      marginBottom: 14,
                    }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                    <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: '0 0 4px' }}>
                      {carouselBiz.name}
                    </h3>
                    {carouselBiz.description && (
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                        {carouselBiz.description}
                      </p>
                    )}
                    <div style={{
                      marginTop: 14, display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 11, color: '#a78bfa', fontWeight: 600,
                    }}>
                      Book now
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Dots */}
                {businesses.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 12 }}>
                    {businesses.slice(0, 5).map((_, i) => (
                      <button key={i} onClick={() => setCarouselIdx(i)}
                              style={{
                                width: 6, height: 6, borderRadius: '50%', border: 'none',
                                cursor: 'pointer', padding: 0,
                                background: i === carouselIdx ? '#a78bfa' : 'rgba(255,255,255,0.12)',
                                transition: 'background 0.2s',
                              }} />
                    ))}
                    {businesses.length > 5 && (
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 2 }}>+{businesses.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-10">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search businesses..."
                 className="input-dark w-full pl-9" />
          {search && (
            <button onClick={() => setSearch('')}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6,
                      width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 11,
                    }}>
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="glass" style={{ width: 280, padding: 20 }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12, marginBottom: 12 }} />
                <div className="skeleton" style={{ width: '65%', height: 14, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '90%', height: 10 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass p-10 text-center max-w-sm mx-auto">
            <p className="text-white text-sm mb-1">No businesses found</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {search ? 'Try a different search term.' : 'No businesses are available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(b => (
              <Link key={b._id} to={`/book/${b.slug}`}
                    className="glass glass-hover block p-5 no-underline">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                     style={{ background: 'rgba(124,58,237,0.15)' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{b.name}</h3>
                {b.description && (
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{b.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes carouselIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
