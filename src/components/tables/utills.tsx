import {
    GridApi,
    GridExportMenuItemProps,
    gridFilteredSortedRowIdsSelector,
    gridVisibleColumnFieldsSelector,
    useGridApiContext
} from "@mui/x-data-grid";
import { assetStatus, requestStatus } from "../../utils/constants";
import { MenuItem } from "@mui/material";
import { exportPDF } from "../../utils/pdf";
import { camelCaseToWords } from "../../utils/helpers";

const TableUtills = () => {

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
        return exportPDF(columns, rows);
    };


    const JsonExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
        const apiRef = useGridApiContext();

        const { hideMenu } = props;

        return (
            <MenuItem
                onClick={() => {
                    generatePDF(apiRef);
                    hideMenu?.();
                }}
            >
                Download as PDF
            </MenuItem>
        );
    }

    return {
        determineTimeLineDotColor,
        JsonExportMenuItem
    };
};

export default TableUtills;
