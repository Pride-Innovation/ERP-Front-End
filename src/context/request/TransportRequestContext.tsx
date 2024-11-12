import React, { createContext, Dispatch, SetStateAction, useState } from 'react'
import { ITransportRequestTableData } from '../../pages/request/interface'

interface ITransportRequestContext {
    transportRequestTableData: Array<ITransportRequestTableData>;
    setTransportRequestTableData: Dispatch<SetStateAction<Array<ITransportRequestTableData>>>;
}

export const TransportRequestContext = createContext<ITransportRequestContext>({} as ITransportRequestContext);

const TransportRequestContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [transportRequestTableData, setTransportRequestTableData] = useState<ITransportRequestTableData[]>([] as Array<ITransportRequestTableData>)
    return (
        <TransportRequestContext.Provider value={{ transportRequestTableData, setTransportRequestTableData }}>
            {children}
        </TransportRequestContext.Provider>
    )
}

export default TransportRequestContextProvider;