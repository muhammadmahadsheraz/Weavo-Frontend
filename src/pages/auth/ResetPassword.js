import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';

const ResetPassword = () => {
  const [params]              = useSearchParams();
  const navigate              = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const token = params.get('token');

  if (!token) return (
    <>
      <h2 className="text-xl font-bold text-white text-center mb-4">Invalid link</h2>
      <p className="text-sm text-center mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>This reset link is missing a token.</p>
      <Link to="/forgot-password" className="btn-primary w-full justify-center">Request new link</Link>
    </>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset! You can now sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-1 text-center">New password</h2>
      <p className="text-sm mb-7 text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>Choose a strong password</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>New password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                 required minLength={6} placeholder="Min. 6 characters" className="input-dark"/>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Confirm password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                 required placeholder="••••••••" className="input-dark"/>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg"
               style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </>
  );
};

export default ResetPassword;
