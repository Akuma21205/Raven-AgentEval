import React, { useState } from 'react';

export default function RunEvaluationModal({ isOpen, onClose, onLaunch, defaultDataset = 'support-tickets-v2' }) {
  const [name, setName] = useState(`eval-run-${new Date().toISOString().slice(5, 10).replace('-', '')}`);
  const [dataset, setDataset] = useState(defaultDataset);
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.2);
  const [metrics, setMetrics] = useState({
    toolAccuracy: true,
    groundedness: true,
    taskSuccess: true,
    latency: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleMetric = (key) => {
    setMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLaunch({
        name,
        dataset,
        model,
        temperature,
        metrics
      });
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-floating" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '28px' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(124, 58, 237, 0.5)'
              }}
              className="animate-pulse-glow"
            >
              <span className="material-symbols-outlined" style={{ color: '#FFFFFF', fontSize: '20px' }}>
                play_arrow
              </span>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Launch New Evaluation
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Run automated benchmarks and LLM-as-a-judge scorers
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn btn-ghost"
            style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Run Name Input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Experiment / Run Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
              placeholder="e.g. customer-support-v1.4.0-prompt-fix"
              required
            />
          </div>

          {/* Dataset & Model in Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Target Dataset
              </label>
              <select 
                value={dataset} 
                onChange={(e) => setDataset(e.target.value)}
                className="glass-select"
                style={{ background: 'rgba(12, 16, 30, 0.95)', cursor: 'pointer' }}
              >
                <option value="support-tickets-v2">support-tickets-v2 (250 items)</option>
                <option value="code-generation-eval">code-generation-eval (120 items)</option>
                <option value="sql-agent-benchmark">sql-agent-benchmark (85 items)</option>
                <option value="customer-support-golden">customer-support-golden (100 items)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Agent / Judge Model
              </label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                className="glass-select"
                style={{ background: 'rgba(12, 16, 30, 0.95)', cursor: 'pointer' }}
              >
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="gemini-1-5-pro">Google Gemini 1.5 Pro</option>
                <option value="llama-3-70b">Meta Llama 3 70B Instruct</option>
              </select>
            </div>
          </div>

          {/* Temperature Slider with Floating Badge */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Temperature
              </label>
              <span 
                className="glass-pill badge-purple" 
                style={{ fontSize: '11px', padding: '2px 8px', fontWeight: 700 }}
              >
                {temperature}
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="glass-slider"
            />
          </div>

          {/* Active Evaluators Pills */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Evaluation Scorers
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { key: 'toolAccuracy', label: 'Tool Accuracy', icon: 'precision_manufacturing' },
                { key: 'groundedness', label: 'Groundedness', icon: 'fact_check' },
                { key: 'taskSuccess', label: 'Task Success', icon: 'task_alt' },
                { key: 'latency', label: 'Latency < 2.5s', icon: 'timer' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.key}
                  onClick={() => toggleMetric(m.key)}
                  className="glass-pill"
                  style={{
                    cursor: 'pointer',
                    background: metrics[m.key] ? 'rgba(124, 58, 237, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                    borderColor: metrics[m.key] ? '#8B5CF6' : 'rgba(255, 255, 255, 0.08)',
                    color: metrics[m.key] ? '#FFFFFF' : 'var(--text-muted)',
                    transform: metrics[m.key] ? 'translateY(-1px)' : 'none',
                    boxShadow: metrics[m.key] ? '0 0 10px rgba(139, 92, 246, 0.25)' : 'none'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: metrics[m.key] ? '#C084FC' : 'inherit' }}>
                    {m.icon}
                  </span>
                  <span>{m.label}</span>
                  {metrics[m.key] && (
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 800 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 18px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary btn-sm animate-button-float"
              style={{ padding: '8px 22px', gap: '8px' }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px' }} />
                  <span>Launching Run...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>rocket_launch</span>
                  <span>Start Evaluation</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
