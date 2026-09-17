import React, { useState } from 'react';
import { MOCK_TRACE_DATA } from '../data/mockData';

export default function TraceViewerPage({ onNavigate, notify }) {
  const [selectedStep, setSelectedStep] = useState(3); // default on tool call
  const [activeTab, setActiveTab] = useState('trace_steps');
  const [viewMode, setViewMode] = useState('formatted');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const data = MOCK_TRACE_DATA;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    if (notify) {
      notify('Trace trace-9842F1 payload copied to clipboard!', 'info');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayToggle = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    if (notify) {
      notify(next ? 'Replaying agent execution trace from start...' : 'Playback paused', 'info');
    }
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      
      {/* ── Page Header Row ──────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>Experiments</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('experiment_detail')}>customer-support-v1.3.0</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span style={{ color: 'var(--text-secondary)' }}>trace-9842F1</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {data.title}
            </h1>
            <span className="glass-pill badge-success" style={{ fontSize: '12px', padding: '3px 10px', gap: '6px' }}>
              <span className="pulse-dot" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              Success
            </span>
            <span className="glass-pill" style={{ fontSize: '12px', padding: '3px 10px' }}>
              ⏱ {data.duration}
            </span>
            <span className="glass-pill" style={{ fontSize: '12px', padding: '3px 10px' }}>
              💰 {data.cost}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="glass-pill" style={{ padding: '6px 12px', gap: '12px' }}>
              <span 
                className="material-symbols-outlined" 
                style={{ fontSize: '16px', cursor: 'pointer' }}
                onClick={() => notify && notify('Viewing previous trace (23 of 128)', 'info')}
              >
                chevron_left
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>24 of 128</span>
              <span 
                className="material-symbols-outlined" 
                style={{ fontSize: '16px', cursor: 'pointer' }}
                onClick={() => notify && notify('Viewing next trace (25 of 128)', 'info')}
              >
                chevron_right
              </span>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ padding: '8px 14px', gap: '6px' }} onClick={handleCopy}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied!' : 'Copy Trace'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs & View Toggles Row ─────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { id: 'trace_steps', label: 'Trace Steps' },
            { id: 'input_output', label: 'Input / Output' },
            { id: 'tool_calls', label: 'Tool Calls (1)' },
            { id: 'raw_trace', label: 'Raw Trace' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px', paddingBottom: '8px' }}>
          {['formatted', 'json', 'message_view'].map((m) => (
            <button
              key={m}
              className={`glass-pill ${viewMode === m ? 'badge-purple' : ''}`}
              onClick={() => setViewMode(m)}
              style={{ fontSize: '12px', textTransform: 'capitalize', cursor: 'pointer' }}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-Column Layout ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.55fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: Execution Timeline */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              EXECUTION TIMELINE
            </span>
            <span className="glass-pill" style={{ fontSize: '11px', padding: '2px 8px' }}>
              6 Spans
            </span>
          </div>

          <div style={{ position: 'relative', paddingLeft: '14px' }}>
            {/* Connecting Vertical Line */}
            <div 
              style={{ 
                position: 'absolute', 
                left: '26px', 
                top: '15px', 
                bottom: '25px', 
                width: '2px', 
                background: 'rgba(255, 255, 255, 0.08)' 
              }} 
            />

            {/* Stepped Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.steps.map((st) => {
                const isSelected = selectedStep === st.stepNumber;
                return (
                  <div 
                    key={st.stepNumber}
                    onClick={() => setSelectedStep(st.stepNumber)}
                    className="glass-card-hover"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '16px',
                      cursor: 'pointer',
                      position: 'relative',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                      border: isSelected ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Node Dot Icon */}
                    <div 
                      style={{ 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: '50%', 
                        background: isSelected ? st.color : 'rgba(15, 20, 36, 0.9)', 
                        border: `2px solid ${st.color}`,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: isSelected ? '#FFFFFF' : st.color,
                        flexShrink: 0,
                        zIndex: 2,
                        boxShadow: isSelected ? `0 0 12px ${st.color}` : 'none'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        {st.icon}
                      </span>
                    </div>

                    {/* Step Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#FFFFFF' : 'var(--text-secondary)' }}>
                          {st.type}
                        </span>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {st.timestamp}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {st.summary}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Step Detail Inspector */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="glass-pill badge-purple" style={{ fontSize: '11px', fontWeight: 700 }}>
                STEP {selectedStep}
              </span>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                Execution Trace Hierarchy
              </h2>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }}>
              Expand All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* User Prompt Card */}
            <div style={{ background: 'rgba(11, 15, 28, 0.7)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                <span>User Prompt</span>
                <span>0.00s • 14 tokens</span>
              </div>
              <p style={{ fontSize: '14px', color: '#FFFFFF' }}>
                "Can I get a refund for my order?"
              </p>
            </div>

            {/* Agent Thought Card */}
            <div style={{ background: 'rgba(20, 16, 36, 0.75)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#C084FC', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                <span>Agent Thought (Reasoning Engine)</span>
                <span>0.82s • temp: 0.2</span>
              </div>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#E2E8F0', lineHeight: 1.5 }}>
                "The customer is inquiring about a refund for an unspecified order. I should check their most recent order details first using the customer ID in context to evaluate delivery date and refund eligibility before replying."
              </p>
            </div>

            {/* Tool Call Payload Card */}
            <div style={{ background: 'rgba(8, 14, 26, 0.8)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                <span>Tool Call: get_order_details</span>
                <span>1.24s • 240ms</span>
              </div>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#A7F3D0', background: 'rgba(0, 0, 0, 0.3)', padding: '10px 14px', borderRadius: '8px', overflowX: 'auto' }}>
{`get_order_details({
  "order_id": "12345",
  "customer_id": "CUST_99012N",
  "include_shipment_logs": true
})`}
              </pre>
            </div>

            {/* Tool Result JSON Card */}
            <div style={{ background: 'rgba(8, 14, 26, 0.8)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#06B6D4', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                <span>Tool Result Payload</span>
                <span>1.80s • HTTP 200</span>
              </div>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#67E8F9', background: 'rgba(0, 0, 0, 0.3)', padding: '10px 14px', borderRadius: '8px', overflowX: 'auto' }}>
{`{
  "order_id": "12345",
  "status": "delivered",
  "delivered_at": "2026-09-10",
  "items": [
    { "sku": "PRD-AURORA-M1", "qty": 1, "price": 129.00 }
  ],
  "eligible_for_return": true
}`}
              </pre>
            </div>

            {/* Final Response Card */}
            <div style={{ background: 'rgba(12, 22, 34, 0.8)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#34D399', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                <span>Final Synthesized Response</span>
                <span>2.84s • 68 tokens</span>
              </div>
              <p style={{ fontSize: '13px', color: '#FFFFFF', lineHeight: 1.5 }}>
                Your order <strong style={{ color: '#06B6D4' }}>#12345</strong> was delivered on <strong>Sep 10, 2026</strong>. Based on our 30-day return policy, you are fully eligible for a complete refund. Would you like me to initiate the refund process right now?
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* ── Bottom Floating Playback Bar ────────────────────────────── */}
      <div 
        className="glass-card"
        style={{ 
          position: 'fixed',
          bottom: '20px',
          left: '280px',
          right: '40px',
          padding: '12px 24px',
          background: 'rgba(11, 15, 28, 0.9)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Play/Pause Button */}
          <button 
            className="btn btn-primary"
            onClick={handlePlayToggle}
            style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          
          <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>replay</span>
          </button>

          <span className="glass-pill" style={{ fontSize: '11px', padding: '3px 8px' }}>
            2x Speed
          </span>
        </div>

        {/* Scrubber Progress Bar */}
        <div style={{ flex: 1, margin: '0 32px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>0.0s</span>
          <div style={{ flex: 1, height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', position: 'relative', cursor: 'pointer' }}>
            <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #7C3AED, #06B6D4)', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', left: '85%', top: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 10px #06B6D4' }} />
          </div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#06B6D4' }}>2.8s</span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Step <strong>{selectedStep}</strong> of 6 • Total Latency: <span style={{ color: '#10B981', fontWeight: 600 }}>2,840ms</span>
        </div>
      </div>

    </div>
  );
}
