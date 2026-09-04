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
    /** Style this option as destructive (red) regardless of its label — e.g. Block / Disable Account. */
    danger?: boolean;
    /**
     * The permission the endpoint behind this option demands.
     *
     * When set, the option is hidden from anyone who does not hold it — filtered centrally in
     * `TableUtills.handleOptionsFilter`, so a page only has to name the permission rather than
     * repeat the filtering. Leave unset for an option whose route is already gated by the page
     * itself (a "View Details" on a page you cannot open without the read permission).
     *
     * Presentation only. The endpoint enforces it regardless; this stops the app offering an action
     * that would come back 403, which reads as a broken button rather than a permission boundary.
     */
    permission?: string;
}

// ─── Column filter definitions ────────────────────────────────────────────────
export type FilterType = 'text' | 'select' | 'dateRange' | 'asyncSelect';

/** One page of options for an `asyncSelect` filter. */
export interface IFilterOptionPage {
    options: Array<{ value: string | number; label: string }>;
    totalElements: number;
}

export interface IColumnFilter {
    key: string;
    label: string;
    type: FilterType;
    /** Required when type === 'select' */
    options?: Array<{ value: string | number; label: string }>;
    placeholder?: string;
    /**
     * Required when type === 'asyncSelect'. Fetches one debounced, server-paginated page.
     *
     * <p>For filters whose options are a table rather than a list — people, suppliers, commodities.
     * A `select` would have to load every row up front, which is both slow and wrong once the set
     * outgrows a dropdown; and a plain `text` filter makes the user guess at spellings and matches
     * on a name rather than an id.
     *
     * <p>The value the filter carries is the option's `value` (an id), so the page should send the
     * id-shaped parameter — `assignedToId`, not `assignedTo`.
     */
    fetchOptions?: (query: string, page: number, pageSize: number) => Promise<IFilterOptionPage>;
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
    /**
     * The asset category this table is showing, when it is showing one.
     *
     * Passed through to the import button so the asset template can be built from that category's
     * field configuration. Ignored by every other module.
     */
    assetTypeId?: number;
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
    /**
     * Called whenever the page or page size changes, so the owning page can refetch with its own
     * parameters.
     *
     * <p>Supply this and the table stops using the shared `CustomTablePagination` path. That path
     * rebuilds request params from scratch and cannot see anything the page derived for itself — a
     * date range held in context, a "due for disposal" flag — so those were silently dropped the
     * moment anyone turned a page. A page that owns its fetch cannot have that problem.
     *
     * <p>Omit it and the previous behaviour is unchanged, so client-paginated tables and pages not
     * yet migrated are unaffected.
     */
    onPaginationChange?: (model: {
        page: number;
        pageSize: number;
        /** Set only when `serverSort` is on; the column and direction to order by. */
        sortBy?: string;
        sortDirection?: 'ASC' | 'DESC';
    }) => void;
    /**
     * Row keys the server can order by, mapped to the backend column that does it.
     *
     * <p>Client-side sorting reorders the rows currently in hand. On a server-paginated table that
     * is one page, so "sort by Asset Name" rearranged ten rows and presented the result as a sort of
     * the whole table. A key listed here refetches instead, carrying the column and direction
     * through `onPaginationChange`.
     *
     * <p>A map rather than a flag because not every column has a server equivalent — "Location" and
     * "Assigned To" are derived from associations the sort cannot reach. Those keep sorting the
     * visible page, which is at least what the user can see, instead of quietly ordering by
     * something else. Omit the prop entirely and nothing changes.
     */
    serverSortFields?: Record<string, string>;
    /**
     * Field name the search box filters on for this module, e.g. `assetName`.
     *
     * <p>Server-side search previously hardcoded `name` for every module, which most endpoints do
     * not declare — Spring drops undeclared parameters silently, so searching simply did nothing on
     * those screens. Without this the search box stays client-side.
     */
    searchKey?: string;
    /** Optional icon shown in the toolbar header. Defaults to FilterAltOutlinedIcon. */
    tableIcon?: React.ReactNode;
    /** Permission name required to render the create button. Hides the button when missing. */
    createPermission?: string;
    /**
     * Permission names required to render the export and import buttons.
     *
     * Both were unconditional. Export in particular is not a lesser form of read: the on-screen
     * table is paginated and filtered, while the export pulls the whole matching set into a file
     * that leaves the building — which is why exports are audited and page views are not.
     * Omit either and that button keeps its previous always-visible behaviour.
     */
    exportPermission?: string;
    importPermission?: string;
    /**
     * When provided, the export menu invokes this instead of serializing the
     * visible rows. Lets pages fetch the full filtered set before exporting.
     */
    onExport?: OnExportHandler;
    /**
     * When true, drops the table's own border/shadow/rounding so it blends into
     * its parent surface (e.g. a tab panel). Default false — standalone card.
     */
    flat?: boolean;
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
    /** Asset category on show, so the import button can build that category's template. */
    assetTypeId?: number;
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
    exportPermission?: string;
    importPermission?: string;
    onExport?: OnExportHandler;
}

export interface CustomToolbarWrapperProps {
    header: { plural: string; singular: string };
    onCreationHandler: () => void;
    module: string;
    createAction: boolean;
    importData: boolean;
    /** Asset category on show, so the import button can build that category's template. */
    assetTypeId?: number;
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
    exportPermission?: string;
    importPermission?: string;
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