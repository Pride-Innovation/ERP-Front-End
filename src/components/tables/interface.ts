/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { GridRowsProp, GridToolbarProps } from "@mui/x-data-grid";
import { IUsersAxiosResponse } from "../../pages/users/interface";
import { IRequestsAxiosResponse } from "../../pages/request/interface";

export interface IOptions {
    value: string | number, label: string, icon?: JSX.Element, header?: boolean;
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
    paginationMode?: 'server' | 'client',
    filterMode?: 'server' | 'client',
    searchAction?: boolean;
    params?: Record<string, any>
    refresh?: boolean;
    filterOptions?: boolean
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
    searchAction: boolean;
    refresh?: boolean;
}

export interface CustomToolbarWrapperProps extends GridToolbarProps {
    header: { plural: string; singular: string };
    onCreationHandler: () => void;
    // onImportHandler: (file: string) => void;
    module: string;
    createAction: boolean;
    importData: boolean;
    exportData: boolean;
    searchAction: boolean;
    refresh?: boolean;
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
}

export type IhandleTablePagination = IUsersAxiosResponse | IRequestsAxiosResponse;