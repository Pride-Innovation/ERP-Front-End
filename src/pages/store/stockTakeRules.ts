/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { PERMISSIONS, PermissionName } from '../../core/permissions/constants';
import { IStockCount } from './stockTakeInterface';

/**
 * Which stock-take controls a viewer is offered.
 *
 * <p>Mirrors `StockTakeController` and `StockTakeService` rule for rule. The pages offered every
 * button to anyone who could open them — a reader holding only READ_STOCK_TAKE saw Open, Submit,
 * Approve and Post, and every click came back refused. If these drift from the server, the page
 * either offers a refusal or hides something the viewer may do.
 */

type Has = (permission: PermissionName) => boolean;

type Actionable = Pick<IStockCount, 'actionable'>;

const isCounting = (c: Pick<IStockCount, 'status'>) => c.status === 'DRAFT' || c.status === 'IN_PROGRESS';

const isCounter = (c: Pick<IStockCount, 'countedById'>, userId: number | null | undefined) =>
    userId != null && c.countedById != null && Number(c.countedById) === Number(userId);

/**
 * Whether the viewer may act on this count at all - the server's answer: its store is at their own
 * branch. Head Office reads every branch's counts and acts only at its own, whatever cross-branch
 * inventory reach it holds for other work. Missing (an older backend) reads as yes.
 */
export const isActionable = (c: Actionable) => c.actionable !== false;

/** POST /stock-counts. Which stores may be counted is the server's list (countable-stores). */
export const canOpenCount = (has: Has) => has(PERMISSIONS.PERFORM_STOCK_TAKE);

/** Save progress and Submit — PUT …/lines and POST …/submit. */
export const canRecordCounts = (c: Pick<IStockCount, 'status'> & Actionable, has: Has) =>
    isActionable(c) && isCounting(c) && has(PERMISSIONS.PERFORM_STOCK_TAKE);

/**
 * Approve and Send back. The server also refuses whoever counted the sheet, so the counter is not
 * offered a button that can only fail.
 */
export const canReview = (c: Pick<IStockCount, 'status' | 'countedById'> & Actionable, has: Has, userId: number | null | undefined) =>
    isActionable(c) && c.status === 'SUBMITTED' && has(PERMISSIONS.APPROVE_STOCK_TAKE) && !isCounter(c, userId);

/** Whether the only thing between this viewer and Approve is that they counted it. */
export const reviewBlockedAsCounter = (c: Pick<IStockCount, 'status' | 'countedById'> & Actionable, has: Has, userId: number | null | undefined) =>
    isActionable(c) && c.status === 'SUBMITTED' && has(PERMISSIONS.APPROVE_STOCK_TAKE) && isCounter(c, userId);

/** POST …/post. */
export const canPost = (c: Pick<IStockCount, 'status'> & Actionable, has: Has) =>
    isActionable(c) && c.status === 'APPROVED' && has(PERMISSIONS.APPROVE_STOCK_TAKE);

/**
 * POST …/cancel: an approver, for anything not yet posted; or the counter, for their own count while
 * it is still being counted.
 */
export const canCancel = (c: Pick<IStockCount, 'status' | 'countedById'> & Actionable, has: Has, userId: number | null | undefined) => {
    if (!isActionable(c)) return false;
    if (c.status === 'POSTED' || c.status === 'CANCELLED') return false;
    if (has(PERMISSIONS.APPROVE_STOCK_TAKE)) return true;
    return has(PERMISSIONS.PERFORM_STOCK_TAKE) && isCounting(c) && isCounter(c, userId);
};
