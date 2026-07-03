import React, { useState, useRef, useEffect } from 'react';
import api from '../api/api';

const FIELDS = [
  { key: 'service', label: 'Service' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'name', label: 'Your Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone', optional: true },
];

const ChatWidget = ({ slug, businessName, services }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! I'm the AI receptionist. Ask me about services, hours, or booking an appointment.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [bookingData, setBookingData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowLabel(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const allRequiredFilled = FIELDS.filter(f => !f.optional).every(f => bookingData[f.key]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', text }]);
    setLoading(true);
    try {
      const history = messages.slice(1).map(m => ({ role: m.role, text: m.text }));
      const { data } = await api.post(`/public/receptionist/${slug}`, { message: text, history });
      setBookingData(prev => ({ ...prev, ...data.collectedData }));
      setMessages(p => [...p, { role: 'assistant', text: data.response }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', text: "Sorry, I'm having trouble responding right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const selectedService = services?.find(s => s.name.toLowerCase() === bookingData.service?.toLowerCase());
    if (!selectedService) return;

    setSubmitting(true);
    try {
      await api.post(`/public/book/${slug}`, {
        serviceId: selectedService._id,
        date: bookingData.date,
        startTime: bookingData.time,
        client: { name: bookingData.name, email: bookingData.email, phone: bookingData.phone || '' },
      });
      setMessages(p => [...p, {
        role: 'assistant',
        text: `✅ Booking confirmed!\n\nService: ${selectedService.name}\nPrice: $${selectedService.price}\nDate: ${new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
Time: ${bookingData.time}\nName: ${bookingData.name}\nEmail: ${bookingData.email}\n\nYou'll receive a confirmation email shortly.`,
        confirmed: true,
      }]);
      setBookingData({});
    } catch (err) {
      setMessages(p => [...p, { role: 'assistant', text: `Booking failed: ${err.response?.data?.message || 'Please try again.'}` }]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastMsgConfirmed = messages[messages.length - 1]?.confirmed;

  return (
    <>
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
      {open && (
        <div className="glass" style={{
          width: 380, maxWidth: 'calc(100vw - 48px)', height: 520, maxHeight: 'calc(100vh - 120px)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          backdropFilter: 'blur(48px)', background: 'rgba(10,6,20,0.88)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg,#7C3AED,#06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" fill="white" fillOpacity="0.9"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>AI Receptionist</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{businessName}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.4)',
              width: 26, height: 26, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>✕</button>
          </div>

          {/* Booking summary panel */}
          {!lastMsgConfirmed && Object.keys(bookingData).length > 0 && (
            <div style={{
              margin: '10px 14px 0', padding: '12px', borderRadius: 12,
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Booking Summary
              </div>
              {FIELDS.map(f => {
                const filled = !!bookingData[f.key];
                return (
                  <div key={f.key} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '4px 0', fontSize: 12,
                    color: filled ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
                  }}>
                    <span>{f.label}{f.optional ? '' : ' *'}</span>
                    <span style={{ fontWeight: 500, color: filled ? '#4ade80' : 'rgba(255,255,255,0.2)' }}>
                      {filled ? '✓ ' + bookingData[f.key] : 'awaiting...'}
                    </span>
                  </div>
                );
              })}
              {allRequiredFilled && (
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  style={{
                    marginTop: 10, width: '100%', padding: '9px 0', borderRadius: 10,
                    background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                    color: '#fff', fontWeight: 600, fontSize: 12, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.5 : 1,
                    boxShadow: '0 0 20px rgba(124,58,237,0.35)',
                  }}
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              )}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg,#7C3AED,#6D28D9)'
                    : 'rgba(255,255,255,0.05)',
                  color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.85)',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 12,
                }}>
                  {msg.text}
                </div>
                {msg.confirmed && (
                  <div style={{
                    marginTop: 6, padding: '8px 12px', borderRadius: 8, fontSize: 11,
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Booking confirmed
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 12, fontSize: 13,
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                  borderBottomLeftRadius: 4, display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <div className="spinner" style={{ width: 14, height: 14 }} />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 8,
          }}>
            <input
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ask about services, hours..."
              disabled={loading}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '9px 12px', fontSize: 13, color: '#f1f5f9', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button onClick={handleSend} disabled={!input.trim() || loading} style={{
              background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', border: 'none', borderRadius: 10,
              padding: '8px 14px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              opacity: !input.trim() || loading ? 0.45 : 1, transition: 'opacity 0.15s',
            }}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!open && showLabel && (
          <div onClick={() => setOpen(true)} style={{
            animation: 'labelFadeIn 0.4s ease forwards',
            cursor: 'pointer', userSelect: 'none',
            padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.25)',
            color: '#a78bfa', backdropFilter: 'blur(12px)',
          }}>
            Ask AI ✦
          </div>
        )}
        <button
          onClick={() => setOpen(o => !o)}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#7C3AED,#06B6D4)',
            boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
            animation: open ? 'none' : 'pulseGlow 2.5s ease-in-out infinite',
          }}>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5L15 15M15 5L5 15"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
    <style>{`
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 4px 24px rgba(124,58,237,0.5); }
        50% { box-shadow: 0 4px 40px rgba(124,58,237,0.8), 0 0 60px rgba(6,182,212,0.3); }
      }
      @keyframes labelFadeIn {
        from { opacity: 0; transform: translateX(12px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `}</style>
    </>
  );
};

export default ChatWidget;
