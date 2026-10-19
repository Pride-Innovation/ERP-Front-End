/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { PERMISSIONS } from '../../core/permissions/constants';
import useAccessScope from '../../core/permissions/useAccessScope';
import {
    Box, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
    TablePagination, TableRow, TableSortLabel, Tooltip, Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import WhereToVoteOutlinedIcon from '@mui/icons-material/WhereToVoteOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { brand, neutral, status as statusTokens } from '../../utils/tokens';
import { dataPaginationSx, dataSurfaceSx } from '../../components/tables/dataTableSx';
import {
    IRowMenuAction, MONO, RowActionsMenu, TwoLine,
    registerBodyCellSx, registerHeadCellSx, registerRowSx,
} from '../../components/tables/registerParts';
import { StatusChip, StatusTone } from '../../components/layout';
import {
    IConsignment, ConsignmentStatus, consignmentStatusLabels, consignmentStatusHelp,
} from './interface';

/**
 * The consignments register — the same grammar as the movements register
 * (`../movement/MovementTable`), built from the same shared parts
 * (`components/tables/registerParts`) so the two halves of the module cannot drift apart again.
 *
 * <p>Status is the one coloured element on a healthy row; an overdue date is the other thing allowed
 * to be red, because it is the question a reader opens this page to answer.
 */

// ── Column model ──────────────────────────────────────────────────────────

type ColumnId = 'reference' | 'from' | 'to' | 'courier' | 'load' | 'schedule' | 'status' | 'actions';

interface ConsignmentColumn {
    id: ColumnId;
    label: string;
    /** Fixed width in px. Absent on From, To and Courier, which share what is left and ellipsise. */
    width?: number;
    align?: 'left' | 'center' | 'right';
    /**
     * Only on columns the server can order by (`ConsignmentController.SORTABLE`). Load used to be
     * sortable here while the endpoint has no such field, so clicking it quietly sorted by id.
     */
    sortValue?: (c: IConsignment) => string | number;
}

/** Journey order, so sorting by status walks the road rather than the alphabet. */
const STATUS_ORDER: ConsignmentStatus[] = ['DRAFT', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'CANCELLED'];

const COLUMNS: ConsignmentColumn[] = [
    { id: 'reference', label: 'Consignment', width: 164, sortValue: (c) => c.id },
    { id: 'from', label: 'From' },
    { id: 'to', label: 'To' },
    { id: 'courier', label: 'Courier' },
    { id: 'load', label: 'Load', width: 76, align: 'right' },
    { id: 'schedule', label: 'Schedule', width: 184, sortValue: (c) => new Date(c.dispatchDate ?? c.createDate ?? 0).getTime() },
    { id: 'status', label: 'Status', width: 124, sortValue: (c) => STATUS_ORDER.indexOf(c.status) },
    { id: 'actions', label: '', width: 52, align: 'right' },
];

/** Below this the table scrolls rather than squeezing the three flexible columns to nothing. */
const TABLE_MIN_WIDTH = 980;

// ── Status presentation ───────────────────────────────────────────────────

/** The shared chip's tones — the same vocabulary the movements register speaks. */
const STATUS_TONE: Record<ConsignmentStatus, StatusTone> = {
    DRAFT: 'neutral',
    DISPATCHED: 'pending',
    IN_TRANSIT: 'info',
    ARRIVED: 'success',
    CANCELLED: 'danger',
};

// ── Formatting ────────────────────────────────────────────────────────────

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Whole days between today and a date; negative once the date has passed. */
const daysFromToday = (d?: string | null): number | null => {
    if (!d) return null;
    const then = new Date(d);
    if (Number.isNaN(then.getTime())) return null;
    return Math.round((startOfDay(then) - startOfDay(new Date())) / 86400000);
};

const referenceOf = (c: IConsignment) => c.reference ?? `CNS-${c.id}`;

const Muted = ({ children }: { children: ReactNode }) => (
    <Typography noWrap sx={{ fontSize: '0.875rem', color: neutral[400] }}>{children}</Typography>
);

// ── Cells ─────────────────────────────────────────────────────────────────

/**
 * The reference, then the number people actually quote once one is issued: the tracking number —
 * the same place the movements register puts it. Until then, when the journey was opened.
 */
const ReferenceCell = ({ c }: { c: IConsignment }) => (
    c.trackingNumber
        ? <TwoLine primary={referenceOf(c)} secondary={c.trackingNumber} mono />
        : <TwoLine primary={referenceOf(c)} secondary={`Opened ${fmtDate(c.createDate)}`} />
);

/** The destination names its landing store once the goods are down — where to go and find them. */
const EndCell = ({ name, sub }: { name?: string | null; sub?: string | null }) =>
    (name ? <TwoLine primary={name} secondary={sub ?? undefined} /> : <Muted>—</Muted>);

/**
 * The courier, then the vehicle's plate — set like a number plate, the cell's one deliberate
 * flourish, because it is what someone at the gate reads off the screen. The tracking number lives
 * under the reference instead: here it shared a line with the plate and was always truncated.
 */
const CourierCell = ({ c }: { c: IConsignment }) => {
    const name = c.courierService ?? c.courier?.name;
    if (!name && !c.plateNumber) return <Muted>Not assigned yet</Muted>;
    return (
        <Box sx={{ minWidth: 0 }} title={[name, c.plateNumber].filter(Boolean).join(' · ')}>
            <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[800], lineHeight: 1.4 }}>
                {name ?? '—'}
            </Typography>
            {/* Only when there is a plate — an empty second line would lift the name off-centre. */}
            {c.plateNumber && (
                <Box sx={{
                    display: 'inline-block', px: 0.5, mt: 0.25, lineHeight: '16px', borderRadius: '3px',
                    border: `1px solid ${neutral[300]}`, bgcolor: neutral[50],
                    fontFamily: MONO, fontSize: '0.8rem', fontWeight: 600, color: neutral[700],
                }}
                >
                    {c.plateNumber}
                </Box>
            )}
        </Box>
    );
};

/** How many movements ride on it. An empty one says so, because it cannot be dispatched. */
const LoadCell = ({ c }: { c: IConsignment }) => (
    <Tooltip
        arrow
        title={c.movementCount === 0
            ? 'Nothing loaded yet — this consignment cannot be dispatched'
            : `${c.movementCount} movement${c.movementCount === 1 ? '' : 's'} travelling together`}
    >
        <Typography
            component="span"
            sx={{
                fontSize: '0.875rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                color: c.movementCount === 0 ? statusTokens.warning.strong : neutral[800],
            }}
        >
            {c.movementCount === 0 ? 'Empty' : c.movementCount}
        </Typography>
    </Tooltip>
);

/**
 * Dispatch and expected delivery in one cell, because the pair is the question being asked: has
 * this left, and is it late? An overdue journey says so in red rather than making the reader
 * subtract two dates.
 */
const ScheduleCell = ({ c }: { c: IConsignment }) => {
    if (c.status === 'DRAFT') return <Muted>Not dispatched</Muted>;
    // A draft abandoned before it left has no dispatch date; "Left —" read as though it had gone.
    if (c.status === 'CANCELLED' && !c.dispatchDate) return <Muted>Never dispatched</Muted>;
    if (c.status === 'ARRIVED') {
        return <TwoLine primary={`Arrived ${fmtDate(c.arrivalDate)}`} secondary={`Left ${fmtDate(c.dispatchDate)}`} strong={false} />;
    }

    const due = daysFromToday(c.expectedDeliveryDate);
    const overdue = c.status !== 'CANCELLED' && due != null && due < 0;
    const dueLine = !c.expectedDeliveryDate ? undefined : overdue ? (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, color: statusTokens.danger.strong, fontWeight: 600 }}>
            <WarningAmberOutlinedIcon sx={{ fontSize: 13 }} />
            {Math.abs(due!)} d overdue
        </Box>
    ) : `Due ${fmtDate(c.expectedDeliveryDate)}${due === 0 ? ' · today' : ''}`;
    return <TwoLine primary={`Left ${fmtDate(c.dispatchDate)}`} secondary={dueLine} strong={false} />;
};

/** The chip alone — the five-step bar beside it said the same thing a second time. */
const StatusCell = ({ c }: { c: IConsignment }) => (
    <Tooltip title={consignmentStatusHelp[c.status]} arrow>
        <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
            <StatusChip label={consignmentStatusLabels[c.status]} tone={STATUS_TONE[c.status]} />
        </Box>
    </Tooltip>
);

// ── Row actions ───────────────────────────────────────────────────────────

export type ConsignmentAction = 'open' | 'dispatch' | 'in-transit' | 'arrived' | 'hand-over' | 'cancel';

type RowAction = IRowMenuAction<ConsignmentAction>;

/**
 * The permission each journey action answers to, mirroring the `@PreAuthorize` on the endpoint
 * behind it. `open` is a navigation, not a write, so it rides on the page's own READ_MOVEMENT guard.
 */
const ACTION_PERMISSION: Partial<Record<ConsignmentAction, string>> = {
    'dispatch': PERMISSIONS.DISPATCH_MOVEMENT,
    'in-transit': PERMISSIONS.DISPATCH_MOVEMENT,
    'arrived': PERMISSIONS.RECEIVE_MOVEMENT,
    'hand-over': PERMISSIONS.RECEIVE_MOVEMENT,
    'cancel': PERMISSIONS.CANCEL_MOVEMENT,
};

/**
 * What a journey can do next. Mirrors the server's own state machine: a consignment moves
 * DRAFT → DISPATCHED → IN_TRANSIT → ARRIVED, and only a draft may be abandoned.
 */
const rowActionsForState = (c: IConsignment): RowAction[] => {
    switch (c.status) {
        case 'DRAFT':
            return [
                {
                    action: 'dispatch',
                    title: 'Dispatch',
                    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />,
                    disabledReason: c.movementCount === 0 ? 'Load at least one movement first' : undefined,
                },
                {
                    action: 'cancel',
                    title: 'Cancel journey',
                    icon: <CancelOutlinedIcon sx={{ fontSize: 16 }} />,
                    destructive: true,
                },
            ];
        case 'DISPATCHED':
            return [{
                action: 'in-transit',
                title: 'Mark in transit',
                icon: <FlightTakeoffOutlinedIcon sx={{ fontSize: 16 }} />,
            }];
        case 'IN_TRANSIT':
            return [{
                action: 'arrived',
                title: 'Mark arrived',
                icon: <WhereToVoteOutlinedIcon sx={{ fontSize: 16 }} />,
            }];
        case 'ARRIVED':
            return [{
                action: 'hand-over',
                title: 'Hand over',
                icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 16 }} />,
            }];
        default:
            return [];
    }
};

/**
 * The state machine's answer, narrowed to what this user may actually press.
 *
 * <p>Actions the user lacks are dropped rather than shown with a `disabledReason`. That field is
 * for a blocker the user can clear themselves — "load at least one movement first" is advice;
 * "you do not hold DISPATCH_MOVEMENT" is not, and offering it greyed out only invites a support
 * call. The permissions themselves are granted in Settings → Roles.
 */
const rowActions = (
    c: IConsignment,
    permitted: (a: ConsignmentAction, c: IConsignment) => boolean,
): RowAction[] => rowActionsForState(c).filter(a => permitted(a.action, c));

// ── Table ─────────────────────────────────────────────────────────────────

type Order = 'asc' | 'desc';

export interface IConsignmentTableProps {
    rows: IConsignment[];
    loading?: boolean;
    /** The row with an action in flight — its dropdown locks until the call returns. */
    busyId?: number | null;
    empty?: ReactNode;
    onAction: (action: ConsignmentAction, consignment: IConsignment) => void;
    /** Change to send pagination back to page 1 — e.g. when the status tab changes. */
    paginationResetKey?: string | number;
    /**
     * Hands paging and sorting to the caller, for a table backed by a filtered server query.
     *
     * <p>Without it the table sorts and pages whatever array it was given — right for a short list,
     * wrong for a register: the page held the first hundred journeys and paginated those, so
     * consignment #101 was unreachable and the filter panel could not find it. When present, `rows`
     * is taken as already sorted and already the page to show, and `total` is the size of the whole
     * matching set rather than of the array.
     */
    server?: {
        page: number;
        rowsPerPage: number;
        total: number;
        onPageChange: (page: number) => void;
        onRowsPerPageChange: (rowsPerPage: number) => void;
        onSortChange: (column: ColumnId, order: Order) => void;
    };
    /** Omit the surrounding Paper when the caller already provides one. */
    disableSurface?: boolean;
    /** Pin the head while the body scrolls. Pair with `maxHeight`. */
    stickyHeader?: boolean;
    /** Caps the scroll area; only meaningful with `stickyHeader`. */
    maxHeight?: number | string;
}

const ConsignmentTable = ({
    rows, loading, busyId, empty, onAction, paginationResetKey, disableSurface,
    stickyHeader, maxHeight, server,
}: IConsignmentTableProps) => {
    const { canActOnAnyOf } = useAccessScope();

    /*
     * Two questions per action, and the second is per row.
     *
     * This resolved the permission once for the whole table, on the reasoning that the answer
     * "cannot differ between rows". True of the permission, false of the scope: the endpoints guard
     * with `requireCanManageAny(MOVEMENTS, [source, destination])`, and the listing resolves VIEW.
     * Someone who sees every branch's journeys without MANAGE reach over them was offered Dispatch,
     * Mark arrived and Cancel on all of them, and the click came back refused — the same gap the
     * movements register had, closed the same way.
     */
    const permitted = useCallback(
        (action: ConsignmentAction, c: IConsignment) => {
            const permission = ACTION_PERMISSION[action];
            return !permission || canActOnAnyOf(permission, 'MOVEMENTS', [c.sourceLocation?.id, c.destLocation?.id]);
        },
        [canActOnAnyOf],
    );

    const [orderBy, setOrderBy] = useState<ColumnId>('reference');
    const [order, setOrder] = useState<Order>('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

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
        const sortValue = COLUMNS.find((c) => c.id === orderBy)?.sortValue;
        if (!sortValue) return rows;
        return [...rows].sort((a, b) => {
            const av = sortValue(a);
            const bv = sortValue(b);
            if (av === bv) return 0;
            return (av > bv ? 1 : -1) * (order === 'asc' ? 1 : -1);
        });
    }, [rows, orderBy, order, server]);

    // Server-backed tables are handed exactly the page to render; slicing again would page a page.
    const paginated = server
        ? sorted
        : sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    // Always shown once there is anything to page through, so the card ends on the same
    // footer strip the movements table does rather than a bare table edge.
    const showPagination = !loading && sorted.length > 0;

    const renderCell = (col: ConsignmentColumn, c: IConsignment) => {
        switch (col.id) {
            case 'reference': return <ReferenceCell c={c} />;
            case 'from': return <EndCell name={c.sourceLocation?.name} />;
            case 'to': return <EndCell name={c.destLocation?.name} sub={c.status === 'ARRIVED' ? c.landingStore?.name : null} />;
            case 'courier': return <CourierCell c={c} />;
            case 'load': return <LoadCell c={c} />;
            case 'schedule': return <ScheduleCell c={c} />;
            case 'status': return <StatusCell c={c} />;
            case 'actions':
                return (
                    // Row click opens the journey, so the menu must not fire it twice.
                    <Stack direction="row" justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
                        <RowActionsMenu
                            heading={referenceOf(c)}
                            subheading={consignmentStatusLabels[c.status]}
                            viewLabel="Open journey"
                            onView={() => onAction('open', c)}
                            actions={rowActions(c, permitted)}
                            busy={busyId === c.id}
                            onPick={(action) => onAction(action, c)}
                        />
                    </Stack>
                );
            default: return null;
        }
    };

    const body = (
        <>
            <TableContainer sx={maxHeight ? { maxHeight } : undefined}>
                <Table size="small" stickyHeader={stickyHeader} sx={{ tableLayout: 'fixed', minWidth: TABLE_MIN_WIDTH }}>
                    <TableHead>
                        <TableRow>
                            {COLUMNS.map((col) => (
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
                                <TableCell colSpan={COLUMNS.length} sx={{ textAlign: 'center', py: 5, border: 'none' }}>
                                    <CircularProgress size={28} sx={{ color: brand[500] }} />
                                </TableCell>
                            </TableRow>
                        ) : paginated.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={COLUMNS.length} sx={{ border: 'none', p: 0 }}>{empty}</TableCell>
                            </TableRow>
                        ) : paginated.map((c) => (
                            <TableRow
                                key={c.id}
                                hover={false}
                                onClick={() => onAction('open', c)}
                                sx={registerRowSx}
                            >
                                {COLUMNS.map((col) => (
                                    <TableCell key={col.id} align={col.align ?? 'left'} sx={registerBodyCellSx}>
                                        {renderCell(col, c)}
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
        </>
    );

    if (disableSurface) return body;

    return <Paper elevation={0} sx={dataSurfaceSx}>{body}</Paper>;
};

export default ConsignmentTable;
