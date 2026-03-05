import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout/layout';
import { publicGuard } from './core/guards/public-guard';
import { authGuard } from './core/guards/auth-guard';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { ResourcePage } from './features/shared/resource-page/resource-page';
import { AccountForm } from './features/accounts/account-form/account-form';
import { TransactionList } from './features/transactions/transaction-list/transaction-list';
import { CategoryForm } from './features/categories/category-form/category-form';
import { Support } from './features/support/support';
import { ColumnDefinition } from './shared/components/data-table/data-table';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { ChangePasswordComponent } from './features/auth/change-password/change-password.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

import { PublicLayout } from './core/layout/public-layout/public-layout';
import { Home } from './features/public/home/home';
import { Features } from './features/public/features/features';
import { Pricing } from './features/public/pricing/pricing';
import { About } from './features/public/about/about';
import { Blog } from './features/public/blog/blog';
import { Contact } from './features/public/contact/contact';
import { Settings } from './features/settings/settings/settings';


// --- Column Definitions ---
const accountColumns: ColumnDefinition[] = [
  { field: 'name', header: 'Name', isLink: true, linkPath: '/app/accounts/:id/transactions' },
  { field: 'accountCategoryName', header: 'Category' },
  { field: 'balance', header: 'Balance', isCurrency: true },
];
const categoryColumns: ColumnDefinition[] = [
  { field: 'name', header: 'Name' }
];

// --- Final Application Routes ---
export const routes: Routes = [
  // Auth pages (no layout)
  { path: 'login', component: Login, canActivate: [publicGuard] },
  { path: 'register', component: Register, canActivate: [publicGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [publicGuard] },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Public pages (PublicLayout with navbar + footer)
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home, pathMatch: 'full' },
      { path: 'features', component: Features },
      { path: 'pricing', component: Pricing },
      { path: 'about', component: About },
      { path: 'blog', component: Blog },
      { path: 'contact', component: Contact }
    ]
  },

  // Authenticated pages (Dashboard Layout with sidebar)
  {
    path: 'app',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'accounts',
        component: ResourcePage,
        data: {
          title: 'Accounts',
          endpoint: 'Accounts',
          columns: accountColumns,
          formComponent: AccountForm
        }
      },
      {
        path: 'accounts/:id/transactions',
        component: TransactionList,
      },
      {
        path: 'account-categories',
        component: ResourcePage,
        data: {
          title: 'Account Categories',
          endpoint: 'AccountCategories',
          columns: categoryColumns,
          formComponent: CategoryForm,
          formConfig: { endpoint: 'AccountCategories' }
        }
      },
      {
        path: 'transaction-categories',
        component: ResourcePage,
        data: {
          title: 'Transaction Categories',
          endpoint: 'TransactionCategories',
          columns: categoryColumns,
          formComponent: CategoryForm,
          formConfig: { endpoint: 'TransactionCategories' }
        }
      },
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'support',
        component: Support
      },
      {
        path: 'settings',
        component: Settings
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
