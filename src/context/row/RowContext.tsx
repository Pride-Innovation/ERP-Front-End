/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { GridRowsProp } from '@mui/x-data-grid';
import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useState
} from 'react';

interface IRowContext {
    rows: GridRowsProp;
    setRows: Dispatch<SetStateAction<GridRowsProp>>
}

export const RowContext = createContext<IRowContext>({} as IRowContext);

export const RowContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [rows, setRows] = useState<GridRowsProp>([] as GridRowsProp)
    return (
        <RowContext.Provider value={{ rows, setRows }}>
            {children}
        </RowContext.Provider>
    )
}

export default RowContext;