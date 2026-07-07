import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Logo from '../../components/Logo';

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
      {/* Animated radial glow */}
      <div style={{
        position: 'fixed', inset: '-80px', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 600px 400px at 50% 180px, rgba(124,58,237,0.08), transparent)',
        animation: 'glowDrift 7s ease-in-out infinite alternate',
      }} />
      <style>{`@keyframes glowDrift { from { transform: translateX(-30px); } to { transform: translateX(30px); } }`}</style>

      <nav style={{
        position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
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

      <div className="relative max-w-5xl mx-auto px-4 pt-14 pb-20" style={{ zIndex: 10 }}>
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Browse Businesses</h1>
          <div style={{ width: 40, height: 3, margin: '0 auto 12px', borderRadius: 2, background: 'linear-gradient(90deg, #7C3AED, #06B6D4)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Find a business and book an appointment
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-12">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search businesses..."
                 className="input-dark w-full pl-9" />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
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
    </div>
  );
}
