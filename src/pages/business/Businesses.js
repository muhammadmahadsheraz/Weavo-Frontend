import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';
import ConfirmModal from '../../components/ConfirmModal';

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [confirm, setConfirm]       = useState(null);

  useEffect(() => {
    api.get('/businesses')
      .then(r => { console.log(r.data); setBusinesses(r.data || []); })
      .catch(() => toast.error('Failed to load businesses'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/businesses/${confirm}`);
      toast.success('Business removed');
      setBusinesses(prev => prev.filter(b => b._id !== confirm));
    } catch {
      toast.error('Failed to remove business');
    } finally {
      setConfirm(null);
    }
  };

  /* Skeleton cards */
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-5 w-28 rounded" />
            <div className="skeleton h-3 w-16 rounded mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="glass overflow-hidden">
              <div className="h-28 skeleton rounded-none" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        open={!!confirm}
        title="Remove this business?"
        message="All services and settings associated with this business will be permanently deleted."
        confirmLabel="Remove business"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Businesses</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
              {businesses.length} location{businesses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/businesses/new" className="btn-primary gap-2">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Add Location
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.12)' }}>
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-white">No locations yet</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.32)' }}>
                Add a business location to start accepting bookings
              </p>
            </div>
            <Link to="/businesses/new" className="btn-primary" style={{ fontSize: '12px', padding: '9px 20px' }}>
              Add your first location
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {businesses.map(biz => (
              <div key={biz._id} className="glass glass-hover overflow-hidden group">
                {/* Banner */}
                <div
                  className="h-24 relative flex items-end px-5 pb-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(6,182,212,0.2) 100%)',
                  }}
                >
                  {/* Business initial */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', backdropFilter: 'blur(8px)' }}
                  >
                    {biz.name?.charAt(0).toUpperCase()}
                  </div>
                  {/* Actions on hover */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <Link
                      to={`/businesses/${biz._id}`}
                      className="btn-icon"
                      style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.8)', width: 30, height: 30 }}
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </Link>
                    <button
                      onClick={() => setConfirm(biz._id)}
                      className="btn-icon"
                      style={{ background: 'rgba(239,68,68,0.35)', color: '#fca5a5', width: 30, height: 30 }}
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-sm font-bold text-white mb-0.5 truncate">{biz.name}</h3>
                  <p className="text-xs truncate mb-3" style={{ color: 'rgba(255,255,255,0.38)' }}>{biz.email}</p>

                  <div className="space-y-1.5">
                    {biz.phone && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        {biz.phone}
                      </div>
                    )}
                    {biz.address?.city && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {biz.address.city}, {biz.address.state}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3.5"
                       style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {biz.services?.length || 0} service{biz.services?.length !== 1 ? 's' : ''}
                    </span>
                    <span className={`badge ${biz.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {biz.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Booking link — always visible once slug exists */}
                  {biz.slug ? (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg"
                         style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.18)' }}>
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#22d3ee" strokeWidth={2} className="flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                      </svg>
                      <span className="text-xs truncate flex-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                        /book/{biz.slug}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/book/${biz.slug}`);
                          toast.success('Booking link copied!');
                        }}
                        className="flex-shrink-0 text-xs font-medium transition-colors"
                        style={{ color: '#22d3ee' }}
                      >
                        Copy
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 px-3 py-2 rounded-lg text-xs"
                         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                      Booking link generating — refresh page
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Businesses;
