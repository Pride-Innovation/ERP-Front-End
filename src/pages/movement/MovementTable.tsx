/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
    alpha, Box, CircularProgress, FormControl, IconButton, ListItemIcon, ListItemText,
    MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
    TablePagination, TableRow, TableSortLabel, Tooltip, Typography,
} from '@mui/material';
import { PERMISSIONS } from '../../core/permissions/constants';
import usePermissions from '../../core/permissions/usePermissions';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { brand, neutral, border } from '../../utils/tokens';
import {
    dataHeadCellSx, dataBodyCellSx, dataRowSx, dataPaginationSx, dataSurfaceSx,
    dataActionSelectSx, dataActionMenuPaperSx,
} from '../../components/tables/dataTableSx';
import { StatusChip } from '../../components/layout';
import {
    movementTypeLabel, statusLabel, statusTone, MovementStatus, MovementType,
    canDispatch, canMarkInTransit, canReceive, canComplete, canCancel, canApproveMovement,
} from './constants';
import { IMovement } from './interface';

/**
 * The movement tables, rendered with the same visual grammar as the audit-trail table
 * (`../reports/ReportDataTable`): tinted uppercase sortable head, zebra body, per-column
 * minimum widths and a tinted footer strip. Movement-specific cells live here rather than in
 * that generic component because they read the whole row, not a single value.
 */

// ── Column model ──────────────────────────────────────────────────────────

type ColumnId = 'ref' | 'type' | 'route' | 'items' | 'status' | 'date' | 'actions';

interface MovementColumn {
    id: ColumnId;
    label: string;
    minWidth: number;
    align?: 'left' | 'center' | 'right';
    /** Absent for presentational columns (route, items, actions) that have no natural order. */
    sortValue?: (m: IMovement) => string | number;
}

/** Lifecycle order, so sorting by status walks the pipeline rather than the alphabet. */
const STATUS_ORDER: MovementStatus[] = [
    'DRAFT', 'INITIATED', 'DISPATCHED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED', 'CANCELLED',
];

const COLUMNS: Record<ColumnId, MovementColumn> = {
    ref: { id: 'ref', label: 'Ref', minWidth: 96, sortValue: (m) => Number(m.id ?? 0) },
    type: { id: 'type', label: 'Type', minWidth: 170, sortValue: (m) => movementTypeLabel(m.movementType) },
    route: { id: 'route', label: 'Source → Destination', minWidth: 280 },
    items: { id: 'items', label: 'Items', minWidth: 80, align: 'center' },
    status: {
        id: 'status',
        label: 'Status',
        minWidth: 150,
        sortValue: (m) => STATUS_ORDER.indexOf(m.status as MovementStatus),
    },
    date: {
        id: 'date',
        label: 'Date',
        minWidth: 130,
        sortValue: (m) => new Date(m.createDate ?? 0).getTime(),
    },
    actions: { id: 'actions', label: 'Actions', minWidth: 110, align: 'right' },
};

const RECENT_COLUMNS: ColumnId[] = ['ref', 'type', 'route', 'items', 'status', 'date', 'actions'];
const APPROVAL_COLUMNS: ColumnId[] = ['ref', 'type', 'route', 'items', 'date', 'actions'];

// ── Movement type colours ─────────────────────────────────────────────────

/**
 * One hue per movement type, so a type is recognisable before its label is read — the same
 * device the audit trail uses for its modules.
 */
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

const initialsOf = (name: string) =>
    name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

/** Stable per-name hue, matching the audit trail's actor avatars. */
const AVATAR_COLORS = ['#0369A1', '#059669', '#7C3AED', '#D97706', '#DC2626', '#0891B2', '#DB2777'];
const avatarColor = (name: string) =>
    AVATAR_COLORS[name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

// ── Cells ─────────────────────────────────────────────────────────────────

const RefCell = ({ mov }: { mov: IMovement }) => (
    <Stack spacing={0.15}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: brand[600], fontFamily: 'monospace' }}>
            #{mov.id}
        </Typography>
        {(mov.consignment || mov.request) && (
            <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.6rem', fontFamily: 'monospace' }}>
                {mov.consignment
                    ? (mov.consignment.reference ?? `CNS-${mov.consignment.id}`)
                    : `REQ-${mov.request?.id}`}
            </Typography>
        )}
    </Stack>
);

const TypeCell = ({ mov }: { mov: IMovement }) => {
    const color = typeColor(mov.movementType);
    return (
        <Stack spacing={0.35} alignItems="flex-start">
            <Box
                sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.6,
                    bgcolor: alpha(color, 0.1), color,
                    border: `1px solid ${alpha(color, 0.22)}`,
                    borderRadius: '6px', px: 0.9, height: 22,
                    fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap',
                }}
            >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                {movementTypeLabel(mov.movementType)}
            </Box>
            {mov.movementCategory && (
                <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.6rem' }}>
                    {mov.movementCategory === 'INTER_LOCATION' ? 'Inter-location' : 'Intra-location'}
                </Typography>
            )}
        </Stack>
    );
};

/** One end of the route — a store (icon badge) or a person (initials avatar). */
const RouteNode = ({ label, sub, person }: { label: string; sub?: string; person?: boolean }) => (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
        <Box
            sx={{
                width: 24, height: 24, borderRadius: person ? '50%' : '6px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700,
                bgcolor: person ? alpha(avatarColor(label), 0.12) : neutral[100],
                color: person ? avatarColor(label) : neutral[500],
            }}
        >
            {person ? initialsOf(label) : <StorefrontOutlinedIcon sx={{ fontSize: 13 }} />}
        </Box>
        <Stack sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: neutral[800] }} noWrap>
                {label}
            </Typography>
            {sub && (
                <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.6rem' }} noWrap>
                    {sub}
                </Typography>
            )}
        </Stack>
    </Stack>
);

const RouteCell = ({ mov }: { mov: IMovement }) => {
    const recipient = userName(mov.recipientUser);
    const toPerson = !mov.destStore && !!recipient;
    return (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <RouteNode
                label={mov.sourceStore?.name ?? '—'}
                sub={mov.sourceStore?.location?.name ?? undefined}
            />
            <ArrowForwardIcon sx={{ fontSize: 13, color: neutral[300], flexShrink: 0 }} />
            <RouteNode
                label={toPerson ? recipient : (mov.destStore?.name ?? (recipient || '—'))}
                sub={toPerson ? 'Recipient' : (mov.destStore?.location?.name ?? undefined)}
                person={toPerson}
            />
        </Stack>
    );
};

const ItemsCell = ({ mov }: { mov: IMovement }) => {
    const items = mov.items ?? [];
    const names = items
        .map((i) => i.asset?.assetName ?? i.commodity?.name ?? i.serialNumber ?? i.assetTag)
        .filter(Boolean) as string[];
    const preview = names.slice(0, 5).join(', ') + (names.length > 5 ? `, +${names.length - 5} more` : '');
    return (
        <Tooltip title={preview || 'No item lines recorded'} arrow>
            <Box
                sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    px: 0.9, height: 22, borderRadius: '6px',
                    bgcolor: items.length ? alpha(brand[500], 0.08) : neutral[100],
                    color: items.length ? brand[700] : neutral[400],
                    fontSize: '0.7rem', fontWeight: 700,
                }}
            >
                <Inventory2OutlinedIcon sx={{ fontSize: 12 }} />
                {items.length}
            </Box>
        </Tooltip>
    );
};

/** Where the movement sits on the lifecycle. Cancelled stops wherever it stopped. */
const PIPELINE: MovementStatus[] = ['DRAFT', 'INITIATED', 'DISPATCHED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED'];

const StatusCell = ({ mov }: { mov: IMovement }) => {
    const cancelled = mov.status === 'CANCELLED';
    const stage = PIPELINE.indexOf(mov.status as MovementStatus);
    const tone = statusTone(mov.status);
    const dotColor = cancelled ? '#DC2626' : brand[500];
    return (
        <Stack spacing={0.6} alignItems="flex-start">
            <StatusChip label={statusLabel(mov.status)} tone={tone} />
            {!cancelled && stage >= 0 && (
                <Tooltip title={`Stage ${stage + 1} of ${PIPELINE.length} — ${statusLabel(mov.status)}`} arrow>
                    <Stack direction="row" spacing={0.4} sx={{ pl: 0.25 }}>
                        {PIPELINE.map((s, i) => (
                            <Box
                                key={s}
                                sx={{
                                    width: i === stage ? 12 : 5, height: 5, borderRadius: 3,
                                    transition: 'width 0.15s',
                                    bgcolor: i <= stage ? dotColor : neutral[200],
                                }}
                            />
                        ))}
                    </Stack>
                </Tooltip>
            )}
        </Stack>
    );
};

const DateCell = ({ mov }: { mov: IMovement }) => (
    <Tooltip title={fmtDateTime(mov.createDate)} arrow>
        <Stack spacing={0.15}>
            <Typography variant="caption" sx={{ color: neutral[700], fontWeight: 500 }}>
                {relativeTime(mov.createDate)}
            </Typography>
            <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.6rem' }}>
                {mov.initiator ? userName(mov.initiator) : fmtDate(mov.createDate)}
            </Typography>
        </Stack>
    </Tooltip>
);

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

const APPROVE: RowAction = { action: 'approve', title: 'Approve', color: '#15803D', icon: <CheckCircleOutlineIcon sx={{ fontSize: 15 }} /> };
const REJECT: RowAction = { action: 'reject', title: 'Reject', color: '#B91C1C', icon: <HighlightOffIcon sx={{ fontSize: 15 }} />, destructive: true };

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
    permitted: (action: MovementAction) => boolean,
    currentUserId?: number | string,
): RowAction[] => {
    // Filtered here too: an approvals-variant table lists what is awaiting a decision, but being
    // shown the queue is not the same as being allowed to decide.
    if (variant === 'approvals') return [APPROVE, REJECT].filter(a => permitted(a.action));
    if (variant !== 'lifecycle') return [];

    const actions: RowAction[] = [];
    if (canApproveMovement(mov, currentUserId)) actions.push(APPROVE, REJECT);
    if (canDispatch(mov)) actions.push({ action: 'dispatch', title: 'Dispatch', color: '#2563EB', icon: <LocalShippingOutlinedIcon sx={{ fontSize: 15 }} /> });
    if (canMarkInTransit(mov)) actions.push({ action: 'in-transit', title: 'Mark in transit', color: '#4338CA', icon: <FlightTakeoffOutlinedIcon sx={{ fontSize: 15 }} /> });
    if (canReceive(mov)) actions.push({ action: 'receive', title: 'Receive', color: '#047857', icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 15 }} /> });
    if (canComplete(mov)) actions.push({ action: 'complete', title: 'Complete', color: '#15803D', icon: <TaskAltOutlinedIcon sx={{ fontSize: 15 }} /> });
    if (canCancel(mov)) actions.push({ action: 'cancel', title: 'Cancel', color: '#DC2626', icon: <CancelOutlinedIcon sx={{ fontSize: 15 }} />, destructive: true });
    return actions.filter(a => permitted(a.action));
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
 * The row's actions as a single dropdown. Preferred where a row can offer several at once —
 * six icons side by side read as noise, and the labels say what each one does.
 *
 * `disableScrollLock` matters here: without it the menu's modal hides the body scrollbar and
 * pads the body to compensate, so the whole page jumps sideways every time a row is opened.
 */
const RowActionsSelect = ({ actions, onView, onPick }: {
    actions: RowAction[];
    onView: () => void;
    onPick: (action: MovementAction) => void;
}) => {
    const routine = actions.filter((a) => !a.destructive);
    const destructive = actions.filter((a) => a.destructive);

    // Held at '' so the control always reads "Actions" — it triggers work, it does not store a choice.
    const handleChange = (value: string) => {
        if (value === 'view') onView();
        else onPick(value as MovementAction);
    };

    /**
     * Groups are separated by a border on the leading item rather than a `<Divider>`: `Select`
     * clones every child into a clickable option, which would make a divider fire `onChange`.
     */
    const groupSx = (leads: boolean) =>
        (leads ? { borderTop: `1px solid ${border.subtle}`, mt: 0.5, pt: 1 } : {});

    const item = (a: RowAction, i: number) => (
        <MenuItem
            key={a.action}
            value={a.action}
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

    return (
        <FormControl size="small" sx={{ minWidth: 116 }}>
            <Select
                value=""
                displayEmpty
                renderValue={() => 'Actions'}
                onChange={(e) => handleChange(e.target.value as string)}
                sx={dataActionSelectSx}
                MenuProps={{
                    // Keeps the page still while the dropdown is open.
                    disableScrollLock: true,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                    transformOrigin: { vertical: 'top', horizontal: 'right' },
                    PaperProps: { elevation: 0, sx: dataActionMenuPaperSx },
                }}
            >
                <MenuItem
                    value="view"
                    sx={{ fontSize: '0.78rem', py: 0.75, color: brand[700], '&:hover': { bgcolor: alpha(brand[500], 0.07) } }}
                >
                    <ListItemIcon sx={{ color: brand[600], minWidth: '28px !important' }}>
                        <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: 600 }}>View details</ListItemText>
                </MenuItem>

                {routine.map(item)}
                {destructive.map(item)}
            </Select>
        </FormControl>
    );
};

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
    /** `menu` collapses the row's actions into one dropdown. Defaults to a row of icon buttons. */
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
}

const MovementTable = ({
    rows, loading, variant = 'recent', empty, onView, onAction, currentUserId, actionsAs = 'icons',
    footer, paginateOver, paginationResetKey, initialSort, disableSurface, stickyHeader, maxHeight,
}: IMovementTableProps) => {
    const { has } = usePermissions();
    // Resolved once per render rather than per row — `has` is cheap, but a lifecycle table asks
    // seven questions a row and the answer cannot change between rows.
    const permitted = useMemo(() => {
        const granted = new Set(
            (Object.keys(ACTION_PERMISSION) as MovementAction[]).filter(a => has(ACTION_PERMISSION[a])),
        );
        return (action: MovementAction) => granted.has(action);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows]);

    const columns = (variant === 'approvals' ? APPROVAL_COLUMNS : RECENT_COLUMNS)
        .map((id) => (id === 'actions' && variant === 'lifecycle'
            ? { ...COLUMNS.actions, minWidth: actionsAs === 'menu' ? 120 : 210 }
            : COLUMNS[id]));

    const [orderBy, setOrderBy] = useState<ColumnId>(initialSort?.column ?? 'date');
    const [order, setOrder] = useState<Order>(initialSort?.order ?? 'desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    // The caller's filters changed underneath us, so the current page may no longer exist.
    useEffect(() => { setPage(0); }, [paginationResetKey]);

    const handleSort = (id: ColumnId) => {
        setOrder(orderBy === id && order === 'asc' ? 'desc' : 'asc');
        setOrderBy(id);
        setPage(0);
    };

    const sorted = useMemo(() => {
        const sortValue = COLUMNS[orderBy].sortValue;
        if (!sortValue) return rows;
        return [...rows].sort((a, b) => {
            const av = sortValue(a);
            const bv = sortValue(b);
            if (av === bv) return 0;
            return (av > bv ? 1 : -1) * (order === 'asc' ? 1 : -1);
        });
    }, [rows, orderBy, order]);

    const paginated = paginateOver != null && sorted.length > paginateOver
        ? sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : sorted;
    const showPagination = paginateOver != null && sorted.length > paginateOver;

    const renderCell = (col: MovementColumn, mov: IMovement) => {
        switch (col.id) {
            case 'ref': return <RefCell mov={mov} />;
            case 'type': return <TypeCell mov={mov} />;
            case 'route': return <RouteCell mov={mov} />;
            case 'items': return <ItemsCell mov={mov} />;
            case 'status': return <StatusCell mov={mov} />;
            case 'date': return <DateCell mov={mov} />;
            case 'actions': {
                const actions = rowActions(mov, variant, permitted, currentUserId);
                return (
                    // Row click opens the movement, so the controls must not fire it twice.
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
                        {actionsAs === 'menu' ? (
                            <RowActionsSelect
                                actions={actions}
                                onView={() => onView(mov)}
                                onPick={(action) => onAction?.(action, mov)}
                            />
                        ) : (
                            <>
                                <ActionButton title="View details" color={brand[600]} onClick={() => onView(mov)}>
                                    <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
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
                <Table size="small" stickyHeader={stickyHeader}>
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
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
                        ) : paginated.map((mov, i) => (
                            <TableRow
                                key={mov.id}
                                hover={false}
                                onClick={() => onView(mov)}
                                sx={dataRowSx(i, true)}
                            >
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.id}
                                        align={col.align ?? 'left'}
                                        sx={dataBodyCellSx}
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
                    count={sorted.length}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
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
