/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { GridRowsProp } from "@mui/x-data-grid";
import { IUsersAxiosResponse } from "../../pages/users/interface";
import { IRequestsAxiosResponse } from "../../pages/request/interface";

export interface IOptions {
    value: string | number, label: string, icon?: JSX.Element, header?: boolean;
    /** Render a separator immediately after this option (e.g. to set a primary action apart). */
    divider?: boolean;
}

// ─── Column filter definitions ────────────────────────────────────────────────
export type FilterType = 'text' | 'select' | 'dateRange';

export interface IColumnFilter {
    key: string;
    label: string;
    type: FilterType;
    /** Required when type === 'select' */
    options?: Array<{ value: string | number; label: string }>;
    placeholder?: string;
}

/** Supported export formats. */
export type ExportFormat = 'pdf' | 'excel';

/**
 * Optional custom export handler. When provided, the export menu calls this
 * instead of serializing the currently-visible `rows` prop. Pages use this to
 * fetch the full filtered set from the backend before exporting.
 */
export type OnExportHandler = (format: ExportFormat) => void | Promise<void>;
export interface ITableHeader {
    label: string;
    status?: boolean;
    isAction?: boolean;
    isBoolen?: boolean;
    isText?: boolean;
    isNumber?: boolean;
    isImage?: boolean;
    isStatus?: boolean;
    isPriority?: boolean;
    isMoney?: boolean;
    actionData?: {
        label: string;
        options: Array<IOptions>
    };
}

export interface ITableComponent {
    columnHeaders: Array<ITableHeader>;
    rows: GridRowsProp;
    onCreationHandler?: () => void;
    module?: string;
    header: { plural: string; singular: string };
    handleOptionClicked?: (option: number | string, moduleID?: string | number) => void;
    createAction?: boolean;
    importData?: boolean;
    exportData?: boolean;
    count?: number;
    loading?: boolean;
    endPoint?: string;
    paginationMode?: 'server' | 'client',
    filterMode?: 'server' | 'client',
    searchAction?: boolean;
    params?: Record<string, any>
    refresh?: boolean;
    filterOptions?: boolean;
    optionsfilterParams?: Record<string, any>
    status?: boolean;
    onStatusChange?: (status: string) => void;
    selectedStatus?: string;
    dateRangePicker?: boolean;
    /** Column-level filter definitions; each triggers a backend call on Apply */
    columnFilters?: IColumnFilter[];
    onApplyFilters?: (filters: Record<string, any>) => void;
    /** Optional icon shown in the toolbar header. Defaults to FilterAltOutlinedIcon. */
    tableIcon?: React.ReactNode;
    /** Permission name required to render the create button. Hides the button when missing. */
    createPermission?: string;
    /**
     * When provided, the export menu invokes this instead of serializing the
     * visible rows. Lets pages fetch the full filtered set before exporting.
     */
    onExport?: OnExportHandler;
}

export interface ITableToolBar {
    header: {
        plural: string;
        singular: string
    },
    onCreationHandler: () => void;
    module: string;
    createAction: boolean;
    importData: boolean;
    exportData: boolean;
    searchAction: boolean;
    onSearch?: (value: string) => void;
    rows?: any[];
    refresh?: boolean;
    status?: boolean;
    onStatusChange?: (status: string) => void;
    selectedStatus?: string;
    dateRangePicker?: boolean;
    columnFilters?: IColumnFilter[];
    onApplyFilters?: (filters: Record<string, any>) => void;
    tableIcon?: React.ReactNode;
    createPermission?: string;
    onExport?: OnExportHandler;
}

export interface CustomToolbarWrapperProps {
    header: { plural: string; singular: string };
    onCreationHandler: () => void;
    module: string;
    createAction: boolean;
    importData: boolean;
    exportData: boolean;
    searchAction: boolean;
    onSearch?: (value: string) => void;
    rows?: any[];
    refresh?: boolean;
    status?: boolean;
    onStatusChange?: (status: string) => void;
    selectedStatus?: string;
    dateRangePicker?: boolean;
    columnFilters?: IColumnFilter[];
    onApplyFilters?: (filters: Record<string, any>) => void;
    tableIcon?: React.ReactNode;
    createPermission?: string;
    onExport?: OnExportHandler;
}

export interface ITableFilter {
    field: string;
    value: string
}

export interface ICustomTableFilterOperator {
    endPoint: string;
    params?: Record<string, any>
}

export interface ICustomTablePagination {
    endPoint: string;
    params?: Record<string, any>;
    selectedStatus?: string;
    /** Active column-filter params to merge on every paginated request */
    filterParams?: Record<string, any>;
}

export type IhandleTablePagination = IUsersAxiosResponse | IRequestsAxiosResponse;