/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../core/apis/axiosInstance';

/** GET /inventory/my-items — the backend's `MyItemsView`. */

export interface IHeldItem {
    id: number;
    name?: string | null;
    model?: string | null;
    engravedNumber?: string | null;
    serialNumber?: string | null;
    assetTypeId?: number | null;
    assetTypeName?: string | null;
    statusCode?: string | null;
    statusName?: string | null;
    branchName?: string | null;
    /** An open temporary assignment: a loaner, which the holder hands back with Return. */
    onLoan: boolean;
}

export interface IAwayItem {
    id: number;
    name?: string | null;
    engravedNumber?: string | null;
    assetTypeId?: number | null;
    assetTypeName?: string | null;
    statusCode?: string | null;
    statusName?: string | null;
    purpose: 'repair' | 'disposal';
    /** The store it is in now. */
    heldAt?: string | null;
    since?: string | null;
    movementId?: number | null;
    /** A movement is bringing it back to them. */
    returning: boolean;
}

export interface IIncomingMovement {
    id: number;
    movementType?: string | null;
    status?: string | null;
    trackingNumber?: string | null;
    fromName?: string | null;
    itemCount: number;
    itemSummary?: string | null;
    createDate?: string | null;
    requestId?: number | null;
}

export interface IMyItems {
    held: IHeldItem[];
    away: IAwayItem[];
    incoming: IIncomingMovement[];
}

/** Throws on failure, so the page can say it could not load rather than "you hold nothing". */
export const fetchMyItemsService = async (): Promise<IMyItems> => {
    const res = await axiosInstance.get('inventory/my-items');
    const data = (res?.data ?? {}) as Partial<IMyItems>;
    return { held: data.held ?? [], away: data.away ?? [], incoming: data.incoming ?? [] };
};

export interface ICategoryGroup<T> {
    category: string;
    items: T[];
}

/** Items grouped by category, both sorted by name — the order a person reads their own kit in. */
export const groupByCategory = <T extends { name?: string | null; assetTypeName?: string | null }>(
    items: T[],
): ICategoryGroup<T>[] => {
    const groups = new Map<string, T[]>();
    items.forEach((item) => {
        const category = item.assetTypeName || 'Uncategorised';
        groups.set(category, [...(groups.get(category) ?? []), item]);
    });
    return Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, list]) => ({
            category,
            items: [...list].sort((x, y) => (x.name ?? '').localeCompare(y.name ?? '')),
        }));
};

/** Where an away item is, and why: "Head Office IT Store · for repair". */
export const awayWhereLabel = (item: IAwayItem): string => {
    const why = item.purpose === 'disposal' ? 'for disposal' : 'for repair';
    return item.heldAt ? `${item.heldAt} · ${why}` : why.charAt(0).toUpperCase() + why.slice(1);
};
