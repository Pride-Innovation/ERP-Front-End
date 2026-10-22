/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { PermissionName } from '../../core/permissions/constants';
import { IStockCount, IStockCountLine, StockCountStatus } from './stockTakeInterface';
import { canPost, canRecordCounts, canReview, reviewBlockedAsCounter } from './stockTakeRules';

/**
 * Where a count is and whose turn it is, in words. Built on stockTakeRules, so "Needs my action" and
 * "ready for you" can never name a count whose buttons the viewer would not be offered.
 */

type Has = (permission: PermissionName) => boolean;
type UserId = number | null | undefined;

export const STOCK_TAKE_STEPS = [
    { label: 'Open', detail: 'The system takes a snapshot of what it thinks is on the shelf.' },
    { label: 'Count', detail: 'A blind count: staff record what they physically find, without seeing the expected figures.' },
    { label: 'Submit', detail: 'The expected figures and the differences are revealed.' },
    { label: 'Review', detail: 'Any other approver at the branch approves the count or sends it back. It cannot be the person who opened it.' },
    { label: 'Post', detail: 'Stock balances are corrected, and every change is written to the adjustment history with its reason.' },
] as const;

/**
 * The step a count is on, as an index into STOCK_TAKE_STEPS. Everything before it is done; a posted
 * count is past the last step. Null for a cancelled count, which left the process rather than finishing it.
 */
export const activeStepOf = (status: StockCountStatus): number | null => {
    switch (status) {
        case 'DRAFT':
        case 'IN_PROGRESS': return 1;
        case 'SUBMITTED': return 3;
        case 'APPROVED': return 4;
        case 'POSTED': return STOCK_TAKE_STEPS.length;
        default: return null;
    }
};

export const isFinished = (c: Pick<IStockCount, 'status'>) => c.status === 'POSTED' || c.status === 'CANCELLED';

/**
 * Whether the count waits on this viewer. Cancelling is left out on purpose: an approver may cancel
 * almost anything, so counting it would put every open count in this tab.
 */
export const needsMyAction = (c: IStockCount, has: Has, userId: UserId) =>
    canRecordCounts(c, has) || canReview(c, has, userId) || canPost(c, has);

export type StockTakeTab = 'mine' | 'progress' | 'completed' | 'all';

export const inTab = (c: IStockCount, tab: StockTakeTab, has: Has, userId: UserId) => {
    switch (tab) {
        case 'mine': return needsMyAction(c, has, userId);
        case 'progress': return !isFinished(c);
        case 'completed': return isFinished(c);
        default: return true;
    }
};

/** The tab the page opens on: your work if there is any, else what is still open, else everything. */
export const defaultTab = (counts: IStockCount[], has: Has, userId: UserId): StockTakeTab => {
    if (counts.some((c) => needsMyAction(c, has, userId))) return 'mine';
    if (counts.some((c) => !isFinished(c))) return 'progress';
    return 'all';
};

export interface NextStep {
    label: string;
    /** True when the next move is this viewer's. */
    mine: boolean;
}

export const nextStep = (c: IStockCount, has: Has, userId: UserId): NextStep => {
    switch (c.status) {
        case 'DRAFT':
        case 'IN_PROGRESS': {
            const progress = `${c.countedLines} of ${c.totalLines} lines`;
            const sentBack = c.status === 'IN_PROGRESS' && !!c.reviewRemarks;
            return {
                label: `${sentBack ? 'Sent back for recount' : 'Counting'}: ${progress}`,
                mine: canRecordCounts(c, has),
            };
        }
        case 'SUBMITTED':
            if (canReview(c, has, userId)) return { label: 'Ready for your approval', mine: true };
            if (reviewBlockedAsCounter(c, has, userId)) {
                return { label: 'Waiting for approval by someone other than you', mine: false };
            }
            return {
                label: c.countedByName
                    ? `Waiting for approval (not by ${c.countedByName}, who opened it)`
                    : 'Waiting for approval',
                mine: false,
            };
        case 'APPROVED':
            return canPost(c, has)
                ? { label: 'Approved, ready for you to post', mine: true }
                : { label: 'Approved, waiting to be posted', mine: false };
        case 'POSTED':
            return { label: 'Posted: balances corrected', mine: false };
        default:
            return { label: 'Cancelled', mine: false };
    }
};

export interface LineGroup {
    category: string;
    lines: IStockCountLine[];
}

/**
 * The sheet's lines, narrowed by the search box and the "uncounted only" toggle, grouped by category.
 * `countedValue` reads the sheet's unsaved entry, so a line typed in a moment ago counts as counted.
 * Groups and lines are sorted by name, so a long sheet reads in the same order as the shelves' labels.
 */
export const groupLines = (
    lines: IStockCountLine[],
    { search, uncountedOnly, countedValue }: {
        search: string;
        uncountedOnly: boolean;
        countedValue: (line: IStockCountLine) => string;
    },
): LineGroup[] => {
    const needle = search.trim().toLowerCase();
    const groups = new Map<string, IStockCountLine[]>();
    lines
        .filter((l) => !needle
            || l.commodityName.toLowerCase().includes(needle)
            || (l.assetTypeName ?? '').toLowerCase().includes(needle))
        .filter((l) => !uncountedOnly || countedValue(l) === '')
        .forEach((l) => {
            const category = l.assetTypeName || 'Uncategorised';
            groups.set(category, [...(groups.get(category) ?? []), l]);
        });
    return Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, ls]) => ({
            category,
            lines: [...ls].sort((x, y) => x.commodityName.localeCompare(y.commodityName)),
        }));
};
