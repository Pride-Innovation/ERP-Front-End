/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import {
    alpha, Box, Chip, InputAdornment, Paper, Skeleton, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { toast } from 'react-toastify';
import { setBalanceMinLevelService } from './service';

const PRIMARY = '#08796C';
const AMBER = '#B45309';
const RED = '#DC2626';

export interface IBalanceView {
    balanceId: number;
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
            <Box sx={{ width: 48, height: 4, borderRadius: 2, bgcolor: alpha('#000', 0.07), overflow: 'hidden', ml: 'auto', mt: 0.5 }}>
                <Box sx={{ width: `${ratio * 100}%`, height: '100%', bgcolor: color, transition: 'width 0.3s ease' }} />
            </Box>
        </Tooltip>
    );
};

const BalancesPanel = ({ rows, setRows, loading, lowOnly, onLowOnlyChange }: BalancesPanelProps) => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [drafts, setDrafts] = useState<Record<number, string>>({});
    const [saving, setSaving] = useState<number | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter((r) => {
            if (lowOnly && !r.lowStock) return false;
            if (typeFilter !== 'ALL' && r.storeType !== typeFilter) return false;
            if (q && ![r.commodityName, r.storeName, r.locationName].some((v) => (v ?? '').toLowerCase().includes(q))) return false;
            return true;
        });
    }, [rows, search, typeFilter, lowOnly]);

    const lowCount = rows.filter((r) => r.lowStock).length;

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

    const filterChipSx = (active: boolean, color = PRIMARY) => ({
        height: 26,
        fontWeight: 700,
        fontSize: '0.7rem',
        cursor: 'pointer',
        bgcolor: active ? alpha(color, 0.12) : '#fff',
        color: active ? color : '#64748B',
        border: `1px solid ${active ? alpha(color, 0.35) : '#E2E8F0'}`,
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: alpha(color, 0.5), bgcolor: alpha(color, 0.06) },
    });

    const headCell = { fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' } as const;

    return (
        <Paper elevation={0} sx={{ mt: 3, borderRadius: 2.5, border: '1px solid #E8EDF3', overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid #EEF2F7', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Inventory2OutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />
                <Typography sx={{ fontWeight: 700 }}>Consumable Balances</Typography>
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
                    sx={{ minWidth: 240 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlinedIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }}
                />
            </Box>

            {/* Filter chips: store type + low-stock-only */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ px: 2.5, py: 1.25, borderBottom: '1px solid #EEF2F7', bgcolor: '#FAFBFC' }}>
                {TYPE_FILTERS.map((t) => (
                    <Chip
                        key={t.value}
                        label={t.label}
                        size="small"
                        onClick={() => setTypeFilter(t.value)}
                        sx={filterChipSx(typeFilter === t.value)}
                    />
                ))}
                <Box sx={{ width: 1, height: 20, bgcolor: '#E2E8F0', mx: 0.5 }} />
                <Chip
                    label="Low stock only"
                    size="small"
                    icon={<WarningAmberOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => onLowOnlyChange(!lowOnly)}
                    sx={{
                        ...filterChipSx(lowOnly, AMBER),
                        '& .MuiChip-icon': { color: lowOnly ? AMBER : '#94A3B8' },
                    }}
                />
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    {filtered.length} of {rows.length} line(s)
                </Typography>
            </Stack>

            <TableContainer sx={{ maxHeight: 460 }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headCell, bgcolor: '#F8FAFC' }}>Commodity</TableCell>
                            <TableCell sx={{ ...headCell, bgcolor: '#F8FAFC' }}>Store</TableCell>
                            <TableCell sx={{ ...headCell, bgcolor: '#F8FAFC' }}>Branch</TableCell>
                            <TableCell align="right" sx={{ ...headCell, bgcolor: '#F8FAFC' }}>On hand</TableCell>
                            <TableCell align="right" sx={{ ...headCell, bgcolor: '#F8FAFC' }}>Reorder at</TableCell>
                            <TableCell align="center" sx={{ ...headCell, bgcolor: '#F8FAFC' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            [0, 1, 2, 3].map((i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}><Skeleton height={24} /></TableCell>
                                </TableRow>
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map((r) => (
                                <TableRow key={r.balanceId} hover sx={{ bgcolor: r.lowStock ? alpha(AMBER, 0.05) : 'transparent' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>{r.commodityName ?? '—'}</TableCell>
                                    <TableCell sx={{ color: '#475569' }}>{r.storeName ?? '—'}</TableCell>
                                    <TableCell sx={{ color: '#64748B' }}>{r.locationName ?? '—'}</TableCell>
                                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                        <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.84rem' }}>{r.quantity}</Typography>
                                        <StockHealthBar quantity={r.quantity} minLevel={r.minLevel} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <TextField
                                            size="small" type="number"
                                            value={drafts[r.balanceId] ?? String(r.minLevel ?? 0)}
                                            onChange={(e) => setDrafts((d) => ({ ...d, [r.balanceId]: e.target.value }))}
                                            onBlur={() => saveMinLevel(r)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                            disabled={saving === r.balanceId}
                                            inputProps={{ min: 0, style: { textAlign: 'right', width: 56, padding: '4px 6px' } }}
                                            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.82rem' } }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {r.lowStock ? (
                                            <Chip size="small" label="Low" sx={{ height: 20, fontWeight: 700, bgcolor: alpha(AMBER, 0.12), color: AMBER }} />
                                        ) : r.minLevel > 0 ? (
                                            <Chip size="small" label="OK" sx={{ height: 20, fontWeight: 700, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY }} />
                                        ) : (
                                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>—</Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                                    {lowOnly || typeFilter !== 'ALL' || search
                                        ? 'No balances match the current filters.'
                                        : 'No consumable balances found.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default BalancesPanel;
