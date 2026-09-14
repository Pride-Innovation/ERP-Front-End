import { IOptions } from '../../components/tables/interface';
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { createContext, Dispatch, SetStateAction, useState } from 'react'
import { IRequestTableData } from '../../pages/request/interface'
import { RowData, StockRowData } from '../../components/forms/interface';
import { IAssetType } from '../../pages/settings/assetTypes/interface';
import { IAsset } from '../../pages/assets/interface';
import { IMonthlyAssetReport } from '../../pages/dashboard/interface';
import { IAcknowledgeIssuanceReceipt, IAcknowledgeRequestReceipt, IIssue } from '../../pages/request/assetRequest/issue/interface';

interface IRequestContext {
    requestTableData: Array<IRequestTableData>;
    setRequestTableData: Dispatch<SetStateAction<Array<IRequestTableData>>>;
    rows: Array<RowData>;
    stockRows: Array<StockRowData>;
    setRows: Dispatch<SetStateAction<Array<RowData>>>
    setStockRows: Dispatch<SetStateAction<Array<StockRowData>>>
    totalCostPrice: number;
    totalPurchasePrice: number;
    setTotalCostPrice: Dispatch<SetStateAction<number>>;
    setTotalPurchasePrice: Dispatch<SetStateAction<number>>;
    assetType: IAssetType;
    setAssetType: Dispatch<SetStateAction<IAssetType>>
    /**
     * Assets currently issuable, bucketed by the commodity they belong to.
     *
     * <h2>Why a map, and why it replaces rather than accumulates</h2>
     * This was one flat array that {@link AssetUtills.fetchAllAssets} only ever <em>appended</em> to.
     * Every query is filtered to "Available for Issuance", so the moment an asset is issued it stops
     * coming back — and an entry that never returns can never be overwritten. It simply stayed, and
     * went on being offered. The de-dupe there was written to fix exactly that and could not: a row
     * that has left the result set wins nothing by being merged last.
     *
     * <p>Bucketing by commodity is what makes replacement possible. A single array cannot be
     * replaced by a query that only ever covers one commodity, so the flat shape forced the pool to
     * be additive, and additive is what made it stale. It also removes the client-side
     * `commodity?.id === row.commodityId` filter each picker used to apply to the whole pool.
     */
    setIssuableAssets: Dispatch<SetStateAction<Record<number, IAsset[]>>>
    issuableAssets: Record<number, IAsset[]>;
    count: number;
    setCount: Dispatch<SetStateAction<number>>;
    monthlyStockingReport: IMonthlyAssetReport[];
    setMonthlyStockingReport: Dispatch<SetStateAction<IMonthlyAssetReport[]>>;
    options: Array<IOptions>,
    setOptions: Dispatch<SetStateAction<Array<IOptions>>>
    currentIssuance: IIssue;
    setCurrentIssuance: Dispatch<SetStateAction<IIssue>>;
    acknowledgeIssuance: IAcknowledgeIssuanceReceipt;
    setAcknowledgeIssuance: Dispatch<SetStateAction<IAcknowledgeIssuanceReceipt>>;
    acknowledgeRequest: IAcknowledgeRequestReceipt;
    setAcknowledgeRequest: Dispatch<SetStateAction<IAcknowledgeRequestReceipt>>;
    issuanceApproval: IAcknowledgeIssuanceReceipt;
    setIssuanceApproval: Dispatch<SetStateAction<IAcknowledgeIssuanceReceipt>>;
    requestStatusIds: number[];
    setRequestStatusIds: Dispatch<SetStateAction<number[]>>;
}

export const RequestContext = createContext<IRequestContext>({} as IRequestContext);

const RequestContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requestTableData, setRequestTableData] = useState<IRequestTableData[]>([] as Array<IRequestTableData>)
    const [rows, setRows] = useState<Array<RowData>>([] as Array<RowData>)
    const [stockRows, setStockRows] = useState<Array<StockRowData>>([] as Array<StockRowData>)
    const [totalCostPrice, setTotalCostPrice] = useState<number>(0);
    const [totalPurchasePrice, setTotalPurchasePrice] = useState<number>(0);
    const [assetType, setAssetType] = useState<IAssetType>({} as IAssetType);
    const [issuableAssets, setIssuableAssets] = useState<Record<number, IAsset[]>>({});
    const [monthlyStockingReport, setMonthlyStockingReport] = useState<IMonthlyAssetReport[]>([] as IMonthlyAssetReport[])
    const [options, setOptions] = useState<Array<IOptions>>([]);
    const [currentIssuance, setCurrentIssuance] = useState<IIssue>({} as IIssue);
    const [acknowledgeIssuance, setAcknowledgeIssuance] = useState<IAcknowledgeIssuanceReceipt>({} as IAcknowledgeIssuanceReceipt);
    const [acknowledgeRequest, setAcknowledgeRequest] = useState<IAcknowledgeIssuanceReceipt>({} as IAcknowledgeIssuanceReceipt);
    const [issuanceApproval, setIssuanceApproval] = useState<IAcknowledgeIssuanceReceipt>({} as IAcknowledgeIssuanceReceipt);
    const [requestStatusIds, setRequestStatusIds] = useState<number[]>([] as number[]);

    const [count, setCount] = useState<number>(0)

    return (
        <RequestContext.Provider value={{
            requestTableData,
            setRequestTableData,
            rows,
            setRows,
            setStockRows,
            stockRows,
            totalCostPrice,
            setTotalCostPrice,
            totalPurchasePrice,
            setTotalPurchasePrice,
            assetType,
            setAssetType,
            issuableAssets,
            setIssuableAssets,
            count,
            setCount,
            monthlyStockingReport,
            setMonthlyStockingReport,
            setOptions,
            options,
            currentIssuance,
            setCurrentIssuance,
            acknowledgeIssuance,
            setAcknowledgeIssuance,
            acknowledgeRequest,
            setAcknowledgeRequest,
            issuanceApproval,
            setIssuanceApproval,
            requestStatusIds,
            setRequestStatusIds
        }}>
            {children}
        </RequestContext.Provider>
    )
}

export default RequestContextProvider;