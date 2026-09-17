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
    useCallback,
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
    /** Which store container the current page is scoped to ('admin' | 'it' | 'disposal'); '' = unscoped. */
    storeType: string;
    setStoreType: Dispatch<SetStateAction<string>>;

    /* ── Shared page state ────────────────────────────────────────────────────────────────────
     *
     * These were `useState` inside `StoreUtills`, which is a plain hook called by five separate
     * components — so each call site got its **own** copy and none of them could see the others'.
     * The consequences were invisible rather than loud:
     *
     *  - `StoreViewPage` rendered a loading panel keyed on a `sendingRequest` belonging to an
     *    instance that never fetches anything, so the panel was unreachable code.
     *  - `TableData` passed the same dead flag to the grid, so the table never showed it was
     *    reloading — which is exactly what made a stale page look like a fresh one.
     *  - `tableHeaders` was filled in `BranchStoreReport`'s copy and read as `[]` everywhere else.
     *
     * A hook is the right shape for behaviour and the wrong one for state two components must
     * agree on. The behaviour stays in `StoreUtills`; what it operates on lives here.
     */

    /** Whether the balances listing is in flight — one answer for every component that shows it. */
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    /** One tab per asset category, built once from the catalogue. */
    tableHeaders: ITabHeader[];
    setTableHeaders: Dispatch<SetStateAction<ITabHeader[]>>;
    /**
     * Why the last listing failed, if it did.
     *
     * <p>Frontend services return the error rather than throwing (trap #6), so a refusal used to
     * reach a `console.log` and nothing else: the table kept the previous branch's rows while the
     * header card named the branch that had just been refused. A boundary has to be visible or it
     * reads as a broken page.
     */
    storeError: string | null;
    setStoreError: Dispatch<SetStateAction<string | null>>;
    /** The stock-line details modal — shared, so the dialog's own Close button reaches its owner. */
    detailsOpen: boolean;
    setDetailsOpen: Dispatch<SetStateAction<boolean>>;
    detailsState: string;
    setDetailsState: Dispatch<SetStateAction<string>>;

    /** Drops everything tied to one branch/container, so nothing stale can render under a new heading. */
    resetStoreView: () => void;
}

export const StoreContext = createContext<IStoreContext>({} as IStoreContext);

const StoreContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [count, setCount] = useState<number>(0);
    const [curentStoreData, setCurrentStoreData] = useState<IStore>({} as IStore);
    const [branchId, setBranchId] = useState<string | number>("")
    const [currentAssetType, setCurrentAssetType] = useState<ITabHeader>({} as ITabHeader)
    const [storeReportTableData, setStoreReportTableData] = useState<Array<IStoreReportTableData>>([]);
    const [currentBranch, setCurrentBranch] = useState<IBranch>({} as IBranch)
    const [storeType, setStoreType] = useState<string>('');

    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [tableHeaders, setTableHeaders] = useState<ITabHeader[]>([]);
    const [storeError, setStoreError] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
    const [detailsState, setDetailsState] = useState<string>('');

    /**
     * This provider is mounted at the application root, so everything in it **survives navigation**.
     *
     * <p>That is what made the store pages show the wrong data: you left the Admin store looking at
     * one branch, came back through the landing page at another, and the previous branch's rows were
     * still sitting in state — rendered under whichever tab the new page happened to select, with
     * nothing on screen saying they were stale. Only `handleTabChange` ever cleared them, so the one
     * path that did not go through a tab click was the one that needed it most.
     *
     * <p>The <b>rows</b> are what must not survive, not the tab. Clearing `tableHeaders` and
     * `currentAssetType` here would also be wrong mechanically: a page's effects run <em>after</em>
     * its children's, so this would wipe the tab list `BranchStoreReport` had just built from a
     * catalogue that is not going to change again — leaving "No asset types configured" on a page
     * with twelve categories. Keeping the chosen category across visits is the better behaviour
     * anyway; it is matched by id, so it survives the catalogue being reordered.
     */
    const resetStoreView = useCallback(() => {
        setStoreReportTableData([]);
        setCount(0);
        setStoreError(null);
    }, []);

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
        storeType,
        setStoreType,
        sendingRequest,
        setSendingRequest,
        tableHeaders,
        setTableHeaders,
        storeError,
        setStoreError,
        detailsOpen,
        setDetailsOpen,
        detailsState,
        setDetailsState,
        resetStoreView,
    }}>
        {children}
    </StoreContext.Provider>
}

export default StoreContextProvider;
