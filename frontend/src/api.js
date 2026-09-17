import { MOCK_RECENT_EXPERIMENTS, MOCK_EXPERIMENT_DETAIL, MOCK_DATASETS, MOCK_COMPARE_DATA } from './data/mockData';

const BASE = '/api';

async function req(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || res.statusText);
    }
    return await res.json();
  } catch (error) {
    console.warn(`API call to ${path} failed, using local/mock fallback:`, error.message);
    throw error;
  }
}

export const api = {
  health: () => req('/health').catch(() => ({ status: 'local' })),

  listRuns: async () => {
    try {
      const runs = await req('/runs');
      if (Array.isArray(runs) && runs.length > 0) return runs;
      return MOCK_RECENT_EXPERIMENTS;
    } catch {
      return MOCK_RECENT_EXPERIMENTS;
    }
  },

  getRun: async (id) => {
    try {
      return await req(`/runs/${id}`);
    } catch {
      return MOCK_EXPERIMENT_DETAIL;
    }
  },

  evaluate: async (body) => {
    return req('/evaluate', { method: 'POST', body: JSON.stringify(body) });
  },

  listDatasets: async () => {
    try {
      const list = await req('/datasets');
      if (Array.isArray(list) && list.length > 0) return list;
      return MOCK_DATASETS.map(d => d.name);
    } catch {
      return MOCK_DATASETS.map(d => d.name);
    }
  },

  getDataset: async (name) => {
    try {
      return await req(`/datasets/${name}`);
    } catch {
      const found = MOCK_DATASETS.find(d => d.name === name);
      return found || { name, test_case_count: 100, test_case_ids: [] };
    }
  },

  compare: async (body) => {
    try {
      return await req('/compare', { method: 'POST', body: JSON.stringify(body) });
    } catch {
      return MOCK_COMPARE_DATA;
    }
  }
};
