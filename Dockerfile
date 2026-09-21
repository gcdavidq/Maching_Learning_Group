# ---------- 1. Compilar el frontend (React + Vite) ----------
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- 2. API + archivos estáticos ----------
FROM python:3.12-slim

# Usuario sin privilegios.
RUN useradd --create-home --uid 1000 usuario
WORKDIR /app

COPY requirements.txt pyproject.toml ./
COPY src/ src/
RUN pip install --no-cache-dir .

COPY app/ app/
COPY models/ models/
COPY --from=frontend /frontend/dist frontend/dist

USER usuario
# Render y otras plataformas inyectan PORT; 7860 es el valor local por defecto.
ENV PORT=7860
EXPOSE 7860
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
