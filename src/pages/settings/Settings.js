import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users', form);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Label = ({ children }) => (
    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
      {children}
    </label>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile card */}
      <div className="glass p-6 space-y-5">
        <div className="flex items-center gap-4 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
               style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', color: '#fff' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-bold text-white">{user?.name}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-white">Profile Information</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
                   className="input-dark" placeholder="Your name"/>
          </div>
          <div>
            <Label>Email Address</Label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
                   className="input-dark" placeholder="your@email.com"/>
          </div>
          <div>
            <Label>Phone Number</Label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                   className="input-dark" placeholder="+1234567890"/>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary text-xs"
                    style={{ padding: '9px 20px' }}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account actions */}
      <div className="glass p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Account</h3>

        <div className="flex items-center justify-between px-4 py-4 rounded-xl"
             style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <div>
            <p className="text-sm font-medium text-white">Sign out</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              You'll need to sign in again to access your dashboard
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="text-center py-4">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Weavo AI · v1.0.0 · AI-powered appointment scheduling
        </p>
      </div>
    </div>
  );
};

export default Settings;
