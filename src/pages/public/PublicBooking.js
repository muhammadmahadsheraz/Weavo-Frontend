import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';
import WeavoThreads from '../../components/WeavoThreads';
import ChatWidget from '../../components/ChatWidget';

const STEPS = ['Service', 'Date & Time', 'Your Details', 'Confirm'];

const PublicBooking = () => {
  const { slug } = useParams();
  const [biz, setBiz]         = useState(null);
  const [services, setServices] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep]       = useState(0);
  const [slots, setSlots]     = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);

  const [form, setForm] = useState({
    serviceId: '',
    date: '',
    startTime: '',
    client: { name: '', email: '', phone: '' },
    notes: '',
  });

  const selectedService = services.find(s => s._id === form.serviceId);

  useEffect(() => {
    api.get(`/public/book/${slug}`)
      .then(r => { setBiz(r.data.business); setServices(r.data.services); })
      .catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (form.date && form.serviceId) {
      setSlotsLoading(true);
      api.get(`/public/book/${slug}/slots`, { params: { date: form.date, serviceId: form.serviceId } })
        .then(r => setSlots(r.data.slots || []))
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [form.date, form.serviceId, slug]);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));
  const setClient = (field, value) => setForm(p => ({ ...p, client: { ...p.client, [field]: value } }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/public/book/${slug}`, form);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
      <WeavoThreads />
      <div className="glass p-10 text-center max-w-sm w-full mx-4" style={{ position: 'relative', zIndex: 10 }}>
        <p className="text-lg font-bold text-white mb-2">Business not found</p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>This booking link doesn't exist or has been disabled.</p>
      </div>
    </div>
  );

  if (!biz) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
      <div className="spinner"/>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#000' }}>
      <WeavoThreads />
      <div className="glass p-10 text-center max-w-md w-full" style={{ position: 'relative', zIndex: 10, backdropFilter: 'blur(48px)', background: 'rgba(12,8,24,0.12)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
             style={{ background: 'rgba(34,197,94,0.15)' }}>
          <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Booking request submitted!</h2>
        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Your appointment at <strong className="text-white">{biz.name}</strong> is pending confirmation from the business.
        </p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          You'll receive an email once it's confirmed.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center" style={{ background: '#000' }}>
      <WeavoThreads />
      <div className="w-full max-w-lg" style={{ position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-white">Weavo AI</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{biz.name}</h1>
          {biz.address?.city && (
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {biz.address.city}, {biz.address.state}
            </p>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                     style={{
                       background: i < step ? '#7C3AED' : i === step ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
                       color: i <= step ? '#fff' : 'rgba(255,255,255,0.3)',
                       border: i === step ? '1px solid #7C3AED' : '1px solid transparent',
                     }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: i === step ? '#a78bfa' : 'rgba(255,255,255,0.3)' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2" style={{ background: i < step ? '#7C3AED' : 'rgba(255,255,255,0.08)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="glass p-7" style={{ backdropFilter: 'blur(48px)', background: 'rgba(12,8,24,0.12)' }}>

          {/* Step 0 — Service */}
          {step === 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white mb-4">Choose a service</h3>
              {services.map(svc => (
                <button key={svc._id} onClick={() => set('serviceId', svc._id)}
                        className="w-full text-left p-4 rounded-xl transition-all"
                        style={{
                          background: form.serviceId === svc._id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${form.serviceId === svc._id ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`,
                        }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-white">{svc.name}</p>
                      {svc.description && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{svc.description}</p>}
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: '#a78bfa' }}>${svc.price}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{svc.duration} min</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 1 — Date & Time */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-white">Pick a date & time</h3>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Date</label>
                <input type="date" value={form.date} onChange={e => { set('date', e.target.value); set('startTime', ''); }}
                       min={new Date().toISOString().split('T')[0]} className="input-dark" />
              </div>
              {form.date && (
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Available slots</label>
                  {slotsLoading ? (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <div className="spinner" style={{ width: 16, height: 16 }} /> Loading slots...
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>No available slots on this date.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map(slot => (
                        <button key={slot} onClick={() => set('startTime', slot)}
                                className="py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                  background: form.startTime === slot ? '#7C3AED' : 'rgba(255,255,255,0.05)',
                                  color: form.startTime === slot ? '#fff' : 'rgba(255,255,255,0.6)',
                                  border: `1px solid ${form.startTime === slot ? '#7C3AED' : 'rgba(255,255,255,0.08)'}`,
                                }}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Client details */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Your details</h3>
              {[
                { label: 'Full Name *', field: 'name', type: 'text', placeholder: 'John Doe', required: true },
                { label: 'Email *', field: 'email', type: 'email', placeholder: 'you@email.com', required: true },
                { label: 'Phone', field: 'phone', type: 'tel', placeholder: '+1234567890' },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{f.label}</label>
                  <input type={f.type} value={form.client[f.field]} onChange={e => setClient(f.field, e.target.value)}
                         required={f.required} placeholder={f.placeholder} className="input-dark" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Notes (optional)</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                          rows={2} placeholder="Any special requests?" className="input-dark resize-none" />
              </div>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Review your booking</h3>
              {[
                { label: 'Business',   value: biz.name },
                { label: 'Service',    value: `${selectedService?.name} · ${selectedService?.duration} min` },
                { label: 'Price',      value: `$${selectedService?.price}` },
                { label: 'Date',       value: new Date(form.date).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }) },
                { label: 'Time',       value: form.startTime },
                { label: 'Name',       value: form.client.name },
                { label: 'Email',      value: form.client.email },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-start py-2"
                     style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{r.label}</span>
                  <span className="text-xs font-medium text-white text-right ml-4 max-w-xs">{r.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-7">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1">Back</button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={
                  (step === 0 && !form.serviceId) ||
                  (step === 1 && (!form.date || !form.startTime)) ||
                  (step === 2 && (!form.client.name || !form.client.email))
                }
                className="btn-primary flex-1"
              >
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
      <ChatWidget slug={slug} businessName={biz.name} services={services} />
    </div>
  );
};

export default PublicBooking;
