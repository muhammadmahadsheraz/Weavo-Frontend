import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/api';
import Logo from '../../components/Logo';
import HelixBackground from '../../components/HelixBackground';
import ChatWidget from '../../components/ChatWidget';

const STEPS = ['Service', 'Date & Time', 'Your Details', 'Confirm'];

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const DateInput = ({ value, onChange, min, error }) => (
  <div>
    <label className="relative block cursor-pointer">
      <input type="date" value={value} onChange={onChange} min={min}
             className="input-dark w-full" style={{ paddingRight: 36 }} />
      <span className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 0 }}>
        <CalendarIcon />
      </span>
    </label>
    {error && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{error}</p>}
  </div>
);

const ErrMsg = ({ msg }) => msg ? <p className="text-xs mt-1" style={{ color: '#f87171' }}>{msg}</p> : null;

const ManageBooking = ({ slug, onBack }) => {
  const [email, setEmail] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lookedUp, setLookedUp] = useState(false);
  const [action, setAction] = useState(null);
  const [actionApt, setActionApt] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpErr, setOtpErr] = useState('');
  const [token, setToken] = useState('');

  const validateEmail = (val) => {
    if (!val.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address';
    return '';
  };

  const handleSendOtp = async () => {
    const err = validateEmail(email);
    setEmailErr(err);
    if (err) return;
    setOtpLoading(true);
    try {
      await api.post('/public/send-otp', { email });
      setOtpSent(true);
      setOtpErr('');
      toast.success('Verification code sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      setOtpErr('Enter the 6-digit code');
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await api.post('/public/verify-otp', { email, code: otpCode });
      setToken(data.token);
      setOtpErr('');
      setLoading(true);
      try {
        const res = await api.get(`/public/book/${slug}/lookup`, {
          params: { email },
          headers: { Authorization: `Bearer ${data.token}` }
        });
        setAppointments(res.data.appointments);
        setLookedUp(true);
      } catch {
        toast.error('Failed to look up appointments');
        setLookedUp(true);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid code';
      setOtpErr(msg);
      if (msg.includes('Too many')) setOtpSent(false);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCancel = async (apt) => {
    setLoadingAction(true);
    try {
      await api.post(`/public/book/${slug}/cancel`, { appointmentId: apt._id, email });
      toast.success('Appointment cancelled');
      setAppointments(p => p.filter(a => a._id !== apt._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setLoadingAction(false);
      setAction(null);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) return;
    setLoadingAction(true);
    try {
      await api.post(`/public/book/${slug}/reschedule`, {
        appointmentId: actionApt._id, email, date: rescheduleDate, startTime: rescheduleTime,
      });
      toast.success('Appointment rescheduled');
      setResolved(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule');
    } finally {
      setLoadingAction(false);
    }
  };

  const fetchRescheduleSlots = useCallback(async (date) => {
    if (!date || !actionApt) return;
    setRescheduleSlotsLoading(true);
    try {
      const { data } = await api.get(`/public/book/${slug}/slots`, {
        params: { date, serviceId: actionApt.service?._id },
      });
      setRescheduleSlots(data.slots || []);
    } catch {
      setRescheduleSlots([]);
    } finally {
      setRescheduleSlotsLoading(false);
    }
  }, [slug, actionApt]);

  useEffect(() => {
    if (action === 'reschedule' && rescheduleDate) {
      fetchRescheduleSlots(rescheduleDate);
    }
  }, [action, rescheduleDate, fetchRescheduleSlots]);

  if (resolved) return (
    <div className="text-center py-6">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
           style={{ background: 'rgba(34,197,94,0.15)' }}>
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <p className="text-white font-semibold mb-1">Appointment rescheduled!</p>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Check your email for the updated details.</p>
      <button onClick={() => { setAction(null); setActionApt(null); setResolved(false); setRescheduleDate(''); setRescheduleTime(''); setRescheduleSlots([]); }}
              className="btn-ghost mt-4 text-sm">Back to my bookings</button>
    </div>
  );

  if (action === 'reschedule' && actionApt) return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-white">Reschedule</h3>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>New Date</label>
        <DateInput value={rescheduleDate}
                   onChange={e => { setRescheduleDate(e.target.value); setRescheduleTime(''); }}
                   min={new Date().toISOString().split('T')[0]} />
      </div>
      {rescheduleDate && (
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>New Time</label>
          {rescheduleSlotsLoading ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <div className="spinner" style={{ width: 16, height: 16 }} /> Loading slots...
            </div>
          ) : rescheduleSlots.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>No available slots on this date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {rescheduleSlots.map(slot => (
                <button key={slot} onClick={() => setRescheduleTime(slot)}
                        className="py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: rescheduleTime === slot ? '#7C3AED' : 'rgba(255,255,255,0.05)',
                          color: rescheduleTime === slot ? '#fff' : 'rgba(255,255,255,0.6)',
                          border: `1px solid ${rescheduleTime === slot ? '#7C3AED' : 'rgba(255,255,255,0.08)'}`,
                        }}>
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button onClick={() => { setAction(null); setActionApt(null); setRescheduleDate(''); setRescheduleTime(''); }}
                className="btn-ghost flex-1">Back</button>
        <button onClick={handleReschedule} disabled={!rescheduleDate || !rescheduleTime || loadingAction}
                className="btn-primary flex-1">
          {loadingAction ? 'Rescheduling...' : 'Confirm Reschedule'}
        </button>
      </div>
    </div>
  );

  if (action === 'cancel' && actionApt) return (
    <div className="text-center py-4">
      <p className="text-sm text-white mb-2">Cancel this appointment?</p>
      <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {actionApt.service?.name} — {new Date(actionApt.date).toLocaleDateString()} at {actionApt.startTime}
      </p>
      <div className="flex gap-3">
        <button onClick={() => { setAction(null); setActionApt(null); }} className="btn-ghost flex-1">Keep it</button>
        <button onClick={() => handleCancel(actionApt)} disabled={loadingAction}
                className="btn-primary flex-1" style={{ background: '#dc2626' }}>
          {loadingAction ? 'Cancelling...' : 'Yes, Cancel'}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-4">Manage My Booking</h3>
      {!token ? (
        <div>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Verify your email to access your bookings. We'll send a one-time code.
          </p>
          <div>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                     placeholder="you@email.com"
                     onBlur={() => setEmailErr(validateEmail(email))}
                     onKeyDown={e => e.key === 'Enter' && !otpSent && handleSendOtp()}
                     disabled={otpSent}
                     className="input-dark flex-1"
                     style={emailErr ? { borderColor: '#f87171' } : {}} />
              {!otpSent ? (
                <button onClick={handleSendOtp} disabled={!email || otpLoading}
                        className="btn-primary" style={{ padding: '9px 18px', fontSize: 13, whiteSpace: 'nowrap' }}>
                  {otpLoading ? 'Sending...' : 'Send Code'}
                </button>
              ) : null}
            </div>
            <ErrMsg msg={emailErr} />
          </div>

          {otpSent && (
            <div className="mt-4">
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Enter the 6-digit code sent to <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</strong>
              </p>
              <div className="flex gap-2">
                <input type="text" value={otpCode} onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpErr(''); }}
                       placeholder="000000" maxLength={6}
                       onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                       className="input-dark flex-1 text-center tracking-widest"
                       style={{ fontSize: 18, letterSpacing: 8, ...(otpErr ? { borderColor: '#f87171' } : {}) }} />
                <button onClick={handleVerifyOtp} disabled={otpCode.length !== 6 || otpLoading}
                        className="btn-primary" style={{ padding: '9px 18px', fontSize: 13, whiteSpace: 'nowrap' }}>
                  {otpLoading ? '...' : 'Verify'}
                </button>
              </div>
              <ErrMsg msg={otpErr} />
              <button onClick={() => { setOtpSent(false); setOtpCode(''); setOtpErr(''); }}
                      className="text-xs mt-2" style={{ color: '#a78bfa', cursor: 'pointer', background: 'none', border: 'none' }}>
                Change email or resend code
              </button>
            </div>
          )}

          <button onClick={onBack} className="btn-ghost mt-3 text-xs">← Back</button>
        </div>
      ) : lookedUp && appointments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-white mb-1">No upcoming appointments found</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Bookings with this email will appear here.</p>
          <button onClick={onBack} className="btn-ghost mt-3 text-xs">← Back</button>
        </div>
      ) : lookedUp ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {appointments.length} appointment{appointments.length > 1 ? 's' : ''} found
            </p>
            <button onClick={() => { setToken(''); setOtpSent(false); setOtpCode(''); setLookedUp(false); }}
                    className="text-xs" style={{ color: '#a78bfa', cursor: 'pointer', background: 'none', border: 'none' }}>
              Different email
            </button>
          </div>
          {appointments.map(apt => (
            <div key={apt._id} className="p-4 rounded-xl"
                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold text-white">{apt.service?.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.startTime}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        background: apt.status === 'confirmed' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                        color: apt.status === 'confirmed' ? '#4ade80' : '#eab308',
                      }}>
                  {apt.status}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setAction('cancel'); setActionApt(apt); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: 'rgba(220,38,38,0.12)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => { setAction('reschedule'); setActionApt(apt); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)', cursor: 'pointer' }}>
                  Reschedule
                </button>
              </div>
            </div>
          ))}
          <button onClick={onBack} className="btn-ghost text-xs mt-1">← Back</button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="spinner" />
        </div>
      ) : null}
    </div>
  );
};

const PublicBooking = () => {
  const { slug } = useParams();
  const [biz, setBiz]           = useState(null);
  const [services, setServices] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep]         = useState(0);
  const [slots, setSlots]       = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [done, setDone]         = useState(false);
  const [mode, setMode]         = useState('book');
  const [carouselIdx, setCarouselIdx] = useState(0);
  const timerRef = useRef(null);

  const [form, setForm] = useState({
    serviceId: '',
    date: '',
    startTime: '',
    client: { name: '', email: '', phone: '' },
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const setErr = (field, msg) => setErrors(p => ({ ...p, [field]: msg }));
  const clearErr = (field) => setErrors(p => ({ ...p, [field]: '' }));

  const validateStep = (s) => {
    const e = {};
    if (s === 0 && !form.serviceId) e.serviceId = 'Please select a service';
    if (s === 1) {
      if (!form.date) e.date = 'Please select a date';
      if (!form.startTime) e.startTime = 'Please select a time';
    }
    if (s === 2) {
      if (!form.client.name.trim()) e.name = 'Name is required';
      if (!form.client.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client.email)) e.email = 'Enter a valid email address';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const selectedService = services.find(s => s._id === form.serviceId);

  useEffect(() => {
    api.get(`/public/book/${slug}`)
      .then(r => { setBiz(r.data.business); setServices(r.data.services); })
      .catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (services.length < 2) return;
    timerRef.current = setInterval(() => {
      setCarouselIdx(prev => (prev + 1) % services.length);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [services.length]);

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
      <HelixBackground />
      <div className="glass p-10 text-center max-w-sm w-full mx-4" style={{ position: 'relative', zIndex: 10 }}>
        <p className="text-lg font-bold text-white mb-2">Business not found</p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>This booking link doesn't exist or has been disabled.</p>
      </div>
    </div>
  );

  if (!biz) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
      <div className="spinner"/>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'transparent' }}>
      <HelixBackground />
      <div className="glass p-10 text-center max-w-md w-full" style={{ position: 'relative', zIndex: 10 }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
             style={{ background: 'rgba(34,197,94,0.15)' }}>
          <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Booking request submitted!</h2>
        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Your appointment at <strong className="text-white">{biz.name}</strong> is pending confirmation.
        </p>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
          You'll receive an email once it's confirmed.
        </p>
        <button onClick={() => { setDone(false); setStep(0); setForm({ serviceId:'', date:'', startTime:'', client:{name:'',email:'',phone:''}, notes:'' }); setMode('manage'); }}
                className="btn-ghost text-xs">Manage your booking</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <HelixBackground />

      <nav style={{
        position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '14px 24px',
      }}>
        <Logo iconSize={24} fontSize={12} />
        <div className="flex items-center gap-2.5">
          <Link to="/login" className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>
            Business Login
          </Link>
          <Link to="/register" className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
            Sign Up
          </Link>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-20" style={{ zIndex: 10 }}>
        {/* Hero: title left, carousel right */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 48,
          marginBottom: 48, flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 280px' }}>
            <h1 style={{
              fontSize: 'clamp(3.5rem, 10vw, 7rem)',
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              margin: 0,
              color: '#fff',
            }}>
              Book{' '}
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                an Appointment
              </span>
            </h1>
            <p style={{
              marginTop: 20, fontSize: 14, lineHeight: 1.6,
              color: 'rgba(255,255,255,0.35)', maxWidth: 320,
            }}>
              {biz.name} — pick a service, choose a time, and book instantly.
            </p>
          </div>

          {/* Carousel: services */}
          {services.length > 0 && (
            <div style={{ flex: '0 0 320px', minHeight: 200 }}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
                <div style={{
                  display: 'flex',
                  transform: `translateX(-${carouselIdx * 100}%)`,
                  transition: 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)',
                }}>
                  {services.map(svc => (
                    <div key={svc._id}
                         style={{ textDecoration: 'none', display: 'block', minWidth: '100%' }}>
                      <div className="glass" style={{ padding: 24 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 14,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.12))',
                          marginBottom: 14,
                        }}>
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                        </div>
                        <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: '0 0 4px' }}>
                          {svc.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#a78bfa' }}>${svc.price}</span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{svc.duration} min</span>
                        </div>
                        {svc.description && (
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5, marginTop: 8 }}>
                            {svc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {services.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 12 }}>
                    {services.slice(0, 5).map((_, i) => (
                      <button key={i} onClick={() => setCarouselIdx(i)}
                              style={{
                                width: 6, height: 6, borderRadius: '50%', border: 'none',
                                cursor: 'pointer', padding: 0,
                                background: i === carouselIdx ? '#a78bfa' : 'rgba(255,255,255,0.12)',
                                transition: 'background 0.2s',
                              }} />
                    ))}
                    {services.length > 5 && (
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 2 }}>+{services.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mode toggle */}
        <div className="flex mb-8 rounded-xl p-1" style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
          maxWidth: 400, margin: '0 auto',
        }}>
          <button onClick={() => { setMode('book'); setStep(0); }}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all"
                  style={{
                    background: mode === 'book' ? 'rgba(124,58,237,0.2)' : 'transparent',
                    color: mode === 'book' ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}>
            Book Appointment
          </button>
          <button onClick={() => setMode('manage')}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all"
                  style={{
                    background: mode === 'manage' ? 'rgba(124,58,237,0.2)' : 'transparent',
                    color: mode === 'manage' ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}>
            Manage Booking
          </button>
        </div>

        {mode === 'book' && (
          <div className="max-w-2xl" style={{ margin: '0 auto' }}>
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-10 px-2">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      background: i < step ? '#7C3AED' : i === step ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)',
                      color: i <= step ? '#fff' : 'rgba(255,255,255,0.3)',
                      border: i === step ? '2px solid rgba(124,58,237,0.6)' : '2px solid transparent',
                      transition: 'all 0.3s ease',
                    }}>
                      {i < step ? (
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : i + 1}
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: i === step ? 600 : 400,
                      color: i === step ? '#a78bfa' : 'rgba(255,255,255,0.25)',
                      transition: 'color 0.3s ease',
                    }}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-3 rounded-full"
                         style={{ background: i < step ? 'linear-gradient(90deg, #7C3AED, #7C3AED)' : 'rgba(255,255,255,0.06)', transition: 'background 0.4s ease' }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Form card */}
            <div className="glass p-8" style={{ borderRadius: 20, animation: 'fadeUp 0.35s ease' }}>
              {/* Step 0 — Service */}
              {step === 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-5">Choose a service</h3>
                  {errors.serviceId && <p className="text-xs mb-3" style={{ color: '#f87171' }}>{errors.serviceId}</p>}
                  <div className="space-y-3">
                    {services.map((svc, idx) => (
                      <button key={svc._id} onClick={() => { set('serviceId', svc._id); clearErr('serviceId'); }}
                              className="w-full text-left p-5 rounded-xl transition-all"
                              style={{
                                background: form.serviceId === svc._id
                                  ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))'
                                  : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${form.serviceId === svc._id ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
                                animation: `fadeUp 0.3s ease ${idx * 0.05}s both`,
                              }}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div style={{
                              width: 40, height: 40, borderRadius: 12,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: form.serviceId === svc._id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                              flexShrink: 0,
                            }}>
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{svc.name}</p>
                              {svc.description && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{svc.description}</p>}
                            </div>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-base font-bold" style={{ color: '#a78bfa' }}>${svc.price}</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{svc.duration} min</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1 — Date & Time */}
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-5">Pick a date & time</h3>
                  <div className="mb-6">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Date</label>
                    <DateInput value={form.date}
                               onChange={e => { set('date', e.target.value); set('startTime', ''); clearErr('date'); }}
                               min={new Date().toISOString().split('T')[0]}
                               error={errors.date} />
                  </div>
                  {form.date && (
                    <div>
                      <label className="block text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>Available slots</label>
                      {slotsLoading ? (
                        <div className="flex items-center gap-2 text-sm py-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          <div className="spinner" style={{ width: 16, height: 16 }} /> Loading slots...
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-sm py-4" style={{ color: 'rgba(255,255,255,0.4)' }}>No available slots on this date.</p>
                      ) : (
                        <div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                            {slots.map(slot => (
                              <button key={slot} onClick={() => { set('startTime', slot); clearErr('startTime'); }}
                                      className="py-2.5 rounded-xl text-sm font-medium transition-all"
                                      style={{
                                        background: form.startTime === slot ? '#7C3AED' : 'rgba(255,255,255,0.04)',
                                        color: form.startTime === slot ? '#fff' : 'rgba(255,255,255,0.6)',
                                        border: `1px solid ${form.startTime === slot ? '#7C3AED' : 'rgba(255,255,255,0.06)'}`,
                                      }}>
                                {slot}
                              </button>
                            ))}
                          </div>
                          <ErrMsg msg={errors.startTime} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2 — Client details */}
              {step === 2 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-5">Your details</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Full Name', field: 'name', type: 'text', placeholder: 'John Doe', required: true },
                      { label: 'Email', field: 'email', type: 'email', placeholder: 'you@email.com', required: true },
                      { label: 'Phone (optional)', field: 'phone', type: 'tel', placeholder: '+1 (234) 567-890' },
                    ].map(f => (
                      <div key={f.field}>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{f.label}</label>
                        <input type={f.type} value={form.client[f.field]}
                               onChange={e => { setClient(f.field, e.target.value); clearErr(f.field); }}
                               onBlur={() => {
                                 const val = form.client[f.field];
                                 if (f.required && !val.trim()) setErr(f.field, `${f.label} is required`);
                                 else if (f.field === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) setErr(f.field, 'Enter a valid email');
                                 else clearErr(f.field);
                               }}
                               placeholder={f.placeholder}
                               className="input-dark"
                               style={errors[f.field] ? { borderColor: '#f87171' } : {}} />
                        <ErrMsg msg={errors[f.field]} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Notes (optional)</label>
                      <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                                rows={3} placeholder="Any special requests or additional information?"
                                className="input-dark resize-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Confirm */}
              {step === 3 && selectedService && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-5">Review your booking</h3>
                  <div style={{
                    background: 'rgba(124,58,237,0.06)', borderRadius: 12,
                    border: '1px solid rgba(124,58,237,0.1)', padding: 16, marginBottom: 20,
                  }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(124,58,237,0.15)',
                      }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{selectedService.name}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {selectedService.duration} min &middot; ${selectedService.price}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Date', value: new Date(form.date).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }) },
                      { label: 'Time', value: form.startTime },
                      { label: 'Name', value: form.client.name },
                      { label: 'Email', value: form.client.email },
                      { label: 'Phone', value: form.client.phone || '\u2014' },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between items-center py-2"
                           style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{r.label}</span>
                        <span className="text-xs font-medium text-white">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1">Back</button>
                )}
                {step < 3 ? (
                  <button onClick={handleNext} className="btn-primary flex-1">Continue</button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === 'manage' && (
          <div className="glass p-8" style={{ borderRadius: 20, maxWidth: 480, margin: '0 auto' }}>
            <ManageBooking slug={slug} onBack={() => setMode('book')} />
          </div>
        )}
      </div>

      <ChatWidget slug={slug} businessName={biz.name} services={services} onManageBooking={() => setMode('manage')} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PublicBooking;
