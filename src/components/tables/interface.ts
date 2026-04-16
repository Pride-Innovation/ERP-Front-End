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
}

// ─── Column filter definitions ────────────────────────────────────────────────
export type FilterType = 'text' | 'select' | 'dateRange';

export interface IColumnFilter {
    key: string;
    label: string;
    type: FilterType;
    /** Required when type === 'select' */
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
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
    params?: Record<string, any>
    selectedStatus?: string;
}

export type IhandleTablePagination = IUsersAxiosResponse | IRequestsAxiosResponse;