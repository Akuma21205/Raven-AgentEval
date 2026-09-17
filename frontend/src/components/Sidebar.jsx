import React from 'react';

export default function Sidebar({ activeView, onNavigate, onNewExperiment }) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'experiments', label: 'Experiments', icon: 'science' },
    { id: 'datasets', label: 'Datasets', icon: 'dataset' },
    { id: 'evaluations', label: 'Evaluations', icon: 'speed' },
    { id: 'trace', label: 'Traces', icon: 'timeline' },
    { id: 'compare', label: 'Compare', icon: 'compare_arrows' },
    { id: 'playground', label: 'Playground', icon: 'smart_toy' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div 
        className="sidebar-logo"
        onClick={() => onNavigate('dashboard')}
      >
        {/* Glowing 4-pointed Sparkle Logo */}
        <div 
          style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(124, 58, 237, 0.6)'
          }}
          className="animate-pulse-glow"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            AgentEval
          </span>
          <span 
            style={{ 
              fontSize: '10px', 
              fontWeight: 700, 
              padding: '1px 5px', 
              borderRadius: '4px', 
              background: 'rgba(139, 92, 246, 0.25)', 
              color: '#C084FC',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            v2
          </span>
        </div>
      </div>

      {/* Primary "+ New Experiment" CTA with Floating Pulse */}
      <div style={{ padding: '0 4px 18px' }}>
        <button 
          className="btn btn-primary animate-button-float"
          onClick={onNewExperiment || (() => onNavigate('playground'))}
          style={{ 
            width: '100%', 
            padding: '10px 16px', 
            fontSize: '13px', 
            borderRadius: '12px',
            gap: '8px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          New Experiment
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = activeView === item.id || (item.id === 'experiments' && activeView === 'experiment_detail');
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ 
                  fontSize: '20px', 
                  color: isActive ? '#A78BFA' : 'inherit',
                  transition: 'color 0.2s ease'
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Pro Plan Usage Banner */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '14px', 
          borderRadius: '14px', 
          background: 'rgba(13, 17, 32, 0.75)',
          marginBottom: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Evals</span>
          <span style={{ fontSize: '11px', color: '#A78BFA', fontWeight: 700 }}>4.2K / 10K</span>
        </div>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
          <div style={{ width: '42%', height: '100%', background: 'linear-gradient(90deg, #7C3AED, #06B6D4)', borderRadius: '2px' }} />
        </div>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigate('settings')}
          style={{ width: '100%', fontSize: '11px', padding: '5px 10px', borderRadius: '8px' }}
        >
          Upgrade Plan
        </button>
      </div>

      {/* Public Pages Drawer Link */}
      <div style={{ display: 'flex', gap: '6px', paddingTop: '6px', borderTop: '1px solid var(--card-border)' }}>
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => onNavigate('landing')}
          style={{ flex: 1, fontSize: '11px', padding: '6px 4px' }}
        >
          Landing
        </button>
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => onNavigate('signin')}
          style={{ flex: 1, fontSize: '11px', padding: '6px 4px' }}
        >
          Sign In
        </button>
      </div>
    </aside>
  );
}
