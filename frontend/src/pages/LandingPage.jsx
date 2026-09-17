import React, { useState } from 'react';

export default function LandingPage({ onNavigate, notify }) {
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setEmailInput('');
      if (notify) {
        notify("You're on the VIP early access list! Check your inbox for your invite.", 'success');
      }
    }, 600);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header 
        style={{ 
          height: '72px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 48px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(8, 11, 20, 0.75)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        {/* Brand Logo */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => onNavigate('landing')}
        >
          <div 
            style={{ 
              width: '34px', 
              height: '34px', 
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
          <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            AgentEval
          </span>
        </div>

        {/* Center Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <span 
            style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </span>
          <span 
            style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}
            onClick={() => onNavigate('playground')}
          >
            Playground
          </span>
          <span 
            style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}
            onClick={() => onNavigate('compare')}
          >
            Benchmarks
          </span>
          <span 
            style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}
            onClick={() => onNavigate('trace')}
          >
            Traces
          </span>
          <span 
            style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}
            onClick={() => onNavigate('settings')}
          >
            Settings
          </span>
        </nav>

        {/* Right CTA with Floating Lift */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn btn-ghost"
            onClick={() => onNavigate('signin')}
            style={{ fontSize: '14px' }}
          >
            Sign In
          </button>
          <button 
            className="btn btn-primary animate-button-float"
            onClick={() => onNavigate('dashboard')}
            style={{ padding: '8px 20px', borderRadius: '9999px', fontSize: '13px' }}
          >
            Open App →
          </button>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section 
        style={{ 
          padding: '80px 48px 60px', 
          maxWidth: '1340px', 
          margin: '0 auto', 
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '60px',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        {/* Left Hero Content */}
        <div>
          {/* Pill Badge with Floating Animation */}
          <div 
            className="glass-pill animate-float-gentle"
            style={{ marginBottom: '24px', cursor: 'pointer', padding: '6px 16px', gap: '8px' }}
            onClick={() => onNavigate('dashboard')}
          >
            <span className="pulse-dot" style={{ background: '#A78BFA', boxShadow: '0 0 8px #8B5CF6' }} />
            <span>Evaluate today. Ship better tomorrow. &gt;</span>
          </div>

          <h1 
            style={{ 
              fontSize: '64px', 
              fontWeight: 800, 
              lineHeight: 1.08, 
              letterSpacing: '-0.03em', 
              marginBottom: '20px',
              color: '#FFFFFF'
            }}
          >
            Build Reliable <br />
            <span style={{ background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Agents
            </span>
          </h1>

          <p 
            style={{ 
              fontSize: '17px', 
              color: 'var(--text-secondary)', 
              lineHeight: 1.6, 
              maxWidth: '520px',
              marginBottom: '36px'
            }}
          >
            Evaluate, debug, compare, and improve your agents — with automated evaluation pipelines, deep flamegraph traces, and live benchmark insights.
          </p>

          {/* CTAs with Floating Hover */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '50px' }}>
            <button 
              className="btn btn-primary btn-lg animate-button-float"
              onClick={() => onNavigate('dashboard')}
              style={{ gap: '10px' }}
            >
              <span>Get Started Free</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
            <button 
              className="btn btn-secondary btn-lg"
              onClick={() => onNavigate('playground')}
              style={{ gap: '10px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#A78BFA' }}>smart_toy</span>
              <span>Test Playground</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '36px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>99.8%</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Evaluation Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#06B6D4' }}>&lt;45ms</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Trace Telemetry Latency</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#A855F7' }}>10M+</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Daily Agent Runs</div>
            </div>
          </div>
        </div>

        {/* Right 3D Isometric Glass Cube Graphic */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          
          {/* Ambient Glow behind the cube */}
          <div 
            style={{ 
              position: 'absolute', 
              width: '380px', 
              height: '380px', 
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, rgba(6, 182, 212, 0.2) 60%, transparent 80%)',
              filter: 'blur(50px)',
              zIndex: 0
            }} 
            className="animate-pulse-glow"
          />

          {/* Isometric Floating Structure */}
          <div 
            className="animate-float" 
            style={{ 
              position: 'relative', 
              zIndex: 1, 
              width: '100%', 
              maxWidth: '440px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Top Node: Evaluate */}
            <div 
              className="glass-card glass-card-hover"
              onClick={() => onNavigate('dashboard')}
              style={{ 
                padding: '16px 20px', 
                background: 'rgba(15, 22, 42, 0.8)', 
                border: '1px solid rgba(6, 182, 212, 0.4)',
                boxShadow: '0 8px 32px rgba(6, 182, 212, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06B6D4' }}>
                  <span className="material-symbols-outlined">explore</span>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>Evaluate</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>agent: v1.4 • Task Accuracy</div>
                </div>
              </div>
              <span className="glass-pill badge-success" style={{ fontSize: '11px', padding: '3px 10px' }}>
                99.2% PASSED
              </span>
            </div>

            {/* Middle Node: Improve */}
            <div 
              className="glass-card glass-card-hover"
              onClick={() => onNavigate('playground')}
              style={{ 
                padding: '16px 20px', 
                background: 'rgba(20, 18, 42, 0.85)', 
                border: '1px solid rgba(139, 92, 246, 0.45)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
                marginLeft: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C084FC' }}>
                  <span className="material-symbols-outlined">auto_fix_high</span>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>Improve</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fast Alpha Loop • Reasoning</div>
                </div>
              </div>
              <span className="glass-pill badge-purple" style={{ fontSize: '11px', padding: '3px 10px' }}>
                +14.2% LIFT
              </span>
            </div>

            {/* Bottom Node: Trace */}
            <div 
              className="glass-card glass-card-hover"
              onClick={() => onNavigate('trace')}
              style={{ 
                padding: '16px 20px', 
                background: 'rgba(12, 18, 36, 0.8)', 
                border: '1px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                  <span className="material-symbols-outlined">timeline</span>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>Trace Observability</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time execution flamegraphs</div>
                </div>
              </div>
              <span className="glass-pill badge-teal" style={{ fontSize: '11px', padding: '3px 10px' }}>
                1,840ms
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards Section ────────────────────────────────────── */}
      <section style={{ padding: '40px 48px 60px', maxWidth: '1340px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Built for production agent workflows
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            From individual prompt experiments to continuous enterprise CI/CD regressions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {/* Card 1 */}
          <div className="glass-card glass-card-hover" style={{ padding: '28px 24px', cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06B6D4', marginBottom: '20px' }}>
              <span className="material-symbols-outlined">dataset</span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>Benchmark Datasets</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Curate golden datasets, synthesize edge cases, and run reproducible test suites across all agent versions.
            </p>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#06B6D4', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Explore benchmarks →
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card glass-card-hover" style={{ padding: '28px 24px', cursor: 'pointer' }} onClick={() => onNavigate('compare')}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', marginBottom: '20px' }}>
              <span className="material-symbols-outlined">compare_arrows</span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>Compare Runs</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Catch regressions early. Diff metrics side-by-side: task success, hallucination rate, latency, and cost.
            </p>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#A78BFA', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Compare models →
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card glass-card-hover" style={{ padding: '28px 24px', cursor: 'pointer' }} onClick={() => onNavigate('trace')}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', marginBottom: '20px' }}>
              <span className="material-symbols-outlined">radar</span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>Debug with Traces</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              See what's happening under the hood with nested flamegraphs, tool calls, and state transitions.
            </p>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Deep observability →
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-card glass-card-hover" style={{ padding: '28px 24px', cursor: 'pointer' }} onClick={() => onNavigate('datasets')}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', marginBottom: '20px' }}>
              <span className="material-symbols-outlined">sync</span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>Improve Continuously</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Iterate with confidence through synthetic generation, human-in-the-loop annotations, and guards.
            </p>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Autonomous pipelines →
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Newsletter / Early Access Section with Floating Form ── */}
      <section style={{ padding: '40px 48px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div 
          className="glass-card" 
          style={{ 
            padding: '36px 40px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(14, 20, 40, 0.85) 0%, rgba(24, 18, 50, 0.75) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(124, 58, 237, 0.2)'
          }}
        >
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '14px', 
              background: 'rgba(139, 92, 246, 0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#C084FC',
              margin: '0 auto 16px'
            }}
            className="animate-pulse-glow"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>mail</span>
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
            Get early access to AgentEval v2 Cloud
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
            Join 1,200+ engineers benchmarking agent reliability. Instant SDK keys dispatched weekly.
          </p>

          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '12px', maxWidth: '460px', margin: '0 auto' }}>
            <input 
              type="email" 
              placeholder="Enter your work email..." 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="glass-input"
              style={{ borderRadius: '9999px', paddingLeft: '20px' }}
            />
            <button 
              type="submit" 
              disabled={isSubscribing}
              className="btn btn-primary animate-button-float"
              style={{ padding: '10px 24px', borderRadius: '9999px', gap: '6px' }}
            >
              {isSubscribing ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px' }} />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>Join</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ── Trusted By Section ──────────────────────────────────────── */}
      <section style={{ padding: '20px 48px 60px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '24px', textTransform: 'uppercase' }}>
          Trusted by builders from
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '48px', opacity: 0.75, flexWrap: 'wrap' }}>
          {['OpenAI', 'Google', 'Meta', 'Microsoft', 'Anthropic', 'Amazon'].map((brand) => (
            <span key={brand} style={{ fontSize: '16px', fontWeight: 700, color: '#CBD5E1', letterSpacing: '-0.01em' }}>
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer 
        style={{ 
          marginTop: 'auto', 
          borderTop: '1px solid rgba(255, 255, 255, 0.06)', 
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}
      >
        <div>© 2026 AgentEval Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => notify && notify('AgentEval Terms of Service', 'info')}>Terms</span>
          <span style={{ cursor: 'pointer' }} onClick={() => notify && notify('AgentEval Privacy Policy', 'info')}>Privacy</span>
          <span style={{ cursor: 'pointer' }} onClick={() => notify && notify('SOC2 Type II & Security Docs', 'info')}>Security</span>
          <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            Systems Normal
          </span>
        </div>
      </footer>
    </div>
  );
}
