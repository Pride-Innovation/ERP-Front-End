/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useRef } from "react";
import { IStore, IStoresAxiosResponse } from "./interface";
import RoutesUtills from "../../core/routes/utills";
import { StoreContext } from "../../context/store";
import { IAssetType } from "../settings/assetTypes/interface";
import TableData from "./TableData";
import { crudStates } from "../../utils/constants";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { IBranch, IBranchAxiosResponse, IBranchesAxiosResponse } from "../settings/branch/interface";
import { fetchSingleBranchService } from "../settings/branch/service";
import { fetchRowsService } from "../../core/apis/globalService";
import { useDispatch } from "react-redux";
import { loadAllStores } from "./slice";
import useAccessScope from "../../core/permissions/useAccessScope";

/**
 * Why a store listing did not load, in words the reader can act on.
 *
 * <h2>A refusal is not a fault, and must not read like one</h2>
 * `GET /store` resolves the branch through `AccessScopeService` and **refuses** one the caller may
 * not see rather than substituting their own — deliberately, because showing one branch's figures
 * under another's name is worse than showing none. A branch user who follows a bookmarked
 * `?branchId=<Head Office>` therefore gets a 403, and until now that landed in a `console.log`: the
 * table kept the previous branch's rows while the header card announced Head Office.
 *
 * <p>Distinguishing the two matters because the answers differ. A boundary is permanent and the user
 * should go back; a failure is worth retrying.
 */
export const listingFailure = (response: unknown): string => {
    const status = (response as { status?: number; response?: { status?: number } })?.status
        ?? (response as { response?: { status?: number } })?.response?.status;

    if (status === 403 || status === 401) {
        return 'You do not have access to this branch\u2019s store. Showing nothing rather than another branch\u2019s figures.';
    }
    return 'Could not load this store\u2019s stock. Please try again.';
};

const StoreUtills = () => {
    const { stores } = useSelector((state: RootState) => state.StoreStore)
    const dispatch = useDispatch<AppDispatch>();

    /*
     * Everything two components have to agree on lives in the context.
     *
     * This hook is called by five of them, and a `useState` here gives each its own copy — which is
     * why the page's loading panel and the grid's spinner both read a flag belonging to an instance
     * that never fetched anything, and why `tableHeaders` was populated in one component and empty
     * in the rest. The behaviour below is shared correctly because it is a function; the state was
     * not, because it was not.
     */
    const {
        setCurrentStoreData,
        setBranchId,
        setCurrentAssetType,
        setCurrentBranch,
        branchId,
        currentAssetType,
        storeType,
        setCount,
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
        setStoreReportTableData,
    } = useContext(StoreContext);

    /**
     * Which listing request is the current one.
     *
     * <p>Arriving at a store page fires the fetch several times as the branch, the category and the
     * container each settle, and the first of those carries the **previous** branch. Nothing
     * sequenced the replies, so a slow early request could land after the correct one and overwrite
     * it — a stale answer arriving as if it were fresh. `StoreAssetsPanel` in this same folder
     * already guards against that with a cancelled flag; a monotonic ticket does the same job for a
     * function that is called rather than run inside an effect.
     *
     * <p>A ref rather than state: nothing renders from it, and a re-render per request would be the
     * opposite of what it is for.
     */
    const requestSequence = useRef(0);

    const handleOpen = () => setDetailsOpen(true);
    const handleClose = () => setDetailsOpen(false);

    const { getCurrentUser } = RoutesUtills();
    // Whether this viewer reaches beyond one branch. Used below to decide whether guessing at Head
    // Office is a helpful default or just a 403 waiting to happen.
    const { scopeFor } = useAccessScope();
    const seesEveryBranch = scopeFor('INVENTORY', 'VIEW') === 'ALL';

    /**
     * Resolves the Head Office branch from the branches directory — the default scope when the
     * logged-in user has no branch of their own (or their cached branch no longer exists).
     */
    const resolveHeadOfficeBranch = async (): Promise<IBranch | null> => {
        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 200,
                endPoint: "branches"
            }) as IBranchesAxiosResponse;
            if (response.status === 200) {
                return (response.data.content ?? []).find((branch) => branch.isHeadOffice) ?? null;
            }
        } catch (error) {
            console.log(error)
        }
        return null;
    }

    /**
     * Which branch the store pages should open on.
     *
     * <h2>The user's own branch, not their title's</h2>
     * This read `title.branch.id`, and that is a different thing. A title is an organisation-wide job
     * description — "Branch Manager" is the same title at every branch — so it commonly carries no
     * branch at all. When it did not, this fell through to the Head Office default and the page then
     * asked `GET /store?branchId=<Head Office>`, which the server correctly refused: **a branch user
     * opening the store page got "You do not have access to this record."** They had a branch all
     * along; it was read from the wrong place.
     *
     * <p>`user.branch` is the duty station, and it is what the backend's `currentUserBranchId()` and
     * the frontend's `useAccessScope` both read. Those three must agree — when they drift, the page
     * asks for something the endpoint then refuses, which is this bug exactly.
     */
    const setCurrentUserBranch = async (id?: number) => {
        if (id) {
            setBranchId(id)
            return;
        }
        const user = getCurrentUser();
        // `title.branch` kept as a fallback: some older accounts carry a branch only there, and
        // preferring the duty station costs them nothing.
        const userBranchId = user?.branch?.id ?? user?.title?.branch?.id;
        if (userBranchId) {
            setBranchId(userBranchId as number)
            return;
        }
        /*
         * Genuinely no branch on the account. Head Office is the right guess only for someone who
         * can actually see it — for anyone else it reproduces the 403 this function exists to avoid,
         * so they are left unset and the page renders its empty state instead of an error.
         */
        if (!seesEveryBranch) return;
        const headOffice = await resolveHeadOfficeBranch();
        if (headOffice) {
            setBranchId(headOffice.id as number)
            setCurrentBranch(headOffice)
        }
    }

    const fetchBranchDetails = async (id: number) => {
        try {
            const response = await fetchSingleBranchService(id) as IBranchAxiosResponse
            if (response.status === 200) {
                setCurrentBranch(response.data)
                return;
            }
            // Branch lookup failed (e.g. a stale session pointing at a deleted branch) →
            // fall back to Head Office so the page still loads with a sensible scope.
            // Re-setting an identical branchId is a no-op, so this cannot loop.
            const headOffice = await resolveHeadOfficeBranch();
            if (headOffice) {
                setBranchId(headOffice.id as number)
                setCurrentBranch(headOffice)
            }
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Builds one tab per asset category, keeping whichever category is already selected.
     *
     * <p>It used to end in {@code setCurrentAssetType(headers[0])} unconditionally, so every refresh
     * of the catalogue silently dragged the fetch back to the first category while the tab bar went
     * on highlighting wherever the viewer had clicked — the tab and the data disagreeing, which is
     * the fault this whole page had in several forms.
     *
     * <p>Matched by **id**, not by position, for the same reason the positional map came out of
     * `TabComponent`: `GET /asset-types` orders by name, so a rename reorders the list and an index
     * means nothing across two loads.
     */
    const handleTableColumns = (assetTypes: IAssetType[]) => {
        if (assetTypes.length < 1) return [];

        const headers = assetTypes.map((assetType, index) => ({
            label: assetType.name,
            position: index,
            content: <TableData />,
            id: assetType.id
        }))
        setTableHeaders(headers)

        const stillSelected = headers.find(header => header.id === currentAssetType?.id);
        setCurrentAssetType(stillSelected ?? headers[0])
    }

    const findSingleStore = (id: number): IStore => {
        return stores.find(store => store.id === id) as IStore;;
    }

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.read:
                setDetailsState(crudStates.read)
                setCurrentStoreData(findSingleStore(moduleID as number))
                handleOpen()
                break;
            default:
                break;
        }

    }

    /**
     * The balances listing for one branch, category and store container.
     *
     * <h2>Two faults beside the sequencing, both of which read as "the wrong data"</h2>
     *
     * <p><b>Nothing was cleared first.</b> The previous branch's rows stayed on screen for the whole
     * round trip, and stayed for good if it failed — so a refused branch looked exactly like a
     * loaded one, with the header card naming the branch that had just been refused.
     *
     * <p><b>A failure was a `console.log`.</b> Services here return the error instead of throwing
     * (trap #6), so anything that is not a 200 has to be treated as failed explicitly. Otherwise a
     * permission boundary reads as a broken page — which is exactly what a branch user saw after
     * following a bookmarked `?branchId=` into a branch they cannot see.
     */
    const fetchStoresCommoditiesPerBranchPerAsset = async () => {
        if (!branchId || !currentAssetType?.id) return;

        const ticket = ++requestSequence.current;
        const superseded = () => ticket !== requestSequence.current;

        setSendingRequest(true)
        setStoreError(null)
        // Cleared before the call rather than after it: rows belonging to another branch must not be
        // readable under this branch's heading while the request is in flight.
        setStoreReportTableData([])
        dispatch(loadAllStores([]))
        setCount(0)

        try {
            const params = {
                branchId,
                assetTypeId: currentAssetType.id,
                // Scope to the page's store container (ADMIN / IT / DISPOSAL) when set —
                // otherwise the Admin, IT and Disposal pages all show the same branch list.
                ...(storeType ? { storeType: storeType.toUpperCase() } : {})
            }
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint: "store",
                params
            }) as IStoresAxiosResponse;

            if (superseded()) return;

            if (response?.status === 200) {
                dispatch(loadAllStores(response.data.content))
                setCount(response.data.totalElements)
            } else {
                setStoreError(listingFailure(response))
            }
        } catch (error) {
            if (!superseded()) setStoreError(listingFailure(error))
        } finally {
            if (!superseded()) setSendingRequest(false)
        }
    }


    return ({
        setCurrentUserBranch,
        sendingRequest,
        handleTableColumns,
        tableHeaders,
        setCurrentAssetType,
        setSendingRequest,
        handleOptionClicked,
        open: detailsOpen,
        handleClose,
        currentState: detailsState,
        storeError,
        fetchBranchDetails,
        fetchStoresCommoditiesPerBranchPerAsset
    })
}

export default StoreUtills