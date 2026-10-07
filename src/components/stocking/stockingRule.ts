/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Where a category or commodity may be stocked. Mirrors the backend's StockingRule - one shape for
 * both, because a commodity that overrides its category is answering the same question.
 */
export interface IStockingRule {
    stockAtHeadOffice?: boolean | null;
    stockAtAllBranches?: boolean | null;
    stockingBranchIds?: number[] | null;
}

/** What Settings sends. `override` is read only for a commodity. */
export interface IStockingRuleRequest {
    override?: boolean;
    stockAtHeadOffice: boolean;
    stockAtAllBranches: boolean;
    branchIds: number[];
}

/** What the caller's branch may stock - the inventory form filters its pickers by it. */
export interface IStockable {
    branchId: number;
    branchName: string;
    headOffice: boolean;
    assetTypeIds: number[];
    commodityIds: number[];
}

const HEAD_OFFICE_ONLY: IStockingRule = { stockAtHeadOffice: true, stockAtAllBranches: false, stockingBranchIds: [] };

/**
 * The rule a commodity actually follows - its own while it overrides, else its category's, and Head
 * Office only when it has no category. Mirrors StockingRuleService.effectiveRule.
 */
export const effectiveStockingRule = (commodity: IStockingRule & {
    stockingOverride?: boolean | null;
    assetType?: IStockingRule | null;
}): IStockingRule => {
    if (commodity.stockingOverride) return commodity;
    return commodity.assetType ?? HEAD_OFFICE_ONLY;
};

/** Nothing ticked: the category can be stocked nowhere. Legal, but worth a confirmation. */
export const isNowhere = (rule: IStockingRule): boolean =>
    !rule.stockAtHeadOffice && !rule.stockAtAllBranches && (rule.stockingBranchIds ?? []).length === 0;

/**
 * One line a reader can take in at a glance: "Head Office + all branches", "Head Office + 3 branches",
 * "Gulu Branch only", "Not stockable anywhere".
 *
 * Named branches are spelled out when there are one or two of them and counted beyond that - a card
 * listing nine branch names is not a summary.
 */
export const describeStockingRule = (
    rule: IStockingRule,
    branchName: (id: number) => string | undefined = () => undefined,
): string => {
    if (isNowhere(rule)) return 'Not stockable anywhere';

    const parts: string[] = [];
    if (rule.stockAtHeadOffice) parts.push('Head Office');

    if (rule.stockAtAllBranches) {
        parts.push('all branches');
    } else {
        const ids = rule.stockingBranchIds ?? [];
        const names = ids.map((id) => branchName(id)).filter((n): n is string => !!n);
        if (ids.length > 0 && ids.length <= 2 && names.length === ids.length) {
            parts.push(...names);
        } else if (ids.length > 0) {
            parts.push(`${ids.length} branch${ids.length === 1 ? '' : 'es'}`);
        }
    }

    // "All branches" alone is the one case where the omission is the news - Head Office cannot.
    if (parts.length === 1 && rule.stockAtAllBranches) return 'All branches, not Head Office';
    return parts.length === 1 ? `${parts[0]} only` : parts.join(' + ');
};
