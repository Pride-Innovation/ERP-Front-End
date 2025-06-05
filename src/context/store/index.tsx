/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    createContext,
    Dispatch,
    FC,
    ReactNode,
    SetStateAction,
    useState
} from "react";
import { IStore } from "../../pages/store/interface";

interface IStoreContext {
    storeCommodities: IStore[],
    setStoreCommoditiesData: Dispatch<SetStateAction<IStore[]>>
}

export const StoreContext = createContext<IStoreContext>({} as IStoreContext);

const StoreContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [storeCommodities, setStoreCommoditiesData] = useState<IStore[]>([])
    return <StoreContext.Provider value={{
        setStoreCommoditiesData,
        storeCommodities
    }}>
        {children}
    </StoreContext.Provider>
}

export default StoreContextProvider;