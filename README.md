# Le Tourneur de Page

Application web/PWA intelligente de navigation et tournage de page, propulsee par IA.

## Concept

Le Tourneur de Page permet de visualiser et naviguer dans des documents (PDF, livres, partitions musicales, presentations) avec un systeme de tournage de page fluide et intelligent, controle par IA.

## Features

- **Tournage de page fluide** — Animations 3D page flip (Framer Motion)
- **Controle vocal** — "page suivante", "va au chapitre 3" (Web Speech API)
- **OCR intelligent** — Extraction de texte, resume, traduction (Gemini Flash)
- **Annotations IA** — Surlignage, notes automatiques, bookmarks
- **Mode partition** — Suit la musique, tourne automatiquement
- **PWA** — Fonctionne offline, mobile-first
- **Auto-pilot** — Mode presentation automatique avec timing configurable

## Architecture

```
Frontend (Next.js + Framer Motion)
  | REST + WebSocket
Backend API (FastAPI Python)
  |
  +-- Gemini Flash (OCR/NLP) [GRATUIT]
  +-- Ollama Local (resume)  [GRATUIT]
  +-- SQLite (metadata + annotations)
```

## Stack Technique

| Composant | Technologie | Raison |
|-----------|------------|--------|
| Frontend | Next.js 15 + React 19 | SSR, PWA support natif |
| Animations | Framer Motion | Page flip 3D fluide |
| PDF | PDF.js | Standard, offline |
| Voix | Web Speech API | Natif navigateur, 0 cout |
| Backend | FastAPI (Python) | Rapide, async, facile |
| IA - OCR | Gemini 2.5 Flash | Gratuit, 1500 req/jour |
| IA - Resume | Ollama (Llama 3.1 8B) | Local, gratuit, offline |
| DB | SQLite | Leger, self-hosted |
| Deploy | Self-hosted (ThinkPad) | Zero cout infrastructure |

## Structure du Projet

```
tourneur-de-page/
  frontend/          # Next.js app
    src/
      components/    # React components
      pages/         # Routes
      styles/        # CSS/Tailwind
      lib/           # Utilities
    public/          # Static assets
  backend/           # FastAPI server
    app/             # Main app
    routers/         # API routes
    services/        # Business logic (OCR, AI)
    models/          # Data models
    tests/           # Tests
  docs/              # Documentation
    architecture/    # Diagrammes
    specs/           # Specifications
  scripts/           # Build, deploy, dev scripts
```

## Equipe (Squid Fleet)

| Agent | Role | Emoji |
|-------|------|-------|
| Claude Code Sonnet | Chef de projet, architecte | :computer: |
| Architecte-Nuit | Architecture nocturne | :crescent_moon: |
| Codeur-Diurne | Developpement | :keyboard: |
| Inspecteur-Code | Review qualite | :microscope: |
| Diagrammeur | Schemas techniques | :bar_chart: |
| Neurochirurgien | Optimisation IA | :brain: |
| Infra | Deploiement | :gear: |
| Rapporteur-Chef | Rapports progression | :newspaper: |

## Coordination

- **Slack:** #proj-tourneur-de-page
- **GitHub:** prosomt-lab/tourneur-de-page
- **Dashboard:** http://localhost:7683 (tab Projets)

## Demarrage rapide

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## License

MIT
