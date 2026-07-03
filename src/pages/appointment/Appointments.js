import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';
import ConfirmModal from '../../components/ConfirmModal';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending',   label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const statusClass = (s) =>
  ({ pending: 'badge badge-pending', confirmed: 'badge badge-confirmed', cancelled: 'badge badge-cancelled',
     completed: 'badge badge-completed', 'no-show': 'badge badge-no-show' }[s] || 'badge badge-pending');

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const SkeletonRow = () => (
  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    {[140, 100, 90, 90, 60, 55, 50].map((w, i) => (
      <td key={i} className="px-6 py-4"><div className="skeleton h-3 rounded" style={{ width: w }} /></td>
    ))}
  </tr>
);

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [confirm, setConfirm]           = useState(null); // { id, action: 'cancel' }

  const fetch = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res    = await api.get('/appointments', { params });
      setAppointments(res.data || []);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [filter]); // eslint-disable-line

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleCancel = async () => {
    try {
      await api.delete(`/appointments/${confirm.id}`);
      toast.success('Booking cancelled');
      setAppointments(prev => prev.filter(a => a._id !== confirm.id));
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setConfirm(null);
    }
  };

  return (
    <>
      <ConfirmModal
        open={!!confirm}
        title="Cancel this booking?"
        message="The client will not be notified automatically. You may want to reach out to them."
        confirmLabel="Cancel booking"
        danger
        onConfirm={handleCancel}
        onCancel={() => setConfirm(null)}
      />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Appointments</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
              {loading ? '—' : `${appointments.length} ${filter !== 'all' ? filter : 'total'}`}
            </p>
          </div>
          <Link to="/appointments/new" className="btn-primary gap-2">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            New Booking
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
              style={filter === f.id
                ? { background: 'rgba(124,58,237,0.25)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.45)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass overflow-hidden">
          {!loading && appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-white">No bookings found</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {filter !== 'all' ? 'Try a different filter' : 'Your bookings will appear here'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Client', 'Service', 'Date & Time', 'Location', 'Status', 'Amount', ''].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium"
                          style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                    : appointments.map((apt) => (
                      <tr key={apt._id} className="table-row-hover"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                 style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                              {apt.client?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-white text-xs">{apt.client?.name}</p>
                              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{apt.client?.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="text-white">{apt.service?.name || '—'}</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>{apt.startTime} – {apt.endTime}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="text-white">{fmtDate(apt.date)}</p>
                        </td>
                        <td className="px-6 py-3.5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {apt.business?.name || '—'}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={statusClass(apt.status)}>{apt.status}</span>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-sm" style={{ color: '#4ade80' }}>
                          {fmt(apt.payment?.amount || 0)}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {apt.status === 'pending' && (
                              <button
                                onClick={() => handleStatus(apt._id, 'confirmed')}
                                className="btn-icon"
                                style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}
                                title="Confirm booking"
                              >
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                              </button>
                            )}
                            {apt.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatus(apt._id, 'completed')}
                                className="btn-icon"
                                style={{ background: 'rgba(6,182,212,0.12)', color: '#22d3ee' }}
                                title="Mark as completed"
                              >
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                              </button>
                            )}
                            {['pending', 'confirmed'].includes(apt.status) && (
                              <button
                                onClick={() => setConfirm({ id: apt._id })}
                                className="btn-icon"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                                title="Cancel booking"
                              >
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Appointments;
