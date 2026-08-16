# Graph Report - .  (2026-07-26)

## Corpus Check
- Corpus is ~9,612 words - fits in a single context window. You may not need a graph.

## Summary
- 122 nodes · 179 edges · 11 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Build & Lint Configuration
- Main App Shell & Routing
- Dashboard & Status Cards
- Cell Monitoring UI
- Core App Dependencies
- Authentication & Login UI
- Package Setup & Scripts
- Module Alerts & Indicators
- Rack & Module Status

## God Nodes (most connected - your core abstractions)
1. `DashboardLayout()` - 8 edges
2. `scripts` - 5 edges
3. `HealthBadge()` - 4 edges
4. `StatCard()` - 4 edges
5. `Cells()` - 4 edges
6. `Logo()` - 3 edges
7. `Modules()` - 3 edges
8. `@tailwindcss/vite` - 2 edges
9. `react` - 2 edges
10. `react-dom` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (11 total, 0 thin omitted)

### Community 0 - "Build & Lint Configuration"
Cohesion: 0.11
Nodes (19): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+11 more)

### Community 1 - "Main App Shell & Routing"
Cohesion: 0.21
Nodes (9): App(), DashboardLayout(), Navbar(), Sidebar(), Alerts(), Dashboard(), History(), Settings() (+1 more)

### Community 2 - "Dashboard & Status Cards"
Cohesion: 0.20
Nodes (7): AlertCard(), ChartCard(), GaugeCard(), ProtectionCard(), QuickActionCard(), StatusCard(), TemperatureCard()

### Community 3 - "Cell Monitoring UI"
Cohesion: 0.22
Nodes (9): BalancingBadge(), CellCard(), HealthBadge(), ModuleSelector(), SensorCard(), Cells(), generateDummyCells(), generateDummySensors() (+1 more)

### Community 4 - "Core App Dependencies"
Cohesion: 0.15
Nodes (13): dependencies, react, react-dom, react-icons, react-router-dom, tailwindcss, @tailwindcss/vite, react (+5 more)

### Community 5 - "Authentication & Login UI"
Cohesion: 0.23
Nodes (6): InputField(), LoginForm(), Logo(), PasswordField(), PrimaryButton(), Login()

### Community 6 - "Package Setup & Scripts"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 7 - "Module Alerts & Indicators"
Cohesion: 0.33
Nodes (4): CommunicationBadge(), ImbalanceAlert(), TemperatureDisplay(), VoltageDisplay()

### Community 8 - "Rack & Module Status"
Cohesion: 0.31
Nodes (6): ModuleCard(), RackSelector(), StatCard(), generateDummyModules(), Modules(), RACKS

## Knowledge Gaps
- **25 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Build & Lint Configuration` to `Package Setup & Scripts`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Core App Dependencies` to `Package Setup & Scripts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `DashboardLayout()` connect `Main App Shell & Routing` to `Rack & Module Status`, `Dashboard & Status Cards`, `Cell Monitoring UI`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build & Lint Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._