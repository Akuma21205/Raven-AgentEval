import React, { useState } from 'react';
import { MOCK_PROVIDERS } from '../data/mockData';

export default function SettingsPage({ onNavigate: _onNavigate, notify }) {
  const [activeTab, setActiveTab] = useState('integrations');
  const [providers, setProviders] = useState(MOCK_PROVIDERS);
  const [apiKey, setApiKey] = useState('agnt_live_9f83a8b27c1094da5f6e8c');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('Shashank');
  const [orgName, setOrgName] = useState('Raven Evaluation Labs');
  const [autoGitRun, setAutoGitRun] = useState(true);
  const [traceSampling, setTraceSampling] = useState(true);
  const [alertOnDrop, setAlertOnDrop] = useState(true);
  const [threshold, setThreshold] = useState(85);

  const tabs = [
    { id: 'integrations', label: 'Integrations (4 Active)' },
    { id: 'api_keys', label: 'API Keys' },
    { id: 'evaluation_rules', label: 'Evaluation Rules' },
    { id: 'profile', label: 'Profile' },
    { id: 'usage', label: 'Usage & Billing' }
  ];

  const handleToggleConnect = (id) => {
    setProviders(providers.map(p => {
      if (p.id === id) {
        const nextState = !p.connected;
        if (notify) {
          notify(`${p.name} integration ${nextState ? 'connected successfully' : 'disconnected'}!`, nextState ? 'success' : 'info');
        }
        return { ...p, connected: nextState };
      }
      return p;
    }));
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    if (notify) {
      notify('Secret API key copied to clipboard!', 'info');
    }
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateKey = () => {
    const newKey = `agnt_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
    setApiKey(newKey);
    if (notify) {
      notify('New API key generated and activated!', 'success');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (notify) {
        notify('Workspace settings & profile updated successfully!', 'success');
      }
    }, 600);
  };

  return (
    <div className="page-container">
      
      {/* ── Page Header Row ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Settings &gt; Workspace Configurations
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Settings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage your model providers, API credentials, evaluation thresholds, and account details.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => notify && notify('AgentEval SDK docs opened', 'info')}
            style={{ gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>menu_book</span>
            Documentation
          </button>
          <button 
            className="btn btn-primary btn-sm animate-button-float"
            onClick={() => notify && notify('New custom provider dialog opened', 'info')}
            style={{ gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Add Integration
          </button>
        </div>
      </div>

      {/* ── Tabs Row ────────────────────────────────────────────────── */}
      <div className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────── */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Model Providers Card */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Model Providers &amp; Endpoints</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Connect LLM providers and custom inference servers to run benchmarks and automated evaluations.
                </p>
              </div>
              <span className="glass-pill badge-success" style={{ fontSize: '11px', padding: '3px 10px' }}>
                <span className="pulse-dot" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                Auto-sync: Active
              </span>
            </div>

            {/* Provider List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {providers.map((p) => (
                <div 
                  key={p.id}
                  className="glass-card-hover"
                  style={{ 
                    padding: '16px 20px', 
                    borderRadius: '14px', 
                    background: 'rgba(12, 16, 30, 0.6)', 
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      <img src={p.logo} alt={p.name} style={{ width: '22px', height: '22px' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>{p.name}</span>
                        <span className="glass-pill" style={{ fontSize: '11px', padding: '1px 7px' }}>
                          {p.models}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {p.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span 
                      className={`glass-pill ${p.connected ? 'badge-success' : 'badge-error'}`}
                      style={{ fontSize: '11px', padding: '3px 10px', fontWeight: 600 }}
                    >
                      <span className="pulse-dot" style={{ background: p.connected ? '#10B981' : '#EF4444' }} />
                      {p.connected ? 'Connected' : 'Not Connected'}
                    </span>

                    {p.connected ? (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleToggleConnect(p.id)}
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                      >
                        Configure
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary btn-sm animate-button-float"
                        onClick={() => handleToggleConnect(p.id)}
                        style={{ fontSize: '12px', padding: '6px 16px' }}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── API Keys Tab ────────────────────────────────────────────── */}
      {activeTab === 'api_keys' && (
        <div className="glass-card" style={{ padding: '28px', maxWidth: '680px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>API Keys</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Use this secret key to authenticate SDK and automated CI/CD evaluation requests.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Secret Production Key
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="glass-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                />
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{ padding: '10px 14px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showApiKey ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCopyKey}
                  style={{ padding: '10px 18px' }}
                >
                  {copiedKey ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Rotate API Key</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Invalidates current credentials immediately</div>
              </div>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleGenerateKey}
                style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                Roll Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Evaluation Rules Tab ────────────────────────────────────── */}
      {activeTab === 'evaluation_rules' && (
        <div className="glass-card" style={{ padding: '28px', maxWidth: '680px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            CI/CD &amp; Evaluation Guardrails
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Configure automatic regression triggers and minimum acceptable benchmark thresholds.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Auto Git Run Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Auto-run evaluation on Git Push</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Executes golden test set on pull requests & main branch</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={autoGitRun} 
                  onChange={(e) => {
                    setAutoGitRun(e.target.checked);
                    if (notify) notify(`Auto git evaluations ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
                  }} 
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Trace Sampling Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Production Trace Sampling (100%)</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Record high-resolution spans and LLM tool payloads</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={traceSampling} 
                  onChange={(e) => {
                    setTraceSampling(e.target.checked);
                    if (notify) notify(`Production trace sampling ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
                  }} 
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Minimum Threshold Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                  Minimum Pass Threshold
                </label>
                <span className="glass-pill badge-purple" style={{ fontSize: '12px', fontWeight: 700 }}>
                  {threshold}% Score
                </span>
              </div>
              <input 
                type="range"
                min="50"
                max="100"
                step="1"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="glass-slider"
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Runs scoring below {threshold}% trigger automatic alert webhook and block deployment.
              </div>
            </div>

            {/* Alert on Score Drop Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Slack &amp; PagerDuty Alerts</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Instant notifications when regression exceeds 3.0%</div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={alertOnDrop} 
                  onChange={(e) => {
                    setAlertOnDrop(e.target.checked);
                    if (notify) notify(`Regression alerts ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
                  }} 
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <button 
              type="button" 
              className="btn btn-primary animate-button-float"
              onClick={() => notify && notify('Evaluation guardrails saved successfully!', 'success')}
              style={{ alignSelf: 'flex-start', marginTop: '10px' }}
            >
              Save Evaluation Rules
            </button>

          </div>
        </div>
      )}

      {/* ── Profile Tab ─────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="glass-card" style={{ padding: '28px', maxWidth: '640px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px' }}>Profile Information</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div 
              style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '24px', 
                fontWeight: 700, 
                color: '#FFFFFF',
                boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)'
              }}
              className="animate-pulse-glow"
            >
              S
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{fullName}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>shashank@smec.ac.in</div>
              <span className="glass-pill badge-purple" style={{ fontSize: '11px', marginTop: '6px' }}>Student Builder</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Full Name
              </label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                className="glass-input" 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Organization
              </label>
              <input 
                type="text" 
                value={orgName} 
                onChange={(e) => setOrgName(e.target.value)}
                className="glass-input" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="btn btn-primary animate-button-float" 
              style={{ alignSelf: 'flex-start', marginTop: '8px', gap: '8px' }}
            >
              {isSaving ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px' }} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── Usage & Billing Tab ─────────────────────────────────────── */}
      {activeTab === 'usage' && (
        <div className="glass-card" style={{ padding: '28px', maxWidth: '640px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>Usage &amp; Quota</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Your workspace is active on the Student Builder tier.
          </p>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Evaluations used this cycle</span>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>4,210 / 10,000</span>
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '42%', background: 'linear-gradient(90deg, #7C3AED, #06B6D4)', borderRadius: '3px' }} />
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-primary btn-sm animate-button-float"
            onClick={() => notify && notify('Plan upgrade flow initiated', 'info')}
          >
            Upgrade to Pro
          </button>
        </div>
      )}

    </div>
  );
}
