import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving]         = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [services, setServices]     = useState([]);
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    business: '', service: '', date: '', startTime: '',
    paymentMethod: 'cash', notes: '',
    client: { name: '', email: '', phone: '' },
  });

  useEffect(() => {
    api.get('/businesses')
      .then(r => setBusinesses(r.data || []))
      .catch(() => toast.error('Failed to load businesses'));
  }, []);

  useEffect(() => {
    if (form.business) {
      api.get('/services', { params: { businessId: form.business } })
        .then(r => setServices(r.data || []))
        .catch(() => toast.error('Failed to load services'));
    } else {
      setServices([]);
      setForm(p => ({ ...p, service: '' }));
    }
  }, [form.business]);

  const set = (name, value) => {
    setError('');
    if (name.startsWith('client.')) {
      const f = name.split('.')[1];
      setForm(p => ({ ...p, client: { ...p.client, [f]: value } }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/appointments', form);
      toast.success('Appointment created!');
      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create appointment');
    } finally {
      setSaving(false);
    }
  };

  const SectionCard = ({ title, children }) => (
    <div className="glass p-6 space-y-5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {children}
    </div>
  );

  const Label = ({ children }) => (
    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
      {children}
    </label>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/appointments')}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">New Appointment</h2>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
               style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        <SectionCard title="Booking Details">
          <div>
            <Label>Business *</Label>
            <select value={form.business} onChange={e => set('business', e.target.value)} required
                    className="input-dark">
              <option value="">Select a business</option>
              {businesses.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Service *</Label>
            <select value={form.service} onChange={e => set('service', e.target.value)} required
                    disabled={!form.business} className="input-dark" style={!form.business ? { opacity: 0.5 } : {}}>
              <option value="">{form.business ? 'Select a service' : 'Select a business first'}</option>
              {services.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} — {s.duration} min — ${s.price}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                     required min={new Date().toISOString().split('T')[0]} className="input-dark"/>
            </div>
            <div>
              <Label>Start Time *</Label>
              <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
                     required className="input-dark"/>
            </div>
          </div>
          <div>
            <Label>Payment Method</Label>
            <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}
                    className="input-dark">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
        </SectionCard>

        <SectionCard title="Client Information">
          <div>
            <Label>Client Name *</Label>
            <input type="text" value={form.client.name} onChange={e => set('client.name', e.target.value)}
                   required placeholder="John Doe" className="input-dark"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <input type="email" value={form.client.email} onChange={e => set('client.email', e.target.value)}
                     placeholder="client@email.com" className="input-dark"/>
            </div>
            <div>
              <Label>Phone</Label>
              <input type="tel" value={form.client.phone} onChange={e => set('client.phone', e.target.value)}
                     placeholder="+1234567890" className="input-dark"/>
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                      rows={3} placeholder="Any special requests..." className="input-dark resize-none"/>
          </div>
        </SectionCard>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/appointments')} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Creating...
              </span>
            ) : 'Create Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
