import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/api';

const PROVIDER_META = {
  google: {
    name: 'Google Calendar',
    icon: '🔵',
    color: 'rgba(66,133,244,0.15)',
    textColor: '#8ab4f8',
    borderColor: 'rgba(66,133,244,0.25)'
  },
  outlook: {
    name: 'Outlook Calendar',
    icon: '📅',
    color: 'rgba(0,120,212,0.15)',
    textColor: '#60a5fa',
    borderColor: 'rgba(0,120,212,0.25)'
  },
  apple: {
    name: 'Apple Calendar',
    icon: '🍎',
    color: 'rgba(255,255,255,0.06)',
    textColor: '#d1d5db',
    borderColor: 'rgba(255,255,255,0.12)'
  }
};

const CalendarIntegration = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appleForms, setAppleForms] = useState({});

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
      window.open(res.data.url, '_blank', 'width=600,height=700');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect Google Calendar');
    }
  };

  const handleOutlookConnect = async (businessId) => {
    try {
      const res = await api.post('/calendar/outlook/auth', { businessId });
      window.open(res.data.url, '_blank', 'width=600,height=700');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect Outlook Calendar');
    }
  };

  const handleAppleConnect = async (businessId) => {
    const form = appleForms[businessId] || {};
    if (!form.email || !form.password) {
      toast.error('Please enter your Apple ID email and app-specific password');
      return;
    }
    try {
      await api.post('/calendar/apple/connect', { businessId, email: form.email, password: form.password });
      toast.success('Apple Calendar connected successfully');
      setAppleForms(prev => ({ ...prev, [businessId]: { ...prev[businessId], show: false } }));
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect Apple Calendar');
    }
  };

  const handleDisconnect = async (businessId, provider) => {
    try {
      await api.delete(`/calendar/${provider}/disconnect`, { data: { businessId } });
      toast.success(`${PROVIDER_META[provider].name} disconnected`);
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disconnect');
    }
  };

  const ProviderCard = ({ businessId, businessName, provider }) => {
    const meta = PROVIDER_META[provider];
    const connected = providers
      .find(p => p.business?._id === businessId)
      ?.providers?.[provider];

    const showForm = appleForms[businessId]?.show;
    const formData = appleForms[businessId] || {};

    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{
          background: connected ? meta.color : 'rgba(255,255,255,0.02)',
          border: `1px solid ${connected ? meta.borderColor : 'rgba(255,255,255,0.05)'}`
        }}>
        <div className="flex items-center gap-3">
          <span className="text-lg">{meta.icon}</span>
          <div>
            <p className="text-sm font-medium text-white">{meta.name}</p>
            {connected ? (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Connected as {connected.email || 'N/A'}
              </p>
            ) : (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Not connected
              </p>
            )}
          </div>
        </div>

        {connected ? (
          <button className="btn-danger text-xs" style={{ padding: '6px 14px' }}
            onClick={() => handleDisconnect(businessId, provider)}>
            Disconnect
          </button>
        ) : provider === 'apple' ? (
          <div className="flex items-center gap-2">
            {showForm ? (
              <div className="flex items-center gap-2">
                <input type="email" placeholder="Apple ID email"
                  className="input-dark text-xs" style={{ width: 160, padding: '6px 10px' }}
                  value={formData.email || ''}
                  onChange={e => setAppleForms(prev => ({
                    ...prev,
                    [businessId]: { ...prev[businessId], email: e.target.value }
                  }))} />
                <input type="password" placeholder="App-specific password"
                  className="input-dark text-xs" style={{ width: 140, padding: '6px 10px' }}
                  value={formData.password || ''}
                  onChange={e => setAppleForms(prev => ({
                    ...prev,
                    [businessId]: { ...prev[businessId], password: e.target.value }
                  }))} />
                <button className="btn-primary text-xs" style={{ padding: '6px 12px' }}
                  onClick={() => handleAppleConnect(businessId)}>
                  Connect
                </button>
                <button className="btn-ghost text-xs" style={{ padding: '6px 10px' }}
                  onClick={() => setAppleForms(prev => ({ ...prev, [businessId]: { ...prev[businessId], show: false } }))}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn-ghost text-xs" style={{ padding: '6px 14px' }}
                onClick={() => setAppleForms(prev => ({ ...prev, [businessId]: { ...prev[businessId], show: true } }))}>
                Connect
              </button>
            )}
          </div>
        ) : (
          <button className="btn-ghost text-xs" style={{ padding: '6px 14px' }}
            onClick={() => provider === 'google' ? handleGoogleConnect(businessId) : handleOutlookConnect(businessId)}>
            Connect
          </button>
        )}
      </div>
    );
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
          No businesses found. Create a business first to connect calendars.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {providers.map(item => (
        <div key={item.business?._id} className="glass p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="text-sm font-semibold text-white">{item.business?.name}</span>
          </div>

          <div className="space-y-2">
            <ProviderCard businessId={item.business?._id} businessName={item.business?.name} provider="google" />
            <ProviderCard businessId={item.business?._id} businessName={item.business?.name} provider="outlook" />
            <ProviderCard businessId={item.business?._id} businessName={item.business?.name} provider="apple" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarIntegration;
