import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Logo from '../../components/Logo';
import HelixBackground from '../../components/HelixBackground';

export default function Browse() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  const filtered = businesses.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: '#000' }}>
      <HelixBackground />

      <nav style={{
        position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
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

      <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-20" style={{ zIndex: 10 }}>
        {/* Hero */}
        <div className="text-center mb-16">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 20, padding: '4px 14px', marginBottom: 20,
            fontSize: 11, letterSpacing: '0.04em', color: '#a78bfa', textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Find your next appointment
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">
            Browse Businesses
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
            Discover top-rated local businesses and book appointments instantly — no account needed.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-14">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search businesses..."
                 className="input-dark w-full pl-9"
                 style={search ? { borderColor: 'rgba(124,58,237,0.3)', boxShadow: '0 0 0 3px rgba(124,58,237,0.06)' } : {}} />
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
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', padding: '20px 0' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="glass" style={{ width: 280, padding: 20 }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12, marginBottom: 12 }} />
                <div className="skeleton" style={{ width: '65%', height: 14, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '90%', height: 10 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass" style={{
            maxWidth: 340, margin: '0 auto', padding: '40px 32px', textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16, margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(124,58,237,0.1)',
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {search ? 'No results found' : 'No businesses yet'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 1.5 }}>
              {search
                ? `Nothing matches "${search}". Try a different term.`
                : 'There are no businesses available right now. Check back later.'}
            </p>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>
              {filtered.length} {filtered.length === 1 ? 'business' : 'businesses'} available
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(b => (
                <Link key={b._id} to={`/book/${b.slug}`}
                      className="glass glass-hover block p-5 no-underline"
                      style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.3s ease',
                    background: 'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.08), transparent 70%)',
                    pointerEvents: 'none',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))',
                    }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm" style={{ lineHeight: 1.3 }}>{b.name}</h3>
                      {b.category && (
                        <span style={{ fontSize: 10, color: 'rgba(167,139,250,0.6)' }}>{b.category}</span>
                      )}
                    </div>
                  </div>
                  {b.description && (
                    <p className="text-xs" style={{
                      color: 'rgba(255,255,255,0.4)', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {b.description}
                    </p>
                  )}
                  <div style={{
                    marginTop: 14, display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, color: 'rgba(167,139,250,0.5)', fontWeight: 500,
                  }}>
                    Book now
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '24px', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
          <Logo iconSize={16} fontSize={10} />
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
          &copy; {new Date().getFullYear()} Weavo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
