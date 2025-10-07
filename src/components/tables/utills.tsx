/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    GridApi,
    GridExportMenuItemProps,
    gridFilteredSortedRowIdsSelector,
    gridVisibleColumnFieldsSelector,
    useGridApiContext
} from "@mui/x-data-grid";
import {
    assetStatus,
    assetTypesStatusConstants,
    requestStatus
} from "../../utils/constants";
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
import { camelCaseToWords } from "../../utils/helpers";

const TableUtills = ({ moduleName }: { moduleName?: string }) => {
    const { fileName } = useContext(FileContext);
    const { getCurrentUser } = RoutesUtills();
    const theme = useTheme();
    const [filterStatuses, setFilterStatuses] = useState<Array<{
        label: string,
        value: string,
        color: string
    }>>([]);
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


    /** * Extracts columns and rows from the provided data array, excluding specific keys.
 * @param data - An array of objects representing the data to be processed.
 * @returns An object containing the extracted columns and rows.
 */
    const determineRowsandColumns = (data: Array<{
        [key: string]: string | number | object | boolean |
        Array<{ [key: string]: string | number | object }>;
    }>) => {
        if (data.length === 0) {
            return { columns: [], rows: [] };
        }

        const columns = Object.keys(data[0])
            .filter(key => key !== 'image' && key !== 'action')
            .map(key => (
                {
                    title: camelCaseToWords(key.charAt(0).toUpperCase() + key.slice(1)),
                    dataKey: key,
                }));

        const rows = data.map(item => {
            return Object.keys(item).reduce((acc, key) => {
                if (key !== 'image' && key !== 'action') {
                    acc[key] = item[key];
                }
                return acc;
            }, {} as { [key: string]: string | number | object | boolean | Array<any> });
        });

        return {
            columns,
            rows
        };
    };


    /** * Export data from the current view of the DataGrid.
 * This function retrieves the currently visible and filtered data from the DataGrid
 * and formats it for export.
 */
    const exportFromCurrentData = async (apiRef: React.MutableRefObject<GridApi>) => {
        const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
        const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef);

        const data = filteredSortedRowIds.map((id) => {
            const row: Record<string, any> = {};
            visibleColumnsField.forEach((field) => {
                row[field] = apiRef.current.getCellParams(id, field).value;
            });
            return row;
        });

        const { columns, rows } = determineRowsandColumns(data);

        return { columns, rows };

    };

    const determineAPIString = (module: string) => {
        switch (module) {
            case assetTypesStatusConstants.itEquipment:
            case assetTypesStatusConstants.officeEquipment:
            case assetTypesStatusConstants.fleet:
                return 'assets';
            default:
                return module;
        }
    };

    /**
     * Generate PDF from the current data in the DataGrid or from API.
     * This function smartly decides whether to use the current filtered table data
     * or fetch fresh data from the API based on the module name.
     */
    const generatePDF = async (apiRef: React.MutableRefObject<GridApi>) => {
        try {
            if (!moduleName) {
                toast.error("Module name not specified");
                return;
            }

            let exportData: { columns: { title: string; dataKey: string; }[]; data: any[] };

            console.log(moduleName, "moduleName");

            // Determine if we should use current table data or fetch from API
            // We use current data for reports and special cases, API data for regular modules
            const useCurrentTableData = moduleName.toLowerCase().includes('report') ||
                moduleName === 'inventory commodities' ||
                moduleName === 'GRN documents' ||
                moduleName === 'assignment history' ||
                moduleName.toLowerCase().includes('commodities');

            if (useCurrentTableData) {
                // Use the current filtered/visible data from the table
                const result = await exportFromCurrentData(apiRef);
                exportData = { columns: result.columns, data: result.rows };
                console.log("Exporting PDF from current table data");
            } else {
                // Use API-fetched data
                const param = {
                    startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
                    endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : '',
                    assetTypeId: moduleName === assetTypesStatusConstants.itEquipment ? 2 : // Asset Type ID for IT Equipment is 2
                        moduleName === assetTypesStatusConstants.officeEquipment ? 1 : // Asset Type ID for Office Equipment is 1
                            moduleName === assetTypesStatusConstants.fleet ? 55 : null // Asset Type ID for Fleet is 55
                };

                const result = await formatExportData(determineAPIString(moduleName) as keyof ModuleTypeMap, param);
                exportData = { columns: result.columns, data: result.data };
                console.log("Exporting PDF from API data");
            }

            // Validate data before export
            if (!exportData.data || exportData.data.length === 0) {
                toast.error(`No data available for ${moduleName} export`);
                return;
            }

            // Export to PDF
            exportPDF(exportData.columns, exportData.data, fileName || moduleName || 'export');

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    /**
     * Generate Excel from the current data in the DataGrid or from API.
     * This function smartly decides whether to use the current filtered table data
     * or fetch fresh data from the API based on the module name.
     */
    const generateExcel = async (apiRef: React.MutableRefObject<GridApi>) => {
        try {
            if (!moduleName) {
                toast.error("Module name not specified");
                return;
            }

            let exportData: { columns: { title: string; dataKey: string; }[]; data: any[] };

            // Determine if we should use current table data or fetch from API
            const useCurrentTableData = moduleName.toLowerCase().includes('report') ||
                moduleName === 'inventory commodities' ||
                moduleName === 'GRN documents' ||
                moduleName === 'assignment history' ||
                moduleName.toLowerCase().includes('commodities');

            if (useCurrentTableData && apiRef) {
                // Use the current filtered/visible data from the table
                const result = await exportFromCurrentData(apiRef);
                exportData = { columns: result.columns, data: result.rows };
                console.log("Exporting Excel from current table data");
            } else {
                // Use API-fetched data
                const param = {
                    startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
                    endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : '',
                    assetTypeId: moduleName === assetTypesStatusConstants.itEquipment ? 2 : // Asset Type ID for IT Equipment is 2
                        moduleName === assetTypesStatusConstants.officeEquipment ? 1 : // Asset Type ID for Office Equipment is 1
                            moduleName === assetTypesStatusConstants.fleet ? 55 : null // Asset Type ID for Fleet is 55
                };

                const result = await formatExportData(determineAPIString(moduleName) as keyof ModuleTypeMap, param);
                exportData = { columns: result.columns, data: result.data };
                console.log("Exporting Excel from API data");
            }

            // Validate data before export
            if (!exportData.data || exportData.data.length === 0) {
                toast.error(`No data available for ${moduleName} Excel export`);
                return;
            }

            // Export to Excel
            exportExcel(exportData.columns, exportData.data, fileName || moduleName || 'export');

        } catch (error) {
            console.error('Error generating Excel:', error);
            toast.error('Failed to generate Excel: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };


    /*     * Create JSON export menu item
     */
    const JsonExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
        const theme = useTheme();
        const apiRef = useGridApiContext();
        const { hideMenu } = props;

        return (
            <MenuItem
                sx={{
                    color: theme.palette.secondary.main,
                }}
                onClick={() => {
                    generatePDF(apiRef);
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
        const apiRef = useGridApiContext();
        return (
            <MenuItem
                sx={{
                    color: theme.palette.primary.main,
                }}
                onClick={() => {
                    generateExcel(apiRef);
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
        const isITEquipmentModule = module === 'IT Equipment';
        const isOfficeEquipmentModule = module === 'Office Equipment';
        const isFleetEquipmentModule = module === 'Fleet';

        const isFilterEnabled = Boolean(filter);

        // Handle Request module filtering (existing logic)
        if (isRequestModule && isFilterEnabled) {
            const isRequester = row?.requesterID === currentUserId;
            const status = optionsfilterParams?.status?.toUpperCase() || "";

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

        // Handle IT Equipment, Fleet Equipment and Office Equipment module filtering (same logic for both)
        if ((isITEquipmentModule || isOfficeEquipmentModule || isFleetEquipmentModule) && isFilterEnabled) {
            const status = row?.status?.toLowerCase() || "";
            // const assignedTo = row?.assignedTo || "";
            // const hasAssignment = assignedTo && assignedTo.trim() !== "";

            // console.log(status, "Status in Option Filter");

            return options.filter((option: any) => {
                switch (option.value) {
                    case 'read':
                    case 'update':
                        // Always show read and update
                        return true;

                    case 'dispose':
                        // Always show dispose for all statuses
                        if (status === 'requireupdate') return false;
                        if (status === 'issuanceavailable') return false;
                        return true;

                    case 'reassign':
                        // Show reassign only if asset is assigned or status allows assignment
                        return status === 'instore'
                    // hasAssignment && status !== "inmaintenance"
                    // || status !== 'requireupdate';

                    case 'repair':
                        // Don't show repair for assets in store (they should be taken out first)
                        // Don't show repair for assets requiring update (they need to be updated first)
                        return status === 'instore' || status === 'requestacknowledged';

                    case 'inStore':
                        // Don't show "Send to Store" for assets already in store
                        // Don't show for assigned assets in certain statuses
                        if (status === 'instore') return false;
                        if (status === 'requireupdate') return false;
                        if (status === 'inmaintenance') return true;
                        if (status === 'issuanceavailable') return false;
                        return true;

                    default:
                        return true;
                }
            });
        }

        // For all other modules, return default options without filtering
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
