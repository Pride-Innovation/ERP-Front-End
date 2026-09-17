/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback, useEffect, useState } from 'react';
import {
    fetchAssetsByBranchService,
    fetchBranchAssetStatisticsService,
    fetchCurrentYearRequestSummaryService,
    fetchGlobalAssetReportService,
    fetchMonthlyStockingReportService,
    fetchMyAssetsService,
    fetchAwaitingMyDecisionService,
    fetchOpenRequestsService,
    fetchRequestVolumeService,
} from './service';
import {
    IAssetTypeStats,
    IAssetTypeStatsAxiosResponse,
    IBranchAssetCell,
    IBranchAssetCellAxiosResponse,
    IGlobalAssetReport,
    IGlobalAssetReportAxiosResponse,
    IMonthlyStockAxiosResponse,
    IMonthlyStockRow,
    IRequestFulfilment,
    IRequestFulfilmentAxiosResponse,
    IRequestVolumeAxiosResponse,
    IRequestVolumePoint,
} from './interface';
import { IPersonalAssetReport, IPersonalAssetReportAxiosResponse, IRequest, IRequestsAxiosResponse } from '../request/interface';
import { IAuditTrail } from '../trails/interface';
import { fetchAuditTrailsService } from '../trails/service';

/**
 * Every dashboard fetch resolves into this shape, so a widget renders one of three states —
 * loading, failed, or data — instead of the previous "empty array means both not-yet-loaded
 * and nothing-there" ambiguity that made an outage look like a legitimately empty branch.
 */
export interface IAsyncData<T> {
    data: T;
    loading: boolean;
    /** Set when the call did not return 200. Widgets surface this rather than drawing zeros. */
    failed: boolean;
    reload: () => void;
}

/**
 * The services swallow their errors and return the error object rather than throwing, so a
 * failure arrives as a value with no `status`. Treat anything that is not a 200 as a failure.
 */
const isOk = (response: unknown): boolean =>
    Boolean(response) && (response as { status?: number }).status === 200;

function useEndpoint<T>(
    fetcher: () => Promise<unknown>,
    extract: (response: any) => T,
    fallback: T,
    enabled = true,
    /**
     * Anything that should cause a refetch when it changes — the selected branch, in practice.
     *
     * A plain value rather than a dependency array so the effect below keeps a fixed dependency
     * count, which is what lets the exhaustive-deps rule stay disabled here safely.
     */
    dependency: string | number | null = null,
): IAsyncData<T> {
    const [data, setData] = useState<T>(fallback);
    const [loading, setLoading] = useState<boolean>(enabled);
    const [failed, setFailed] = useState<boolean>(false);
    const [nonce, setNonce] = useState<number>(0);

    const reload = useCallback(() => setNonce((n) => n + 1), []);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setFailed(false);

        (async () => {
            const response = await fetcher();
            if (cancelled) return;

            if (isOk(response)) {
                setData(extract(response));
            } else {
                setFailed(true);
                setData(fallback);
            }
            setLoading(false);
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, nonce, dependency]);

    return { data, loading, failed, reload };
}

/**
 * Per-category asset counts, scoped server-side by DashboardScopeService.
 *
 * The limitation this note used to describe is gone: the endpoint no longer resolves the branch
 * from the signed-in user and ignore VIEW_ALL_BRANCHES, so a viewer at ALL scope now gets a genuine
 * national roll-up here rather than Head Office's own assets under a national label. Pass a
 * `branchId` to focus one station.
 */
export const useBranchAssetStats = (
    enabled = true,
    branchId: number | null = null,
): IAsyncData<IAssetTypeStats[]> =>
    useEndpoint<IAssetTypeStats[]>(
        () => fetchBranchAssetStatisticsService(branchId),
        (response: IAssetTypeStatsAxiosResponse) => response.data ?? [],
        [],
        enabled,
        branchId,
    );

/** Per-category totals across every branch. */
export const useGlobalAssetReport = (enabled = true): IAsyncData<IGlobalAssetReport[]> =>
    useEndpoint<IGlobalAssetReport[]>(
        fetchGlobalAssetReportService,
        (response: IGlobalAssetReportAxiosResponse) => response.data ?? [],
        [],
        enabled,
    );

/** Branch × category asset counts — one row per pair that has assets. */
export const useAssetsByBranch = (enabled = true): IAsyncData<IBranchAssetCell[]> =>
    useEndpoint<IBranchAssetCell[]>(
        fetchAssetsByBranchService,
        (response: IBranchAssetCellAxiosResponse) => response.data ?? [],
        [],
        enabled,
    );

/** Last six months of stocking quantities, keyed by category. */
export const useMonthlyStocking = (
    enabled = true,
    branchId: number | null = null,
): IAsyncData<IMonthlyStockRow[]> =>
    useEndpoint<IMonthlyStockRow[]>(
        () => fetchMonthlyStockingReportService(branchId),
        (response: IMonthlyStockAxiosResponse) => response.data ?? [],
        [],
        enabled,
        branchId,
    );

/** Requested vs delivered per category, current year. */
export const useRequestFulfilment = (
    enabled = true,
    branchId: number | null = null,
): IAsyncData<IRequestFulfilment[]> =>
    useEndpoint<IRequestFulfilment[]>(
        () => fetchCurrentYearRequestSummaryService(branchId),
        (response: IRequestFulfilmentAxiosResponse) => response.data ?? [],
        [],
        enabled,
        branchId,
    );

/** Monthly request volume over the trailing year. */
export const useRequestVolume = (enabled = true): IAsyncData<IRequestVolumePoint[]> =>
    useEndpoint<IRequestVolumePoint[]>(
        fetchRequestVolumeService,
        (response: IRequestVolumeAxiosResponse) => response.data ?? [],
        [],
        enabled,
    );

/** Requests waiting on this person's own decision. Not scoped — see the endpoint's note. */
export const useAwaitingMyDecision = (pageSize = 25, enabled = true): IAsyncData<IRequest[]> =>
    useEndpoint<IRequest[]>(
        () => fetchAwaitingMyDecisionService(pageSize),
        (response: IRequestsAxiosResponse) => response.data?.content ?? [],
        [],
        enabled,
    );

/** Open requests within the viewer's scope, refetched when the branch selector moves. */
export const useOpenRequests = (
    pageSize = 25,
    enabled = true,
    branchId: number | null = null,
): IAsyncData<IRequest[]> =>
    useEndpoint<IRequest[]>(
        () => fetchOpenRequestsService(pageSize, branchId),
        (response: IRequestsAxiosResponse) => response.data?.content ?? [],
        [],
        enabled,
        branchId,
    );

/**
 * The most recent recorded activity, for the Records band.
 *
 * Reads the audit trail rather than any one module's listing: "the underlying items" cuts across
 * all of them, and the trail already records an actor and a timestamp for every one.
 */
export const useRecentActivity = (limit = 8, enabled = true): IAsyncData<IAuditTrail[]> =>
    useEndpoint<IAuditTrail[]>(
        () => fetchAuditTrailsService({ pageSize: limit, pageNumber: 0, background: true })
            .then((page) => ({ status: 200, data: page })),
        (response: { data: { rows: IAuditTrail[] } }) => response.data?.rows ?? [],
        [],
        enabled,
    );

/** The signed-in user's own assets, grouped by category. */
export const useMyAssets = (enabled = true): IAsyncData<IPersonalAssetReport[]> =>
    useEndpoint<IPersonalAssetReport[]>(
        fetchMyAssetsService,
        (response: IPersonalAssetReportAxiosResponse) => response.data ?? [],
        [],
        enabled,
    );
