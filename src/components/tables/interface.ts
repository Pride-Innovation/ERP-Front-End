import { GridRowsProp, GridToolbarProps } from "@mui/x-data-grid";

export interface IOptions {
    value: string, label: string, icon?: JSX.Element
}
export interface ITableHeader {
    label: string;
    status?: boolean;
    isAction?: boolean;
    isBoolen?: boolean;
    isText?: boolean;
    isNumber?: boolean;
    actionData?: {
        label: string;
        options: Array<IOptions>
    };
}

export interface ITableComponent {
    columnHeaders: Array<ITableHeader>;
    rows: GridRowsProp;
    onCreationHandler: () => void;
    onImportHandler?: () => void;
    header: { plural: string; singular: string };
    handleOptionClicked?: (option: number | string, moduleID?: string | number) => void
}

export interface ITableToolBar {
    header: {
        plural: string;
        singular: string
    },
    onCreationHandler: () => void;
    onImportHandler: () => void;
}

export interface CustomToolbarWrapperProps extends GridToolbarProps {
    header: { plural: string; singular: string };
    onCreationHandler: () => void;
    onImportHandler: () => void;
}

export interface ITableFilter {
    field: string;
    value: string
}

export interface ICustomTableFilterOperator {
    rows: GridRowsProp;
    setFilteredRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
    endPoint: string;
}

export interface ICustomTablePagination {
    rows: GridRowsProp;
    endPoint: string;
}