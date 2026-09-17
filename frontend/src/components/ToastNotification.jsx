import React from 'react';

export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return { icon: 'check_circle', color: '#10B981' };
      case 'error':
        return { icon: 'error', color: '#EF4444' };
      case 'info':
        return { icon: 'info', color: '#06B6D4' };
      default:
        return { icon: 'auto_awesome', color: '#A78BFA' };
    }
  };

  const { icon, color } = getIcon();

  return (
    <div className="floating-toast" onClick={onClose} style={{ cursor: 'pointer' }}>
      <span 
        className="material-symbols-outlined" 
        style={{ fontSize: '18px', color: color }}
      >
        {icon}
      </span>
      <span>{toast.message}</span>
      <span 
        className="material-symbols-outlined" 
        style={{ fontSize: '16px', color: 'var(--text-muted)', marginLeft: '8px' }}
      >
        close
      </span>
    </div>
  );
}
