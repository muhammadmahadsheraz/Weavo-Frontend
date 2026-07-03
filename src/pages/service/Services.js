import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';
import ConfirmModal from '../../components/ConfirmModal';

/* Map category keywords to a color accent */
const categoryColor = (cat) => {
  if (!cat) return { bg: 'rgba(124,58,237,0.15)', stroke: '#a78bfa' };
  const c = cat.toLowerCase();
  if (c.includes('hair'))   return { bg: 'rgba(245,158,11,0.15)',  stroke: '#f59e0b' };
  if (c.includes('skin') || c.includes('face')) return { bg: 'rgba(236,72,153,0.15)', stroke: '#ec4899' };
  if (c.includes('massage') || c.includes('body')) return { bg: 'rgba(34,197,94,0.15)', stroke: '#4ade80' };
  if (c.includes('nail'))   return { bg: 'rgba(6,182,212,0.15)',   stroke: '#22d3ee' };
  if (c.includes('health') || c.includes('medical')) return { bg: 'rgba(99,102,241,0.15)', stroke: '#818cf8' };
  return { bg: 'rgba(124,58,237,0.15)', stroke: '#a78bfa' };
};

const currencySymbol = (c) => ({ USD: '$', EUR: '€', GBP: '£', INR: '₹' }[c] || c + ' ');

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [confirm, setConfirm]   = useState(null);

  useEffect(() => {
    api.get('/services')
      .then(r => setServices(r.data || []))
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/services/${confirm}`);
      toast.success('Service removed');
      setServices(prev => prev.filter(s => s._id !== confirm));
    } catch {
      toast.error('Failed to remove service');
    } finally {
      setConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-5 w-24 rounded" />
            <div className="skeleton h-3 w-14 rounded mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="skeleton w-10 h-10 rounded-xl" />
              </div>
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
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
        title="Remove this service?"
        message="Appointments using this service will no longer reference it."
        confirmLabel="Remove service"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Services</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
              {services.length} service{services.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/services/new" className="btn-primary gap-2">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            New Service
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.1)' }}>
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#22d3ee" strokeWidth={1.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-white">No services yet</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.32)' }}>
                Define what you offer — clients will choose from these when booking
              </p>
            </div>
            <Link to="/services/new" className="btn-primary" style={{ fontSize: '12px', padding: '9px 20px' }}>
              Create first service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {services.map(svc => {
              const { bg, stroke } = categoryColor(svc.category);
              return (
                <div key={svc._id} className="glass glass-hover p-5 group flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: bg }}>
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/>
                      </svg>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <Link
                        to={`/services/${svc._id}`}
                        className="btn-icon"
                        style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}
                      >
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </Link>
                      <button
                        onClick={() => setConfirm(svc._id)}
                        className="btn-icon"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
                      >
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-0.5 truncate">{svc.name}</h3>
                  {svc.business?.name && (
                    <p className="text-xs mb-2 truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>{svc.business.name}</p>
                  )}
                  {svc.description && (
                    <p className="text-xs mb-3 line-clamp-2 flex-1" style={{ color: 'rgba(255,255,255,0.42)' }}>
                      {svc.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3.5"
                       style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {svc.duration} min
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: stroke }}>
                        {currencySymbol(svc.currency)}{Number(svc.price).toLocaleString()}
                      </span>
                      <span className={`badge ${svc.isAvailable ? 'badge-active' : 'badge-inactive'}`}>
                        {svc.isAvailable ? 'Available' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Services;
