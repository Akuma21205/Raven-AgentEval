import React, { useState } from 'react';

export default function SignInPage({ onNavigate, onLogin, notify }) {
  const [email, setEmail] = useState('shashank@smec.ac.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onLogin) onLogin();
      else {
        if (notify) notify('Welcome back, Shashank! Logged into workspace.', 'success');
        onNavigate('dashboard');
      }
    }, 600);
  };

  const handleSocialLogin = (provider) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (notify) notify(`Authenticated with ${provider}! Redirecting to dashboard...`, 'success');
      onNavigate('dashboard');
    }, 600);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Top Header Link */}
      <header style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => onNavigate('landing')}
        >
          <div 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '9px', 
              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(124, 58, 237, 0.6)'
            }}
            className="animate-pulse-glow"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>AgentEval</span>
        </div>

        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => onNavigate('landing')}
          style={{ gap: '6px', fontSize: '13px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Back to home
        </button>
      </header>

      {/* Main Split Body */}
      <div 
        style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '80px',
          padding: '40px 48px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        {/* Left: Centered Auth Card */}
        <div 
          className="glass-card animate-float-gentle"
          style={{ 
            width: '100%', 
            maxWidth: '450px', 
            padding: '36px', 
            background: 'rgba(14, 19, 36, 0.88)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(124, 58, 237, 0.2)'
          }}
        >
          {/* Brand header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>AgentEval</span>
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Sign in to continue building and monitoring reliable agents.
          </p>

          {/* Social Logins with Floating Lift */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => handleSocialLogin('Google')}
              style={{ width: '100%', borderRadius: '12px', padding: '10px', fontSize: '13px', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.5 0 2.9.5 4 1.5l3-3C17.1 1.7 14.7 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
              </svg>
              Continue with Google
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => handleSocialLogin('GitHub')}
              style={{ width: '100%', borderRadius: '12px', padding: '10px', fontSize: '13px', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          {/* Form with Floating Focus States */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                style={{ fontSize: '13px', padding: '11px 16px' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  style={{ fontSize: '13px', padding: '11px 16px', paddingRight: '42px' }}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="glass-checkbox"
                />
                <span>Remember me</span>
              </label>
              <span 
                style={{ color: '#A78BFA', cursor: 'pointer', fontWeight: 500 }}
                onClick={() => notify && notify('Password reset link sent to your registered email.', 'info')}
              >
                Forgot password?
              </span>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary animate-button-float"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', marginTop: '8px', gap: '8px' }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <span 
              style={{ color: '#A78BFA', fontWeight: 600, cursor: 'pointer' }} 
              onClick={() => {
                if (notify) notify('Redirecting to workspace signup...', 'info');
                onNavigate('dashboard');
              }}
            >
              Create one free
            </span>
          </div>
        </div>

        {/* Right: Floating Quote & Badges */}
        <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <div className="glass-pill badge-purple animate-float-gentle" style={{ alignSelf: 'flex-start', padding: '6px 14px' }}>
            <span className="pulse-dot" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <span>Production Ready Observability</span>
          </div>

          <div style={{ position: 'relative' }}>
            <p 
              style={{ 
                fontSize: '28px', 
                fontStyle: 'italic', 
                fontWeight: 400, 
                lineHeight: 1.4, 
                color: '#E2E8F0',
                letterSpacing: '-0.01em'
              }}
            >
              “Evaluation turns AI from a demo into a product.”
            </p>
            <div style={{ marginTop: '14px', fontSize: '14px', color: 'var(--text-muted)' }}>
              — A builder • <span style={{ color: '#06B6D4' }}>AI Agents Benchmark</span>
            </div>
          </div>

          <div 
            className="glass-card animate-float"
            style={{ 
              padding: '16px 20px', 
              background: 'rgba(15, 20, 36, 0.65)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}>
              <span className="material-symbols-outlined">speed</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deterministic Runs</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>99.94% Confidence</div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
        <div>© 2026 AgentEval Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '18px' }}>
          <span style={{ cursor: 'pointer' }}>Privacy</span>
          <span style={{ cursor: 'pointer' }}>Terms</span>
          <span style={{ cursor: 'pointer' }}>Documentation</span>
        </div>
      </footer>
    </div>
  );
}
