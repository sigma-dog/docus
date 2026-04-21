---
paths:
    - 'frontend/src/*.{ts,tsx}'
---

# Architecture

- Use **Feature-Sliced Design (FSD)**
- Main approach: **pages-first**
- Do not mix architectural approaches

---

## Layers (must follow)

Hierarchy (top to bottom):
app → pages → widgets → features → entities → shared

### Dependency rules

- ✅ import only from **lower layers**
- ❌ do not import from higher layers
- ❌ no circular dependencies

---

## Layer responsibilities

### `app`

- global initialization
- routing
- providers (store, i18n, etc.)
- ❌ no business logic

---

### `pages`

- application pages
- contains **main page logic**
- each page = separate slice

---

### `widgets`

- large UI blocks
- used on pages
- no standalone business logic

---

### `features`

- user scenarios (use cases)
- isolated business logic
- must not depend on each other directly

---

### `entities`

- business entities (user, product, etc.)
- core data structure and logic

---

### `shared`

- reusable code without business meaning
- UI kit, utilities, configs

---

## Segments (common for all layers)

Each slice may contain:

- `ui` — components
- `model` — state and logic
- `api` — requests
- `lib` — utilities
- `config` — configuration

### UI segment rules

- В сегменте ui плоская структура.

- Вложенности разрешены только если существует практическая польза (улучшает читаемость, навигацию по коду).

- компоненты со стилями обязательно храним в отдельной папке.

- компоненты без стилей можно хранить на уровне сегмента Ui или в группирующей по смыслу папке.

- локальные переменные, типы (имя типа для пропсов компонента формируется следующим образом: ИмяКомпонентаProps) использующиеся только в одном компоненте объявляем в файле этого компонента в определенном порядке сверху вниз, сначала константы, потом типы, и в конце сам компонент.

- хуки, утилиты, которые используются в одном компоненте, располагаем рядом с файлом компонента, объединяя в директорию (по аналогии с файлом стилей); правила именования те же, что и в сегменте lib. Утилиты — в файле utils.ts, для каждого хука — отдельный файл (если для этих хуков или утилит нужны типы, константы, пишем рядом с ними). Если констант (не типов!) слишком много (код констант занимает 10 и более строк), выносим их в отдельный файл config.ts в той же директории.

- компоненты экспортируются с использованием export default только в случае когда компонент грузится “лениво” с помощью функции lazy(), в противном случае используется обычный именованный экспорт

### Lib segment rules

- Сегмент lib имеет плоскую структуру без папок

- lib/config.ts - общие константы для слайса (FSD-slice), константы, необходимые для одного файла сюда не выносятся

- lib/utils.ts - утилиты слайса (FSD-slice) которые используются в двух и более файлах

- Кастомные хуки слайса в плоском формате: lib/useSomeCustomLogic.ts, lib/useCustomHook.ts, хуки выносятся в сегмент lib только в случае использования в двух и более файлах, либо хук не привязан к конкретному ui компоненту и может быть вызван в любом Ui компоненте сегмента Ui

- Контекст, хук для контекста, типы контекста, провайдер, рендер функция (если это контекст для панели): lib/openTariffsContext.ts

- lib/types.ts типы используемые в разных файлах сегментов, необходимые для одного файла сюдане выносятся

---

## Pages-first approach

- All logic is created in `pages` by default
- Move code to other layers only if:
    - it is reused
    - it becomes complex
    - it represents standalone business logic

---

## Working with code

- ❌ do not refactor without a reason
- ✅ extend using the existing approach
- refactor only when necessary

---

## Constraints

- ❌ do not duplicate business logic
- ❌ do not create hidden dependencies between features
- ❌ do not extract code prematurely
