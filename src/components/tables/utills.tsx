import {
    GridApi,
    GridExportMenuItemProps,
    gridFilteredSortedRowIdsSelector,
    gridVisibleColumnFieldsSelector,
    useGridApiContext
} from "@mui/x-data-grid";
import { assetStatus, requestStatus } from "../../utils/constants";
import { MenuItem } from "@mui/material";

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

    const getJson = (apiRef: React.MutableRefObject<GridApi>) => {
        const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
        const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef);

        const data = filteredSortedRowIds.map((id) => {
            const row: Record<string, any> = {};
            visibleColumnsField.forEach((field) => {
                row[field] = apiRef.current.getCellParams(id, field).value;
            });
            return row;
        });

        return JSON.stringify(data, null, 2);
    };


    const exportBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        });
    };


    const JsonExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
        const apiRef = useGridApiContext();

        const { hideMenu } = props;

        return (
            <MenuItem
                onClick={() => {
                    const jsonString = getJson(apiRef);
                    const blob = new Blob([jsonString], {
                        type: 'text/json',
                    });
                    exportBlob(blob, 'DataGrid_demo.json');

                    hideMenu?.();
                }}
            >
                Export PDF
            </MenuItem>
        );
    }

    return {
        determineTimeLineDotColor,
        JsonExportMenuItem
    };
};

export default TableUtills;
