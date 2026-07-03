import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const ForgotPassword = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <>
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
             style={{ background: 'rgba(6,182,212,0.15)' }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#22d3ee" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Check your inbox</h2>
        <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
          If an account exists for <span style={{ color: '#a78bfa' }}>{email}</span>, you'll receive a reset link shortly.
        </p>
      </div>
      <Link to="/login" className="btn-primary w-full justify-center">Back to sign in</Link>
    </>
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-1 text-center">Reset your password</h2>
      <p className="text-sm mb-7 text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Enter your email and we'll send a reset link
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                 required placeholder="you@example.com" className="input-dark" />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg"
               style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
          {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Sending...</span> : 'Send reset link'}
        </button>
      </form>
      <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <Link to="/login" style={{ color: '#a78bfa' }} className="font-medium hover:underline">← Back to sign in</Link>
      </p>
    </>
  );
};

export default ForgotPassword;
