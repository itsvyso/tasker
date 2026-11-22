# Taske — Next-Gen Project & Task Management

A project and task management system built with React 19, TypeScript, Vite, and Tailwind CSS. Inspired by Di Smolskii's **Taske / Tasked** UI design system.

![Taske Banner](public/favicon.svg)

---

## ⚡ Key Highlights & Visual Architecture

1. **Aesthetic & Design System**
   - **Dark-mode Palette**: Deep dark theme canvas (`#090D17`, `#0E1424`), 1px frosted glass borders, glowing gradient accents (Neon Indigo `#6366F1`, Electric Cyan `#06B6D4`, Emerald `#10B981`, Amber `#F59E0B`, Rose `#F43F5E`).
   - **Plus Jakarta Sans Typography**: High-contrast, metric headers, and clean monospace task codes (`NOV-101`, `NEX-201`, `AIE-301`).

2. **Bento-Grid Dashboard Overview**
   - **Sprint Metrics**: Live velocity, completion percentage ring/bar, burned vs estimated hours, and urgent issue counters.
   - **Upcoming Sprint Deadlines**: Real-time sorted countdown with 1-click status completions.
   - **Team Workload Allocation**: Active workload meters per engineer/designer against 40h/wk standard capacity.
   - **Audit Activity Feed**: Chronological log of moves, comments, files, and completions.

3. **Multi-Perspective Workspace Views**
   - **Interactive Kanban Board**: 4 pipeline columns (`Backlog`, `In Progress`, `In Review`, `Done`) with HTML5 drag-and-drop, visual drop targets, subtask meters, and celebration confetti on completion.
   - **Dense Linear-Style Table**: Sortable columns (code, title, priority, status, assignee, due date, hours), checkbox selection, and batch actions (batch mark done, batch delete).
   - **Sprint Calendar**: Monthly calendar grid with day cells, priority chips, today indicator, and month navigation.
   - **Gantt & Timeline**: Duration bars spanning start dates to due dates across sprint weeks.
   - **Team Messenger**: Real-time team collaboration stream with presence indicators, quick reaction pills, and member directory.

4. **Contextual Side-Sheet Task Drawer**
   - In-place title & description editing.
   - Subtask checklist with live percentage progress bar and toggle.
   - Interactive comment discussions with author timestamps.
   - Asset attachments gallery with mock uploads.
   - Priority, status, due date, start date, and estimate controls.

5. **Keyboard Shortcuts & Power Tools**
   - `⌘K` or `Ctrl+K`: Global Quick Search / Command Palette.
   - `C`: Quick-create task modal dialog.
   - `ESC`: Dismiss any modal or slide-over drawer.
   - `localStorage` persistence with one-click **"Reset Demo State"** button.

---

## 🛠️ Tech Stack

- **React 19**
- **TypeScript 7**
- **Vite 8** + **@tailwindcss/vite**
- **Lucide React** (icons)
- **Canvas-Confetti** (celebration physics)
- **Vitest** + **@testing-library/react** (27 unit & integration tests)

---

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Run Automated Test Suite
```bash
npm test
```

### Build Production Bundle
```bash
npm run build
```
