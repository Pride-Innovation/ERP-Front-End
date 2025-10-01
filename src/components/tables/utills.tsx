/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { GridExportMenuItemProps } from "@mui/x-data-grid";
import { assetStatus, assetTypesStatusConstants, requestStatus } from "../../utils/constants";
import { MenuItem, useTheme } from "@mui/material";
import { exportPDF } from "../../utils/pdf";
import { useContext, useEffect, useState } from "react";
import { FileContext } from "../../context/file/FileContext";
import RoutesUtills from "../../core/routes/utills";
import formatExportData, { ModuleTypeMap } from "./formatExportData";
import { toast } from "react-toastify";
import { exportExcel } from "../../utils/excel";
import { FormContext } from "../../context/form";
import dayjs from "dayjs";

const TableUtills = ({ moduleName }: { moduleName?: string }) => {
    const { fileName } = useContext(FileContext);
    const { getCurrentUser } = RoutesUtills();
    const theme = useTheme();
    const [filterStatuses, setFilterStatuses] = useState<Array<{ label: string, value: string, color: string }>>([]);
    const { tableStartDate, tableEndDate } = useContext(FormContext);

    const determineTimeLineDotColor = (value: string) => {
        switch (value) {
            case requestStatus.approved:
            case assetStatus.use:
            case assetStatus.active:
                return 'green';
            case requestStatus.pending:
            case assetStatus.repair:
                return 'orange';
            case requestStatus.rejected:
            case assetStatus.disposed:
                return 'red';
            default:
                return 'blue';
        }
    };


    const generatePDF = async () => {

        const param = {
            startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
            endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
        }

        try {
            if (!moduleName) return;

            const { data, columns } = await formatExportData(moduleName as keyof ModuleTypeMap, param);

            if (!data || data.length === 0) {
                toast.error(`No data available for ${moduleName} export`);
                return;
            }
            exportPDF(columns, data, fileName || moduleName || 'export');

        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };


    const generateExcel = async () => {

        const param = {
            startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
            endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
        }

        try {
            if (!moduleName) return;

            const { data, columns } = await formatExportData(moduleName as keyof ModuleTypeMap, param);

            if (!data || data.length === 0) {
                toast.error(`No data available for ${moduleName} export`);
                return;
            }
            exportExcel(columns, data, fileName || moduleName || 'export');

        } catch (error) {
            console.error('Error generating Excel:', error);
        }
    };


    const JsonExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
        const theme = useTheme();

        const { hideMenu } = props;

        return (
            <MenuItem
                sx={{
                    color: theme.palette.secondary.main,
                }}
                onClick={() => {
                    generatePDF();
                    hideMenu?.();
                }}
            >
                Download as PDF
            </MenuItem>
        );
    }

    // Create Excel export menu item
    const ExcelExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
        const { hideMenu } = props;

        console.log(tableEndDate, tableStartDate, "excel");

        return (
            <MenuItem
                sx={{
                    color: theme.palette.secondary.main,
                }}
                onClick={() => {
                    generateExcel();
                    hideMenu?.();
                }}
            >
                Download as Excel
            </MenuItem>
        );
    };

    /**
     * Ensure that the options in the select dropdown are filtered based on the current row.
     * For this purpose we need to ensure that each request owner has to be tracked and not able to approve or reject their own request.
     * This is to ensure that the request is approved by a different person than the one who created it.
     */
    const handleOptionsFilter = (
        column: any,
        filter?: boolean,
        row?: any,
        module?: string,
        optionsfilterParams?: Record<string, any>
    ) => {
        const options = column?.actionData?.options || [];
        const currentUserId = getCurrentUser()?.id || 0;

        const isRequestModule = module === 'request';
        const isFilterEnabled = Boolean(filter);
        const isRequester = row?.requesterID === currentUserId;
        const status = optionsfilterParams?.status?.toUpperCase() || "";

        if (isRequestModule && isFilterEnabled) {
            if (isRequester) {
                if (status === "CREATED") {
                    return options.filter(
                        (option: any) =>
                            option.value !== 'approve' &&
                            option.value !== 'reject'
                    );
                }

                if (status === "PENDING") {
                    return options.filter(
                        (option: any) =>
                            option.value !== 'issue' &&
                            option.value !== 'acknowledgeRequest'
                    );
                }
            }

            return options.filter(
                (option: any) =>
                    option.value !== 'delete' &&
                    option.value !== 'update'
            );
        }

        return options;
    }

    const assetFilterStatuses: { label: string, value: string, color: string }[] = [
        {
            label: "Require Update",
            value: "requireUpdate",
            color: theme.palette.warning.main
        },
        {
            label: "In Repair",
            value: "inMaintenance",
            color: theme.palette.secondary.main
        },
        {
            label: "Issuance Available",
            value: "issuanceAvailable",
            color: theme.palette.success.main
        },
        {
            label: "In Store",
            value: "inStore",
            color: theme.palette.error.main
        },
        {
            label: "In Use",
            value: "receiptAcknowledged",
            color: theme.palette.info.main
        }
    ];

    const userFilterStatuses: { label: string, value: string, color: string }[] = [
        {
            label: "Active",
            value: "active",
            color: theme.palette.success.main
        },
        {
            label: "Locked",
            value: "locked",
            color: theme.palette.warning.main
        },
        {
            label: "Disabled",
            value: "disabled",
            color: theme.palette.error.main
        }
    ];

    const requestsPendingFilterStatuses: { label: string, value: string, color: string }[] = [
        {
            label: "Request Approved",
            value: "requestApproved",
            color: theme.palette.success.main
        },
        {
            label: "Request Acknowledged",
            value: "requestAcknowledged",
            color: theme.palette.warning.main
        },
    ]

    const requestsRejectedFilterStatuses: { label: string, value: string, color: string }[] = [
        {
            label: "Request Rejected",
            value: "requestRejected",
            color: theme.palette.error.main
        }
    ]

    const requestIssuedFilterStatuses: { label: string, value: string, color: string }[] = [
        {
            label: "Request Issued",
            value: "requestIssued",
            color: theme.palette.info.main
        },
        {
            label: "Receipt Acknowledged",
            value: "receiptAcknowledged",
            color: theme.palette.info.main
        },
        {
            label: "Issuance Approved",
            value: "issuanceApproved",
            color: theme.palette.secondary.main
        }
    ];

    const userRequestFilterStatuses: { label: string, value: string, color: string }[] = [

        {
            label: "Request Created",
            value: "requestCreated",
            color: theme.palette.error.main
        },
        ...requestsPendingFilterStatuses,
        ...requestsRejectedFilterStatuses,
        ...requestIssuedFilterStatuses
    ];


    const inventoryFilterStatuses: { label: string, value: string, color: string }[] = [
        {
            label: "Stock Completed",
            value: "stockCompleted",
            color: theme.palette.success.main
        },
        {
            label: "Stock Pending",
            value: "stockPending",
            color: theme.palette.warning.main
        },
    ]

    const determineFilterStatuses = () => {
        switch (moduleName) {
            case assetTypesStatusConstants.itEquipment:
            case assetTypesStatusConstants.officeEquipment:
            case assetTypesStatusConstants.fleet:
                return setFilterStatuses(assetFilterStatuses);
            case "user":
                return setFilterStatuses(userFilterStatuses);
            case "request":
                return setFilterStatuses(userRequestFilterStatuses);
            case "issued requests":
                return setFilterStatuses(requestIssuedFilterStatuses);
            case "pending requests":
                return setFilterStatuses(requestsPendingFilterStatuses);
            case "inventory":
                return setFilterStatuses(inventoryFilterStatuses);
            default:
                return [] as Array<{ label: string, value: string, color: string }>;
        }
    };

    useEffect(() => { determineFilterStatuses() }, [moduleName]);

    return {
        determineTimeLineDotColor,
        JsonExportMenuItem,
        handleOptionsFilter,
        filterStatuses,
        ExcelExportMenuItem
    };
};

export default TableUtills;
