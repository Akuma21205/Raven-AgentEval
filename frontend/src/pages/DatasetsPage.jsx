import React, { useState } from 'react';
import { MOCK_DATASETS } from '../data/mockData';

export default function DatasetsPage({ onNavigate, onRunEvalOnDataset, notify }) {
  const [datasets, setDatasets] = useState(MOCK_DATASETS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [newDatasetDesc, setNewDatasetDesc] = useState('');
  const [newDatasetCategory, setNewDatasetCategory] = useState('Customer Support');
  const [fileFormat, setFileFormat] = useState('JSONL');
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['All', 'Customer Support', 'E-commerce', 'Tool Use', 'General'];

  const filtered = datasets.filter((d) => {
    const matchesCat = activeCategory === 'All' || d.category === activeCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newDatasetName) return;
    setIsUploading(true);

    setTimeout(() => {
      const newDs = {
        id: `ds-${Date.now()}`,
        name: newDatasetName,
        description: newDatasetDesc || 'Curated benchmark test suite',
        category: newDatasetCategory,
        created: 'Just now',
        count: Math.floor(Math.random() * 50) + 50,
        status: 'Active'
      };
      setDatasets([newDs, ...datasets]);
      setNewDatasetName('');
      setNewDatasetDesc('');
      setIsUploading(false);
      setIsModalOpen(false);
      if (notify) {
        notify(`Dataset '${newDs.name}' created with ${newDs.count} test cases (${fileFormat})!`, 'success');
      }
    }, 500);
  };

  const handleImportClick = () => {
    if (notify) {
      notify('Ready to import: select a .jsonl or .csv dataset from disk', 'info');
    }
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      
      {/* ── Page Header Row ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Datasets
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Curate golden datasets, test scenarios, and regression suites.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={handleImportClick}
            style={{ padding: '8px 16px', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
            Import Dataset
          </button>
          <button 
            className="btn btn-primary btn-sm animate-button-float"
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '8px 18px', gap: '6px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            New Dataset
          </button>
        </div>
      </div>

      {/* ── 4 Quick Stats with Floating Glass Hover ───────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: 'folder', label: 'Total Datasets', val: `${datasets.length} Available`, color: '#8B5CF6' },
          { icon: 'view_list', label: 'Total Test Cases', val: '640 Scenarios', color: '#06B6D4' },
          { icon: 'check_circle', label: 'Evaluations Run', val: '142 Completed', color: '#10B981' },
          { icon: 'sync', label: 'Last Synced', val: '2 hours ago', color: '#F59E0B' },
        ].map((item, i) => (
          <div 
            key={i} 
            className="glass-card glass-card-hover glass-card-toplight" 
            style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>{item.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter Row ──────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search bar with Floating Focus */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--text-muted)' }}>
              search
            </span>
            <input 
              type="text" 
              placeholder="Filter by name, tags, description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input" 
              style={{ paddingLeft: '38px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px' }} 
            />
          </div>

          {/* Category Chips with Floating Lift */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`glass-pill ${activeCategory === cat ? 'badge-purple' : ''}`}
                onClick={() => setActiveCategory(cat)}
                style={{ 
                  fontSize: '12px', 
                  padding: '6px 14px', 
                  cursor: 'pointer',
                  fontWeight: activeCategory === cat ? 700 : 500
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Datasets Table ───────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <table className="glass-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>DATASET NAME</th>
              <th>DESCRIPTION & TEST CASES</th>
              <th>TAG / CATEGORY</th>
              <th>CREATED / UPDATED</th>
              <th style={{ textAlign: 'right', paddingRight: '24px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ds) => (
              <tr key={ds.id} className="glass-card-hover" style={{ cursor: 'pointer' }}>
                <td style={{ paddingLeft: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storage</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{ds.name}</div>
                      <div style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="pulse-dot" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                        {ds.count || 50} test cases
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ds.description}</div>
                </td>
                <td>
                  <span className={`glass-pill badge-${ds.category === 'Customer Support' ? 'teal' : ds.category === 'E-commerce' ? 'cyan' : ds.category === 'Tool Use' ? 'purple' : 'gray'}`} style={{ fontSize: '11px' }}>
                    {ds.category}
                  </span>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {ds.created}
                </td>
                <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRunEvalOnDataset) {
                          onRunEvalOnDataset(ds);
                        } else {
                          onNavigate('playground');
                        }
                      }}
                      style={{ fontSize: '11px', padding: '5px 12px', gap: '4px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#A78BFA' }}>play_arrow</span>
                      Run Eval
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (notify) notify(`Exported ${ds.name} to JSONL`, 'success');
                      }}
                      style={{ padding: '5px 8px' }}
                      title="Export dataset"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal for New Dataset with Floating Animations ───────────── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div 
            className="modal-floating" 
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '28px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7C3AED, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>add_box</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>Create New Dataset</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Dataset Name
                </label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="e.g. refund-v2-scenarios"
                  value={newDatasetName}
                  onChange={(e) => setNewDatasetName(e.target.value)}
                  required 
                />
              </div>

              {/* Format selection pills */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Dataset Format
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['JSONL', 'CSV', 'YAML'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFileFormat(fmt)}
                      className="glass-pill"
                      style={{
                        cursor: 'pointer',
                        background: fileFormat === fmt ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                        color: fileFormat === fmt ? '#FFFFFF' : 'var(--text-secondary)',
                        fontWeight: 600
                      }}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Category
                </label>
                <select 
                  className="glass-select"
                  value={newDatasetCategory}
                  onChange={(e) => setNewDatasetCategory(e.target.value)}
                  style={{ background: '#090D1A', cursor: 'pointer' }}
                >
                  <option value="Customer Support">Customer Support</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Tool Use">Tool Use</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea 
                  className="glass-textarea" 
                  rows="3"
                  placeholder="100 edge cases testing conversational recovery and tool invocation..."
                  value={newDatasetDesc}
                  onChange={(e) => setNewDatasetDesc(e.target.value)}
                />
              </div>

              {/* Drag & Drop Upload Zone with Floating Icon */}
              <div 
                style={{ 
                  border: '1.5px dashed rgba(139, 92, 246, 0.4)', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  textAlign: 'center',
                  background: 'rgba(124, 58, 237, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="glass-card-hover"
                onClick={() => {
                  if (notify) notify(`Sample test_cases.${fileFormat.toLowerCase()} staged for upload`, 'info');
                }}
              >
                <span className="material-symbols-outlined animate-float-soft" style={{ fontSize: '28px', color: '#A78BFA', display: 'block', margin: '0 auto 8px' }}>
                  cloud_upload
                </span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                  Drag & drop your {fileFormat} file here, or browse
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supports test cases with input, context, and expected ground truth
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="btn btn-primary btn-sm animate-button-float"
                  style={{ gap: '6px' }}
                >
                  {isUploading ? (
                    <>
                      <div className="spinner" style={{ width: '14px', height: '14px' }} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                      <span>Save & Create Dataset</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
