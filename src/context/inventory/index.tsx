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
    inventoryCount: number;
    setInventoryCount: Dispatch<SetStateAction<number>>
    options: Array<{ value: string | number, label: string, icon: JSX.Element }>,
    setOptions: Dispatch<SetStateAction<Array<{ value: string | number, label: string, icon: JSX.Element }>>>
}

export const InventoryContext = createContext<IInventoryContext>({} as IInventoryContext);

export const InventoryContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentInventory, setCurrentInventory] = useState<IInventory>({} as IInventory);
    const [inventoryCount, setInventoryCount] = useState<number>(0);
    const [options, setOptions] = useState<Array<{ value: string | number, label: string, icon: JSX.Element }>>([] as Array<{ value: string | number, label: string, icon: JSX.Element }>);
    return (
        <InventoryContext.Provider value={{
            currentInventory,
            setCurrentInventory,
            inventoryCount,
            setInventoryCount,
            options,
            setOptions
        }}>
            {children}
        </InventoryContext.Provider>
    )
}