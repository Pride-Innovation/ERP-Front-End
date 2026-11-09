/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/** `GET /requests/{id}/stock-check` - IssueStockCheckService.StockCheck on the server. */
export interface IStockCheckLine {
    commodityId: number;
    commodityName: string;
    needed: number;
    available: number;
}

export interface IStockCheck {
    storeId: number | null;
    storeName: string | null;
    lines: IStockCheckLine[];
    waiting: boolean;
}

export interface IStockCheckSummary {
    waiting: boolean;
    title: string;
    message: string;
    shortLines: IStockCheckLine[];
}

/**
 * What the request page says about it, or null when there is nothing honest to say - no store could
 * be determined, or the request has no lines. An unknown must not read as a shortfall.
 */
export const stockCheckSummary = (check: IStockCheck): IStockCheckSummary | null => {
    if (check.storeId == null || check.lines.length === 0) return null;
    const store = check.storeName ?? 'the store';
    const shortLines = check.lines.filter((l) => l.available < l.needed);
    if (check.waiting && shortLines.length > 0) {
        return {
            waiting: true,
            title: 'Waiting for stock',
            message: `${store} does not yet hold everything on this request. It will be issued once the store is restocked; the issuer is told when it arrives.`,
            shortLines,
        };
    }
    return {
        waiting: false,
        title: 'In stock',
        message: `${store} holds everything on this request, so it can be issued now.`,
        shortLines: [],
    };
};
