/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useState
} from "react";
import { IInventory } from "../../pages/inventory/interface";

interface IInventoryContext {
    currentInventory: IInventory;
    setCurrentInventory: Dispatch<SetStateAction<IInventory>>
}

export const InventoryContext = createContext<IInventoryContext>({} as IInventoryContext);

export const InventoryContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentInventory, setCurrentInventory] = useState<IInventory>({} as IInventory)
    return (
        <InventoryContext.Provider value={{ currentInventory, setCurrentInventory }}>
            {children}
        </InventoryContext.Provider>
    )
}