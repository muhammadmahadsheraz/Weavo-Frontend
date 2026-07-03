import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';

const ServiceForm = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [businesses, setBusinesses] = useState([]);

  const [form, setForm] = useState({
    business: '', name: '', description: '', duration: 60,
    price: 0, currency: 'USD', category: '', isAvailable: true,
  });

  useEffect(() => {
    api.get('/businesses').then(r => setBusinesses(r.data || []));
    if (id) {
      api.get(`/services/${id}`)
        .then(r => setForm({ ...r.data, business: r.data.business?._id || r.data.business }))
        .catch(() => toast.error('Failed to load service'));
    }
  }, [id]);

  const set = (name, value) => {
    setError('');
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      id ? await api.put(`/services/${id}`, form) : await api.post('/services', form);
      toast.success(id ? 'Service updated!' : 'Service created!');
      navigate('/services');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const Label = ({ children, required }) => (
    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
      {children}{required && <span style={{ color: '#7C3AED' }}> *</span>}
    </label>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/services')}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">{id ? 'Edit Service' : 'New Service'}</h2>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {id ? 'Update service details' : 'Add a new service to your business'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass p-6 space-y-5">
        {error && (
          <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
               style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        <div>
          <Label required>Business</Label>
          <select value={form.business} onChange={e => set('business', e.target.value)}
                  required className="input-dark">
            <option value="">Select a business</option>
            {businesses.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>

        <div>
          <Label required>Service Name</Label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                 required className="input-dark" placeholder="e.g. Haircut, Massage, Consultation"/>
        </div>

        <div>
          <Label>Description</Label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={3} className="input-dark resize-none" placeholder="Brief description of what's included"/>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label required>Duration (min)</Label>
            <input type="number" value={form.duration} onChange={e => set('duration', parseInt(e.target.value))}
                   required min={15} max={480} className="input-dark"/>
          </div>
          <div>
            <Label required>Price</Label>
            <div className="flex">
              <select value={form.currency} onChange={e => set('currency', e.target.value)}
                      className="input-dark rounded-r-none border-r-0" style={{ width: '60px', padding: '10px 8px' }}>
                <option value="USD">$</option>
                <option value="EUR">€</option>
                <option value="GBP">£</option>
                <option value="INR">₹</option>
              </select>
              <input type="number" value={form.price} onChange={e => set('price', parseFloat(e.target.value))}
                     required min={0} step={0.01} className="input-dark rounded-l-none flex-1"/>
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <input type="text" value={form.category} onChange={e => set('category', e.target.value)}
                   className="input-dark" placeholder="Hair, Beauty…"/>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl"
             style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-sm font-medium text-white">Available for booking</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Clients can book this service when enabled
            </p>
          </div>
          <div
            className="relative w-10 h-5 rounded-full cursor-pointer transition-colors"
            style={{ background: form.isAvailable ? '#7C3AED' : 'rgba(255,255,255,0.15)' }}
            onClick={() => set('isAvailable', !form.isAvailable)}
          >
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                 style={{ left: form.isAvailable ? '22px' : '2px' }} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/services')} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Saving...
              </span>
            ) : id ? 'Update Service' : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
