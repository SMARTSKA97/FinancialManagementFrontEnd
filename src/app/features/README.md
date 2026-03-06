# 📄 Features

Each subdirectory in `features/` represents a **domain area** of the application. All components are standalone (no NgModules).

## Structure

```
features/
├── public/              # Unauthenticated public site (PublicLayout)
│   ├── home/            # Landing / hero page
│   ├── features/        # Feature overview page
│   ├── blog/            # Blog post listing
│   ├── blog-post/       # Individual blog article (routed by /blog/:id)
│   ├── about/           # About page
│   └── contact/         # Contact / feedback form (public)
│
├── auth/                # Auth recovery flows (under public routes)
│   ├── change-password/ # Change password (authenticated users)
│   ├── forgot-password/ # Step 1 of password recovery
│   └── reset-password/  # Step 2 — enter OTP + new password
│
├── login/               # Login page component
├── register/            # Registration with 2-step OTP verification
│
├── dashboard/           # Main dashboard (summary cards, doughnut chart, deep insights)
├── accounts/            # Account list (ResourcePage) + AccountForm
├── categories/          # CategoryForm (reused for transaction & account categories)
├── transactions/
│   ├── transaction-list/      # Per-account transaction history view
│   └── bulk-transaction-add/  # Excel-like bulk entry grid with row validation
│
├── settings/            # Settings hub page
├── support/             # Support / feedback form (authenticated users)
└── shared/              # ResourcePage + DataTable generic components
```

## Routing Convention

- `/` → PublicLayout children
- `/app/*` → authenticated Layout children (protected by `authGuard`)
- `/login`, `/register`, `/forgot-password` → protected by `publicGuard`

## Component Conventions

- All components use `ChangeDetectionStrategy.OnPush`
- All signals declared with `signal()` / `computed()`, no `BehaviorSubject`
- Template control flow uses `@if`, `@for`, `@switch` (Angular 17+ native syntax)
- No `ngClass` or `ngStyle` — use `[class.*]` / `[style.*]` bindings
