import { GridRowsProp } from "@mui/x-data-grid";

export interface ITableComponent {
    columnHeaders: Array<string>;
    rows: GridRowsProp
}