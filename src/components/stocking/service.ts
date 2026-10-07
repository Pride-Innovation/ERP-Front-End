/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../core/apis/axiosInstance';
import { IStockable, IStockingRuleRequest } from './stockingRule';

/*
 * These throw rather than returning the error (trap #6), so a refusal reaches the caller's catch
 * with its message instead of arriving as a value with no status.
 */

export const updateCategoryStockingRuleService = (id: number | string, body: IStockingRuleRequest) =>
    axiosInstance.put(`asset-types/${id}/stocking-rule`, body);

export const updateCommodityStockingRuleService = (id: number | string, body: IStockingRuleRequest) =>
    axiosInstance.put(`commodities/${id}/stocking-rule`, body);

/** What a branch may stock - the caller's own unless `branchId` names the branch of an order being corrected. */
export const fetchStockableService = async (branchId?: number | null): Promise<IStockable> => {
    const response = await axiosInstance.get('stocking/stockable', { params: branchId ? { branchId } : {} });
    if (response.status !== 200) throw new Error('Stocking rules could not be loaded');
    return response.data as IStockable;
};

export interface IBranchOption {
    id: number;
    name: string;
    isHeadOffice?: boolean;
}

/** Every branch, for the "specific branches" picker. Head Office is left out - it has its own switch. */
export const fetchBranchOptionsService = async (): Promise<IBranchOption[]> => {
    const response = await axiosInstance.get('branches', { params: { pageNumber: 0, pageSize: 500 } });
    const data = response.data;
    const list: IBranchOption[] = Array.isArray(data) ? data : data?.content ?? [];
    return list
        .filter((b) => !b.isHeadOffice)
        .sort((a, b) => a.name.localeCompare(b.name));
};

/** The server's own sentence when it has one - it names the offending branch or commodity. */
export const refusalMessage = (error: any, fallback: string): string => {
    const data = error?.response?.data;
    return data?.message || data?.detail || fallback;
};
