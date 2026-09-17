import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RunEvaluationModal from './components/RunEvaluationModal';
import ToastNotification from './components/ToastNotification';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import DashboardHome from './pages/DashboardHome';
import ExperimentDetailPage from './pages/ExperimentDetailPage';
import TraceViewerPage from './pages/TraceViewerPage';
import CompareExperimentsPage from './pages/CompareExperimentsPage';
import DatasetsPage from './pages/DatasetsPage';
import PlaygroundPage from './pages/PlaygroundPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  // Navigation state: 'landing' | 'signin' | 'dashboard' | 'experiments' | 'experiment_detail' | 'datasets' | 'evaluations' | 'trace' | 'compare' | 'playground' | 'settings'
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedExperimentId, setSelectedExperimentId] = useState('customer-support-v1.3.0');
  const [toast, setToast] = useState(null);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);

  const notify = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr && curr.message === message ? null : curr));
    }, 3800);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectExperiment = (id) => {
    setSelectedExperimentId(id);
    setCurrentView('experiment_detail');
  };

  const handleLaunchEvaluation = (runConfig) => {
    notify(`Evaluation run '${runConfig.name}' started successfully! Evaluating 250 cases on ${runConfig.model}...`, 'success');
    setSelectedExperimentId(runConfig.name);
    setCurrentView('experiment_detail');
  };

  // Determine if the current view is a standalone public page (no shell)
  const isPublicPage = currentView === 'landing' || currentView === 'signin';

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      
      {/* ── Ambient Aurora Glow Orbs in Background ──────────────────── */}
      <div className="ambient-aurora-bg">
        <div className="aurora-orb aurora-1" />
        <div className="aurora-orb aurora-2" />
        <div className="aurora-orb aurora-3" />
      </div>

      {/* ── Global Floating Toast Notification ───────────────────────── */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* ── Global Floating Run Evaluation Modal ────────────────────── */}
      <RunEvaluationModal 
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        onLaunch={handleLaunchEvaluation}
      />

      {/* ── Floating Screen Switcher Bar (Quick-Jump for Pair Programming) ── */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '14px', 
          right: '16px', 
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: 'rgba(8, 12, 24, 0.88)',
          backdropFilter: 'blur(20px)',
          borderRadius: '9999px',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#C084FC', padding: '0 4px' }}>
          Screens:
        </span>
        {[
          { id: 'landing', label: '1. Landing' },
          { id: 'signin', label: '2. Sign In' },
          { id: 'dashboard', label: '3. Home' },
          { id: 'experiment_detail', label: '4. Detail' },
          { id: 'trace', label: '5. Trace' },
          { id: 'compare', label: '6. Compare' },
          { id: 'datasets', label: '7. Datasets' },
          { id: 'playground', label: '8. Playground' },
          { id: 'settings', label: '9. Settings' }
        ].map((screen) => (
          <button
            key={screen.id}
            onClick={() => handleNavigate(screen.id)}
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              background: currentView === screen.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
              color: currentView === screen.id ? '#FFFFFF' : '#94A3B8',
              transition: 'all 0.15s ease'
            }}
          >
            {screen.label}
          </button>
        ))}
      </div>

      {/* ── Public Standalone Views ─────────────────────────────────── */}
      {currentView === 'landing' && (
        <LandingPage 
          onNavigate={handleNavigate} 
          notify={notify}
        />
      )}

      {currentView === 'signin' && (
        <SignInPage 
          onNavigate={handleNavigate} 
          onLogin={() => {
            notify('Welcome back, Shashank! Logged in successfully.', 'success');
            handleNavigate('dashboard');
          }} 
          notify={notify}
        />
      )}

      {/* ── Workspace Views (Wrapped in Sidebar & Header Shell) ─────── */}
      {!isPublicPage && (
        <div className="app-shell">
          <Sidebar 
            activeView={currentView} 
            onNavigate={handleNavigate} 
            onNewExperiment={() => setIsRunModalOpen(true)}
          />

          <main className="main-content">
            <Header 
              activeView={currentView} 
              onNavigate={handleNavigate} 
              onNewExperiment={() => setIsRunModalOpen(true)}
              notify={notify}
            />

            {currentView === 'dashboard' && (
              <DashboardHome 
                onNavigate={handleNavigate} 
                onSelectExperiment={handleSelectExperiment} 
                onNewExperiment={() => setIsRunModalOpen(true)}
                notify={notify}
              />
            )}

            {(currentView === 'experiments' || currentView === 'experiment_detail') && (
              <ExperimentDetailPage 
                experimentId={selectedExperimentId}
                onNavigate={handleNavigate} 
                onSelectTrace={() => handleNavigate('trace')}
                onNewExperiment={() => setIsRunModalOpen(true)}
                notify={notify}
              />
            )}

            {currentView === 'trace' && (
              <TraceViewerPage 
                onNavigate={handleNavigate} 
                notify={notify}
              />
            )}

            {currentView === 'compare' && (
              <CompareExperimentsPage 
                onNavigate={handleNavigate} 
                notify={notify}
              />
            )}

            {currentView === 'datasets' && (
              <DatasetsPage 
                onNavigate={handleNavigate} 
                onRunEvalOnDataset={() => setIsRunModalOpen(true)}
                notify={notify}
              />
            )}

            {currentView === 'playground' && (
              <PlaygroundPage 
                onNavigate={handleNavigate} 
                notify={notify}
              />
            )}

            {currentView === 'settings' && (
              <SettingsPage 
                onNavigate={handleNavigate} 
                notify={notify}
              />
            )}

            {currentView === 'evaluations' && (
              <DashboardHome 
                onNavigate={handleNavigate} 
                onSelectExperiment={handleSelectExperiment} 
                onNewExperiment={() => setIsRunModalOpen(true)}
                notify={notify}
              />
            )}
          </main>
        </div>
      )}

    </div>
  );
}
