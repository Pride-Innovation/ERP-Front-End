import { GridRowsProp } from "@mui/x-data-grid";

export interface ITableHeader {
    label: string;
    status?: boolean;
    isAction?: boolean;
    isBoolen?: boolean;
    isText?: boolean;
    isNumber?: boolean;
    actionLabel?: string;
}

export interface ITableComponent {
    columnHeaders: Array<ITableHeader>;
    rows: GridRowsProp
}