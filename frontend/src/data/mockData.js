// ═════════════════════════════════════════════════════════════════
// AGENTEVAL / RAVEN — COMPREHENSIVE MOCK & SEED DATA
// ═════════════════════════════════════════════════════════════════

export const MOCK_STATS = [
  {
    id: 'total_runs',
    label: 'Total Runs',
    value: '1,248',
    delta: '+12%',
    deltaType: 'up',
    icon: 'bar_chart',
    color: '#8B5CF6'
  },
  {
    id: 'task_success',
    label: 'Task Success',
    value: '87.4%',
    delta: '+2.1%',
    deltaType: 'up',
    icon: 'check_circle',
    color: '#10B981'
  },
  {
    id: 'avg_latency',
    label: 'Avg. Latency',
    value: '3.2s',
    delta: 'v 8%',
    deltaType: 'down',
    icon: 'bolt',
    color: '#06B6D4'
  },
  {
    id: 'total_cost',
    label: 'Total Cost',
    value: '$24.4',
    delta: '+16%',
    deltaType: 'up',
    icon: 'attach_money',
    color: '#F59E0B'
  }
];

export const MOCK_PERFORMANCE_TREND = [
  { date: 'Aug 20', taskSuccess: 72, toolAccuracy: 64, latency: 4.8 },
  { date: 'Aug 24', taskSuccess: 76, toolAccuracy: 69, latency: 4.2 },
  { date: 'Aug 28', taskSuccess: 81, toolAccuracy: 74, latency: 3.9 },
  { date: 'Sep 01', taskSuccess: 84, toolAccuracy: 78, latency: 3.5 },
  { date: 'Sep 04', taskSuccess: 86, toolAccuracy: 84, latency: 3.3 },
  { date: 'Sep 08', taskSuccess: 87.4, toolAccuracy: 88, latency: 3.2 },
];

export const MOCK_RECENT_EXPERIMENTS = [
  {
    id: 'exp-1',
    name: 'customer-support-v1.3.0',
    dataset: 'support-100',
    timeAgo: '2m ago',
    score: '87.4%',
    scoreType: 'success',
    agentVersion: 'v1.3.0',
    status: 'Completed'
  },
  {
    id: 'exp-2',
    name: 'refund-policy-test',
    dataset: 'edge-cases',
    timeAgo: '1h ago',
    score: '61.2%',
    scoreType: 'warning',
    agentVersion: 'v0.9.4',
    status: 'Completed'
  },
  {
    id: 'exp-3',
    name: 'tool-routing',
    dataset: 'tool-use',
    timeAgo: '3h ago',
    score: '92.1%',
    scoreType: 'success',
    agentVersion: 'v2.0.1',
    status: 'Completed'
  },
  {
    id: 'exp-4',
    name: 'fallback-handling',
    dataset: 'rag-bench',
    timeAgo: '5h ago',
    score: '78.3%',
    scoreType: 'warning',
    agentVersion: 'v1.1.0',
    status: 'Completed'
  }
];

export const MOCK_EXPERIMENT_DETAIL = {
  id: 'customer-support-v1.3.0',
  title: 'customer-support-v1.3.0',
  status: 'Completed',
  meta: 'Ran on Sep 13, 2026, 10:24 AM • support-100 • by Shashank',
  kpis: [
    { label: 'Task Success', value: '87.4%', delta: '+2.1%', type: 'up', color: '#8B5CF6', icon: 'task_alt' },
    { label: 'Tool Selection', value: '92.1%', delta: '+1.8%', type: 'up', color: '#06B6D4', icon: 'tune' },
    { label: 'Avg. Latency', value: '3.2s', delta: 'v 12%', type: 'down', color: '#F59E0B', icon: 'speed' },
    { label: 'Total Tokens', value: '48.2K', delta: '0%', type: 'neutral', color: '#6366F1', icon: 'token' }
  ],
  metricBreakdown: [
    { name: 'Task Success', score: 87.4, color: '#06B6D4' },
    { name: 'Tool Selection', score: 92.1, color: '#14B8A6' },
    { name: 'Tool Arguments', score: 86.3, color: '#38BDF8' },
    { name: 'Response Quality', score: 76.2, color: '#818CF8' },
    { name: 'Hallucination Rate', score: 4.1, color: '#EF4444', inverted: true }
  ],
  testCases: [
    { id: '001', input: 'Can I get a refund for my order?', expected: 'Correct refund eligibility', status: 'Success', latency: '2.1s' },
    { id: '002', input: 'Track my order #12345', expected: 'Provide tracking details', status: 'Success', latency: '3.2s' },
    { id: '003', input: 'I received a damaged item', expected: 'Correct return process', status: 'Failed', latency: '5.2s' },
    { id: '004', input: 'Do you ship internationally?', expected: 'Provide shipping regions', status: 'Success', latency: '2.4s' }
  ]
};

export const MOCK_TRACE_DATA = {
  title: 'Trace: Can I get a refund for my order?',
  status: 'Success',
  duration: '2.8s',
  cost: '$0.0042',
  steps: [
    {
      stepNumber: 1,
      type: 'User Input',
      timestamp: '0.0s',
      color: '#3B82F6',
      icon: 'person',
      summary: 'Can I get a refund for my order?',
      details: {
        role: 'user',
        tokens: 14,
        prompt: 'Can I get a refund for my order?'
      }
    },
    {
      stepNumber: 2,
      type: 'Agent Thought',
      timestamp: '0.8s',
      color: '#A855F7',
      icon: 'psychology',
      summary: 'Need to check the order details first...',
      details: {
        model: 'gpt-4o-mini',
        thought: 'The customer is inquiring about a refund for an unspecified order. I should check their most recent order details first using the customer ID in context to evaluate delivery date and refund eligibility before replying.'
      }
    },
    {
      stepNumber: 3,
      type: 'Tool Call',
      timestamp: '1.2s',
      color: '#10B981',
      icon: 'terminal',
      summary: 'get_order_details {"order_id": "12345"}',
      details: {
        function: 'get_order_details',
        arguments: {
          order_id: '12345',
          customer_id: 'CUST_99012N',
          include_shipment_logs: true
        }
      }
    },
    {
      stepNumber: 4,
      type: 'Tool Result',
      timestamp: '1.8s',
      color: '#06B6D4',
      icon: 'inventory_2',
      summary: 'Order found: #12345, Status: delivered, Date: Sep 10, 2026',
      details: {
        status_code: 200,
        payload: {
          order_id: '12345',
          status: 'delivered',
          delivered_at: '2026-09-10',
          items: [{ sku: 'PRD-AURORA-M1', qty: 1, price: 129.00 }],
          eligible_for_return: true
        }
      }
    },
    {
      stepNumber: 5,
      type: 'Agent Thought',
      timestamp: '2.1s',
      color: '#A855F7',
      icon: 'psychology',
      summary: 'The order was delivered. Check policy...',
      details: {
        thought: 'The order was delivered on Sep 10, 2026. Standard return policy window is 30 days. Current date is Sep 13, 2026. Customer is well within the return window. Formulate affirmative response and offer to begin refund.'
      }
    },
    {
      stepNumber: 6,
      type: 'Final Response',
      timestamp: '2.8s',
      color: '#10B981',
      icon: 'check_circle',
      summary: "Here's your refund eligibility...",
      details: {
        response: 'Your order #12345 was delivered on Sep 10, 2026. Based on our 30-day return policy, you are fully eligible for a complete refund. Would you like me to initiate the refund process right now?'
      }
    }
  ]
};

export const MOCK_COMPARE_DATA = {
  versions: [
    { id: 'v1', name: 'v1.2.1', label: 'Baseline', color: '#3B82F6', model: 'gpt-4o', samples: '500 runs' },
    { id: 'v2', name: 'v1.3.0', label: 'Current', color: '#8B5CF6', model: 'gpt-4o', samples: '500 runs' },
    { id: 'v3', name: 'v1.3.1', label: 'Experimental', color: '#F97316', model: 'ft:gpt-4o-mini', samples: '500 runs' }
  ],
  metrics: [
    { name: 'Task Success', v1: '82.1%', v2: '87.4%', v3: '88.6%', best: 'v3', delta: '+6.5% ↑' },
    { name: 'Tool Selection', v1: '89.3%', v2: '92.1%', v3: '91.0%', best: 'v2', delta: '+2.8% ↑' },
    { name: 'Tool Arguments', v1: '84.2%', v2: '88.3%', v3: '86.7%', best: 'v2', delta: '+4.1% ↑' },
    { name: 'Latency (s)', v1: '3.8s', v2: '3.2s', v3: '3.6s', best: 'v2', delta: '-0.6s ↓' },
    { name: 'Hallucination Rate', v1: '6.2%', v2: '4.1%', v3: '5.3%', best: 'v2', delta: '-2.1% ↓' },
    { name: 'Total Cost', v1: '$10.4', v2: '$12.4', v3: '$11.1', best: 'v1', delta: '+$0.7' }
  ],
  chartGroups: [
    { metric: 'Task Success', v1: 82.1, v2: 87.4, v3: 88.6 },
    { metric: 'Tool Selection', v1: 89.3, v2: 92.1, v3: 91.0 },
    { metric: 'Tool Arguments', v1: 84.2, v2: 88.3, v3: 86.7 },
    { metric: 'Latency (x20)', v1: 76.0, v2: 64.0, v3: 72.0 },
    { metric: 'Reliability', v1: 93.8, v2: 95.9, v3: 94.7 }
  ]
};

export const MOCK_DATASETS = [
  {
    id: 'support-100',
    name: 'support-100',
    description: '100 test cases • Customer support queries',
    category: 'Customer Support',
    categoryColor: 'teal',
    created: 'Sep 10, 2026',
    count: 100,
    status: 'Active'
  },
  {
    id: 'ecom-cases',
    name: 'ecom-cases',
    description: '250 test cases • E-commerce scenarios',
    category: 'E-commerce',
    categoryColor: 'cyan',
    created: 'Sep 5, 2026',
    count: 250,
    status: 'Active'
  },
  {
    id: 'tool-use',
    name: 'tool-use',
    description: '150 test cases • Tool calling scenarios',
    category: 'Tool Use',
    categoryColor: 'purple',
    created: 'Aug 28, 2026',
    count: 150,
    status: 'Active'
  },
  {
    id: 'edge-cases',
    name: 'edge-cases',
    description: '100 test cases • Adversarial & edge cases',
    category: 'General',
    categoryColor: 'gray',
    created: 'Aug 20, 2026',
    count: 100,
    status: 'Active'
  }
];

export const MOCK_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: 'gpt-4o, gpt-4o-mini',
    desc: 'Used for LLM evaluations',
    connected: true,
    logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M22.28 9.38a5.95 5.95 0 0 0-.48-4.8 6.03 6.03 0 0 0-6.19-2.92 6.02 6.02 0 0 0-4.87 2.5 6 6 0 0 0-5.74 3.32 6.03 6.03 0 0 0-3.32 5.74 6 6 0 0 0 2.5 4.87 6.03 6.03 0 0 0 2.92 6.19 6.02 6.02 0 0 0 5.8 0 6.02 6.02 0 0 0 4.87-2.5 6 6 0 0 0 5.74-3.32 6.03 6.03 0 0 0 3.32-5.74 6 6 0 0 0-2.5-4.87zM12 14.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>'
  },
  {
    id: 'google',
    name: 'Google',
    models: 'gemini-2.0-flash, text-embedding-004',
    desc: 'Used for embeddings & eval',
    connected: true,
    logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23EA4335" d="M12 5c1.5 0 2.9.5 4 1.5l3-3C17.1 1.7 14.7 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="%234285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/><path fill="%23FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/><path fill="%2334A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/></svg>'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: 'Claude 3.5 Sonnet',
    desc: 'Used for model evaluation',
    connected: false,
    logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D97706"><path d="M14.5 3h-5L2 21h5l1.6-4.5h6.8L17 21h5L14.5 3zm-4.7 10.5L12 7.2l2.2 6.3H9.8z"/></svg>'
  },
  {
    id: 'custom',
    name: 'Custom Models',
    models: 'Local endpoint: http://localhost:11434',
    desc: 'Use your own models (Ollama, vLLM, etc.)',
    connected: true,
    logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2306B6D4"><path d="M4 6h16v12H4zM2 4v16h20V4H2zm4 4h4v4H6zm6 0h6v2h-6zm0 4h6v2h-6z"/></svg>'
  }
];
