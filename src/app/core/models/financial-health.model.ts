export interface FinancialInsight {
    message: string;
    type: 'info' | 'success' | 'warning';
    categoryName?: string;
}

export interface FinancialHealth {
    score: number;
    status: string;
    insights: FinancialInsight[];
    savingsRate: number;
    budgetAdherence: number;
}
