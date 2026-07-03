import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLORS = { confirmed: '#4ade80', pending: '#fbbf24', cancelled: '#f87171', completed: '#22d3ee', 'no-show': '#94a3b8' };

/* Simple inline SVG bar chart */
const BarChart = ({ data, label, color = '#7C3AED' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const h = 100;
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${data.length * 36} ${h + 24}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {data.map((d, i) => {
          const barH = Math.max(2, (d.value / max) * h);
          const x = i * 36 + 4;
          const y = h - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={28} height={barH} rx={4}
                    fill={color} opacity={0.75} />
              <text x={x + 14} y={h + 16} textAnchor="middle" fontSize="9"
                    fill="rgba(255,255,255,0.35)">{d.label}</text>
              {d.value > 0 && (
                <text x={x + 14} y={y - 4} textAnchor="middle" fontSize="9"
                      fill="rgba(255,255,255,0.6)">{d.value}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Analytics = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then(r => setAppointments(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><div className="spinner"/></div>
  );

  // ── Derive stats ──
  const total    = appointments.length;
  const revenue  = appointments.reduce((s,a) => a.payment?.status === 'paid' ? s + (a.payment?.amount||0) : s, 0);
  const completed = appointments.filter(a => a.status === 'completed').length;
  const noShow   = appointments.filter(a => a.status === 'no-show').length;
  const showRate = total > 0 ? (((total - noShow) / total) * 100).toFixed(0) : 100;

  // Bookings per month (last 6 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const count = appointments.filter(a => {
      const ad = new Date(a.date);
      return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
    }).length;
    return { label: MONTHS[d.getMonth()], value: count };
  });

  // Revenue per month (last 6)
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const amt = appointments.filter(a => {
      const ad = new Date(a.date);
      return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth()
        && a.payment?.status === 'paid';
    }).reduce((s, a) => s + (a.payment?.amount || 0), 0);
    return { label: MONTHS[d.getMonth()], value: Math.round(amt) };
  });

  // Status breakdown
  const statusBreakdown = Object.entries(
    appointments.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]);

  // Top services
  const serviceCounts = appointments.reduce((acc, a) => {
    const name = a.service?.name || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Analytics</h2>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>Overview of your booking performance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings',   value: total,           accent: 'rgba(124,58,237,0.2)', color: '#a78bfa' },
          { label: 'Completed',        value: completed,        accent: 'rgba(34,197,94,0.15)', color: '#4ade80' },
          { label: 'Revenue Collected', value: fmt(revenue),    accent: 'rgba(6,182,212,0.15)', color: '#22d3ee' },
          { label: 'Show-up Rate',     value: `${showRate}%`,   accent: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
        ].map(k => (
          <div key={k.label} className="glass p-5">
            <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.38)' }}>{k.label}</p>
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Bookings — last 6 months</h3>
          <BarChart data={monthlyData} color="#7C3AED" />
        </div>
        <div className="glass p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue — last 6 months</h3>
          <BarChart data={revenueData} color="#06B6D4" />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status breakdown */}
        <div className="glass p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Booking Status</h3>
          {statusBreakdown.length === 0
            ? <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No data yet</p>
            : statusBreakdown.map(([status, count]) => {
              const pct = total > 0 ? (count / total * 100).toFixed(0) : 0;
              return (
                <div key={status} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.6)' }}>{status}</span>
                    <span className="text-xs font-semibold" style={{ color: STATUS_COLORS[status] || '#a78bfa' }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                         style={{ width: `${pct}%`, background: STATUS_COLORS[status] || '#a78bfa' }} />
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Top services */}
        <div className="glass p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Top Services</h3>
          {topServices.length === 0
            ? <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No data yet</p>
            : topServices.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3 mb-3">
                <span className="text-xs w-4 text-center font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{name}</p>
                </div>
                <span className="badge badge-confirmed">{count}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default Analytics;
