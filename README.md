# 🦅 Raven / AgentEval — AI Agent Evaluation & Observability Platform

A state-of-the-art evaluation, observability, and benchmarking platform for autonomous AI agents. Built with a FastAPI backend and a glassmorphic React/Vite frontend.

---

## 🌟 Features

- **⚡ Automated Benchmarking Engine**: Evaluate agent responses, tool selections, and multi-turn trajectories with customizable scorers (Accuracy, Groundedness, Latency, Tool Call Validity).
- **🔬 Interactive Flamegraph Trace Viewer**: Inspect intermediate chain-of-thought, tool arguments, HTTP statuses, and step-by-step payloads in real-time.
- **📊 Multi-Version Comparative Analysis**: Side-by-side regression testing comparing baseline vs candidate versions across task success, latency, and cost.
- **🎮 Real-Time Testing Playground**: Experiment with live agent prompts, temperature sliders, model routers, and instant scenario execution.
- **📁 Dataset & Benchmark Management**: Curate golden evaluation datasets, import `.jsonl` / `.csv` / `.yaml` suites, and trigger regression runs.
- **🎨 Glassmorphic Dark UI**: Built with Plus Jakarta Sans, ambient purple aurora gradients, tactile floating micro-interactions, and responsive state feedback across 9 fully implemented screens.

---

## 🏗️ Architecture

```
raven/
├── backend/                  # FastAPI & SQLModel backend
│   ├── api.py               # REST API endpoints & evaluation routes
│   ├── database.py          # SQLite / PostgreSQL session handling
│   ├── models.py            # Pydantic & SQLModel schemas
│   ├── engine.py            # Evaluation & trajectory scoring logic
│   └── evaluators/          # Deterministic & LLM-as-a-judge scorers
├── frontend/                 # React (Vite) Glassmorphic Web App
│   ├── src/
│   │   ├── components/      # Header, Sidebar, Modals, ToastNotification
│   │   ├── pages/           # 9 complete view pages
│   │   ├── data/            # Mock telemetry & trace fixtures
│   │   └── index.css        # Design system tokens & floating animations
├── datasets/                 # Golden evaluation datasets & YAML benchmarks
├── docker-compose.yml        # Multi-container deployment setup
└── Dockerfile               # Backend container definition
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose

---

### 1. Backend Setup

```bash
# Create virtual environment and install dependencies
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Unix/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt # or uv sync

# Copy environment variables
cp .env.example .env

# Run FastAPI backend
uvicorn backend.api:app --reload --port 8000
```

The API docs will be available at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

```bash
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

### 3. Docker Deployment

```bash
docker-compose up --build
```

---

## 🧪 Running Tests

```bash
pytest tests/ -v
```

---

## 📜 License

MIT License © 2026 Raven / AgentEval Contributors.
