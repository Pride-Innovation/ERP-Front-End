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