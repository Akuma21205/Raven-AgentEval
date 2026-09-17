FROM python:3.12-slim

WORKDIR /app

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first (layer cache)
COPY pyproject.toml uv.lock* ./

# Install all dependencies
RUN uv sync --no-dev --frozen

# Copy application code
COPY backend/ ./backend/
COPY datasets/ ./datasets/

# Expose FastAPI port
EXPOSE 8000

# Run with uvicorn
CMD ["uv", "run", "uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000"]
