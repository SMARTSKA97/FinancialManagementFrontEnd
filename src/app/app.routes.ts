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
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'dashboard', component: Dashboard },

    // Route for Accounts (Dashboard)
    {
        path: 'accounts',
        component: ResourcePage,
        canActivate: [authGuard],
        data: {
            title: 'Accounts',
            endpoint: 'accounts',
            columns: accountColumns,
            formComponent: AccountForm
        }
    },

    {
        path: 'accounts/:id/transactions',
        component: ResourcePage,
        canActivate: [authGuard],
        data: {
            title: 'Transactions',
            endpoint: 'accounts/:id/transactions',
            columns: transactionColumns,
            backLinkPath: '/accounts',
            formComponent: TransactionForm
        }
    },

    {
    path: 'categories', // <-- ADD THIS CATEGORY MANAGEMENT ROUTE
    component: ResourcePage,
    canActivate: [authGuard],
    data: {
      title: 'Categories',
      endpoint: 'categories',
      columns: categoryColumns,
      formComponent: CategoryForm
    }
  },

    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: '/accounts' }
];
