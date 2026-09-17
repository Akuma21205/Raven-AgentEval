import React, { useState, useEffect } from 'react';
import { MOCK_STATS, MOCK_RECENT_EXPERIMENTS } from '../data/mockData';
import { api } from '../api';

export default function DashboardHome({ onNavigate, onSelectExperiment, onNewExperiment, notify }) {
  const [stats] = useState(MOCK_STATS);
  const [experiments, setExperiments] = useState(MOCK_RECENT_EXPERIMENTS);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    // Attempt live fetch from backend
    api.listRuns()
      .then((runs) => {
        if (Array.isArray(runs) && runs.length > 0) {
          // Normalize to dashboard structure
          const formatted = runs.slice(0, 4).map((r, i) => ({
            id: r.id || `run-${i}`,
            name: r.test_case_name || r.name || `run-${r.run_id?.slice(0, 8) || i}`,
            dataset: r.dataset_name || 'support-100',
            timeAgo: 'Recently',
            score: '87.4%',
            scoreType: 'success',
            agentVersion: r.agent_version ? `v${r.agent_version}` : 'v1.3.0',
            status: 'Completed'
          }));
          setExperiments(formatted);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="page-container">
      
      {/* ── Page Header Greeting ────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Good evening, Shashank <span>👋</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Your agents ran 48 evaluations today across 4 environments.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Timeframe Selector Pills */}
          <div style={{ display: 'flex', background: 'rgba(12, 16, 30, 0.7)', padding: '3px', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {['7d', '14d', '30d'].map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setSelectedTimeframe(tf);
                  if (notify) notify(`Filtering dashboard metrics for past ${tf}`, 'info');
                }}
                style={{
                  background: selectedTimeframe === tf ? 'var(--primary)' : 'transparent',
                  color: selectedTimeframe === tf ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* "+ Run Evaluation" Primary Button with Floating Glow */}
          <button 
            className="btn btn-primary animate-button-float"
            onClick={onNewExperiment || (() => onNavigate('playground'))}
            style={{ padding: '8px 18px', fontSize: '13px', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
            <span>Run Evaluation</span>
          </button>
        </div>
      </div>

      {/* ── 4 KPI Stats Grid ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
        {stats.map((st) => (
          <div 
            key={st.id} 
            className="glass-card glass-card-hover glass-card-toplight"
            style={{ padding: '20px 22px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {st.label}
              </span>
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '10px', 
                  background: `${st.color}22`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: st.color
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{st.icon}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {st.value}
              </span>
              <span 
                className="glass-pill badge-success"
                style={{ fontSize: '11px', padding: '2px 8px', fontWeight: 700 }}
              >
                {st.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Two-Column Row ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '22px', marginBottom: '28px' }}>
        
        {/* LEFT: Performance Trend Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>Performance Trend</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4' }} />
                  Task Success
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
                  Tool Accuracy
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                  Latency (s)
                </span>
              </div>
            </div>

            <span className="glass-pill" style={{ fontSize: '11px' }}>
              Last 14 days ▾
            </span>
          </div>

          {/* SVG Line Chart */}
          <div style={{ height: '220px', width: '100%', position: 'relative', marginTop: '10px' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[40, 80, 120, 160].map((y) => (
                <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              ))}

              {/* Cyan Area & Line (Task Success: ~72% to ~88%) */}
              <path 
                d="M 20 120 Q 100 110, 180 90 T 340 60 T 480 40 L 480 180 L 20 180 Z" 
                fill="url(#gradCyan)" 
              />
              <path 
                d="M 20 120 Q 100 110, 180 90 T 340 60 T 480 40" 
                fill="none" 
                stroke="#06B6D4" 
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Purple Area & Line (Tool Accuracy: ~64% to ~88%) */}
              <path 
                d="M 20 140 Q 100 130, 180 110 T 340 90 T 480 65 L 480 180 L 20 180 Z" 
                fill="url(#gradPurple)" 
              />
              <path 
                d="M 20 140 Q 100 130, 180 110 T 340 90 T 480 65" 
                fill="none" 
                stroke="#8B5CF6" 
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Amber Dotted Line (Latency) */}
              <path 
                d="M 20 150 Q 100 155, 180 145 T 340 135 T 480 130" 
                fill="none" 
                stroke="#F59E0B" 
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Data dots on curve */}
              {[[20, 120], [100, 110], [180, 90], [260, 75], [340, 60], [420, 50], [480, 40]].map(([cx, cy], i) => (
                <circle 
                  key={i} 
                  cx={cx} 
                  cy={cy} 
                  r="4" 
                  fill="#06B6D4" 
                  stroke="#0E1322" 
                  strokeWidth="2" 
                  style={{ cursor: 'pointer' }} 
                />
              ))}

              {/* X Axis Labels */}
              {['Aug 20', 'Aug 24', 'Aug 28', 'Sep 01', 'Sep 04', 'Sep 08'].map((label, idx) => (
                <text 
                  key={label} 
                  x={20 + idx * 90} 
                  y="195" 
                  fill="#64748B" 
                  fontSize="11" 
                  textAnchor="middle" 
                  fontFamily="var(--font-sans)"
                >
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* RIGHT: Recent Experiments */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>Recent Experiments</h2>
            <span 
              style={{ fontSize: '13px', fontWeight: 600, color: '#8B5CF6', cursor: 'pointer' }}
              onClick={() => onNavigate('experiments')}
            >
              View all
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {experiments.map((exp) => (
              <div 
                key={exp.id}
                className="glass-card-hover"
                onClick={() => onSelectExperiment ? onSelectExperiment(exp.id) : onNavigate('experiment_detail')}
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  background: 'rgba(12, 16, 30, 0.5)', 
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: exp.scoreType === 'success' ? '#10B981' : '#F59E0B' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{exp.name}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '14px', marginTop: '2px' }}>
                    {exp.dataset} • {exp.timeAgo}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span 
                    className={`glass-pill ${exp.scoreType === 'success' ? 'badge-success' : 'badge-warning'}`}
                    style={{ fontSize: '11px', padding: '2px 8px', fontWeight: 700 }}
                  >
                    {exp.score}
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Promo Banner with Cute 3D Astronaut ───────────────── */}
      <div 
        className="glass-card"
        style={{ 
          padding: '24px 32px', 
          background: 'linear-gradient(135deg, rgba(16, 20, 42, 0.85) 0%, rgba(26, 18, 52, 0.75) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          boxShadow: '0 12px 40px rgba(124, 58, 237, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              background: 'rgba(139, 92, 246, 0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#C084FC'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>auto_awesome</span>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              New here? Run a quick demo experiment
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Try a sample dataset and see AgentEval in action.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('playground')}
            style={{ padding: '10px 24px', fontSize: '13px' }}
          >
            Try Demo →
          </button>

          {/* 3D Astronaut Illustration Graphic with Glowing Orb */}
          <div 
            className="animate-float" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '6px 14px',
              borderRadius: '16px',
              background: 'rgba(10, 14, 28, 0.75)',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}
          >
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: 'radial-gradient(circle, #C084FC 0%, #4F46E5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px #8B5CF6'
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>
                smart_toy
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#E2E8F0', whiteSpace: 'nowrap' }}>
              Small Experiments, Big Confidence.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
