/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import TableComponent from "../../components/tables/TableComponent";
import InventoryUtills from "./Utills";
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
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const { tableStartDate, tableEndDate } = useContext(FormContext);
    const { inventoryCount } = useContext(InventoryContext);

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

    const handleStatusChange = (status: string) => {
        if (status.length > 0) {
            const param = {
                stockStatusId: status === "stockPending" ? 10
                    : status === "stockCompleted" ? 11 : ""
            };
            fetchInventory(param);
            setSelectedStatus(status);
        } else {
            fetchInventory();
            setSelectedStatus('all');
        }
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
                        status
                        onStatusChange={handleStatusChange}
                        selectedStatus={selectedStatus}
                        dateRangePicker
                        tableIcon={<Inventory2OutlinedIcon sx={{ fontSize: 18, color: '#08796C' }} />}
                        columnFilters={[
                            { key: 'lpoNumber', label: 'LPO Number', type: 'text' },
                            { key: 'supplier', label: 'Supplier', type: 'text' },
                            { key: 'location', label: 'Location', type: 'text' },
                            {
                                key: 'status', label: 'Status', type: 'select', options: [
                                    { value: 'active', label: 'Active' },
                                    { value: 'disabled', label: 'Disabled' },
                                    { value: 'locked', label: 'Locked' },
                                ]
                            },
                            { key: 'createdAt', label: 'Date Created', type: 'dateRange' },
                        ]}
                        onApplyFilters={(filters) => fetchInventory(filters)}
                    />
                </Box>
            )}
        </Box>
    );
};

export default Inventory;
