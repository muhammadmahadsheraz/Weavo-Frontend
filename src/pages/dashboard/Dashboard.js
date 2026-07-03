import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const statusClass = (s) =>
  ({ pending: 'badge badge-pending', confirmed: 'badge badge-confirmed', cancelled: 'badge badge-cancelled',
     completed: 'badge badge-completed', 'no-show': 'badge badge-no-show' }[s] || 'badge badge-pending');

/* ── Skeleton rows ── */
const SkeletonRow = () => (
  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    {[120, 90, 80, 100, 60, 55].map((w, i) => (
      <td key={i} className="px-6 py-4">
        <div className="skeleton h-3 rounded" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

const StatCard = ({ title, value, sub, icon, accent, loading }) => (
  <div className="glass glass-hover p-5 flex items-center gap-4">
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: accent }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{title}</p>
      {loading
        ? <div className="skeleton h-6 w-16 mt-1.5 rounded" />
        : <p className="text-2xl font-bold text-white mt-0.5 leading-none">{value}</p>
      }
      {sub && !loading && (
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>{sub}</p>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats]       = useState({ total: 0, businesses: 0, revenue: 0, pending: 0 });
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([api.get('/appointments'), api.get('/businesses')])
      .then(([aptRes, bizRes]) => {
        const apts = aptRes.data || [];
        const bizs = bizRes.data || [];
        const revenue = apts.reduce((s, a) =>
          a.payment?.status === 'paid' ? s + (a.payment?.amount || 0) : s, 0);
        setStats({ total: apts.length, businesses: bizs.length, revenue, pending: apts.filter(a => a.status === 'pending').length });
        setRows(apts.slice(0, 7));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-7">

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard loading={loading} title="Total Bookings"   value={stats.total}        sub="All time"             accent="rgba(124,58,237,0.22)" icon={<svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} />
        <StatCard loading={loading} title="Locations"        value={stats.businesses}   sub="Registered"           accent="rgba(6,182,212,0.18)"  icon={<svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="#22d3ee" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>} />
        <StatCard loading={loading} title="Revenue Collected" value={fmt(stats.revenue)} sub="Paid bookings"        accent="rgba(34,197,94,0.18)"  icon={<svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
        <StatCard loading={loading} title="Needs Attention"  value={stats.pending}      sub="Awaiting confirmation" accent="rgba(251,191,36,0.18)"  icon={<svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
      </div>

      {/* Recent bookings */}
      <div className="glass overflow-hidden">
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Bookings</h3>
            {!loading && (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Showing last {rows.length} entries
              </p>
            )}
          </div>
          <Link
            to="/appointments"
            className="text-xs font-medium flex items-center gap-1 transition-colors"
            style={{ color: '#a78bfa' }}
          >
            View all
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {!loading && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-white">No bookings yet</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Create your first appointment to see it here</p>
            <Link to="/appointments/new" className="btn-primary mt-1" style={{ padding: '8px 18px', fontSize: '12px' }}>
              Create booking
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Client', 'Service', 'Date', 'Business', 'Status', 'Amount'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium"
                        style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : rows.map((apt) => (
                    <tr
                      key={apt._id}
                      className="table-row-hover"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onClick={() => {}}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}
                          >
                            {apt.client?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white text-xs">{apt.client?.name}</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{apt.client?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-white">{apt.service?.name || '—'}</td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm text-white">{fmtDate(apt.date)}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{apt.startTime}</p>
                      </td>
                      <td className="px-6 py-3.5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {apt.business?.name || '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={statusClass(apt.status)}>{apt.status}</span>
                      </td>
                      <td className="px-6 py-3.5 text-sm font-semibold" style={{ color: '#4ade80' }}>
                        {fmt(apt.payment?.amount || 0)}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule nudge — only show if there are pending items */}
      {!loading && stats.pending > 0 && (
        <div
          className="glass flex items-center gap-4 px-5 py-4"
          style={{ borderLeft: '3px solid rgba(251,191,36,0.5)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(251,191,36,0.12)' }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {stats.pending} booking{stats.pending > 1 ? 's' : ''} pending confirmation
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Confirm or reschedule to keep your calendar up to date
            </p>
          </div>
          <Link
            to="/appointments"
            className="btn-ghost flex-shrink-0"
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            Review
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
