import React from 'react';

const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(124,58,237,0.15)' }}
        >
          {danger ? (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          )}
        </div>

        <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
        {message && (
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>{message}</p>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
          {danger ? (
            <button
              onClick={onConfirm}
              className="btn-danger flex-1"
            >
              {confirmLabel}
            </button>
          ) : (
            <button onClick={onConfirm} className="btn-primary flex-1">{confirmLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
