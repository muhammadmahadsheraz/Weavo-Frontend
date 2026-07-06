import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/api';

const CalendarIntegration = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await api.get('/calendar/providers');
      setProviders(res.data);
    } catch (err) {
      console.error('Failed to load calendar providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = async (businessId) => {
    try {
      const res = await api.post('/calendar/google/auth', { businessId });
      const popup = window.open(res.data.url, '_blank', 'width=600,height=700');

      const handleMessage = (event) => {
        if (event.data?.type !== 'OAUTH_CALLBACK') return;
        window.removeEventListener('message', handleMessage);
        if (event.data.status === 'connected') {
          toast.success('Calendar connected successfully!');
        } else {
          toast.error('Failed to connect calendar. Please try again.');
        }
        fetchProviders();
      };

      window.addEventListener('message', handleMessage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect Google Calendar');
    }
  };

  const handleDisconnect = async (businessId) => {
    try {
      await api.delete('/calendar/google/disconnect', { data: { businessId } });
      toast.success('Google Calendar disconnected');
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disconnect');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="glass p-6 text-center">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          No businesses found. Create a business first to connect Google Calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map(item => {
        const connected = item.provider;

        return (
          <div key={item.business?._id}
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{
              background: connected ? 'rgba(66,133,244,0.15)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${connected ? 'rgba(66,133,244,0.25)' : 'rgba(255,255,255,0.05)'}`
            }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 20, lineHeight: 1 }}>🔵</span>
              <div>
                <p className="text-sm font-medium text-white">Google Calendar</p>
                <p className="text-xs" style={{ color: connected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.3)' }}>
                  {item.business?.name}
                  {connected ? ` — connected as ${connected.email || 'N/A'}` : ' — not connected'}
                </p>
              </div>
            </div>

            {connected ? (
              <button className="btn-danger text-xs" style={{ padding: '6px 14px' }}
                onClick={() => handleDisconnect(item.business._id)}>
                Disconnect
              </button>
            ) : (
              <button className="btn-ghost text-xs" style={{ padding: '6px 14px' }}
                onClick={() => handleGoogleConnect(item.business._id)}>
                Connect
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarIntegration;
