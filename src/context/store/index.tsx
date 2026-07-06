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
import { IStore, IStoreReportTableData } from "../../pages/store/interface";
import { ITabHeader } from "../../components/tabs/interface";
import { IBranch } from "../../pages/settings/branch/interface";

interface IStoreContext {
    count: number;
    setCount: Dispatch<SetStateAction<number>>;
    curentStoreData: IStore;
    setCurrentStoreData: Dispatch<SetStateAction<IStore>>;
    branchId: string | number;
    setBranchId: Dispatch<SetStateAction<string | number>>;
    currentAssetType: ITabHeader;
    setCurrentAssetType: Dispatch<SetStateAction<ITabHeader>>;
    storeReportTableData: IStoreReportTableData[];
    setStoreReportTableData: Dispatch<SetStateAction<IStoreReportTableData[]>>;
    currentBranch: IBranch;
    setCurrentBranch: Dispatch<SetStateAction<IBranch>>;
    selectedStatus: string;
    setSelectedStatus: Dispatch<SetStateAction<string>>;
    /** Which store container the current page is scoped to ('admin' | 'it' | 'disposal'); '' = unscoped. */
    storeType: string;
    setStoreType: Dispatch<SetStateAction<string>>;
}

export const StoreContext = createContext<IStoreContext>({} as IStoreContext);

const StoreContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [count, setCount] = useState<number>(0);
    const [curentStoreData, setCurrentStoreData] = useState<IStore>({} as IStore);
    const [branchId, setBranchId] = useState<string | number>("")
    const [currentAssetType, setCurrentAssetType] = useState<ITabHeader>({} as ITabHeader)
    const [storeReportTableData, setStoreReportTableData] = useState<Array<IStoreReportTableData>>([]);
    const [currentBranch, setCurrentBranch] = useState<IBranch>({} as IBranch)
    const [selectedStatus, setSelectedStatus] = useState<string>('officeEquipment');
    const [storeType, setStoreType] = useState<string>('');


    return <StoreContext.Provider value={{
        count,
        setCount,
        curentStoreData,
        setCurrentStoreData,
        branchId,
        setBranchId,
        currentAssetType,
        setCurrentAssetType,
        setStoreReportTableData,
        storeReportTableData,
        currentBranch,
        setCurrentBranch,
        selectedStatus,
        setSelectedStatus,
        storeType,
        setStoreType
    }}>
        {children}
    </StoreContext.Provider>
}

export default StoreContextProvider;