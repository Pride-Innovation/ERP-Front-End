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
import { IIssue } from '../../pages/request/assetRequest/issue/interface';

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
    setAssetsEngravedInStore: Dispatch<SetStateAction<IAsset[]>>
    assetsEngravedInStore: IAsset[];
    count: number;
    setCount: Dispatch<SetStateAction<number>>;
    monthlyStockingReport: IMonthlyAssetReport[];
    setMonthlyStockingReport: Dispatch<SetStateAction<IMonthlyAssetReport[]>>;
    options: Array<{ value: string | number, label: string, icon: JSX.Element }>,
    setOptions: Dispatch<SetStateAction<Array<{ value: string | number, label: string, icon: JSX.Element }>>>
    currentIssuance: IIssue;
    setCurrentIssuance: Dispatch<SetStateAction<IIssue>>;
}

export const RequestContext = createContext<IRequestContext>({} as IRequestContext);

const RequestContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requestTableData, setRequestTableData] = useState<IRequestTableData[]>([] as Array<IRequestTableData>)
    const [rows, setRows] = useState<Array<RowData>>([] as Array<RowData>)
    const [stockRows, setStockRows] = useState<Array<StockRowData>>([] as Array<StockRowData>)
    const [totalCostPrice, setTotalCostPrice] = useState<number>(0);
    const [totalPurchasePrice, setTotalPurchasePrice] = useState<number>(0);
    const [assetType, setAssetType] = useState<IAssetType>({} as IAssetType);
    const [assetsEngravedInStore, setAssetsEngravedInStore] = useState<IAsset[]>([] as IAsset[]);
    const [monthlyStockingReport, setMonthlyStockingReport] = useState<IMonthlyAssetReport[]>([] as IMonthlyAssetReport[])
    const [options, setOptions] = useState<Array<{ value: string | number, label: string, icon: JSX.Element }>>([]);
    const [currentIssuance, setCurrentIssuance] = useState<IIssue>({} as IIssue);

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
            assetsEngravedInStore,
            setAssetsEngravedInStore,
            count,
            setCount,
            monthlyStockingReport,
            setMonthlyStockingReport,
            setOptions,
            options,
            currentIssuance,
            setCurrentIssuance
        }}>
            {children}
        </RequestContext.Provider>
    )
}

export default RequestContextProvider;