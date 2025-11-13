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


// --- Column Definitions ---
const accountColumns: ColumnDefinition[] = [
  { field: 'name', header: 'Name', isLink: true, linkPath: '/accounts/:id/transactions' },
  { field: 'accountCategoryName', header: 'Category' },
  { field: 'balance', header: 'Balance', isCurrency: true },
];
const categoryColumns: ColumnDefinition[] = [
  { field: 'name', header: 'Name' }
];

// --- Final Application Routes ---
export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [publicGuard] },
  { path: 'register', component: Register, canActivate: [publicGuard] },

  {
    path: '',
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
        // --- THIS ROUTE IS NOW FIXED ---
        path: 'accounts/:id/transactions',
        component: TransactionList, // <-- Use the new "smart" component
      },
      {
        path: 'account-categories',
        component: ResourcePage,
        data: {
          title: 'Account Categories',
          endpoint: 'AccountCategories',
          columns: categoryColumns,
          formComponent: CategoryForm,
          formConfig: { endpoint: 'AccountCategories' } // Pass config to form
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
          formConfig: { endpoint: 'TransactionCategories' } // Pass config to form
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
      // {
      //   path: 'about',
      //   component: About
      // },
      { path: '', redirectTo: 'accounts', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];