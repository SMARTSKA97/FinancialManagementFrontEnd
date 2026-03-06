import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

export const BLOG_POSTS = [
  // ─── LATEST ─────────────────────────────────────────────────────────────────
  {
    id: 'dashboard-deep-insights',
    tag: 'v4.0.0',
    tagColor: '#38bdf8',
    title: 'v4.0.0 — Deep Insights Panel & Global Date Filtering',
    excerpt: 'The biggest dashboard release yet: an interactive Deep Insights panel with glass-morphic design, global month/year filtering, and an upgraded doughnut chart.',
    date: 'Mar 6, 2026',
    _dateValue: new Date('2026-03-06'),
    content: `
      <h2>What Ships in v4.0.0</h2>
      <p>Version 4.0.0 is the current stable release, with the version declared in both <code>environment.ts</code> (<code>appVersion: '4.0.0'</code>) on the frontend and <code>VersionPrefix: 4.0.0</code> in the backend API project. This release focused entirely on the Dashboard experience.</p>

      <h2>Deep Insights Panel</h2>
      <p>A new glass-morphic panel sits directly below the summary cards, powered by a single optimised backend endpoint (<code>GET /api/dashboard/insights</code>) that aggregates your entire transaction history in one query pass. Four analytical lenses are available via toggle buttons:</p>
      <ul>
        <li><strong>💰 Amount:</strong> Instantly surface the top 5 highest or lowest transactions. Click the same button again to flip the sort direction — no page reload, just Angular Signal reactivity.</li>
        <li><strong>📅 Timeline:</strong> See your 5 most recent or oldest recorded transactions — useful for confirming imports landed correctly.</li>
        <li><strong>🏷️ Category Extremes:</strong> Which spending categories have the highest or lowest maximum single transaction.</li>
        <li><strong>🏦 Account Extremes:</strong> Same power, scoped to your financial accounts.</li>
      </ul>

      <h2>Global Month/Year Selector</h2>
      <p>A single <code>p-datepicker</code> at the top of the Dashboard now controls all three data streams simultaneously: Summary Cards, Spending by Category Chart, and the Deep Insights panel. All endpoints accept optional <code>?startDate=&endDate=</code> parameters added in this release — omitting them returns all-time data.</p>

      <h2>Doughnut Chart Upgrade</h2>
      <p>The basic pie chart was replaced with a Chart.js doughnut chart (<code>cutout: '70%'</code>) with seven hardcoded hex colour slices (Blue, Purple, Teal, Orange, Pink, Cyan, Indigo), lighter hover variants, <code>borderRadius: 6</code> rounded edges, animated entry, right-aligned legend, and theme-aware tooltips. Chart options are initialised in <code>ngOnInit</code> with a 50ms delay to ensure CSS variable resolution is complete before Chart.js reads colours.</p>

      <h2>Bulk Excel Transaction Add</h2>
      <p>Also ships in v4.0.0: the interactive Bulk Transaction Add page — an HTML table styled like a spreadsheet with sticky column headers, per-row validation, account/category auto-complete, Transfer type support (adds a Destination Account column dynamically), Excel/CSV import, and partial-save logic so valid rows persist even if individual rows fail.</p>
    `
  },
  {
    id: 'master-budget',
    tag: 'Guide',
    tagColor: '#10b981',
    title: '5 Steps to Master Your Monthly Budget',
    excerpt: 'Learn practical budgeting techniques that actually stick — from auditing last month to the 5-minute monthly review ritual.',
    date: 'Mar 1, 2026',
    _dateValue: new Date('2026-03-01'),
    content: `
      <h2>Why Most Budgets Fail</h2>
      <p>Most people abandon a budget within two weeks — not from lack of discipline, but because the budget wasn't connected to real spending data. Financial Planner is built to close that gap by making your actual numbers visible and actionable.</p>

      <h2>Step 1: Audit Last Month First</h2>
      <p>Open the Dashboard, set the Month/Year filter to last month, and look at the Spending by Category doughnut chart. Note the three biggest slices — those are your starting points. Never build a budget without knowing where money actually went first.</p>

      <h2>Step 2: Bucket Into Needs, Wants, Savings (50/30/20)</h2>
      <ul>
        <li><strong>50% Needs:</strong> Rent, groceries, utilities, transport, insurance.</li>
        <li><strong>30% Wants:</strong> Dining out, entertainment, subscriptions, holidays.</li>
        <li><strong>20% Savings/Investments:</strong> Emergency fund, retirement, investments.</li>
      </ul>

      <h2>Step 3: Build an Emergency Cushion First</h2>
      <p>Create a dedicated Savings account and record all transfers to it as Transfer transactions (not Expenses) so they don't inflate your expense totals. Target: 3–6 months of essential expenses.</p>

      <h2>Step 4: Log Every Transaction — Even Small Ones</h2>
      <p>Use Bulk Transaction Add to log a week's worth in one sitting. Small frequent purchases become visible on the Dashboard chart — and seeing them is often enough to change the habit.</p>

      <h2>Step 5: Review on the 1st of Every Month</h2>
      <ol>
        <li>Did total expenses exceed total income?</li>
        <li>Did any savings transfer happen?</li>
        <li>What is the single largest "Want" category that could be trimmed?</li>
      </ol>
      <p>The Dashboard date filter makes this monthly ritual take under five minutes.</p>
    `
  },
  {
    id: 'bulk-excel-transactions',
    tag: 'Feature',
    tagColor: '#0ea5e9',
    title: 'Bulk Transaction Add: Excel-Like Mass Entry',
    excerpt: 'Replacing one-by-one form entry with a full interactive grid — import, validate, auto-suggest, and save dozens of transactions at once.',
    date: 'Feb 25, 2026',
    _dateValue: new Date('2026-02-25'),
    content: `
      <h2>Motivation</h2>
      <p>Adding transactions one form at a time is painful when catching up on a week of expenses or returning from a trip. The Bulk Transaction Add page removes all of that friction.</p>

      <h2>The Grid Layout</h2>
      <p>Each row in the HTML grid is a pending transaction with columns for Date, Account, Category, Type, Amount, and Description — styled to look and feel like Excel. When the Transfer type is selected, a Destination Account column appears dynamically on that row only.</p>

      <h2>Excel/CSV Import</h2>
      <p>Users with exported bank statements can upload an <code>.xlsx</code> or <code>.csv</code> file. The parser maps column headers to grid fields, pre-populates all rows, and runs instant validation — giving a clear preview before committing.</p>

      <h2>Row-Level Status Indicators</h2>
      <ul>
        <li>🟢 Green check — valid and ready.</li>
        <li>🟡 Yellow triangle — missing required fields.</li>
        <li>🔴 Red circle — backend rejected this row.</li>
        <li>🔵 Blue spinner — currently saving.</li>
      </ul>
      <p>The Save action runs each valid row in parallel. Failed rows remain editable and highlighted — valid rows have already been persisted so you never lose progress.</p>

      <h2>Sticky Column Headers</h2>
      <p>Headers use <code>position: sticky; top: 0; z-index: 20</code> with a fully opaque background so column labels stay fixed and legible while data rows scroll underneath — identical to a frozen header row in Excel.</p>
    `
  },
  {
    id: 'master-record-manager',
    tag: 'Feature',
    tagColor: '#10b981',
    title: 'Master Record Manager: Soft Delete, Toggles & Audit Logging',
    excerpt: 'Per-record saves, active/inactive toggles, soft delete with is_deleted, and smarter audit logging that only writes when data actually changes.',
    date: 'Feb 25, 2026',
    _dateValue: new Date('2026-02-25'),
    content: `
      <h2>The Problem with Bulk Save</h2>
      <p>The original design queued all edits for a manual "Update on Server" click — slow, confusing, and error-prone. The new design removes that button entirely. Every single action fires its own immediate API call with instant row-level feedback.</p>

      <h2>Individual Record Updates</h2>
      <ul>
        <li><strong>Inline edit:</strong> Fires on blur from the edited cell.</li>
        <li><strong>Active/Inactive toggle:</strong> Fires immediately on toggle click.</li>
        <li><strong>Delete:</strong> Fires immediately after a confirmation prompt.</li>
      </ul>

      <h2>Soft Delete (is_deleted)</h2>
      <p>Deleting a record sets <code>is_deleted = true</code> rather than physically removing it. Historical transactions that referenced the record remain valid. Records can be recovered by an administrator. The migration scripts were updated to add both <code>is_active</code> and <code>is_deleted</code> columns with sensible defaults.</p>

      <h2>Audit Log Efficiency</h2>
      <p>The upsert stored procedure now compares incoming values against the current row and only writes an audit record when at least one field actually changed — preventing duplicate noise from no-op updates.</p>
    `
  },
  {
    id: 'categories-pro',
    tag: 'Tips',
    tagColor: '#818cf8',
    title: 'How to Categorize Transactions Like a Pro',
    excerpt: 'Granular categories unlock the full power of the Dashboard doughnut chart — here is how to structure them for maximum insight.',
    date: 'Feb 20, 2026',
    _dateValue: new Date('2026-02-20'),
    content: `
      <h2>Two Category Systems</h2>
      <ul>
        <li><strong>Transaction Categories:</strong> Where money went (Dining Out, Groceries, Fuel, Salary, Subscriptions).</li>
        <li><strong>Account Categories:</strong> What kind of container holds the money (Current Account, Savings, Credit Card, Cash, Investment).</li>
      </ul>

      <h2>The Transfer Category Trick</h2>
      <p>Record inter-account movements as <strong>Transfer</strong> transactions — not Expenses. Financial Planner creates two linked entries (debit + credit) and excludes both from the "Total Expenses" dashboard card. This prevents artificially inflating your expense totals every time you top up your savings account.</p>

      <h2>Pro Tips</h2>
      <ul>
        <li><strong>Naming conventions:</strong> "Food › Dining Out" and "Food › Groceries" create implicit groupings without needing a formal sub-category system.</li>
        <li><strong>One-Off category:</strong> Tag unusual non-recurring expenses (car repair, holiday) as One-Off to prevent them from skewing your monthly averages.</li>
        <li><strong>Quarterly review:</strong> Rename vague categories and re-tag historical transactions periodically for cleaner charts.</li>
      </ul>
    `
  },
  {
    id: 'jwt-otp-guide',
    tag: 'Security',
    tagColor: '#ef4444',
    title: 'Why We Use JWT + OTP Authentication',
    excerpt: 'A plain-English explanation of how HTTP-Only cookies, refresh token rotation, and email OTP keep your financial data safe.',
    date: 'Feb 15, 2026',
    _dateValue: new Date('2026-02-15'),
    content: `
      <h2>The Threat Model</h2>
      <p>Financial data is among the most sensitive personal information a web app can handle. Our authentication system was designed with three primary threats in mind: stolen passwords, Cross-Site Scripting (XSS token theft), and abandoned sessions on shared devices.</p>

      <h2>JWT + Refresh Token Architecture</h2>
      <ul>
        <li><strong>Short-lived Access Token (JWT):</strong> Expires quickly — limits damage if intercepted.</li>
        <li><strong>Long-lived Refresh Token:</strong> 32 cryptographic random bytes, stored in PostgreSQL. Automatically rotated on every use.</li>
        <li><strong>One token per IP:</strong> Only one active refresh token per device IP is permitted — a new token from the same IP removes the old one.</li>
      </ul>

      <h2>Email OTP for Registration & Password Reset</h2>
      <p>All OTPs are generated via <code>RandomNumberGenerator.GetInt32()</code> (cryptographically secure), stored in Redis with a 10-minute TTL, and immediately deleted after successful use. The password reset flow never confirms whether an email exists (prevents enumeration attacks).</p>

      <h2>Idle Timeout & Cross-Tab Sync</h2>
      <p>The <code>IdleTimerService</code> auto-logs out after inactivity. The <code>SessionSyncService</code> uses the native <code>BroadcastChannel API</code> to sync logout events across all open browser tabs instantly.</p>
    `
  },
  {
    id: 'account-management',
    tag: 'Guide',
    tagColor: '#f59e0b',
    title: 'Managing Multiple Accounts in Financial Planner',
    excerpt: 'Bank accounts, wallets, credit cards — here is how to structure multiple accounts for maximum clarity and accurate balance tracking.',
    date: 'Feb 10, 2026',
    _dateValue: new Date('2026-02-10'),
    content: `
      <h2>The Account Model</h2>
      <p>An Account represents any financial container — bank account, digital wallet, cash envelope, credit card, or investment portfolio. The platform is intentionally agnostic to the institution; it cares only that you want to track the balance inside.</p>

      <h2>Setting an Opening Balance</h2>
      <p>When creating a new account, enter its real-world balance at that moment. Every transaction recorded thereafter adjusts this mathematically — Financial Planner never guesses your balance.</p>

      <h2>Inter-Account Transfers</h2>
      <p>Paying off a credit card from your current account? Record it as a Transfer transaction. Two linked entries are created (debit from source, credit to destination) and both are excluded from your expense totals — so your Dashboard always shows money that actually left your possession, not self-directed movements.</p>
    `
  },
  {
    id: 'glassmorphism-ui',
    tag: 'Update',
    tagColor: '#f59e0b',
    title: 'Glassmorphism UI & Dark Mode: The Visual Overhaul',
    excerpt: 'How the public site, authenticated app, and every component were redesigned with a glass aesthetic and seamless light/dark mode switching.',
    date: 'Oct 6, 2025',
    _dateValue: new Date('2025-10-06'),
    content: `
      <h2>Glassmorphism Design Language</h2>
      <ul>
        <li><code>.glass-card</code>: <code>backdrop-filter: blur(24px)</code>, semi-transparent background, 1px semi-opaque border.</li>
        <li><code>.block-orbs</code>: Three slow-drifting animated gradient blobs for depth without distraction.</li>
        <li><code>.gradient-text</code>: App logo and accent headings use a green-to-sky-blue CSS gradient clip effect.</li>
      </ul>

      <h2>Light & Dark Mode</h2>
      <p>The <code>ThemeService</code> toggles PrimeNG's stylesheet between <code>lara-light-blue</code> and <code>lara-dark-blue</code> and persists the choice to <code>localStorage</code>. All custom CSS tokens update immediately — ensuring every UI primitive follows the active theme automatically.</p>

      <h2>Public Site</h2>
      <p>The public site at <code>/</code> (Home, Features, Blog, About, Contact) shares the same design system with a sticky frosted-glass navigation header, animated orb backgrounds, and glass cards.</p>
    `
  },
  {
    id: 'auth-system',
    tag: 'Security',
    tagColor: '#ef4444',
    title: 'Auth System Deep Dive: OTP Registration, JWT & Refresh Token Rotation',
    excerpt: 'A full breakdown of the two-step OTP-verified registration, concurrent session detection, refresh token rotation, and the complete forgot/reset password flow.',
    date: 'Oct 4, 2025',
    _dateValue: new Date('2025-10-04'),
    content: `
      <h2>Two-Step OTP Registration</h2>
      <ol>
        <li><strong>Initiate:</strong> User submits credentials. The server stores the payload in <strong>Redis with a 10-minute TTL</strong> and sends a 6-digit OTP to the email address.</li>
        <li><strong>Verify:</strong> The user enters the OTP. Server validates it, retrieves the cached payload, creates the user via ASP.NET Core Identity, sets <code>EmailConfirmed = true</code>, and deletes the Redis keys.</li>
      </ol>

      <h2>Login & Concurrent Session Detection</h2>
      <p>Every login checks <code>user.CurrentSessionId</code>. If a session is already active and <code>ForceLogin</code> is false, the API returns a <code>Auth.ConcurrentLogin</code> error. The frontend prompts: <em>"You are already logged in on another device. Do you want to continue here?"</em></p>

      <h2>Refresh Token Rotation</h2>
      <p>On every token refresh: the old token is immediately revoked, a new token is issued, all expired tokens are pruned, and one-token-per-IP is enforced.</p>

      <h2>Forgot Password Flow</h2>
      <ol>
        <li>User submits email → 6-digit OTP stored in Redis with 10-minute TTL → styled HTML email dispatched.</li>
        <li>User enters OTP → validated against Redis.</li>
        <li>User enters new password → hashed and saved via <code>UserManager.ResetPasswordAsync()</code> → Redis key deleted to prevent replay.</li>
      </ol>
      <p>The API never reveals whether an email exists — preventing enumeration attacks.</p>
    `
  },
  {
    id: 'accounts-categories',
    tag: 'Feature',
    tagColor: '#10b981',
    title: 'Accounts & Categories: Structuring Your Financial World',
    excerpt: 'How the account and category systems work — and the elegant generic patterns that power them without code duplication.',
    date: 'Oct 4, 2025',
    _dateValue: new Date('2025-10-04'),
    content: `
      <h2>Account Categories & Accounts</h2>
      <p>Users first create <strong>Account Categories</strong> (Current Account, Savings, Credit Card, Cash Wallet, etc.), then create <strong>Accounts</strong> assigned to those categories. Every Account stores a live <code>Balance</code> that the <code>TransactionService</code> adjusts automatically on every create, update, and delete.</p>

      <h2>The ResourcePage Pattern</h2>
      <p>Rather than creating a separate list, create, edit, and delete page for every entity, a single reusable <code>ResourcePage</code> component accepts configuration via Angular's route <code>data</code> property. One component handles Accounts, Account Categories, and Transaction Categories — saving hundreds of lines of duplicated view code.</p>

      <h2>Generic CRUD Service</h2>
      <p>The <code>GenericCrudService</code> provides typed <code>getAll()</code>, <code>create()</code>, <code>update()</code>, and <code>delete()</code> methods wired to any REST endpoint string. All list pages share this single service — no duplicated HTTP logic.</p>
    `
  },
  {
    id: 'project-genesis',
    tag: 'Architecture',
    tagColor: '#64748b',
    title: 'Project Genesis: The Technology Blueprint',
    excerpt: 'Before any feature was built, we designed the data model, chose the stack, and locked in Clean Architecture as the structural foundation.',
    date: 'Sep 25, 2025',
    _dateValue: new Date('2025-09-25'),
    content: `
      <h2>The Stack</h2>
      <p>Financial Planner runs on <strong>Angular 18+</strong> (Standalone Components, Signals, OnPush) on the frontend and <strong>ASP.NET Core (.NET 10)</strong> with Clean Architecture on the backend. PostgreSQL is the primary data store, Redis handles ephemeral data (OTPs, pending registrations) with automatic TTL expiry. Current version across both projects: <strong>4.0.0</strong>.</p>

      <h2>Clean Architecture Layers</h2>
      <ul>
        <li><strong>Domain:</strong> Pure C# entities — no framework dependencies.</li>
        <li><strong>Application:</strong> Service interfaces, business logic, DTOs, validators.</li>
        <li><strong>Infrastructure:</strong> EF Core, email, Redis.</li>
        <li><strong>Presentation:</strong> ASP.NET Core controllers — thin HTTP orchestration only.</li>
      </ul>

      <h2>Frontend Principles</h2>
      <ul>
        <li>Standalone components everywhere — no NgModules.</li>
        <li>Signals for all state — no <code>BehaviorSubject</code> in components.</li>
        <li><code>OnPush</code> change detection on every component.</li>
        <li>Fully <strong>lazy-loaded routes</strong> — every feature loads on demand via <code>loadComponent()</code>.</li>
        <li><strong>GenericCrudService</strong> — one typed service handles CRUD for any entity.</li>
        <li><strong>ResourcePage</strong> — one generic list component driven by route <code>data</code> config.</li>
      </ul>
    `
  }
];

@Component({
  selector: 'app-blog',
  imports: [RouterLink],
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class Blog {
  sortAscending = signal(false); // default: newest first (descending)

  sortedPosts = computed(() => {
    const asc = this.sortAscending();
    return [...BLOG_POSTS].sort((a, b) =>
      asc
        ? a._dateValue.getTime() - b._dateValue.getTime()
        : b._dateValue.getTime() - a._dateValue.getTime()
    );
  });

  toggleSort(): void {
    this.sortAscending.update(v => !v);
  }
}
