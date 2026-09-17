import React, { useState } from 'react';
import { MOCK_COMPARE_DATA } from '../data/mockData';

export default function CompareExperimentsPage({ onNavigate: _onNavigate, notify }) {
  const [data] = useState(MOCK_COMPARE_DATA);
  const [diffMode, setDiffMode] = useState('percentage'); // 'percentage' | 'absolute'

  const handleExportReport = () => {
    if (notify) {
      notify('Comparison report (v1.2.1 vs v1.3.0 vs v1.3.1) exported to PDF/Markdown!', 'success');
    }
  };

  const handleAddExperiment = () => {
    if (notify) {
      notify('Maximum 3 experiments compared concurrently in this view.', 'info');
    }
  };

  return (
    <div className="page-container">
      
      {/* ── Page Header Row ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Compare Experiments
            </h1>
            <span className="glass-pill badge-purple" style={{ fontSize: '11px', fontWeight: 700 }}>
              3 Selected
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Side-by-side benchmarking and regression testing across agent versions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Diff Mode Toggle Pill */}
          <div style={{ display: 'flex', background: 'rgba(12, 16, 30, 0.7)', padding: '3px', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => setDiffMode('percentage')}
              style={{
                background: diffMode === 'percentage' ? 'var(--primary)' : 'transparent',
                color: diffMode === 'percentage' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '9999px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              % Delta
            </button>
            <button
              onClick={() => setDiffMode('absolute')}
              style={{
                background: diffMode === 'absolute' ? 'var(--primary)' : 'transparent',
                color: diffMode === 'absolute' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '9999px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Raw Values
            </button>
          </div>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={handleExportReport}
            style={{ padding: '8px 16px', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>ios_share</span>
            Export Report
          </button>
          
          <button 
            className="btn btn-primary btn-sm animate-button-float" 
            onClick={handleAddExperiment}
            style={{ padding: '8px 18px', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Add Candidate
          </button>
        </div>
      </div>

      {/* ── 3 Version Selector Cards with Floating Hover ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '28px' }}>
        {data.versions.map((ver) => (
          <div 
            key={ver.id}
            className="glass-card glass-card-hover"
            style={{ 
              padding: '20px', 
              borderTop: `3px solid ${ver.color}`,
              background: 'rgba(14, 19, 36, 0.75)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ver.color }} />
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{ver.name}</span>
              </div>
              <span 
                className="glass-pill" 
                style={{ 
                  fontSize: '11px', 
                  padding: '2px 8px',
                  background: `${ver.color}18`,
                  color: ver.color,
                  borderColor: `${ver.color}35`
                }}
              >
                {ver.label}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Customer Support • Optimized prompt chain
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Model: <strong style={{ color: '#FFFFFF' }}>{ver.model}</strong></span>
              <span>Samples: <strong style={{ color: '#FFFFFF' }}>{ver.samples}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Metrics Comparison Table ─────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8B5CF6' }}>table_chart</span>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Metrics Comparison</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Green indicates optimal result among compared versions
          </span>
        </div>

        <table className="glass-table">
          <thead>
            <tr>
              <th>METRIC</th>
              <th><span style={{ color: '#3B82F6' }}>● v1.2.1</span> (BASELINE)</th>
              <th><span style={{ color: '#8B5CF6' }}>● v1.3.0</span> (CURRENT)</th>
              <th><span style={{ color: '#F97316' }}>● v1.3.1</span> (EXPERIMENTAL)</th>
              <th>DELTA (VS BASELINE)</th>
            </tr>
          </thead>
          <tbody>
            {data.metrics.map((m, idx) => (
              <tr key={idx} className="glass-card-hover">
                <td style={{ fontWeight: 600, color: '#FFFFFF' }}>{m.name}</td>
                <td>{m.v1}</td>
                <td>
                  <span style={{ color: m.best === 'v2' ? '#10B981' : 'inherit', fontWeight: m.best === 'v2' ? 700 : 400 }}>
                    {m.v2} {m.best === 'v2' && '✓ Best'}
                  </span>
                </td>
                <td>
                  <span style={{ color: m.best === 'v3' ? '#10B981' : 'inherit', fontWeight: m.best === 'v3' ? 700 : 400 }}>
                    {m.v3} {m.best === 'v3' && '✓ Best'}
                  </span>
                </td>
                <td>
                  <span 
                    className="glass-pill"
                    style={{ 
                      color: m.delta.includes('-') && !m.name.includes('Latency') && !m.name.includes('Hallucination') ? '#EF4444' : '#10B981', 
                      borderColor: m.delta.includes('-') && !m.name.includes('Latency') && !m.name.includes('Hallucination') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                      fontWeight: 700, 
                      fontSize: '11px' 
                    }}
                  >
                    {m.delta}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Performance Comparison Grouped Bar Chart ─────────────────── */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Performance Comparison</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Normalized percentage scores across key benchmark dimensions
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3B82F6' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
              v1.2.1
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B5CF6' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
              v1.3.0
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F97316' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F97316' }} />
              v1.3.1
            </span>
          </div>
        </div>

        {/* Grouped Bar Chart SVG */}
        <div style={{ height: '220px', width: '100%' }}>
          <svg viewBox="0 0 520 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid */}
            {[40, 80, 120, 160].map((y) => (
              <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            ))}

            {/* Bars: 4 Categories (Task Success, Tool Accuracy, Policy Adherence, Cost Efficiency) */}
            {[
              { label: 'Task Success', v1: 140, v2: 60, v3: 40 },
              { label: 'Tool Accuracy', v1: 120, v2: 50, v3: 35 },
              { label: 'Policy Adherence', v1: 110, v2: 65, v3: 75 },
              { label: 'Latency Score', v1: 90, v2: 45, v3: 60 }
            ].map((cat, i) => {
              const startX = 40 + i * 125;
              return (
                <g key={cat.label}>
                  {/* v1 Bar (Blue) */}
                  <rect x={startX} y={cat.v1} width="16" height={180 - cat.v1} rx="4" fill="#3B82F6" opacity="0.85" />
                  {/* v2 Bar (Purple) */}
                  <rect x={startX + 20} y={cat.v2} width="16" height={180 - cat.v2} rx="4" fill="#8B5CF6" />
                  {/* v3 Bar (Orange) */}
                  <rect x={startX + 40} y={cat.v3} width="16" height={180 - cat.v3} rx="4" fill="#F97316" />

                  {/* Label */}
                  <text x={startX + 28} y="195" fill="#94A3B8" fontSize="11" textAnchor="middle" fontFamily="var(--font-sans)">
                    {cat.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

    </div>
  );
}
