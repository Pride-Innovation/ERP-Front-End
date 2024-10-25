import { GridRowsProp, GridToolbarProps } from "@mui/x-data-grid";

export interface IOptions {
    value: string, label: string, icon?: JSX.Element, header?: boolean;
}
export interface ITableHeader {
    label: string;
    status?: boolean;
    isAction?: boolean;
    isBoolen?: boolean;
    isText?: boolean;
    isNumber?: boolean;
    isImage?: boolean;
    isStatus?: boolean;
    actionData?: {
        label: string;
        options: Array<IOptions>
    };
}

export interface ITableComponent {
    columnHeaders: Array<ITableHeader>;
    rows: GridRowsProp;
    onCreationHandler?: () => void;
    // onImportHandler?: () => void;
    module?: string;
    header: { plural: string; singular: string };
    handleOptionClicked?: (option: number | string, moduleID?: string | number) => void;
    createAction?: boolean;
    importData?: boolean;
    exportData?: boolean;
    count?: number;
    loading?: boolean;
    endPoint?: string;
    paginationMode?: 'server' | 'client'
}

export interface ITableToolBar {
    header: {
        plural: string;
        singular: string
    },
    onCreationHandler: () => void;
    // onImportHandler: (file: string) => void;
    module: string;
    createAction: boolean;
    importData: boolean;
    exportData: boolean;
}

export interface CustomToolbarWrapperProps extends GridToolbarProps {
    header: { plural: string; singular: string };
    onCreationHandler: () => void;
    // onImportHandler: (file: string) => void;
    module: string;
    createAction: boolean;
    importData: boolean;
    exportData: boolean;
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
    endPoint: string;
}