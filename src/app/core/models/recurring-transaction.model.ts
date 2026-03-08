export enum RecurrenceFrequency {
    Daily = 1,
    Weekly = 2,
    Monthly = 3,
    Yearly = 4
}

export interface RecurringTransaction {
    id: number;
    accountId: number;
    accountName: string;
    transactionCategoryId?: number;
    categoryName?: string;
    description: string;
    amount: number;
    type: number; // 0: Income, 1: Expense (or match your TransactionType enum)
    frequency: RecurrenceFrequency;
    startDate: string;
    endDate?: string;
    nextProcessDate: string;
    isActive: boolean;
    lastProcessedDate?: string;
}

export interface UpsertRecurringTransactionRequest {
    accountId: number;
    transactionCategoryId?: number;
    description: string;
    amount: number;
    type: number;
    frequency: RecurrenceFrequency;
    startDate: string;
    endDate?: string;
    isActive: boolean;
}
