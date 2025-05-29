/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { createContext, Dispatch, SetStateAction, useState } from 'react'
import { IRequestTableData } from '../../pages/request/interface'
import { RowData, StockRowData } from '../../components/forms/interface';

interface IRequestContext {
    requestTableData: Array<IRequestTableData>;
    setRequestTableData: Dispatch<SetStateAction<Array<IRequestTableData>>>;
    rows: Array<RowData>;
    stockRows: Array<StockRowData>;
    setRows: Dispatch<SetStateAction<Array<RowData>>>
    setStockRows: Dispatch<SetStateAction<Array<StockRowData>>>
}

export const RequestContext = createContext<IRequestContext>({} as IRequestContext);

const RequestContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requestTableData, setRequestTableData] = useState<IRequestTableData[]>([] as Array<IRequestTableData>)
    const [rows, setRows] = useState<Array<RowData>>([] as Array<RowData>)
    const [stockRows, setStockRows] = useState<Array<StockRowData>>([] as Array<StockRowData>)
    return (
        <RequestContext.Provider value={{
            requestTableData,
            setRequestTableData,
            rows,
            setRows,
            setStockRows,
            stockRows
        }}>
            {children}
        </RequestContext.Provider>
    )
}

export default RequestContextProvider;