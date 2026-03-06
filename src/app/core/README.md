# 🔒 Core Layer

The `core/` directory contains application-wide infrastructure that is **not tied to any specific feature**.

## Contents

| Directory / File | Description |
|-----------------|-------------|
| `guards/` | Route guards: `authGuard` (protects `/app/*`) and `publicGuard` (protects login/register when already logged in) |
| `interceptors/` | HTTP interceptor that attaches Bearer JWT to every request and transparently refreshes tokens on 401 |
| `layout/` | Shell layout components: `PublicLayout` (navbar + footer) and `Layout` (authenticated sidebar + topbar) |
| `models/` | Shared TypeScript interfaces for API response contracts |
| `services/` | Application-wide services (see below) |
| `state/` | `DashboardStateService` — signal-based global state for dashboard data |

## Key Services

| Service | Responsibility |
|---------|---------------|
| `AuthService` | Login, logout, register, token storage, token refresh |
| `GenericCrudService` | Typed `getAll / create / update / delete` wired to any REST endpoint |
| `GenericApiService` | Lower-level HTTP wrapper with generic response unwrapping |
| `ThemeService` | Light/dark mode toggle, persists to `localStorage` |
| `NotificationService` | Wraps PrimeNG `MessageService` with `success/error/warning/info` shortcuts |
| `IdleTimerService` | Monitors user inactivity and auto-logs out after a timeout |
| `SessionSyncService` | BroadcastChannel-based cross-tab session synchronisation |
| `ValidationService` | Reusable async validators (email taken, username taken) |
