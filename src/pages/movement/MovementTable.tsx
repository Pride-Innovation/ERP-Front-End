/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
    alpha, Box, CircularProgress, IconButton, Paper, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Tooltip, Typography,
} from '@mui/material';
import { PERMISSIONS } from '../../core/permissions/constants';
import useAccessScope from '../../core/permissions/useAccessScope';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { brand, neutral, border } from '../../utils/tokens';
import { dataPaginationSx, dataSurfaceSx } from '../../components/tables/dataTableSx';
import {
    RowActionsMenu, TwoLine, registerBodyCellSx, registerHeadCellSx, registerRowSx,
} from '../../components/tables/registerParts';
import { StatusChip } from '../../components/layout';
import {
    movementTypeLabel, statusLabel, statusTone, MovementStatus, MovementType,
    canDispatch, canMarkInTransit, canReceive, canComplete, canCancel, canApproveMovement,
} from './constants';
import { IMovement } from './interface';

/**
 * The movement tables — the landing page's digest and the full register.
 *
 * <h2>Restraint is the design</h2>
 * A row used to carry about a dozen separate marks: a coloured type pill, icon and initials badges
 * at both ends of the route, a tinted count pill, a status chip *and* a six-segment progress bar
 * repeating it, and the initiator filed under "Date". Three colour systems (type, avatar, status)
 * competed in every row, so none of them led the eye anywhere.
 *
 * <p>Now: every cell is at most two lines — a value and a muted qualifier — and **status is the only
 * coloured element**, because it is the one thing a reader scanning the register is looking for.
 * The type keeps a small dot so it stays recognisable at a glance without shouting. Anything else
 * belongs on the detail page, one click away.
 */

// ── Column model ──────────────────────────────────────────────────────────

type ColumnId = 'ref' | 'type' | 'from' | 'to' | 'items' | 'status' | 'date' | 'actions';

interface MovementColumn {
    id: ColumnId;
    label: string;
    /**
     * Fixed width in px. Absent on From and To, which share whatever the fixed columns leave and
     * ellipsise long names — so the table fits the container instead of every column demanding its
     * full content width (which made it ~230px wider than a 1366px laptop's content area).
     */
    width?: number;
    align?: 'left' | 'center' | 'right';
    /** Absent for presentational columns that have no natural order. */
    sortValue?: (m: IMovement) => string | number;
}

/** Lifecycle order, so sorting by status walks the pipeline rather than the alphabet. */
const STATUS_ORDER: MovementStatus[] = [
    'DRAFT', 'INITIATED', 'DISPATCHED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED', 'CANCELLED',
];

const COLUMNS: Record<ColumnId, MovementColumn> = {
    // Wide enough for a whole tracking number — the one value here that must never be truncated.
    ref: { id: 'ref', label: 'Movement', width: 156, sortValue: (m) => Number(m.id ?? 0) },
    type: { id: 'type', label: 'Type', width: 176, sortValue: (m) => movementTypeLabel(m.movementType) },
    from: { id: 'from', label: 'From' },
    to: { id: 'to', label: 'To' },
    items: { id: 'items', label: 'Items', width: 64, align: 'right' },
    status: {
        id: 'status',
        label: 'Status',
        width: 120,
        sortValue: (m) => STATUS_ORDER.indexOf(m.status as MovementStatus),
    },
    date: {
        id: 'date',
        label: 'Raised',
        width: 148,
        sortValue: (m) => new Date(m.createDate ?? 0).getTime(),
    },
    actions: { id: 'actions', label: '', width: 52, align: 'right' },
};

/** The actions column is appended per variant — the digest has none, since the row itself opens. */
const RECENT_COLUMNS: ColumnId[] = ['ref', 'type', 'from', 'to', 'items', 'status', 'date'];
const APPROVAL_COLUMNS: ColumnId[] = ['ref', 'type', 'from', 'to', 'items', 'date'];

// ── Movement type colours ─────────────────────────────────────────────────

/** One hue per type, shown only as a small dot — enough to recognise, not enough to compete. */
const TYPE_COLORS: Record<MovementType, string> = {
    REPLENISHMENT: brand[500],
    ISSUANCE_FULFILLMENT: '#1D4ED8',
    DEPARTMENT_TRANSFER: '#7C3AED',
    REPAIR_TRANSFER: '#D97706',
    TEMP_REPLACEMENT: '#4338CA',
    RETURN_AFTER_REPAIR: '#0891B2',
    DISPOSAL_TRANSFER: '#DC2626',
    RETURN_TO_STORE: '#475569',
};

const typeColor = (type?: string) => TYPE_COLORS[type as MovementType] ?? neutral[500];

// ── Formatting helpers ────────────────────────────────────────────────────

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (d?: string | null) =>
    d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

/** Coarse relative age — precise enough for a digest, with the exact stamp on hover. */
const relativeTime = (d?: string | null): string => {
    if (!d) return '—';
    const then = new Date(d).getTime();
    if (Number.isNaN(then)) return '—';
    const mins = Math.round((Date.now() - then) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days} d ago`;
    if (days < 31) return `${Math.round(days / 7)} w ago`;
    return fmtDate(d);
};

const userName = (u?: { firstName?: string; lastName?: string } | null) =>
    u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '';

// ── Cells ─────────────────────────────────────────────────────────────────

/**
 * The movement's number, then the reference people actually quote: its tracking number once one is
 * issued, else the consignment or request it belongs to.
 */
const RefCell = ({ mov }: { mov: IMovement }) => {
    const reference = mov.trackingNumber
        ?? (mov.consignment ? (mov.consignment.reference ?? `CNS-${mov.consignment.id}`) : null)
        ?? (mov.request ? `REQ-${mov.request.id}` : null);
    return <TwoLine primary={`#${mov.id}`} secondary={reference} mono />;
};

const TypeCell = ({ mov }: { mov: IMovement }) => (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: typeColor(mov.movementType), flexShrink: 0 }} />
        <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 500, color: neutral[700] }}>
            {movementTypeLabel(mov.movementType)}
        </Typography>
    </Stack>
);

/**
 * One end of a movement: a store and the branch it stands in, or a person and their duty station.
 * The source used to read the store alone, so a return — which leaves a person, not a store —
 * showed "—" where the person's name belonged.
 */
const EndCell = ({ store, person, personRole }: {
    store?: IMovement['sourceStore'];
    person?: IMovement['recipientUser'];
    personRole: string;
}) => {
    const name = userName(person);
    if (store) {
        return <TwoLine primary={store.name ?? '—'} secondary={store.location?.name} />;
    }
    if (name) {
        return <TwoLine primary={name} secondary={person?.branch?.name ?? personRole} />;
    }
    return <Typography sx={{ fontSize: '0.875rem', color: neutral[400] }}>—</Typography>;
};

const ItemsCell = ({ mov }: { mov: IMovement }) => {
    const items = mov.items ?? [];
    const names = items
        .map((i) => i.asset?.assetName ?? i.commodity?.name ?? i.serialNumber ?? i.assetTag)
        .filter(Boolean) as string[];
    const preview = names.slice(0, 5).join(', ') + (names.length > 5 ? `, +${names.length - 5} more` : '');
    return (
        <Tooltip title={preview || 'No item lines recorded'} arrow>
            <Typography
                component="span"
                sx={{
                    fontSize: '0.875rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                    color: items.length ? neutral[800] : neutral[400],
                }}
            >
                {items.length || '—'}
            </Typography>
        </Tooltip>
    );
};

/** The chip alone — the progress bar beside it said the same thing a second time. */
const StatusCell = ({ mov }: { mov: IMovement }) => (
    <StatusChip label={statusLabel(mov.status)} tone={statusTone(mov.status)} />
);

/** When, and by whom — the initiator used to sit under "Date" with nothing saying what it was. */
const DateCell = ({ mov }: { mov: IMovement }) => {
    const by = userName(mov.initiator);
    return (
        <Tooltip title={fmtDateTime(mov.createDate)} arrow placement="top-start">
            <Box sx={{ minWidth: 0 }}>
                <TwoLine
                    primary={relativeTime(mov.createDate)}
                    secondary={by ? `by ${by}` : fmtDate(mov.createDate)}
                    strong={false}
                    hint={false}
                />
            </Box>
        </Tooltip>
    );
};

// ── Row actions ───────────────────────────────────────────────────────────

/** Modal state names understood by `MovementActionModal`. */
export type MovementAction =
    | 'approve' | 'reject' | 'dispatch' | 'in-transit' | 'receive' | 'complete' | 'cancel';

interface RowAction {
    action: MovementAction;
    title: string;
    color: string;
    icon: ReactNode;
    /** Rendered below a divider in the menu, so it is never the click next to a routine action. */
    destructive?: boolean;
}

const APPROVE: RowAction = { action: 'approve', title: 'Approve', color: '#15803D', icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> };
const REJECT: RowAction = { action: 'reject', title: 'Reject', color: '#B91C1C', icon: <HighlightOffIcon sx={{ fontSize: 16 }} />, destructive: true };

/**
 * The permission each lifecycle action answers to, mirroring the `@PreAuthorize` on the endpoint
 * behind it.
 *
 * Dispatch and receive are not CREATE_MOVEMENT: raising a transfer and handing custody over are
 * different duties. Complete shares RECEIVE_MOVEMENT because it is the intra-location equivalent of
 * receiving — it lands the goods and applies the inventory effect.
 */
const ACTION_PERMISSION: Record<MovementAction, string> = {
    'approve': PERMISSIONS.APPROVE_MOVEMENT,
    'reject': PERMISSIONS.APPROVE_MOVEMENT,
    'dispatch': PERMISSIONS.DISPATCH_MOVEMENT,
    'in-transit': PERMISSIONS.DISPATCH_MOVEMENT,
    'receive': PERMISSIONS.RECEIVE_MOVEMENT,
    'complete': PERMISSIONS.RECEIVE_MOVEMENT,
    'cancel': PERMISSIONS.CANCEL_MOVEMENT,
};

/**
 * Which lifecycle buttons a row earns. The `can*` predicates are the same ones the backend
 * enforces, so a hidden button is one the server would have refused anyway.
 *
 * <p>`permitted` applies the second half of that promise. The `can*` rules answer "is this movement
 * in a state where the action is possible"; they say nothing about whether *this user* may perform
 * it, and until the movement endpoints were guarded there was no answer to give. Both must hold.
 */
const rowActions = (
    mov: IMovement,
    variant: 'recent' | 'approvals' | 'lifecycle',
    permitted: (action: MovementAction, movement: IMovement) => boolean,
    currentUserId?: number | string,
): RowAction[] => {
    // Filtered here too: an approvals-variant table lists what is awaiting a decision, but being
    // shown the queue is not the same as being allowed to decide.
    if (variant === 'approvals') return [APPROVE, REJECT].filter(a => permitted(a.action, mov));
    if (variant !== 'lifecycle') return [];

    const actions: RowAction[] = [];
    if (canApproveMovement(mov, currentUserId)) actions.push(APPROVE, REJECT);
    if (canDispatch(mov)) actions.push({ action: 'dispatch', title: 'Dispatch', color: '#2563EB', icon: <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} /> });
    if (canMarkInTransit(mov)) actions.push({ action: 'in-transit', title: 'Mark in transit', color: '#4338CA', icon: <FlightTakeoffOutlinedIcon sx={{ fontSize: 16 }} /> });
    if (canReceive(mov)) actions.push({ action: 'receive', title: 'Receive', color: '#047857', icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 16 }} /> });
    if (canComplete(mov)) actions.push({ action: 'complete', title: 'Complete', color: '#15803D', icon: <TaskAltOutlinedIcon sx={{ fontSize: 16 }} /> });
    if (canCancel(mov)) actions.push({ action: 'cancel', title: 'Cancel', color: '#DC2626', icon: <CancelOutlinedIcon sx={{ fontSize: 16 }} />, destructive: true });
    return actions.filter(a => permitted(a.action, mov));
};

const ActionButton = ({ title, color, onClick, children }: {
    title: string; color: string; onClick: () => void; children: ReactNode;
}) => (
    <Tooltip title={title} arrow>
        <IconButton
            size="small"
            onClick={onClick}
            sx={{
                color,
                width: 26, height: 26,
                '&:hover': { bgcolor: alpha(color, 0.1) },
            }}
        >
            {children}
        </IconButton>
    </Tooltip>
);

/**
 * Below this the table scrolls rather than squeezing From and To to nothing. It is the sum of the
 * fixed columns plus room for two readable names.
 */
const TABLE_MIN_WIDTH = 940;

// ── Table ─────────────────────────────────────────────────────────────────

type Order = 'asc' | 'desc';

export interface IMovementTableProps {
    rows: IMovement[];
    loading?: boolean;
    /**
     * - `recent` — read-only digest, view action only.
     * - `approvals` — drops the status column (all rows are DRAFT) and adds approve / reject.
     * - `lifecycle` — the full action set, gated per row by the `can*` rules in `./constants`.
     */
    variant?: 'recent' | 'approvals' | 'lifecycle';
    /** Rendered in place of the body when there is nothing to show. */
    empty?: ReactNode;
    onView: (mov: IMovement) => void;
    /** Fired by every non-view action; `action` is the `MovementActionModal` state name. */
    onAction?: (action: MovementAction, mov: IMovement) => void;
    /** Needed by `lifecycle` to decide whether the approve / reject pair is this user's to press. */
    currentUserId?: number | string;
    /** `menu` collapses the row's actions behind one ⋮ button. Defaults to a row of icon buttons. */
    actionsAs?: 'icons' | 'menu';
    /** Footer strip content — e.g. a "View all" link. Hidden while paginating. */
    footer?: ReactNode;
    /** Paginate once the row count passes this. Omit to never paginate; `0` always paginates. */
    paginateOver?: number;
    /** Change this to send pagination back to page 1 — e.g. when a filter or tab changes. */
    paginationResetKey?: string | number;
    /** Default sort column; defaults to newest-first on `date`. */
    initialSort?: { column: ColumnId; order: Order };
    /** Omit the surrounding Paper when the caller already provides one. */
    disableSurface?: boolean;
    /** Pin the head while the body scrolls. Pair with `maxHeight`. */
    stickyHeader?: boolean;
    /** Caps the scroll area; only meaningful with `stickyHeader`. */
    maxHeight?: number | string;
    /**
     * Hands paging and sorting to the caller, for a table backed by a filtered server query.
     *
     * <p>Without this the table sorts and pages whatever array it was given, which is right for the
     * eight-row digest and wrong for the register: the page held the first hundred movements and
     * paginated those, so movement #101 was unreachable and the filter bar could not find it. When
     * present, `rows` is taken as already sorted and already the page to show, and `total` is the
     * size of the whole matching set rather than of the array.
     */
    server?: {
        page: number;
        rowsPerPage: number;
        total: number;
        onPageChange: (page: number) => void;
        onRowsPerPageChange: (rowsPerPage: number) => void;
        /** The column and direction to ask the server for. */
        onSortChange: (column: ColumnId, order: Order) => void;
    };
}

const MovementTable = ({
    rows, loading, variant = 'recent', empty, onView, onAction, currentUserId, actionsAs = 'icons',
    footer, paginateOver, paginationResetKey, initialSort, disableSurface, stickyHeader, maxHeight,
    server,
}: IMovementTableProps) => {
    const { canActOnAnyOf } = useAccessScope();

    /*
     * Two questions per button, and the second one is per row.
     *
     * This resolved the permission once for the whole table, on the reasoning that "the answer
     * cannot change between rows". That is true of the permission and false of the *scope*: each
     * movement touches its own set of branches, so whether the viewer may act on it is a property of
     * the row, not of the table.
     *
     * It mattered because the listing resolves VIEW scope while the endpoints guard with
     * `requireCanManageAny` — MANAGE. `DASH_SCOPE_ALL` widens VIEW to ALL but deliberately never
     * MANAGE, so someone holding it without `MANAGE_ALL_BRANCH_MOVEMENTS` sees every branch's
     * movements and was offered Dispatch, Receive, Complete and Cancel on all of them. The click
     * came back 403, which reads as a broken button rather than as a boundary.
     *
     * `canActOnAnyOf` asks both halves at once and is the same call the detail page makes, so the
     * two screens cannot drift into offering different buttons for the same movement. A movement has
     * up to four ends and the caller is in reach if any one is theirs; absent ends are ordinary
     * rather than a fault — a return has no source store, an issuance no source user.
     */
    const permitted = useCallback(
        (action: MovementAction, mov: IMovement) =>
            canActOnAnyOf(ACTION_PERMISSION[action], 'MOVEMENTS', [
                mov.sourceStore?.location?.id,
                mov.destStore?.location?.id,
                mov.sourceUser?.branch?.id,
                mov.recipientUser?.branch?.id,
                    ], [
                        // The people party to it — what SELF means for a movement, mirroring
                        // MovementService.peoplePartyTo and the DAO's SELF predicate.
                        mov.initiator?.id,
                        mov.sourceUser?.id,
                        mov.recipientUser?.id,
                        mov.receivingOfficer?.id,
                        mov.request?.requesterId,
                    ]),
        [canActOnAnyOf],
    );

    const columns: MovementColumn[] = [
        ...(variant === 'approvals' ? APPROVAL_COLUMNS : RECENT_COLUMNS).map((id) => COLUMNS[id]),
        // The digest has no actions column — clicking the row opens it, and an eye icon on every
        // row said the same thing again.
        ...(variant === 'recent' ? [] : [{
            ...COLUMNS.actions,
            width: actionsAs === 'menu' ? 52 : (variant === 'lifecycle' ? 210 : 90),
        }]),
    ];

    const [orderBy, setOrderBy] = useState<ColumnId>(initialSort?.column ?? 'date');
    const [order, setOrder] = useState<Order>(initialSort?.order ?? 'desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    // The caller's filters changed underneath us, so the current page may no longer exist.
    useEffect(() => { setPage(0); }, [paginationResetKey]);

    const handleSort = (id: ColumnId) => {
        const next: Order = orderBy === id && order === 'asc' ? 'desc' : 'asc';
        setOrder(next);
        setOrderBy(id);
        setPage(0);
        // Server-backed: re-ask rather than reorder the page in front of us, which would sort one
        // page of a larger set and present it as the whole ordering.
        server?.onSortChange(id, next);
    };

    const sorted = useMemo(() => {
        // Already ordered by the query that produced them.
        if (server) return rows;
        const sortValue = COLUMNS[orderBy].sortValue;
        if (!sortValue) return rows;
        return [...rows].sort((a, b) => {
            const av = sortValue(a);
            const bv = sortValue(b);
            if (av === bv) return 0;
            return (av > bv ? 1 : -1) * (order === 'asc' ? 1 : -1);
        });
    }, [rows, orderBy, order, server]);

    /*
     * Server-backed tables are handed exactly the page to render; slicing again would page a page.
     * The pager is shown whenever the whole matching set is larger than what is in front of us —
     * from `total`, not from `rows.length`, which is the distinction the old code could not make.
     */
    const paginated = server
        ? sorted
        : (paginateOver != null && sorted.length > paginateOver
            ? sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : sorted);
    const showPagination = server
        ? server.total > server.rowsPerPage
        : (paginateOver != null && sorted.length > paginateOver);

    const renderCell = (col: MovementColumn, mov: IMovement) => {
        switch (col.id) {
            case 'ref': return <RefCell mov={mov} />;
            case 'type': return <TypeCell mov={mov} />;
            case 'from': return <EndCell store={mov.sourceStore} person={mov.sourceUser} personRole="Holder" />;
            case 'to': return <EndCell store={mov.destStore} person={mov.recipientUser} personRole="Recipient" />;
            case 'items': return <ItemsCell mov={mov} />;
            case 'status': return <StatusCell mov={mov} />;
            case 'date': return <DateCell mov={mov} />;
            case 'actions': {
                const actions = rowActions(mov, variant, permitted, currentUserId);
                return (
                    // Row click opens the movement, so the controls must not fire it twice.
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
                        {actionsAs === 'menu' ? (
                            <RowActionsMenu
                                heading={`Movement #${mov.id}`}
                                subheading={statusLabel(mov.status)}
                                actions={actions}
                                onView={() => onView(mov)}
                                onPick={(action) => onAction?.(action, mov)}
                            />
                        ) : (
                            <>
                                <ActionButton title="View details" color={brand[600]} onClick={() => onView(mov)}>
                                    <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                                </ActionButton>
                                {actions.map((a) => (
                                    <ActionButton key={a.action} title={a.title} color={a.color} onClick={() => onAction?.(a.action, mov)}>
                                        {a.icon}
                                    </ActionButton>
                                ))}
                            </>
                        )}
                    </Stack>
                );
            }
            default: return null;
        }
    };

    const body = (
        <>
            <TableContainer sx={maxHeight ? { maxHeight } : undefined}>
                <Table size="small" stickyHeader={stickyHeader} sx={{ tableLayout: 'fixed', minWidth: TABLE_MIN_WIDTH }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
                                <TableCell
                                    key={col.id}
                                    align={col.align ?? 'left'}
                                    style={col.width ? { width: col.width } : undefined}
                                    sortDirection={orderBy === col.id ? order : false}
                                    sx={registerHeadCellSx}
                                >
                                    {col.sortValue ? (
                                        <TableSortLabel
                                            active={orderBy === col.id}
                                            direction={orderBy === col.id ? order : 'asc'}
                                            onClick={() => handleSort(col.id)}
                                        >
                                            {col.label}
                                        </TableSortLabel>
                                    ) : col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{ textAlign: 'center', py: 5, border: 'none' }}>
                                    <CircularProgress size={28} sx={{ color: brand[500] }} />
                                </TableCell>
                            </TableRow>
                        ) : paginated.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{ border: 'none', p: 0 }}>
                                    {empty}
                                </TableCell>
                            </TableRow>
                        ) : paginated.map((mov) => (
                            <TableRow
                                key={mov.id}
                                hover={false}
                                onClick={() => onView(mov)}
                                sx={registerRowSx}
                            >
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.id}
                                        align={col.align ?? 'left'}
                                        sx={registerBodyCellSx}
                                    >
                                        {renderCell(col, mov)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {showPagination && (
                <TablePagination
                    component="div"
                    count={server ? server.total : sorted.length}
                    page={server ? server.page : page}
                    onPageChange={(_, p) => (server ? server.onPageChange(p) : setPage(p))}
                    rowsPerPage={server ? server.rowsPerPage : rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        const size = parseInt(e.target.value, 10);
                        if (server) { server.onRowsPerPageChange(size); return; }
                        setRowsPerPage(size);
                        setPage(0);
                    }}
                    rowsPerPageOptions={[15, 25, 50, 100]}
                    sx={dataPaginationSx}
                />
            )}

            {!showPagination && !loading && footer && paginated.length > 0 && (
                <Box
                    sx={{
                        borderTop: `1px solid ${border.subtle}`, bgcolor: neutral[50],
                        px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                >
                    {footer}
                </Box>
            )}
        </>
    );

    if (disableSurface) return body;

    return (
        <Paper elevation={0} sx={dataSurfaceSx}>
            {body}
        </Paper>
    );
};

export default MovementTable;
