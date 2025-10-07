import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { TransactionList } from './features/transactions/transaction-list/transaction-list';
import { ColumnDefinition } from './shared/components/data-table/data-table';
import { ResourcePage } from './features/shared/resource-page/resource-page';
import { AccountForm } from './features/accounts/account-form/account-form';
import { TransactionForm } from './features/transactions/transaction-form/transaction-form';
import { CategoryForm } from './features/categories/category-form/category-form';
import { Support } from './features/support/support';
import { publicGuard } from './core/guards/public-guard';
import { Layout } from './core/layout/layout/layout';

const accountColumns: ColumnDefinition[] = [
    { field: 'name', header: 'Name', isLink: true, linkPath: 'accounts/:id/transactions' },
    { field: 'balance', header: 'Balance', isCurrency: true },
    { field: 'accountCategoryName', header: 'Category' },
];

const transactionColumns: ColumnDefinition[] = [
    { field: 'date', header: 'Date', isDate: true },
    { field: 'description', header: 'Description' },
    { field: 'categoryName', header: 'Category' },
    { field: 'amount', header: 'Amount', isCurrency: true, isTransaction: true },
];

const categoryColumns: ColumnDefinition[] = [
    { field: 'name', header: 'Name' }
];

export const routes: Routes = [
   // --- Public Auth Routes (No Layout) ---
  // These are only accessible if the user is NOT logged in.
  { path: 'login', component: Login, canActivate: [publicGuard] },
  { path: 'register', component: Register, canActivate: [publicGuard] },

  // --- Private App Routes (Inside the Main Layout) ---
  // The authGuard protects this entire section.
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
        path: 'accounts/:id/transactions',
        component: ResourcePage,
        data: {
          title: 'Transactions',
          endpoint: 'accounts/:id/transactions',
          columns: transactionColumns,
          formComponent: TransactionForm,
          backLinkPath: '/accounts'
        }
      },
      {
        path: 'account-categories',
        component: ResourcePage,
        data: {
          title: 'Account Categories',
          endpoint: 'AccountCategories',
          columns: categoryColumns,
          formComponent: CategoryForm
        }
      },
      {
        path: 'transaction-categories',
        component: ResourcePage,
        data: {
          title: 'Transaction Categories',
          endpoint: 'TransactionCategories',
          columns: categoryColumns,
          formComponent: CategoryForm
        }
      },
      {
        path: 'support',
        component: Support
      },
    //   {
    //     path: 'about',
    //     component: abou
    //   },
      // Default route for logged-in users
      { path: '', redirectTo: 'accounts', pathMatch: 'full' }
    ]
  },

  // Catch-all route redirects to the main app path
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
