import React, { useState } from 'react';
import { MOCK_EXPERIMENT_DETAIL } from '../data/mockData';

export default function ExperimentDetailPage({ onNavigate, onSelectTrace: _onSelectTrace, onNewExperiment, notify }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunningAgain, setIsRunningAgain] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const data = MOCK_EXPERIMENT_DETAIL;

  const tabs = ['Overview', 'Test Cases', 'Traces', 'Metrics', 'Logs', 'Config'];

  const handleRunAgain = () => {
    setIsRunningAgain(true);
    if (notify) {
      notify(`Re-running evaluation suite for ${data.title}...`, 'info');
    }
    setTimeout(() => {
      setIsRunningAgain(false);
      if (notify) {
        notify(`Completed re-run! 128/128 test cases finished. Score: 87.4% (+1.2%)`, 'success');
      }
    }, 1200);
  };

  const handleExport = () => {
    if (notify) {
      notify('Exported experiment results to CSV and JSON benchmark report', 'success');
    }
  };

  const filteredCases = data.testCases.filter(tc => 
    tc.input.toLowerCase().includes(searchFilter.toLowerCase()) || 
    tc.expected.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="page-container">
      
      {/* ── Breadcrumb & Header Row ──────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>Experiments</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span style={{ color: 'var(--text-secondary)' }}>{data.title}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {data.title}
            </h1>
            <span className="glass-pill badge-success" style={{ fontSize: '12px', padding: '3px 10px', gap: '6px' }}>
              <span className="pulse-dot" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              Completed
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('compare')}
              style={{ padding: '8px 14px', gap: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>compare_arrows</span>
              <span>Compare</span>
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleExport}
              style={{ padding: '8px 14px', gap: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              <span>Export</span>
            </button>
            <button 
              className="btn btn-primary btn-sm animate-button-float"
              onClick={handleRunAgain}
              disabled={isRunningAgain}
              style={{ padding: '8px 18px', gap: '8px' }}
            >
              <span className={`material-symbols-outlined ${isRunningAgain ? 'spinner' : ''}`} style={{ fontSize: '16px' }}>
                {isRunningAgain ? '' : 'refresh'}
              </span>
              <span>{isRunningAgain ? 'Running...' : 'Run Again'}</span>
            </button>
          </div>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
          {data.meta}
        </div>
      </div>

      {/* ── Tabs Row ────────────────────────────────────────────────── */}
      <div className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── 4 KPI Stat Cards with Floating Hover ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
        {data.kpis.map((kpi, idx) => (
          <div key={idx} className="glass-card glass-card-hover glass-card-toplight" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{kpi.label}</span>
              <span className="glass-pill badge-success" style={{ fontSize: '11px', padding: '2px 8px' }}>
                {kpi.delta}
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Middle Two-Column (Chart + Breakdown) ───────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '22px', marginBottom: '28px' }}>
        
        {/* LEFT: Performance Over Time */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Performance Over Time</h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Historical progression across benchmark checkpoints
              </div>
            </div>
            <span className="glass-pill" style={{ fontSize: '11px' }}>Last 14 days ▾</span>
          </div>

          {/* SVG Chart */}
          <div style={{ height: '190px', width: '100%' }}>
            <svg viewBox="0 0 450 170" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Grid lines */}
              {[30, 70, 110, 150].map((y) => (
                <line key={y} x1="0" y1={y} x2="450" y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              ))}

              {/* Cyan Line: Task Success upward */}
              <path 
                d="M 20 120 Q 120 110, 220 75 T 430 40" 
                fill="none" 
                stroke="#06B6D4" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
              {/* Purple Line: Tool Accuracy upward */}
              <path 
                d="M 20 135 Q 120 125, 220 95 T 430 60" 
                fill="none" 
                stroke="#8B5CF6" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />

              {/* Data dots */}
              {[[20, 120], [120, 105], [220, 75], [320, 55], [430, 40]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#06B6D4" stroke="#0E1322" strokeWidth="2" />
              ))}

              {['Aug 26', 'Aug 29', 'Sep 02', 'Sep 06', 'Sep 10'].map((lbl, idx) => (
                <text key={lbl} x={20 + idx * 100} y="165" fill="#64748B" fontSize="11" textAnchor="middle" fontFamily="var(--font-sans)">
                  {lbl}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* RIGHT: Metric Breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Metric Breakdown</h2>
            <span className="glass-pill" style={{ fontSize: '11px' }}>Full Suite</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data.breakdown.map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.metric}</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{item.rate} ({item.detail})</span>
                </div>
                {/* Visual Progress Bar */}
                <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: item.rate, 
                      background: i === 0 ? 'linear-gradient(90deg, #7C3AED, #06B6D4)' : i === 1 ? '#06B6D4' : '#10B981',
                      borderRadius: '3px'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Test Cases Table with Search Filter ────────────────── */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Recent Test Cases</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Representative evaluation items from execution trace (click row to open Trace Viewer)
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <input 
                type="text" 
                placeholder="Filter test cases..." 
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="glass-input"
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '9999px' }}
              />
            </div>
            <span 
              style={{ fontSize: '13px', fontWeight: 600, color: '#8B5CF6', cursor: 'pointer' }}
              onClick={() => onNavigate('trace')}
            >
              View all →
            </span>
          </div>
        </div>

        <table className="glass-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              <th>INPUT</th>
              <th>EXPECTED OUTCOME</th>
              <th style={{ width: '120px' }}>STATUS</th>
              <th style={{ width: '100px' }}>LATENCY</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((tc) => (
              <tr 
                key={tc.id} 
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate('trace')}
              >
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{tc.id}</td>
                <td style={{ color: '#FFFFFF', fontWeight: 500 }}>"{tc.input}"</td>
                <td>{tc.expected}</td>
                <td>
                  <span className={`glass-pill ${tc.status === 'Success' ? 'badge-success' : 'badge-error'}`} style={{ padding: '3px 8px', fontSize: '11px' }}>
                    <span className="pulse-dot" style={{ background: tc.status === 'Success' ? '#10B981' : '#EF4444' }} />
                    {tc.status}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{tc.latency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
