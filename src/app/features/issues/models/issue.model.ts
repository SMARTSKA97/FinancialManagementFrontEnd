export interface Issue {
    id: number;
    title: string;
    description: string;
    status: string; // New, Acknowledged, Triaged, Planned, InProgress, Released, Verified
    painScore: number;
    categoryName: string;
    subcategoryName: string;
    createdAt: string;
    votes: number;
    commentCount: number;
}

export interface CreateIssueDto {
    title: string;
    description: string;
    priority?: string;
    categoryId?: number;
    subcategoryId?: number;
    severity: string; // Minor, Major, Critical
    impactsMoney: boolean;
    financialImpactAmount?: number;
    frequency: string; // Rare, Frequent, Always
    structuredExpecations?: string;
}

export interface IssueTaxonomy {
    id: number;
    name: string;
    type: string;
    parentId?: number;
    children?: IssueTaxonomy[];
}
