import React, { useState } from 'react';

export default function Header({ activeView: _activeView, onNavigate, onNewExperiment, notify }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (notify) {
        notify(`Searching for "${searchQuery.trim()}" across runs & traces...`, 'info');
      }
    }
  };

  const handleBellClick = () => {
    if (notify) {
      notify('All systems operational: 48 evals completed today, 0 failures.', 'success');
    }
  };

  const handleHelpClick = () => {
    if (notify) {
      notify('AgentEval v2 Docs: Full CLI & SDK guides available in /docs', 'info');
    }
  };

  return (
    <header className="top-header">
      {/* Search Bar with Floating Focus and Clear Button */}
      <div style={{ position: 'relative', width: '380px' }}>
        <span 
          className="material-symbols-outlined" 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            fontSize: '18px', 
            color: searchQuery ? '#8B5CF6' : 'var(--text-muted)',
            transition: 'color 0.2s ease'
          }}
        >
          search
        </span>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchSubmit}
          placeholder="Search experiments, datasets, traces... (⌘K)" 
          className="glass-input"
          style={{ 
            paddingLeft: '38px', 
            paddingRight: searchQuery ? '36px' : '16px', 
            paddingTop: '8px', 
            paddingBottom: '8px', 
            fontSize: '13px', 
            borderRadius: '9999px',
            background: 'rgba(12, 16, 28, 0.65)'
          }} 
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* "+ Run Eval" Floating Button in Header */}
        {onNewExperiment && (
          <button
            className="btn btn-primary btn-sm animate-button-float"
            onClick={onNewExperiment}
            style={{ fontSize: '12px', padding: '6px 14px', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>play_arrow</span>
            <span>Run Eval</span>
          </button>
        )}

        {/* Public view shortcut button */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigate('landing')}
          style={{ fontSize: '12px', padding: '6px 14px', gap: '6px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>public</span>
          Landing
        </button>

        {/* Notifications Icon with Floating Glow Pulse */}
        <div 
          onClick={handleBellClick}
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
          title="Notifications"
          className="glass-pill"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
            notifications
          </span>
          <span 
            className="pulse-dot"
            style={{ 
              background: '#8B5CF6',
              boxShadow: '0 0 8px #8B5CF6'
            }} 
          />
        </div>

        {/* Help Icon */}
        <div 
          onClick={handleHelpClick}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
          title="Documentation & Help"
          className="glass-pill"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
            help
          </span>
        </div>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '22px', background: 'var(--card-border)' }} />

        {/* User Profile Avatar with Floating Glow */}
        <div 
          onClick={() => onNavigate('settings')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 8px', borderRadius: '12px' }}
          className="glass-card-hover"
        >
          <div 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              color: '#FFFFFF',
              boxShadow: '0 0 12px rgba(124, 58, 237, 0.4)'
            }}
          >
            S
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Shashank
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Student Builder
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
