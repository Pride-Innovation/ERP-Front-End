/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useMemo, useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router";
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { ROUTES } from "../../core/routes/routes";
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
    const navigate = useNavigate();

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
    const applyInventoryFilters = (filters: Record<string, any>) => {
        const { status, ...rest } = filters || {};
        const params: Record<string, any> = { ...rest };
        if (status) {
            const id = statusIdByCode(statuses, status);
            if (id != null) params.stockStatusId = id;
        }
        fetchInventory(params);
    };

    useEffect(() => {
        if (tableStartDate && tableEndDate) {
            const param = {
                startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
                endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
            };
            fetchInventory(param);
        }
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
            <Stack direction="row" justifyContent="flex-end" sx={{ px: { xs: 1, md: 0 }, mb: 1.5 }}>
                <Button
                    variant="outlined"
                    startIcon={<FactCheckOutlinedIcon />}
                    onClick={() => navigate(ROUTES.INVENTORY_RECONCILIATION)}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '999px' }}
                >
                    Reconciliation
                </Button>
            </Stack>

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
                    <UploadGRN />
                </ModalComponent>
            )}

            {columnHeaders.length > 0 && (
                <Box sx={{ px: { xs: 0, md: 0 } }}>
                    <TableComponent
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
                            { key: 'supplier', label: 'Supplier', type: 'text' },
                            {
                                key: 'status', label: 'Stocking Status', type: 'select', options: [
                                    { value: 'stockCompleted', label: 'Fully Stocked' },
                                    { value: 'stockPending', label: 'Partially Stocked' },
                                    { value: 'stockClosedShort', label: 'Closed Short' },
                                ]
                            },
                            { key: 'createdAt', label: 'Date Created', type: 'dateRange' },
                        ]}
                        onApplyFilters={applyInventoryFilters}
                    />
                </Box>
            )}
        </Box>
    );
};

export default Inventory;
