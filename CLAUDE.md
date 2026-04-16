# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack TypeScript web application with a NestJS backend and React 19 frontend. The project is in early development (skeleton stage).

## Commands

### Backend (`/backend`)

```bash
npm run start:dev     # Start with watch/auto-reload
npm run build         # Compile TypeScript to dist/
npm run lint          # ESLint with auto-fix
npm run format        # Prettier formatting
npm run test          # Run Jest unit tests
npm run test:watch    # Jest in watch mode
npm run test:cov      # Jest with coverage
npm run test:e2e      # End-to-end tests
```

### Frontend (`/frontend`)

```bash
npm run dev           # Start Vite dev server
npm run build         # TypeScript check + production build
npm run lint          # ESLint check
npm run preview       # Preview production build
```

## Architecture

### Backend

Minimal NestJS app at `backend/src/`. Entry point bootstraps on `process.env.PORT` or 3000. Currently just the app module scaffold — no domain modules yet.

### Frontend

Uses **Feature-Sliced Design (FSD)**:

- `app/` — router (React Router) and Redux store setup
- `pages/` — full-page components (auth: login/register, index)
- `shared/` — cross-cutting concerns:
  - `ui/` — Chakra UI wrappers (ChakraProvider, Field, tooltip, confirmDialog)
  - `api/` — auth API clients and token utilities
  - `types/` — shared TypeScript types (users, utility types)
  - `lib/` — shared utilities
- `features/`, `widgets/`, `entities/` — FSD layers (currently empty, populate as needed)

New code should follow FSD layering: `shared` → `entities` → `features` → `widgets` → `pages` → `app`. Lower layers must not import from higher layers.

## Code Style

Both frontend and backend use **4-space indentation** and **single quotes** (enforced by Prettier/ESLint).

### Import ordering (enforced by ESLint)
- **Frontend**: React imports → absolute (app/entities/features/pages/shared/widgets) → relative → styles
- **Backend**: Built-ins → external packages → internal → relative

Max line length: **140 characters** (frontend).

### TypeScript
- Strict mode enabled in both projects
- Frontend uses path aliases matching FSD layers: `@app`, `@pages`, `@shared`, etc. (configured in `vite.config.ts` and `tsconfig.app.json`)
- Backend enables decorators (`experimentalDecorators`, `emitDecoratorMetadata`) for NestJS
