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
import { assetStatus, requestStatus } from "../../utils/constants";
import { MenuItem, useTheme } from "@mui/material";
import { exportPDF } from "../../utils/pdf";
import { camelCaseToWords } from "../../utils/helpers";
import { useContext } from "react";
import { FileContext } from "../../context/file/FileContext";
import RoutesUtills from "../../core/routes/utills";

const TableUtills = () => {
    const { fileName } = useContext(FileContext);
    const { getCurrentUser } = RoutesUtills();

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


    const handleOptionsFilter = (
        column: any,
        filter?: boolean,
        row?: any,
        module?: string
    ) => {

        /**
         * Ensure that the options in the select dropdown are filtered based on the current row.
         * For this purpose we need to ensure that each request owner has to be tracked and not able to approve or reject their own request.
         * This is to ensure that the request is approved by a different person than the one who created it.
         */
        const options = column?.actionData?.options || [];

        const currentUserId = getCurrentUser()?.id || 0;

        const isRequestModule = module === 'request';
        const isFilterEnabled = !!filter;
        const isRequester = row?.requesterID === currentUserId;

        if (isRequestModule && isFilterEnabled) {
            if (isRequester) {
                return options.filter(
                    (option: any) => option.value !== 'approve' && option.value !== 'reject'
                );
            } else {
                return options.filter(
                    (option: any) => option.value !== 'delete' && option.value !== 'update'
                );
            }
        }

        return options;
    }

    return {
        determineTimeLineDotColor,
        JsonExportMenuItem,
        handleOptionsFilter
    };
};

export default TableUtills;
