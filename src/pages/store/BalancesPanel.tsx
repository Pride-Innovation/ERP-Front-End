/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import {
    alpha, Box, Chip, IconButton, InputAdornment, Paper, Skeleton, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { toast } from 'react-toastify';
import usePermissions from '../../core/permissions/usePermissions';
import { PERMISSIONS } from '../../core/permissions/constants';
import { StatusChip } from '../../components/layout';
import ModalComponent from '../../components/modal';
import LedgerHistoryModal from './LedgerHistoryModal';
import {
    dataHeadCellSx, dataBodyCellSx, dataRowSx, dataSurfaceSx,
} from '../../components/tables/dataTableSx';
import { brand, neutral, border, status as statusTokens } from '../../utils/tokens';
import { setBalanceMinLevelService } from './service';

const PRIMARY = brand[500];
const AMBER = statusTokens.warning.strong;
const RED = statusTokens.danger.main;

export interface IBalanceView {
    balanceId: number;
    /** Needed to open this line's ledger history — the backend has always sent both. */
    storeId?: number;
    commodityId?: number;
    storeName?: string;
    storeType?: string;
    locationName?: string;
    commodityName?: string;
    assetTypeName?: string;
    quantity: number;
    minLevel: number;
    lowStock: boolean;
}

interface BalancesPanelProps {
    rows: IBalanceView[];
    setRows: Dispatch<SetStateAction<IBalanceView[]>>;
    loading: boolean;
    /** "Low stock only" filter — lifted so the page's KPI tile can toggle it too. */
    lowOnly: boolean;
    onLowOnlyChange: (v: boolean) => void;
}

const TYPE_FILTERS = [
    { value: 'ALL', label: 'All stores' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'IT', label: 'IT' },
    { value: 'DISPOSAL', label: 'Disposal' },
];

/** Compact on-hand vs reorder-level health bar: green → amber → red as stock approaches zero. */
const StockHealthBar = ({ quantity, minLevel }: { quantity: number; minLevel: number }) => {
    if (!minLevel || minLevel <= 0) return null;
    // Full bar at 2× the reorder level — "comfortably stocked" — clamped to [0, 1].
    const ratio = Math.max(0, Math.min(1, quantity / (minLevel * 2)));
    const color = quantity <= minLevel ? (quantity <= minLevel / 2 ? RED : AMBER) : PRIMARY;
    return (
        <Tooltip title={`${quantity} on hand · reorder at ${minLevel}`} arrow>
            <Box sx={{ width: 52, height: 4, borderRadius: 2, bgcolor: alpha('#000', 0.07), overflow: 'hidden', ml: 'auto', mt: 0.5 }}>
                <Box sx={{ width: `${ratio * 100}%`, height: '100%', bgcolor: color, transition: 'width 0.3s ease' }} />
            </Box>
        </Tooltip>
    );
};

const BalancesPanel = ({ rows, setRows, loading, lowOnly, onLowOnlyChange }: BalancesPanelProps) => {
    const { has } = usePermissions();
    const seesAllBranches = has(PERMISSIONS.VIEW_ALL_BRANCHES);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    /** Narrows to lines with no reorder level — the ones that can never raise an alert. */
    const [unmonitoredOnly, setUnmonitoredOnly] = useState(false);
    const [drafts, setDrafts] = useState<Record<number, string>>({});
    const [saving, setSaving] = useState<number | null>(null);
    /** The line whose ledger history is open. */
    const [historyRow, setHistoryRow] = useState<IBalanceView | null>(null);

    /**
     * A line with no reorder level can never be flagged low, whatever happens to its quantity.
     *
     * <p>These are the genuinely risky rows — they will run to zero without ever raising an alert —
     * and until now they were the quietest thing on the table, showing a grey dash in the status
     * column and nothing else.
     */
    const unmonitored = rows.filter((r) => !r.minLevel || r.minLevel <= 0);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter((r) => {
            if (lowOnly && !r.lowStock) return false;
            if (unmonitoredOnly && r.minLevel > 0) return false;
            if (typeFilter !== 'ALL' && r.storeType !== typeFilter) return false;
            if (q && ![r.commodityName, r.storeName, r.locationName].some((v) => (v ?? '').toLowerCase().includes(q))) return false;
            return true;
        });
    }, [rows, search, typeFilter, lowOnly, unmonitoredOnly]);

    const lowCount = rows.filter((r) => r.lowStock).length;
    /** Units on hand across whatever the filters are currently showing. */
    const visibleUnits = filtered.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

    const saveMinLevel = async (row: IBalanceView) => {
        const raw = drafts[row.balanceId];
        if (raw === undefined) return;
        const next = Math.max(0, Number(raw) || 0);
        if (next === row.minLevel) return;
        setSaving(row.balanceId);
        try {
            const res = (await setBalanceMinLevelService(row.balanceId, next)) as any;
            if (res?.status === 200) {
                setRows((prev) => prev.map((r) => (r.balanceId === row.balanceId ? res.data : r)));
                toast.success('Reorder level updated');
            } else {
                toast.error('Failed to update reorder level');
            }
        } finally {
            setSaving(null);
            setDrafts((d) => { const n = { ...d }; delete n[row.balanceId]; return n; });
        }
    };

    const filterChipSx = (active: boolean, color: string = PRIMARY) => ({
        height: 26,
        fontWeight: 700,
        fontSize: '0.7rem',
        cursor: 'pointer',
        bgcolor: active ? alpha(color, 0.12) : '#fff',
        color: active ? color : neutral[500],
        border: `1px solid ${active ? alpha(color, 0.35) : border.default}`,
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: alpha(color, 0.5), bgcolor: alpha(color, 0.06) },
    });

    return (
        <Paper elevation={0} sx={{ ...dataSurfaceSx, mt: 3 }}>
            {/* Header band — same icon-chip + title grammar as the movement and audit tables. */}
            <Box
                sx={{
                    px: 2.5, py: 1.75, borderBottom: `1px solid ${border.subtle}`,
                    display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
                }}
            >
                <Box sx={{
                    width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY,
                }}
                >
                    <Inventory2OutlinedIcon sx={{ fontSize: 17 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.25 }}>
                        Consumable Balances
                    </Typography>
                    {/* The listing is branch-scoped server-side. Saying so stops a branch officer
                        reading an empty or short table as "the bank holds almost nothing". */}
                    <Typography variant="caption" sx={{ color: neutral[500], fontSize: '0.7rem' }}>
                        {seesAllBranches
                            ? 'What each store holds on hand, across every branch'
                            : 'What your branch’s stores hold on hand, and when to reorder'}
                    </Typography>
                </Box>
                {lowCount > 0 && (
                    <Chip
                        size="small"
                        icon={<WarningAmberOutlinedIcon sx={{ fontSize: 14 }} />}
                        label={`${lowCount} low`}
                        sx={{ height: 22, fontWeight: 700, bgcolor: alpha(AMBER, 0.1), color: AMBER, '& .MuiChip-icon': { color: AMBER } }}
                    />
                )}
                <Box sx={{ flex: 1 }} />
                <TextField
                    size="small" placeholder="Search commodity / store / branch"
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        minWidth: 250,
                        '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#fff', fontSize: '0.8rem' },
                        '& fieldset': { borderColor: border.subtle },
                        '&:hover fieldset': { borderColor: alpha(PRIMARY, 0.5) },
                    }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlinedIcon sx={{ fontSize: 18, color: neutral[400] }} /></InputAdornment> }}
                />
            </Box>

            {/* Filter chips: store type + low-stock-only */}
            <Stack
                direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap
                sx={{ px: 2.5, py: 1.25, borderBottom: `1px solid ${border.subtle}`, bgcolor: neutral[50] }}
            >
                {TYPE_FILTERS.map((t) => (
                    <Chip
                        key={t.value}
                        label={t.label}
                        size="small"
                        onClick={() => setTypeFilter(t.value)}
                        sx={filterChipSx(typeFilter === t.value)}
                    />
                ))}
                <Box sx={{ width: 1, height: 20, bgcolor: border.default, mx: 0.5 }} />
                <Chip
                    label="Low stock only"
                    size="small"
                    icon={<WarningAmberOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => { onLowOnlyChange(!lowOnly); setUnmonitoredOnly(false); }}
                    sx={{
                        ...filterChipSx(lowOnly, AMBER),
                        '& .MuiChip-icon': { color: lowOnly ? AMBER : neutral[400] },
                    }}
                />
                {unmonitored.length > 0 && (
                    <Tooltip title="These lines have no reorder level, so they can never be flagged low however far they fall" arrow>
                        <Chip
                            label={`${unmonitored.length} not monitored`}
                            size="small"
                            icon={<VisibilityOffOutlinedIcon sx={{ fontSize: 13 }} />}
                            onClick={() => { setUnmonitoredOnly(!unmonitoredOnly); onLowOnlyChange(false); }}
                            sx={{
                                ...filterChipSx(unmonitoredOnly, statusTokens.danger.main),
                                '& .MuiChip-icon': { color: unmonitoredOnly ? statusTokens.danger.main : neutral[400] },
                            }}
                        />
                    </Tooltip>
                )}
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" sx={{ color: neutral[500], fontWeight: 600 }}>
                    {filtered.length} of {rows.length} line(s) · {visibleUnits.toLocaleString()} unit(s)
                </Typography>
            </Stack>

            <TableContainer sx={{ maxHeight: 460, overflowX: 'auto' }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...dataHeadCellSx, minWidth: 200 }}>Commodity</TableCell>
                            <TableCell sx={{ ...dataHeadCellSx, minWidth: 160 }}>Store</TableCell>
                            <TableCell sx={{ ...dataHeadCellSx, minWidth: 140 }}>Branch</TableCell>
                            <TableCell align="right" sx={{ ...dataHeadCellSx, minWidth: 110 }}>On hand</TableCell>
                            <TableCell align="right" sx={{ ...dataHeadCellSx, minWidth: 110 }}>Reorder at</TableCell>
                            <TableCell align="center" sx={{ ...dataHeadCellSx, minWidth: 90 }}>Status</TableCell>
                            <TableCell align="right" sx={{ ...dataHeadCellSx, width: 70 }}>History</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            [0, 1, 2, 3].map((i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7} sx={dataBodyCellSx}><Skeleton height={22} /></TableCell>
                                </TableRow>
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map((r, i) => (
                                // Zebra + brand rail on hover, as every other data table in the app.
                                // A low line is called out by its chip and health bar rather than a
                                // tinted row, which fought the stripe and made the table read busy.
                                <TableRow key={r.balanceId} hover={false} sx={dataRowSx(i)}>
                                    <TableCell sx={{ ...dataBodyCellSx, fontWeight: 700, color: neutral[900] }}>
                                        {r.commodityName ?? '—'}
                                    </TableCell>
                                    <TableCell sx={{ ...dataBodyCellSx, color: neutral[700] }}>{r.storeName ?? '—'}</TableCell>
                                    <TableCell sx={{ ...dataBodyCellSx, color: neutral[500] }}>{r.locationName ?? '—'}</TableCell>
                                    <TableCell align="right" sx={{ ...dataBodyCellSx, fontVariantNumeric: 'tabular-nums' }}>
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontWeight: 700, fontSize: '0.84rem',
                                                color: r.lowStock ? AMBER : neutral[900],
                                            }}
                                        >
                                            {r.quantity.toLocaleString()}
                                        </Typography>
                                        <StockHealthBar quantity={r.quantity} minLevel={r.minLevel} />
                                    </TableCell>
                                    <TableCell align="right" sx={dataBodyCellSx}>
                                        {/* Editable in place — the reorder level is the one field on this
                                            table a storekeeper actually maintains. */}
                                        <TextField
                                            size="small" type="number"
                                            value={drafts[r.balanceId] ?? String(r.minLevel ?? 0)}
                                            onChange={(e) => setDrafts((d) => ({ ...d, [r.balanceId]: e.target.value }))}
                                            onBlur={() => saveMinLevel(r)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                            disabled={saving === r.balanceId}
                                            inputProps={{ min: 0, style: { textAlign: 'right', width: 52, padding: '3px 6px' } }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    fontSize: '0.78rem', borderRadius: '6px', bgcolor: '#fff',
                                                    fontVariantNumeric: 'tabular-nums',
                                                },
                                                '& fieldset': { borderColor: border.subtle },
                                                '&:hover fieldset': { borderColor: alpha(PRIMARY, 0.5) },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={dataBodyCellSx}>
                                        {r.lowStock ? (
                                            <StatusChip label="Low" tone="pending" />
                                        ) : r.minLevel > 0 ? (
                                            <StatusChip label="OK" tone="success" />
                                        ) : (
                                            <Tooltip title="No reorder level set — this line is never flagged low" arrow>
                                                <Typography variant="caption" sx={{ color: neutral[300], fontWeight: 700 }}>—</Typography>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    <TableCell align="right" sx={dataBodyCellSx}>
                                        {/* The answer to "why is this number what it is". Until now that
                                            question had no answer anywhere in the UI — the ledger was
                                            recorded on every write and read by nothing. */}
                                        <Tooltip title="How this balance got to its current number" arrow>
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={r.storeId == null || r.commodityId == null}
                                                    onClick={() => setHistoryRow(r)}
                                                    sx={{ color: neutral[400], '&:hover': { color: PRIMARY, bgcolor: alpha(PRIMARY, 0.08) } }}
                                                >
                                                    <HistoryOutlinedIcon sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5, color: neutral[400] }}>
                                    <Inventory2OutlinedIcon sx={{ fontSize: 32, color: neutral[200], display: 'block', mx: 'auto', mb: 1 }} />
                                    <Typography variant="body2" sx={{ color: neutral[500] }}>
                                        {lowOnly || typeFilter !== 'ALL' || search
                                            ? 'No balances match the current filters.'
                                            : 'No consumable balances found.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {historyRow && historyRow.storeId != null && historyRow.commodityId != null && (
                <ModalComponent
                    open={!!historyRow}
                    handleClose={() => setHistoryRow(null)}
                    title="Stock history"
                    width="60%"
                >
                    <LedgerHistoryModal
                        storeId={historyRow.storeId}
                        commodityId={historyRow.commodityId}
                        storeName={historyRow.storeName}
                        commodityName={historyRow.commodityName}
                        currentQuantity={historyRow.quantity}
                    />
                </ModalComponent>
            )}
        </Paper>
    );
};

export default BalancesPanel;
