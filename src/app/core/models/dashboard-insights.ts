export interface BasicTransactionDto {
    id: number;
    description: string;
    amount: number;
    date: Date;
    categoryName?: string;
    accountName?: string;
    type: number;
}

export interface GroupExtremeDto {
    groupName: string;
    maxTransaction?: BasicTransactionDto;
    minTransaction?: BasicTransactionDto;
}

export interface DashboardInsightsDto {
    highestAmountTransactions: BasicTransactionDto[];
    lowestAmountTransactions: BasicTransactionDto[];
    latestTransactions: BasicTransactionDto[];
    oldestTransactions: BasicTransactionDto[];
    categoryExtremes: GroupExtremeDto[];
    accountExtremes: GroupExtremeDto[];
}
