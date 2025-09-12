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
import { assetStatus, assetTypesStatusConstants, requestStatus } from "../../utils/constants";
import { MenuItem, useTheme } from "@mui/material";
import { exportPDF } from "../../utils/pdf";
import { camelCaseToWords } from "../../utils/helpers";
import { useContext, useEffect, useState } from "react";
import { FileContext } from "../../context/file/FileContext";
import RoutesUtills from "../../core/routes/utills";

const TableUtills = ({ moduleName }: { moduleName?: string }) => {
    const { fileName } = useContext(FileContext);
    const { getCurrentUser } = RoutesUtills();
    const theme = useTheme();
    const [filterStatuses, setFilterStatuses] = useState<Array<{ label: string, value: string, color: string }>>([]);

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


    const generatePDF = (apiRef: React.MutableRefObject<GridApi>) => {
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
        return exportPDF(columns, rows, fileName);
    };


    const JsonExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
        const apiRef = useGridApiContext();
        const theme = useTheme();

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
    };
};

export default TableUtills;
