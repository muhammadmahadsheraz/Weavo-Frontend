import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import ConfirmModal from '../../components/ConfirmModal';

const Staff = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBiz, setSelectedBiz] = useState('');
  const [staff, setStaff]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting]     = useState(false);
  const [confirm, setConfirm]       = useState(null); // { staffId, name }

  useEffect(() => {
    api.get('/businesses').then(r => {
      const bizs = r.data || [];
      setBusinesses(bizs);
      if (bizs.length > 0) setSelectedBiz(bizs[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedBiz) return;
    setLoading(true);
    api.get(`/staff/${selectedBiz}`)
      .then(r => setStaff(r.data || []))
      .catch(() => toast.error('Failed to load staff'))
      .finally(() => setLoading(false));
  }, [selectedBiz]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await api.post(`/staff/${selectedBiz}/invite`, { email: inviteEmail });
      toast.success(res.data.message);
      setStaff(prev => [...prev, res.data.staff]);
      setInviteEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite');
    } finally { setInviting(false); }
  };

  const handleRemove = async () => {
    try {
      await api.delete(`/staff/${selectedBiz}/${confirm.staffId}`);
      toast.success(`${confirm.name} removed from team`);
      setStaff(prev => prev.filter(s => s._id !== confirm.staffId));
    } catch {
      toast.error('Failed to remove staff');
    } finally { setConfirm(null); }
  };

  return (
    <>
      <ConfirmModal
        open={!!confirm}
        title="Remove team member?"
        message={`${confirm?.name} will no longer have access to this business.`}
        confirmLabel="Remove"
        danger
        onConfirm={handleRemove}
        onCancel={() => setConfirm(null)}
      />

      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Team</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
            Manage staff access across your businesses
          </p>
        </div>

        {/* Business selector */}
        {businesses.length > 1 && (
          <div className="glass p-4">
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Select business
            </label>
            <select value={selectedBiz} onChange={e => setSelectedBiz(e.target.value)} className="input-dark">
              {businesses.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        )}

        {/* Invite */}
        <div className="glass p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Add team member</h3>
          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="colleague@email.com"
              required
              className="input-dark flex-1"
            />
            <button type="submit" disabled={inviting} className="btn-primary flex-shrink-0">
              {inviting ? 'Adding...' : 'Add'}
            </button>
          </form>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            The person must already have a Weavo AI account.
          </p>
        </div>

        {/* Staff list */}
        <div className="glass overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-semibold text-white">
              Current team {!loading && `· ${staff.length} member${staff.length !== 1 ? 's' : ''}`}
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32"><div className="spinner"/></div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No team members yet</p>
            </div>
          ) : (
            staff.map(member => (
              <div key={member._id} className="flex items-center gap-4 px-6 py-4 table-row-hover"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                     style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{member.name}</p>
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>{member.email}</p>
                </div>
                <span className="badge badge-active text-xs">Staff</span>
                <button
                  onClick={() => setConfirm({ staffId: member._id, name: member.name })}
                  className="btn-icon flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                  title="Remove"
                >
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Staff;
