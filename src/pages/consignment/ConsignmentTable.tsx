/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { PERMISSIONS } from '../../core/permissions/constants';
import usePermissions from '../../core/permissions/usePermissions';
import {
    alpha, Box, CircularProgress, FormControl, ListItemIcon, ListItemText, MenuItem, Paper,
    Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
    TableRow, TableSortLabel, Tooltip, Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import WhereToVoteOutlinedIcon from '@mui/icons-material/WhereToVoteOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { brand, neutral, border, status as statusTokens } from '../../utils/tokens';
import {
    dataHeadCellSx, dataBodyCellSx, dataRowSx, dataPaginationSx, dataSurfaceSx,
    dataActionSelectSx, dataActionMenuPaperSx,
} from '../../components/tables/dataTableSx';
import {
    IConsignment, ConsignmentStatus, consignmentStatusLabels, consignmentStatusHelp,
} from './interface';

/**
 * The consignments list, rendered with the same grammar as the movement tables
 * (`../movement/MovementTable`) so the two halves of the module read as one product: tinted
 * uppercase sortable head, zebra body, per-column minimum widths, one dropdown per row.
 */

// ── Column model ──────────────────────────────────────────────────────────

type ColumnId = 'reference' | 'route' | 'courier' | 'load' | 'schedule' | 'status' | 'actions';

interface ConsignmentColumn {
    id: ColumnId;
    label: string;
    minWidth: number;
    align?: 'left' | 'center' | 'right';
    sortValue?: (c: IConsignment) => string | number;
}

/** Journey order, so sorting by status walks the road rather than the alphabet. */
const STATUS_ORDER: ConsignmentStatus[] = ['DRAFT', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'CANCELLED'];

const COLUMNS: ConsignmentColumn[] = [
    { id: 'reference', label: 'Reference', minWidth: 130, sortValue: (c) => c.id },
    { id: 'route', label: 'Route', minWidth: 260 },
    { id: 'courier', label: 'Courier', minWidth: 180 },
    { id: 'load', label: 'Load', minWidth: 90, align: 'center', sortValue: (c) => c.movementCount },
    { id: 'schedule', label: 'Schedule', minWidth: 165, sortValue: (c) => new Date(c.dispatchDate ?? c.createDate ?? 0).getTime() },
    { id: 'status', label: 'Status', minWidth: 150, sortValue: (c) => STATUS_ORDER.indexOf(c.status) },
    { id: 'actions', label: 'Actions', minWidth: 120, align: 'right' },
];

// ── Status presentation ───────────────────────────────────────────────────

const STATUS_TONE: Record<ConsignmentStatus, { bg: string; fg: string; dot: string }> = {
    DRAFT: { bg: alpha(brand[500], 0.1), fg: brand[700], dot: brand[500] },
    DISPATCHED: { bg: alpha(statusTokens.warning.main, 0.14), fg: statusTokens.warning.strong, dot: statusTokens.warning.main },
    IN_TRANSIT: { bg: alpha(statusTokens.info.main, 0.12), fg: statusTokens.info.strong, dot: statusTokens.info.main },
    ARRIVED: { bg: alpha(statusTokens.success.main, 0.12), fg: statusTokens.success.strong, dot: statusTokens.success.main },
    CANCELLED: { bg: alpha(statusTokens.danger.main, 0.1), fg: statusTokens.danger.strong, dot: statusTokens.danger.main },
};

/** The road a healthy journey travels; CANCELLED steps off it wherever it stopped. */
const JOURNEY: ConsignmentStatus[] = ['DRAFT', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED'];

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

// ── Cells ─────────────────────────────────────────────────────────────────

const ReferenceCell = ({ c }: { c: IConsignment }) => (
    <Stack spacing={0.15}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: brand[600], fontFamily: 'monospace' }}>
            {c.reference ?? `CNS-${c.id}`}
        </Typography>
        <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.6rem' }}>
            Opened {fmtDate(c.createDate)}
        </Typography>
    </Stack>
);

/** One end of the road — a location, with the landing store named once the goods are down. */
const RouteNode = ({ label, sub }: { label: string; sub?: string }) => (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
        <Box
            sx={{
                width: 24, height: 24, borderRadius: '6px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: neutral[100], color: neutral[500],
            }}
        >
            <PlaceOutlinedIcon sx={{ fontSize: 13 }} />
        </Box>
        <Stack sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: neutral[800] }} noWrap>{label}</Typography>
            {sub && (
                <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.6rem' }} noWrap>{sub}</Typography>
            )}
        </Stack>
    </Stack>
);

const RouteCell = ({ c }: { c: IConsignment }) => (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
        <RouteNode label={c.sourceLocation?.name ?? '—'} />
        <ArrowForwardIcon sx={{ fontSize: 13, color: neutral[300], flexShrink: 0 }} />
        <RouteNode
            label={c.destLocation?.name ?? '—'}
            sub={c.status === 'ARRIVED' ? (c.landingStore?.name ?? undefined) : undefined}
        />
    </Stack>
);

const CourierCell = ({ c }: { c: IConsignment }) => {
    const name = c.courierService ?? c.courier?.name;
    if (!name && !c.plateNumber) {
        return (
            <Typography variant="caption" sx={{ color: neutral[400], fontStyle: 'italic' }}>
                Not yet assigned
            </Typography>
        );
    }
    return (
        <Stack spacing={0.4} alignItems="flex-start">
            <Typography variant="caption" sx={{ fontWeight: 600, color: neutral[800] }} noWrap>
                {name ?? '—'}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
                {c.plateNumber && (
                    // Styled as a number plate — the one detail a gate officer reads off the screen.
                    <Box
                        sx={{
                            px: 0.6, height: 17, display: 'inline-flex', alignItems: 'center',
                            borderRadius: '3px', border: `1px solid ${neutral[300]}`, bgcolor: neutral[50],
                            fontFamily: 'monospace', fontSize: '0.6rem', fontWeight: 700,
                            letterSpacing: '0.04em', color: neutral[700],
                        }}
                    >
                        {c.plateNumber}
                    </Box>
                )}
                {c.trackingNumber && (
                    <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.6rem', fontFamily: 'monospace' }}>
                        {c.trackingNumber}
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
};

const LoadCell = ({ c }: { c: IConsignment }) => {
    const empty = c.movementCount === 0;
    return (
        <Tooltip
            arrow
            title={empty
                ? 'Nothing loaded yet — this consignment cannot be dispatched'
                : `${c.movementCount} movement${c.movementCount === 1 ? '' : 's'} travelling together`}
        >
            <Box
                sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    px: 0.9, height: 22, borderRadius: '6px',
                    bgcolor: empty ? alpha(statusTokens.warning.main, 0.12) : alpha(brand[500], 0.08),
                    color: empty ? statusTokens.warning.strong : brand[700],
                    fontSize: '0.7rem', fontWeight: 700,
                }}
            >
                <Inventory2OutlinedIcon sx={{ fontSize: 12 }} />
                {c.movementCount}
            </Box>
        </Tooltip>
    );
};

/**
 * Dispatch and expected-delivery in one cell, because the pair is the question being asked:
 * has this left, and is it late? An overdue journey says so in red rather than making the
 * reader subtract two dates.
 */
const ScheduleCell = ({ c }: { c: IConsignment }) => {
    if (c.status === 'DRAFT') {
        return <Typography variant="caption" sx={{ color: neutral[400], fontStyle: 'italic' }}>Not dispatched</Typography>;
    }
    if (c.status === 'ARRIVED') {
        return (
            <Stack spacing={0.15}>
                <Typography variant="caption" sx={{ color: neutral[700], fontWeight: 500 }}>
                    Landed {fmtDate(c.arrivalDate)}
                </Typography>
                <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.6rem' }}>
                    Left {fmtDate(c.dispatchDate)}
                </Typography>
            </Stack>
        );
    }

    const due = daysFromToday(c.expectedDeliveryDate);
    const overdue = c.status !== 'CANCELLED' && due != null && due < 0;
    return (
        <Stack spacing={0.3} alignItems="flex-start">
            <Typography variant="caption" sx={{ color: neutral[700], fontWeight: 500 }}>
                Left {fmtDate(c.dispatchDate)}
            </Typography>
            {c.expectedDeliveryDate && (
                overdue ? (
                    <Box
                        sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.4,
                            px: 0.6, height: 18, borderRadius: '4px',
                            bgcolor: alpha(statusTokens.danger.main, 0.1),
                            color: statusTokens.danger.strong,
                            fontSize: '0.62rem', fontWeight: 700,
                        }}
                    >
                        <WarningAmberOutlinedIcon sx={{ fontSize: 11 }} />
                        {Math.abs(due!)} d overdue
                    </Box>
                ) : (
                    <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.6rem' }}>
                        Due {fmtDate(c.expectedDeliveryDate)}{due === 0 ? ' · today' : ''}
                    </Typography>
                )
            )}
        </Stack>
    );
};

const StatusCell = ({ c }: { c: IConsignment }) => {
    const tone = STATUS_TONE[c.status];
    const stage = JOURNEY.indexOf(c.status);
    return (
        <Stack spacing={0.6} alignItems="flex-start">
            <Tooltip title={consignmentStatusHelp[c.status]} arrow>
                <Box
                    sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.6,
                        bgcolor: tone.bg, color: tone.fg,
                        borderRadius: '6px', px: 0.9, height: 22,
                        fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'help',
                    }}
                >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: tone.dot, flexShrink: 0 }} />
                    {consignmentStatusLabels[c.status]}
                </Box>
            </Tooltip>
            {stage >= 0 && (
                <Stack direction="row" spacing={0.4} sx={{ pl: 0.25 }}>
                    {JOURNEY.map((s, i) => (
                        <Box
                            key={s}
                            sx={{
                                width: i === stage ? 14 : 6, height: 5, borderRadius: 3,
                                transition: 'width 0.15s',
                                bgcolor: i <= stage ? tone.dot : neutral[200],
                            }}
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    );
};

// ── Row actions ───────────────────────────────────────────────────────────

export type ConsignmentAction = 'open' | 'dispatch' | 'in-transit' | 'arrived' | 'hand-over' | 'cancel';

interface RowAction {
    action: ConsignmentAction;
    title: string;
    color: string;
    icon: ReactNode;
    /** Shown greyed with the reason on hover rather than hidden, so the blocker is legible. */
    disabledReason?: string;
    destructive?: boolean;
}

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
                    color: brand[600],
                    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />,
                    disabledReason: c.movementCount === 0 ? 'Load at least one movement first' : undefined,
                },
                {
                    action: 'cancel',
                    title: 'Cancel journey',
                    color: statusTokens.danger.strong,
                    icon: <CancelOutlinedIcon sx={{ fontSize: 15 }} />,
                    destructive: true,
                },
            ];
        case 'DISPATCHED':
            return [{
                action: 'in-transit',
                title: 'Mark in transit',
                color: statusTokens.info.strong,
                icon: <FlightTakeoffOutlinedIcon sx={{ fontSize: 15 }} />,
            }];
        case 'IN_TRANSIT':
            return [{
                action: 'arrived',
                title: 'Mark arrived',
                color: statusTokens.success.strong,
                icon: <WhereToVoteOutlinedIcon sx={{ fontSize: 15 }} />,
            }];
        case 'ARRIVED':
            return [{
                action: 'hand-over',
                title: 'Hand over',
                color: statusTokens.success.strong,
                icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 15 }} />,
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
    permitted: (a: ConsignmentAction) => boolean,
): RowAction[] => rowActionsForState(c).filter(a => permitted(a.action));

const RowActionsSelect = ({ actions, busy, onPick }: {
    actions: RowAction[];
    busy: boolean;
    onPick: (action: ConsignmentAction) => void;
}) => {
    const routine = actions.filter((a) => !a.destructive);
    const destructive = actions.filter((a) => a.destructive);

    /** Groups separated by a border, not a `<Divider>` — `Select` turns any child into an option. */
    const groupSx = (leads: boolean) =>
        (leads ? { borderTop: `1px solid ${border.subtle}`, mt: 0.5, pt: 1 } : {});

    const item = (a: RowAction, i: number) => {
        const row = (
            <MenuItem
                key={a.action}
                value={a.action}
                disabled={!!a.disabledReason}
                sx={{
                    fontSize: '0.78rem', py: 0.75, color: a.color,
                    '&:hover': { bgcolor: alpha(a.color, 0.07) },
                    ...groupSx(i === 0),
                }}
            >
                <ListItemIcon sx={{ color: a.color, minWidth: '28px !important' }}>{a.icon}</ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: 600 }}>{a.title}</ListItemText>
            </MenuItem>
        );
        // A disabled MenuItem swallows pointer events, so the reason hangs off a wrapper.
        return a.disabledReason
            ? <Tooltip key={a.action} title={a.disabledReason} arrow placement="left"><span>{row}</span></Tooltip>
            : row;
    };

    return (
        <FormControl size="small" sx={{ minWidth: 116 }}>
            <Select
                value=""
                displayEmpty
                disabled={busy}
                renderValue={() => (busy ? 'Working…' : 'Actions')}
                onChange={(e) => onPick(e.target.value as ConsignmentAction)}
                sx={dataActionSelectSx}
                MenuProps={{
                    // Without this the menu's modal pads the body and the page jumps sideways.
                    disableScrollLock: true,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                    transformOrigin: { vertical: 'top', horizontal: 'right' },
                    PaperProps: { elevation: 0, sx: dataActionMenuPaperSx },
                }}
            >
                <MenuItem
                    value="open"
                    sx={{ fontSize: '0.78rem', py: 0.75, color: brand[700], '&:hover': { bgcolor: alpha(brand[500], 0.07) } }}
                >
                    <ListItemIcon sx={{ color: brand[600], minWidth: '28px !important' }}>
                        <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: 600 }}>Open journey</ListItemText>
                </MenuItem>
                {routine.map(item)}
                {destructive.map(item)}
            </Select>
        </FormControl>
    );
};

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
    /** Omit the surrounding Paper when the caller already provides one. */
    disableSurface?: boolean;
    /** Pin the head while the body scrolls. Pair with `maxHeight`. */
    stickyHeader?: boolean;
    /** Caps the scroll area; only meaningful with `stickyHeader`. */
    maxHeight?: number | string;
}

const ConsignmentTable = ({
    rows, loading, busyId, empty, onAction, paginationResetKey, disableSurface,
    stickyHeader, maxHeight,
}: IConsignmentTableProps) => {
    const { has } = usePermissions();
    // Resolved once per render, not per row — the answer cannot differ between rows.
    const permitted = useMemo(() => {
        const granted = new Set(
            (Object.keys(ACTION_PERMISSION) as ConsignmentAction[])
                .filter(a => has(ACTION_PERMISSION[a] as string)),
        );
        return (action: ConsignmentAction) => !ACTION_PERMISSION[action] || granted.has(action);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows]);

    const [orderBy, setOrderBy] = useState<ColumnId>('reference');
    const [order, setOrder] = useState<Order>('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    useEffect(() => { setPage(0); }, [paginationResetKey]);

    const handleSort = (id: ColumnId) => {
        setOrder(orderBy === id && order === 'asc' ? 'desc' : 'asc');
        setOrderBy(id);
        setPage(0);
    };

    const sorted = useMemo(() => {
        const sortValue = COLUMNS.find((c) => c.id === orderBy)?.sortValue;
        if (!sortValue) return rows;
        return [...rows].sort((a, b) => {
            const av = sortValue(a);
            const bv = sortValue(b);
            if (av === bv) return 0;
            return (av > bv ? 1 : -1) * (order === 'asc' ? 1 : -1);
        });
    }, [rows, orderBy, order]);

    const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    // Always shown once there is anything to page through, so the card ends on the same
    // footer strip the movements table does rather than a bare table edge.
    const showPagination = !loading && sorted.length > 0;

    const renderCell = (col: ConsignmentColumn, c: IConsignment) => {
        switch (col.id) {
            case 'reference': return <ReferenceCell c={c} />;
            case 'route': return <RouteCell c={c} />;
            case 'courier': return <CourierCell c={c} />;
            case 'load': return <LoadCell c={c} />;
            case 'schedule': return <ScheduleCell c={c} />;
            case 'status': return <StatusCell c={c} />;
            case 'actions':
                return (
                    // Row click opens the journey, so the dropdown must not fire it twice.
                    <Stack direction="row" justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
                        <RowActionsSelect
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
                <Table size="small" stickyHeader={stickyHeader}>
                    <TableHead>
                        <TableRow>
                            {COLUMNS.map((col) => (
                                <TableCell
                                    key={col.id}
                                    align={col.align ?? 'left'}
                                    style={{ minWidth: col.minWidth }}
                                    sortDirection={orderBy === col.id ? order : false}
                                    sx={dataHeadCellSx}
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
                        ) : paginated.map((c, i) => (
                            <TableRow
                                key={c.id}
                                hover={false}
                                onClick={() => onAction('open', c)}
                                sx={dataRowSx(i, true)}
                            >
                                {COLUMNS.map((col) => (
                                    <TableCell key={col.id} align={col.align ?? 'left'} sx={dataBodyCellSx}>
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
                    count={sorted.length}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
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
