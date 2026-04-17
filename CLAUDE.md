# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack TypeScript web application — аналог Atlassian Confluence. Пользователи могут создавать пространства (Spaces), организовывать страницы в иерархические деревья и управлять доступом через ролевую систему.

**Stack:** NestJS (backend) + React 19 + Vite (frontend) + PostgreSQL + Prisma ORM.

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

### Database

```bash
npx prisma migrate dev --name <name>   # Create and apply migration
npx prisma generate                    # Regenerate Prisma client
npx prisma studio                      # GUI for database
```

Prisma client генерируется в `backend/generated/prisma/` (не в `node_modules`). Импортировать из `../../generated/prisma` относительно `src/`.

## Backend Architecture

### Module structure (`backend/src/`)

```
src/
├── app.module.ts               # Root module — регистрирует все модули
├── main.ts                     # Bootstrap: ValidationPipe (whitelist), CORS, PORT
├── auth/                       # JWT аутентификация
│   ├── auth.module.ts
│   ├── auth.service.ts         # register / login / refresh
│   ├── auth.controller.ts      # POST /auth/register|login|refresh
│   ├── jwt.strategy.ts         # Passport JWT — validate() возвращает полный User из БД
│   └── dto/
│       ├── login.dto.ts        # email, password
│       ├── register.dto.ts     # username, email, password, birthDate
│       └── refresh.dto.ts      # refresh token
├── spaces/                     # Пространства
│   ├── spaces.module.ts
│   ├── spaces.service.ts       # CRUD + управление участниками + хелперы assertMember/assertAdminOrOwner
│   ├── spaces.controller.ts    # CRUD /spaces + /spaces/:key/members
│   └── dto/
│       ├── create-space.dto.ts # name, key (A-Z0-9, 2-10 символов), description?
│       ├── update-space.dto.ts # name?, description?, avatarUrl?
│       └── add-member.dto.ts   # userId, role (ADMIN|EDITOR|VIEWER)
├── pages/                      # Страницы (включая "папки" — страницы с дочерними)
│   ├── pages.module.ts         # imports: SpacesModule
│   ├── pages.service.ts        # CRUD + move + buildTree()
│   ├── pages.controller.ts     # /spaces/:key/pages + /:pageId + /:pageId/move
│   └── dto/
│       ├── create-page.dto.ts  # title, content?, parentId?, position?
│       ├── update-page.dto.ts  # title?, content?, position?
│       └── move-page.dto.ts    # parentId? (null = корень), position?
├── prisma/
│   ├── prisma.module.ts        # @Global() — экспортирует PrismaService везде
│   └── prisma.service.ts       # extends PrismaClient с @prisma/adapter-pg
└── common/
    ├── guards/
    │   └── jwt-auth.guard.ts       # JwtAuthGuard extends AuthGuard('jwt')
    ├── decorators/
    │   └── current-user.decorator.ts  # @CurrentUser() — достаёт request.user
    └── types/
        └── auth.types.ts           # interface AuthUser { id, email, username, role }
```

### Authentication flow

- JWT dual-token: **access** (короткоживущий, `JWT_ACCESS_SECRET`) + **refresh** (долгоживущий, `JWT_REFRESH_SECRET`)
- Refresh token хранится в БД (`User.refreshToken`) — при обновлении сверяется
- `JwtStrategy.validate()` возвращает полный объект `User` из Prisma → попадает в `request.user`
- Все защищённые эндпоинты используют `@UseGuards(JwtAuthGuard)` + `@CurrentUser() user: AuthUser`

### Authorization model

Роли работают на двух уровнях:

| Уровень | Поле | Значения |
|---------|------|----------|
| Глобальный | `User.role` | `ADMIN \| EDITOR \| VIEWER` |
| Пространство | `SpaceMember.role` | `ADMIN \| EDITOR \| VIEWER` |

Логика проверки доступа — в сервисах через private-хелперы:
- `assertMember` — проверяет, что пользователь участник пространства
- `assertAdminOrOwner` — owner пространства или участник с ролью ADMIN
- `assertEditor` — owner или участник с ролью EDITOR/ADMIN (не VIEWER)

### API endpoints

**Auth** (`/auth`)
- `POST /auth/register` — регистрация
- `POST /auth/login` — вход
- `POST /auth/refresh` — обновление токенов

**Spaces** (`/spaces`) — все защищены JwtAuthGuard
- `POST /spaces` — создать пространство (автор становится owner + ADMIN-участником)
- `GET /spaces` — мои пространства (owner или участник)
- `GET /spaces/:key` — детали пространства (участник)
- `PATCH /spaces/:key` — обновить (owner или ADMIN)
- `DELETE /spaces/:key` — удалить (только owner, cascade удаляет участников и страницы)
- `POST /spaces/:key/members` — добавить участника (owner/ADMIN)
- `DELETE /spaces/:key/members/:userId` — удалить участника (owner/ADMIN)

**Pages** (`/spaces/:key/pages`) — все защищены JwtAuthGuard
- `POST /spaces/:key/pages` — создать страницу (EDITOR+)
- `GET /spaces/:key/pages` — дерево страниц (VIEWER+)
- `GET /spaces/:key/pages/:pageId` — одна страница с прямыми дочерними (VIEWER+)
- `PATCH /spaces/:key/pages/:pageId` — обновить (EDITOR+)
- `DELETE /spaces/:key/pages/:pageId` — удалить (EDITOR+, cascade удаляет дочерние)
- `PATCH /spaces/:key/pages/:pageId/move` — переместить в другой parent / изменить позицию (EDITOR+)

### Database schema (`backend/prisma/schema.prisma`)

```
User ──< SpaceMember >── Space ──< Page
                                    │
                                    └─< Page (children, self-ref PageTree)
```

- `Space.key` — уникальный короткий идентификатор (`PROJ`, `TEAM`), используется в URL
- `Page.parentId` — nullable self-reference: `null` = корневая страница, иначе дочерняя ("папка" = страница с children)
- `Page.position` — порядок среди соседних страниц
- `Page.content` — JSON (TipTap/ProseMirror) или Markdown, nullable
- `SpaceMember` — join-table с `@@unique([spaceId, userId])`

## Frontend Architecture

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
