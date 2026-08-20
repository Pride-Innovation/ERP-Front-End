import {
    alpha,
    Box,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Typography,
} from '@mui/material';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { useState } from 'react';

const PRIMARY = '#08796C';

export interface ReportColumn<T = any> {
    id: keyof T | string;
    label: string;
    minWidth?: number;
    align?: 'left' | 'center' | 'right';
    format?: (value: any, row: T) => React.ReactNode;
}

interface ReportDataTableProps<T> {
    columns: ReportColumn<T>[];
    rows: T[];
    accentColor?: string;
    loading?: boolean;
    /**
     * Set when the fetch failed. Shown instead of the table, because "no rows" and "we could not
     * ask" mean opposite things and an empty grid cannot tell them apart.
     */
    error?: string | null;
    /** What an empty result means for this particular report. */
    emptyMessage?: string;
    rowKey?: keyof T | ((row: T) => string);
    /**
     * Total row count on the server, when the caller is paging server-side.
     *
     * Set this together with `page` and `onPageChange` and the table stops slicing and sorting
     * locally: `rows` is taken to be exactly the page to display. Leave all three unset — every
     * report does — and it keeps paging and sorting in the browser as before.
     *
     * The audit trail needs this because it pages in SQL: it holds twenty-five rows and must still
     * offer a pager over hundreds of thousands, and sorting the twenty-five it happens to be holding
     * would produce a sort order that is a lie.
     */
    totalCount?: number;
    page?: number;
    rowsPerPage?: number;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T | string) {
    const av = (a as any)[orderBy];
    const bv = (b as any)[orderBy];
    if (bv < av) return -1;
    if (bv > av) return 1;
    return 0;
}

function getComparator<T>(order: Order, orderBy: keyof T | string) {
    return order === 'desc'
        ? (a: T, b: T) => descendingComparator(a, b, orderBy)
        : (a: T, b: T) => -descendingComparator(a, b, orderBy);
}

function ReportDataTable<T>({
    columns, rows, accentColor = PRIMARY, loading, error, emptyMessage, rowKey,
    totalCount, page: controlledPage, rowsPerPage: controlledRowsPerPage,
    onPageChange, onRowsPerPageChange,
}: ReportDataTableProps<T>) {
    const [localPage, setLocalPage] = useState(0);
    const [localRowsPerPage, setLocalRowsPerPage] = useState(10);
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof T | string>(columns[0]?.id ?? '');

    // The caller owns the paging as soon as it supplies a total.
    const serverPaged = totalCount !== undefined;
    const page = serverPaged ? (controlledPage ?? 0) : localPage;
    const rowsPerPage = serverPaged ? (controlledRowsPerPage ?? 25) : localRowsPerPage;

    const handleSort = (col: keyof T | string) => {
        const isAsc = orderBy === col && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(col);
    };

    /*
     * Server-paged tables are shown exactly as sent. Sorting or slicing here would only reorder the
     * page in hand — which reads as a sort of the whole table and is not one — and the server has
     * already ordered it.
     */
    const paginated = serverPaged
        ? rows
        : [...rows].sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handlePageChange = (next: number) => {
        if (serverPaged) onPageChange?.(next);
        else setLocalPage(next);
    };

    const handleRowsPerPageChange = (next: number) => {
        if (serverPaged) onRowsPerPageChange?.(next);
        else { setLocalRowsPerPage(next); setLocalPage(0); }
    };

    const getKey = (row: T, i: number): string => {
        if (!rowKey) return String(i);
        if (typeof rowKey === 'function') return rowKey(row);
        return String((row as any)[rowKey]);
    };

    return (
        <Paper elevation={0} sx={{
            border: '1px solid #EEF2F7',
            borderRadius: 2,
            overflow: 'hidden',
        }}>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                    <CircularProgress size={28} sx={{ color: accentColor }} />
                </Box>
            )}

            {!loading && error && (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                    <ErrorOutlineOutlinedIcon sx={{ fontSize: 30, color: '#DC2626', mb: 1 }} />
                    <Typography sx={{ color: '#B91C1C', fontSize: '0.85rem', fontWeight: 600 }}>{error}</Typography>
                </Box>
            )}

            {!loading && !error && (
                <>
                    <TableContainer>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {columns.map((col) => (
                                        <TableCell
                                            key={String(col.id)}
                                            align={col.align ?? 'left'}
                                            style={{ minWidth: col.minWidth ?? 120 }}
                                            sortDirection={orderBy === col.id ? order : false}
                                            sx={{
                                                bgcolor: '#F8FAFC',
                                                color: '#475569',
                                                fontWeight: 700,
                                                fontSize: '0.68rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.07em',
                                                py: 1.25,
                                                px: 2,
                                                whiteSpace: 'nowrap',
                                                borderBottom: '1px solid #E2E8F0',
                                                '& .MuiTableSortLabel-root': {
                                                    color: '#475569',
                                                    '&:hover': { color: accentColor },
                                                    '&.Mui-active': { color: accentColor },
                                                },
                                                '& .MuiTableSortLabel-icon': { color: `${accentColor} !important` },
                                            }}
                                        >
                                            {/* No sort affordance when the server owns the order —
                                                a control that reorders only the visible page would
                                                promise more than it does. */}
                                            {serverPaged ? col.label : (
                                                <TableSortLabel
                                                    active={orderBy === col.id}
                                                    direction={orderBy === col.id ? order : 'asc'}
                                                    onClick={() => handleSort(col.id)}
                                                >
                                                    {col.label}
                                                </TableSortLabel>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginated.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                                            <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                                                {emptyMessage ?? 'No records found for the selected filters.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {paginated.map((row, i) => (
                                    <TableRow
                                        key={getKey(row, i)}
                                        sx={{
                                            bgcolor: i % 2 === 0 ? '#fff' : '#FAFBFC',
                                            transition: 'background-color 0.12s',
                                            '&:hover': { bgcolor: alpha(accentColor, 0.04) },
                                            '&:last-child td': { borderBottom: 0 },
                                        }}
                                    >
                                        {columns.map((col) => (
                                            <TableCell
                                                key={String(col.id)}
                                                align={col.align ?? 'left'}
                                                sx={{ fontSize: '0.8rem', color: '#1F2937', py: 1.2, px: 2, borderColor: '#F1F5F9' }}
                                            >
                                                {col.format
                                                    ? col.format((row as any)[col.id], row)
                                                    : String((row as any)[col.id] ?? '—')}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        component="div"
                        count={totalCount ?? rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(_, p) => handlePageChange(p)}
                        onRowsPerPageChange={(e) => handleRowsPerPageChange(parseInt(e.target.value, 10))}
                        sx={{
                            borderTop: '1px solid #EEF2F7',
                            bgcolor: '#FAFBFC',
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.78rem', color: '#64748B' },
                            '& .MuiTablePagination-select': { fontSize: '0.78rem' },
                        }}
                    />
                </>
            )}
        </Paper>
    );
}

export default ReportDataTable;

// ── Status chip helper (shared by panels) ─────────────────────────────────
type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

const STATUS_MAP: Record<string, StatusVariant> = {
    approved: 'success', active: 'success', completed: 'success', present: 'success',
    pending: 'warning', created: 'warning', stockPending: 'warning', inactive: 'warning',
    rejected: 'error', blocked: 'error', disposed: 'error', disabled: 'error',
    issued: 'info', inRepair: 'info', repair: 'info', acknowledge: 'info', available: 'info', inStore: 'info',
};

const STATUS_COLORS: Record<StatusVariant, { bg: string; text: string; border: string }> = {
    success: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
    warning: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
    error: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    info: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    default: { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0' },
};

export const StatusChip = ({ value }: { value: string }) => {
    const variant = STATUS_MAP[value?.toLowerCase?.()] ?? 'default';
    const c = STATUS_COLORS[variant];
    return (
        <Chip
            label={value}
            size="small"
            sx={{
                bgcolor: c.bg, color: c.text, border: `1px solid ${c.border}`,
                fontWeight: 600, fontSize: '0.7rem', height: 22,
                textTransform: 'capitalize',
            }}
        />
    );
};
