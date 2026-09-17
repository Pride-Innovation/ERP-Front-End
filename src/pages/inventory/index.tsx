/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchSuppliersService } from "../settings/suppliers/service";
import { fetchAllBranches, ReferenceOption } from "../users/service/referenceData";
import useAccessScope from "../../core/permissions/useAccessScope";
import { Box } from "@mui/material";
// import { useNavigate } from "react-router";
// import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
// import { ROUTES } from "../../core/routes/routes";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import TableComponent from "../../components/tables/TableComponent";
import InventoryUtills from "./Utills";
import StatusUtills from "../settings/statuses/Utills";
import { statusIdByCode } from "../../utils/helpers";
import { crudStates } from "../../utils/constants";
import ModalComponent from "../../components/modal";
import DeleteInventory from "./DeleteInventory";
import UploadGRN from "./UploadGRN";
import { FormContext } from "../../context/form";
import { InventoryContext } from "../../context/inventory";
import dayjs from "dayjs";
import { PERMISSIONS } from "../../core/permissions/constants";
import { PageHero } from "../../components/layout";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

const Inventory = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { tableStartDate, tableEndDate } = useContext(FormContext);
    const { inventoryCount } = useContext(InventoryContext);
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const { fetchAllStatuses } = StatusUtills();
    // const navigate = useNavigate();

    const {
        columnHeaders,
        stocksTableData,
        header,
        modalState,
        handleClose,
        handleOptionClicked,
        open,
        handleCreation,
        fetchInventory,
        loading,
        count,
        endPoint,
    } = InventoryUtills();

    useEffect(() => { fetchInventory() }, []);
    // Load the status catalogue so the stocking-status filter can resolve a stable status id.
    useEffect(() => { if (statuses.length === 0) fetchAllStatuses(); }, []);

    // Translate the "Stocking Status" column filter (a status code) to the backend's stockStatusId,
    // and pass any other column filters straight through.
    /** The params currently in force, so turning a page can reissue the same query. */
    const activeParams = useRef<Record<string, any>>({});

    /*
     * Branch options for the branch filter, and how far this viewer can actually reach.
     *
     * The filter is offered only at ALL scope. Below that the listing is already one branch, so the
     * control could only ever return everything or — if someone picked another branch — a refusal.
     * A filter whose every option but one is an error is worse than no filter.
     */
    const { scopeFor } = useAccessScope();
    const seesEveryBranch = scopeFor('INVENTORY', 'VIEW') === 'ALL';
    const [branches, setBranches] = useState<ReferenceOption[]>([]);

    useEffect(() => {
        if (!seesEveryBranch) return;
        fetchAllBranches()
            .then(setBranches)
            .catch((e) => console.warn('Failed to load branches for the inventory filter', e));
    }, [seesEveryBranch]);

    /**
     * The supplier list behind the filter, one debounced page at a time.
     *
     * <p>Ten at a time with search rather than every supplier up front: the list is a table, not a
     * dropdown, and it only grows.
     */
    const fetchSupplierOptions = useCallback(async (query: string, page: number, pageSize: number) => {
        const res: any = await fetchSuppliersService({
            name: query?.trim() || undefined,
            pageNumber: page,
            pageSize,
        });
        if (res?.status !== 200) return { options: [], totalElements: 0 };

        const content = res.data?.content ?? [];
        return {
            options: content.map((sup: any) => ({ value: sup.id, label: sup.name })),
            totalElements: res.data?.totalElements ?? content.length,
        };
    }, []);

    /**
     * The page size the user last chose, so a new query keeps it.
     *
     * <p>Applying a filter used to call `fetchInventory(params)` with no page model, which falls back
     * to ten. With 25 rows per page selected, the server then returned ten while the grid still
     * believed it had 25 — so the page count was computed from the wrong divisor and page two
     * requested rows 25–49, silently skipping ten to twenty-four.
     *
     * <p>The page always restarts at zero on a new query, which is correct: staying on page four of
     * the old result set would show an arbitrary slice of the new one.
     */
    const pageSizeRef = useRef<number>(10);

    const runQuery = (params: Record<string, any>) => {
        activeParams.current = params;
        fetchInventory(params, { page: 0, pageSize: pageSizeRef.current });
    };

    /**
     * Turns what the filter panel produces into what `GET /stocks` actually declares.
     *
     * <p>Three of the four filters needed translating, and two of them had none — Spring drops an
     * undeclared parameter without complaining, so both boxes looked like they worked and quietly
     * returned the unfiltered list:
     *
     * <ul>
     *   <li><b>Stocking Status</b> — `status` is a code; the endpoint wants `stockStatusId`. Resolved
     *       by code rather than by a literal, because ids depend on seed order.</li>
     *   <li><b>Date Created</b> — the panel emits `createdAtFrom` / `createdAtTo` from the filter's
     *       key; the endpoint has the same range under `startDate` / `endDate`. It was purely a name
     *       mismatch, so the filter had a working query behind it the whole time and never reached
     *       it.</li>
     *   <li><b>Display labels</b> — an `asyncSelect` keeps the chosen option's name beside its id for
     *       the filter summary. Only the id belongs on the wire.</li>
     * </ul>
     */
    const applyInventoryFilters = (filters: Record<string, any>) => {
        const {
            status,
            createdAtFrom,
            createdAtTo,
            ...rest
        } = filters || {};

        const params: Record<string, any> = Object.fromEntries(
            Object.entries(rest).filter(([key]) => !key.endsWith('__label')),
        );

        if (status) {
            const id = statusIdByCode(statuses, status);
            if (id != null) params.stockStatusId = id;
        }
        if (createdAtFrom) params.startDate = createdAtFrom;
        if (createdAtTo) params.endDate = createdAtTo;

        runQuery(params);
    };

    useEffect(() => {
        if (tableStartDate && tableEndDate) {
            // Merged with whatever is already in force — the date picker narrows the current view
            // rather than replacing it.
            runQuery({
                ...activeParams.current,
                startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
                endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableStartDate, tableEndDate]);

    const todayLabel = useMemo(
        () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        []
    );

    return (
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <PageHero
                title="Inventory Management"
                subtitle="Track and manage stock levels"
                icon={<Inventory2OutlinedIcon />}
                stat={{
                    value: (inventoryCount ?? count ?? 0).toLocaleString(),
                    label: 'records',
                    helper: todayLabel,
                }}
            />

            {/* Entry point to the read-only cross-check of orders against GRNs and the asset register. */}
            {/* <Stack direction="row" justifyContent="flex-end" sx={{ px: { xs: 1, md: 0 }, mb: 1.5 }}>
                <Button
                    variant="outlined"
                    startIcon={<FactCheckOutlinedIcon />}
                    onClick={() => navigate(ROUTES.INVENTORY_RECONCILIATION)}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '999px' }}
                >
                    Reconciliation
                </Button>
            </Stack> */}

            {modalState === crudStates.delete && (
                <ModalComponent title='Delete Inventory' open={open} handleClose={handleClose} width="40%">
                    <DeleteInventory
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        sendingRequest={sendingRequest}
                    />
                </ModalComponent>
            )}
            {modalState === crudStates.upload && (
                <ModalComponent title='Upload Signed GRN' open={open} handleClose={handleClose} width="40%">
                    {/* No single GRN is in context from the list — a stock can hold several, so the
                        modal explains where to attach the scan rather than guessing. */}
                    <UploadGRN handleClose={handleClose} />
                </ModalComponent>
            )}

            {columnHeaders.length > 0 && (
                <Box sx={{ px: { xs: 0, md: 0 } }}>
                    <TableComponent
                tableKey="inventoryOrders"
                        createAction
                        createPermission={PERMISSIONS.CREATE_INVENTORY}
                        loading={loading}
                        exportData
                        handleOptionClicked={handleOptionClicked}
                        onCreationHandler={handleCreation}
                        module='inventory'
                        header={header}
                        count={count}
                        rows={stocksTableData}
                        columnHeaders={columnHeaders}
                        paginationMode="server"
                        endPoint={endPoint}
                        refresh
                        dateRangePicker
                        tableIcon={<Inventory2OutlinedIcon sx={{ fontSize: 18, color: '#08796C' }} />}
                        columnFilters={[
                            { key: 'lpoNumber', label: 'LPO Number', type: 'text' },
                            /*
                             * Supplier — picked from the directory, not typed.
                             *
                             * It was a text box sending `supplier` as a partial name to an endpoint
                             * that never declared it, so it silently did nothing. It now carries
                             * `supplierId`, which the endpoint declares and the DAO joins on.
                             *
                             * Unscoped: suppliers are organisation-wide, so unlike the staff
                             * directory there is nothing here to narrow by branch.
                             */
                            {
                                key: 'supplierId',
                                label: 'Supplier',
                                type: 'asyncSelect' as const,
                                placeholder: 'Search suppliers…',
                                fetchOptions: fetchSupplierOptions,
                            },
                            {
                                key: 'status', label: 'Stocking Status', type: 'select', options: [
                                    { value: 'stockCompleted', label: 'Fully Stocked' },
                                    { value: 'stockPending', label: 'Partially Stocked' },
                                    { value: 'stockClosedShort', label: 'Closed Short' },
                                ]
                            },
                            /*
                             * Which branch's deliveries to show.
                             *
                             * Only rendered for someone who sees more than one — see the note on
                             * `seesEveryBranch` above. The server refuses a branch the caller may
                             * not see rather than substituting their own, so this cannot widen
                             * anything even if it were sent by hand.
                             */
                            ...(seesEveryBranch ? [{
                                key: 'branchId',
                                label: 'Branch',
                                type: 'select' as const,
                                options: branches,
                            }] : []),
                            { key: 'createdAt', label: 'Date Created', type: 'dateRange' },
                        ]}
                        onApplyFilters={applyInventoryFilters}
                        onPaginationChange={(model) => {
                            // Remembered so the next filter keeps the size the user chose.
                            pageSizeRef.current = model.pageSize;
                            fetchInventory(activeParams.current, model);
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default Inventory;
