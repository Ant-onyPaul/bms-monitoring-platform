# Shade Energy BMS Monitoring Platform

## 1. Project Overview
The Shade Energy Battery Management System (BMS) Monitoring Platform is a web-based dashboard application designed for monitoring and managing industrial-scale energy storage systems. The application provides an interface for admins, vendors, and end customers to monitor battery health, telemetrics (voltage, temperature), historical data, and system alerts at different levels of granularity (fleet, rack, module, and individual cell).

## 2. Technology Stack
The project currently utilizes the following technologies:
- **Frontend Framework**: React 19 (via Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, custom utility classes (`src/index.css`)
- **Routing**: React Router DOM (v7)
- **Icons**: `react-icons` (specifically Feather Icons - `Fi*`)
- **Charts**: Recharts
- **Authentication / Backend (Prepared)**: Supabase JS client (`@supabase/supabase-js`)

## 3. Application Architecture
The application follows a modular, component-based frontend architecture:
- **Pages** (`src/pages/`): Contains the main views organized by role (`admin/`, `vendor/`, `customer/`, and `shared/`).
- **Layouts** (`src/components/DashboardLayout.tsx`): The main shell of the app, composing the `Sidebar` and `Navbar`.
- **BMS Domain Components** (`src/components/bms/`): Deeply specific, domain-driven components representing actual battery hardware (e.g., `CellCard`, `ModuleCard`, `BmsOverview`, `RackSelector`).
- **Reusable UI Components** (`src/components/`): Generic components used across the app (e.g., `StatCard`, `DataTable`, `AlertCard`, `PrimaryButton`, `StatusBadge`).
- **Design System**: A strict "industrial off-white" and green aesthetic defined globally in `src/index.css`.

## 4. Authentication & Roles
Currently, the authentication uses a mock login flow that simulates Supabase authentication (`src/hooks/useAuth.tsx`).
- **Login Flow**: Users log in via `src/pages/Login.tsx`. The login is currently a mock simulation.
- **Roles**: The system supports `admin`, `vendor`, and `customer` roles.
- **Role Guards**: `src/components/RoleGuard.tsx` wraps components/routes to ensure users only see content authorized for their specific role.

## 5. Navigation & Routing
Routes are defined in `src/App.tsx`. 
The primary flow is: **Dashboard** → **Devices** → **Device Details (BMS Workspace)**

Current Routes:
- `/` - Redirects to login
- `/login` - Login page
- `/admin/dashboard` - Admin Dashboard
- `/admin/vendors` - Vendor Management
- `/admin/vendors/:id` - Vendor Details
- `/admin/customers` - Customer Management
- `/admin/customers/:id` - Customer Details
- `/admin/devices` - Global Device Management
- `/admin/devices/:id` - **Device Details (BMS Workspace)**
- `/vendor/dashboard` - Vendor Dashboard
- `/vendor/devices` - Vendor Devices
- `/vendor/customers` - Vendor Customers
- `/vendor/customers/:id` - Vendor's Customer Details
- `/customer/dashboard` - Customer Dashboard
- `/customer/devices` - Customer Devices

## 6. Admin Features
Admins have access to the highest level of fleet management.
- **Admin Dashboard**: Displays high-level stats (Total Vendors, Total Customers, Total Devices, Online Devices) and mock System Alerts / Recent Activity.
- **Vendor Management**: Lists all vendors with the ability to add a new vendor via the `AddVendorModal`.
- **Customer Management**: Lists all customers globally.
- **Device Management**: Lists all devices in the system.
- **Details Views**: Admins can drill down into specific vendors or customers to see associated entities.

## 7. Vendor Features
Vendors can manage their specific subset of customers and devices.
- **Vendor Dashboard**: Overview of the vendor's total customers, devices, online/offline status.
- **Vendor Customers**: Lists customers belonging to the vendor.
- **Vendor Devices**: Lists devices belonging to the vendor.

## 8. Customer Features
Customers have the most restricted view, only seeing their own devices.
- **Customer Dashboard**: Overview of their own devices (Total, Online, Offline).
- **Customer Devices**: Lists the specific devices owned by the customer.

## 9. Device Management
The Device listing (`DeviceManagement.tsx`) shows:
- **Table**: Displays Device Name, Serial Number, Owner, Status (Online/Offline/Warning), and Last Seen.
- **Interactions**: Clicking a row navigates to the Device Details workflow (`/admin/devices/:id`).

## 10. BMS Workspace (Device Details)
The Device Details page (`src/pages/shared/DeviceDetails.tsx`) serves as the core BMS Workspace. It utilizes a tabbed interface:
- **Overview**: High-level telemetry, gauges, and statuses.
- **Modules**: Rack-level drill-down showing individual battery modules.
- **Cells**: Module-level drill-down showing individual battery cells.
- **History**: Time-series charts showing voltage and temperature trends over time.
- **Alerts**: A historical list of alerts and faults associated with the device.

## 11. BMS Overview
Located in `BmsOverview.tsx`:
- **Statistics**: State of Charge (SoC), State of Health (SoH), Cycle Count, Core Temp.
- **Gauges / Visuals**: Utilizes `GaugeCard` (e.g., SoC ring), `TemperatureCard`, `ProtectionCard`, and `ChartCard` (sparklines).
- **Status Information**: Displays raw pack voltage, current, and overall system state.

## 12. Module Overview
Located in `ModuleOverview.tsx`:
- **Rack Selector**: A dropdown (`RackSelector.tsx`) to switch between different physical racks.
- **Stats**: Total, Healthy, Warning, and Offline/Fault modules.
- **Module Cards**: Dense grid of `ModuleCard` components showing voltage, temperature, delta V, health, and communication status.
- **Interactions**: Identifies and highlights the module with the highest voltage imbalance.

## 13. Cell Overview
Located in `CellOverview.tsx`:
- **Module Selector**: A dropdown (`ModuleSelector.tsx`) to switch between different modules within a rack.
- **Cell Grid**: A dense 52-cell grid (`CellCard.tsx`) designed as a "Voltage Map" for rapid pattern recognition.
- **Telemetry**: Highlights highest and lowest voltage cells automatically. Indicates active balancing states.
- **Sensors**: Displays `SensorCard` components for local NTC temperature probes.

## 14. History & Logs
Located in `BmsHistory.tsx`:
- **Charts**: Uses Recharts to display historical telemetry data.
- **Data handling**: Implements a time-series compression utility (`src/utils/timeSeries.ts`) to optimize rendering of dense historical data.
- **UI**: Presents the data in a "Bento grid" style layout.

## 15. Alerts
Located in `BmsAlerts.tsx`:
- **UI**: Lists recent alerts using the `AlertCard.tsx` component.
- **Severity**: Differentiates between Faults (critical, red), Warnings (yellow), and Info (green/neutral) events.

## 16. Vendor Management (Add Vendor)
Located in `VendorManagement.tsx` and `AddVendorModal.tsx`:
- **Form**: Takes Vendor Name and Email Address.
- **Generated Password**: Automatically generates a secure temporary password (e.g., `X7kP-9mQa-2LxT`) on mount. Admin cannot edit it.
- **Interactions**: Copy to clipboard button with "Copied" feedback. Regenerate button.
- **State Update**: Upon saving, a mock vendor is constructed, appended to the React state array, immediately rendered in the table, and a success banner is displayed.

## 17. UI/UX Design System
The platform utilizes a highly constrained, premium industrial aesthetic heavily inspired by high-end EV and energy products.
- **Colors**: "Industrial Off-White" surfaces (`bg-card`, `#ffffff`), dark charcoal text (`text-foreground`), and Shade Energy Green (`#10B981`) used strictly for active/healthy meaning or primary actions.
- **Typography**: `Inter` for general UI text; `JetBrains Mono` for telemetry and raw data. Implemented via `.label-technical` and `.data-technical` utility classes.
- **Layouts**: Data-dense "Bento" grids favoring organization and whitespace over decorative elements.
- **Surfaces**: Crisp borders, medium-to-small rounded corners (`rounded-md`, `rounded-xl`), and soft drop shadows. Glassmorphism was specifically removed in favor of solid contrast.
- **Dropdowns**: Styled as solid `bg-card` elements with borders and shadows, appearing above content (`z-50`).

## 18. Component Architecture
Major reusable components include:
- `StatCard`: Standardized metric display with an icon, title, and value.
- `DataTable`: Generic table component supporting custom accessors and row clicks.
- `AlertCard`: Reusable component for displaying fault/warning messages with severity colors.
- `StatusBadge`: Pill-shaped badge for displaying active/offline/warning states.
- `InputField` / `PasswordField`: Standardized form inputs with strict styling.
- `PrimaryButton`: Standardized action button.

## 19. Data & State
- **Mock Data**: Currently, almost all data is generated on the client-side via mock arrays or random generation functions (e.g., `generateDummyCells`, `generateDummyModules`).
- **Local State**: UI state (modals, dropdowns, active tabs) and current mock lists (like vendors) are managed via standard React `useState` and `useMemo`.
- **No Active Backend**: Despite the presence of `supabase.ts`, the application is currently operating purely on local mock data. Do NOT assume data is being fetched from a real database.

## 20. Known Limitations
- Data is entirely mocked. Forms (like Add Vendor) update local React state and will reset upon page refresh.
- Login is a simulation and accepts any credentials (bypassing real Auth).
- The `DashboardLayout` placeholder sections in `AdminDashboard` have been populated with mock arrays, but they do not reflect real system events.
- Device Details `/admin/devices/:id` does not currently read the `:id` parameter to fetch real data; it displays standard generated arrays.

## 21. Future Backend Integration
- **Supabase**: The project contains `src/lib/supabase.ts` configured for standard Supabase client initialization.
- **Hooks**: `src/hooks/useDeviceRealtime.ts` is stubbed out for future realtime WebSocket subscriptions.
- **Database Types**: `src/types/database.types.ts` exists to define the expected schema for Vendors, Customers, and Devices once the backend is hooked up.

## 22. User Flows
1. **Admin Add Vendor Flow**: 
   Login → Dashboard → Vendors → "Add Vendor" → Fill Name/Email → Copy generated password → Create Vendor → View new vendor in table.
2. **Device Troubleshooting Flow**:
   Dashboard → Devices → Click a Device row → Land on BMS Workspace (Overview) → Switch to "Modules" tab to find highest imbalance → Switch to "Cells" tab to view 52-cell voltage map and identify anomalous cells.

## 23. File/Folder Structure
```text
src/
├── assets/
├── components/          # Reusable UI elements (DataTable, StatCard, etc.)
│   ├── admin/           # Admin-specific components (AddVendorModal)
│   └── bms/             # Core BMS domain components (CellCard, ModuleCard, Overviews)
├── hooks/               # useAuth, useDeviceRealtime
├── lib/                 # supabase client
├── pages/               # Route components
│   ├── admin/           # Admin dashboard, vendor management, etc.
│   ├── customer/        # Customer views
│   ├── vendor/          # Vendor views
│   └── shared/          # Shared views (DeviceDetails)
├── types/               # TypeScript definitions
├── utils/               # Helper functions (timeSeries compression)
├── App.tsx              # Router setup
├── index.css            # Global Tailwind design tokens
└── main.tsx             # React mount point
```

## 24. Functional Requirements
- **FR1**: The system must authenticate users and enforce role-based access control (Admin, Vendor, Customer).
- **FR2**: Admins must be able to create vendors, generating secure temporary passwords automatically.
- **FR3**: Users must be able to view a list of devices authorized for their role.
- **FR4**: The system must provide a detailed BMS Workspace for individual devices, separated into Overview, Modules, Cells, History, and Alerts.
- **FR5**: Module and Cell views must allow filtering by Rack and Module respectively.

## 25. UI/UX Requirements
- **UI1**: The interface must adhere strictly to the "Industrial Off-White" design system.
- **UI2**: Telemetry and raw data must use `JetBrains Mono` monospace typography (`.data-technical`).
- **UI3**: The primary brand color (`#10B981`) must be used sparingly, primarily for healthy states and primary call-to-actions.
- **UI4**: Dropdowns, modals, and overlays must use solid, opaque backgrounds with clear borders to maintain contrast over dense data grids, avoiding glassmorphism.

## 26. Important Implementation Constraints
- **C1**: Do NOT change existing application routing (`src/App.tsx`).
- **C2**: Do NOT remove the mock data generation functions until a real backend is actively connected and verified.
- **C3**: Do NOT replace the strict global CSS variables in `src/index.css` with generic Tailwind themes. The custom styling is intentionally constrained.
- **C4**: Maintain the exact folder structure (`pages/`, `components/bms/`, etc.) for consistency.
