import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };
const defaultHours = (open, close, isOpen) => ({ open, close, isOpen });

/* ── Defined OUTSIDE BusinessForm so they never get recreated on state change ── */
const Label = ({ children, required }) => (
  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
    {children}{required && <span style={{ color: '#7C3AED' }}> *</span>}
  </label>
);

const Section = ({ title, children }) => (
  <div className="glass p-6 space-y-5">
    <h3 className="text-sm font-semibold text-white">{title}</h3>
    {children}
  </div>
);

const BusinessForm = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const [form, setForm] = useState({
    name: '', description: '', phone: '', email: '', website: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    workingHours: {
      monday:    defaultHours('09:00','18:00',true),
      tuesday:   defaultHours('09:00','18:00',true),
      wednesday: defaultHours('09:00','18:00',true),
      thursday:  defaultHours('09:00','18:00',true),
      friday:    defaultHours('09:00','18:00',true),
      saturday:  defaultHours('10:00','16:00',true),
      sunday:    defaultHours('10:00','14:00',false),
    },
  });

  useEffect(() => {
    if (id) {
      api.get(`/businesses/${id}`)
        .then(r => setForm(r.data))
        .catch(() => toast.error('Failed to load business'));
    }
  }, [id]);

  const set = (name, value) => {
    setError('');
    if (name.includes('.')) {
      const [p, c] = name.split('.');
      setForm(prev => ({ ...prev, [p]: { ...prev[p], [c]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const setHours = (day, field, value) =>
    setForm(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, [day]: { ...prev.workingHours[day], [field]: value } },
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      id ? await api.put(`/businesses/${id}`, form) : await api.post('/businesses', form);
      toast.success(id ? 'Business updated!' : 'Business created!');
      navigate('/businesses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save business');
    } finally {
      setSaving(false);
    }
  };

  return (

    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/businesses')}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">{id ? 'Edit Business' : 'Add Business'}</h2>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {id ? 'Update your business details' : 'Set up a new business location'}
          </p>
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

        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label required>Business Name</Label>
              <input type="text" value={form.name} onChange={e=>set('name',e.target.value)}
                     required className="input-dark" placeholder="Acme Salon"/>
            </div>
            <div>
              <Label required>Email</Label>
              <input type="email" value={form.email} onChange={e=>set('email',e.target.value)}
                     required className="input-dark" placeholder="hello@business.com"/>
            </div>
            <div>
              <Label required>Phone</Label>
              <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)}
                     required className="input-dark" placeholder="+1 555 000 0000"/>
            </div>
            <div>
              <Label>Website</Label>
              <input type="url" value={form.website} onChange={e=>set('website',e.target.value)}
                     className="input-dark" placeholder="https://"/>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea value={form.description} onChange={e=>set('description',e.target.value)}
                        rows={2} className="input-dark resize-none" placeholder="A brief description of your business"/>
            </div>
          </div>
        </Section>

        <Section title="Address">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label required>Street Address</Label>
              <input type="text" value={form.address.street} onChange={e=>set('address.street',e.target.value)}
                     required className="input-dark" placeholder="123 Main St"/>
            </div>
            <div>
              <Label required>City</Label>
              <input type="text" value={form.address.city} onChange={e=>set('address.city',e.target.value)}
                     required className="input-dark" placeholder="New York"/>
            </div>
            <div>
              <Label required>State</Label>
              <input type="text" value={form.address.state} onChange={e=>set('address.state',e.target.value)}
                     required className="input-dark" placeholder="NY"/>
            </div>
            <div>
              <Label required>Zip Code</Label>
              <input type="text" value={form.address.zipCode} onChange={e=>set('address.zipCode',e.target.value)}
                     required className="input-dark" placeholder="10001"/>
            </div>
          </div>
        </Section>

        <Section title="Working Hours">
          <div className="space-y-2">
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-4 px-3 py-2.5 rounded-xl"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <label className="flex items-center gap-2.5 w-32 flex-shrink-0 cursor-pointer">
                  <div
                    className="relative w-8 h-4 rounded-full transition-colors cursor-pointer"
                    style={{ background: form.workingHours[day].isOpen ? '#7C3AED' : 'rgba(255,255,255,0.15)' }}
                    onClick={() => setHours(day, 'isOpen', !form.workingHours[day].isOpen)}
                  >
                    <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
                         style={{ left: form.workingHours[day].isOpen ? '17px' : '2px' }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: form.workingHours[day].isOpen ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>
                    {DAY_LABELS[day]}
                  </span>
                </label>
                {form.workingHours[day].isOpen ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <input type="time" value={form.workingHours[day].open}
                           onChange={e => setHours(day,'open',e.target.value)}
                           className="input-dark text-xs" style={{ width: '110px', padding: '5px 8px' }}/>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>to</span>
                    <input type="time" value={form.workingHours[day].close}
                           onChange={e => setHours(day,'close',e.target.value)}
                           className="input-dark text-xs" style={{ width: '110px', padding: '5px 8px' }}/>
                  </div>
                ) : (
                  <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Closed</span>
                )}
              </div>
            ))}
          </div>
        </Section>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/businesses')} className="btn-ghost">
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
            ) : id ? 'Update Business' : 'Create Business'}
          </button>
        </div>
      </form>
    </div>
  );

};

export default BusinessForm;
