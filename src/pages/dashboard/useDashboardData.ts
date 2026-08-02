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
    fetchPendingRequestsService,
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
    }, [enabled, nonce]);

    return { data, loading, failed, reload };
}

/**
 * Per-category asset counts for the caller's branch.
 *
 * Note the server-side limitation: `/assets/statistics` resolves the branch from the signed-in
 * user and ignores VIEW_ALL_BRANCHES, so a Head Office user gets their own branch here, not a
 * national roll-up. The Head Office widgets therefore read from `useGlobalAssetReport` instead,
 * and this hook's output is always labelled with the branch it belongs to.
 */
export const useBranchAssetStats = (enabled = true): IAsyncData<IAssetTypeStats[]> =>
    useEndpoint<IAssetTypeStats[]>(
        fetchBranchAssetStatisticsService,
        (response: IAssetTypeStatsAxiosResponse) => response.data ?? [],
        [],
        enabled,
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
export const useMonthlyStocking = (enabled = true): IAsyncData<IMonthlyStockRow[]> =>
    useEndpoint<IMonthlyStockRow[]>(
        fetchMonthlyStockingReportService,
        (response: IMonthlyStockAxiosResponse) => response.data ?? [],
        [],
        enabled,
    );

/** Requested vs delivered per category, current year. */
export const useRequestFulfilment = (enabled = true): IAsyncData<IRequestFulfilment[]> =>
    useEndpoint<IRequestFulfilment[]>(
        fetchCurrentYearRequestSummaryService,
        (response: IRequestFulfilmentAxiosResponse) => response.data ?? [],
        [],
        enabled,
    );

/** Monthly request volume over the trailing year. */
export const useRequestVolume = (enabled = true): IAsyncData<IRequestVolumePoint[]> =>
    useEndpoint<IRequestVolumePoint[]>(
        fetchRequestVolumeService,
        (response: IRequestVolumeAxiosResponse) => response.data ?? [],
        [],
        enabled,
    );

/** The open request queue. */
export const usePendingRequests = (pageSize = 25, enabled = true): IAsyncData<IRequest[]> =>
    useEndpoint<IRequest[]>(
        () => fetchPendingRequestsService(pageSize),
        (response: IRequestsAxiosResponse) => response.data?.content ?? [],
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
