import { GridRowsProp } from "@mui/x-data-grid";

export interface ITableHeader {
    label: string;
    status?: boolean;
    action?: boolean;
    isBoolen?: boolean;
    isText?: boolean;
    isNumber?: boolean;
}

export interface ITableComponent {
    columnHeaders: Array<ITableHeader>;
    rows: GridRowsProp
}