export enum BudgetPeriod {
    Monthly = 1,
    Yearly = 2
}

export interface Budget {
    id: number;
    transactionCategoryId?: number;
    categoryName?: string;
    amount: number;
    period: BudgetPeriod;
    startDate: string;
    endDate?: string;
}

export interface UpsertBudgetRequest {
    transactionCategoryId?: number;
    amount: number;
    period: BudgetPeriod;
    startDate: string;
    endDate?: string;
}

export interface BudgetProgress {
    budgetId: number;
    transactionCategoryId?: number;
    categoryName?: string;
    budgetAmount: number;
    spentAmount: number;
    remainingAmount: number;
    percentageUsed: number;
    period: BudgetPeriod;
    startDate: string;
    endDate?: string;
}
