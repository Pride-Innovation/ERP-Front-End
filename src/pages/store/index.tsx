/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Avatar,
    Box,
    Button,
    Chip,
    Collapse,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    alpha,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LaptopChromebookOutlinedIcon from '@mui/icons-material/LaptopChromebookOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { SvgIconComponent } from '@mui/icons-material';

import { PageHero } from '../../components/layout';
import { ROUTES } from '../../core/routes/routes';
import { fetchRowsService } from '../../core/apis/globalService';
import { fetchLowStockService } from './service';
import BalancesPanel from './BalancesPanel';

// ── Store definitions ─────────────────────────────────────────────────────────

type StoreDef = {
    type: string;
    title: string;
    subtitle: string;
    accentColor: string;
    Icon: SvgIconComponent;
    path: string;
};

const STORES: StoreDef[] = [
    {
        type: 'admin',
        title: 'Admin Store',
        subtitle: 'Administrative supplies & office materials',
        accentColor: '#08796C',
        Icon: AdminPanelSettingsOutlinedIcon,
        path: ROUTES.STORE_ADMIN,
    },
    {
        type: 'it',
        title: 'IT Store',
        subtitle: 'Technology equipment & digital assets',
        accentColor: '#0369a1',
        Icon: LaptopChromebookOutlinedIcon,
        path: ROUTES.STORE_IT,
    },
    {
        type: 'disposal',
        title: 'Disposal Store',
        subtitle: 'Items awaiting disposal or write-off',
        accentColor: '#b45309',
        Icon: DeleteOutlineOutlinedIcon,
        path: ROUTES.STORE_DISPOSAL,
    },
];

interface IBranchRow {
    id: number;
    name: string;
    region?: string;
    itemLines: number;
    low: number;
}

const headerCellSx = {
    fontWeight: 700,
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#64748B',
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

const Store = () => {
    const navigate = useNavigate();

    // Cross-branch snapshot for the Admin: stocked item lines + low-stock count per branch store.
    const [branchRows, setBranchRows] = useState<IBranchRow[]>([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

    useEffect(() => { fetchBranchesOverview(); }, []);

    const fetchBranchesOverview = async () => {
        setBranchesLoading(true);
        try {
            const [bRes, lowRes] = await Promise.all([
                fetchRowsService({ pageNumber: 0, pageSize: 100, endPoint: 'branches', params: {} }) as any,
                fetchLowStockService() as any,
            ]);
            const branches: any[] = bRes?.status === 200 ? (bRes.data?.content ?? []) : [];
            const lowByLocation: Record<number, number> = {};
            if (lowRes?.status === 200) {
                (lowRes.data ?? []).forEach((b: any) => {
                    if (b.locationId != null) lowByLocation[b.locationId] = (lowByLocation[b.locationId] ?? 0) + 1;
                });
            }
            const withCounts = await Promise.all(branches.map(async (b) => {
                const sRes = (await fetchRowsService({ pageNumber: 0, pageSize: 1, endPoint: 'store', params: { branchId: b.id } })) as any;
                return {
                    id: b.id, name: b.name, region: b.region?.name,
                    itemLines: sRes?.status === 200 ? (sRes.data.totalElements ?? 0) : 0,
                    low: lowByLocation[b.id] ?? 0,
                };
            }));
            setBranchRows(withCounts);
            // Surface problems immediately: regions carrying low-stock alerts start expanded.
            setExpandedRegions(new Set(
                withCounts.filter((b) => b.low > 0).map((b) => b.region ?? 'Unassigned')
            ));
        } catch (e) {
            console.log(e);
        }
        setBranchesLoading(false);
    };

    // Group branches by region so the overview reads as a short list of regions
    // instead of one long flat table.
    const regionGroups = useMemo(() => {
        const groups = new Map<string, IBranchRow[]>();
        branchRows.forEach((b) => {
            const key = b.region ?? 'Unassigned';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(b);
        });
        return Array.from(groups.entries())
            .map(([region, rows]) => ({
                region,
                rows: rows.sort((a, b) => a.name.localeCompare(b.name)),
                itemLines: rows.reduce((sum, r) => sum + r.itemLines, 0),
                low: rows.reduce((sum, r) => sum + r.low, 0),
            }))
            .sort((a, b) => a.region.localeCompare(b.region));
    }, [branchRows]);

    const toggleRegion = (region: string) => {
        setExpandedRegions((prev) => {
            const next = new Set(prev);
            if (next.has(region)) next.delete(region); else next.add(region);
            return next;
        });
    };

    const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const totalItemLines = branchRows.reduce((sum, b) => sum + b.itemLines, 0);

    return (
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <PageHero
                title="Store Management"
                subtitle="Overview of all organizational stores and inventory"
                icon={<StorefrontOutlinedIcon />}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<SwapHorizOutlinedIcon />}
                        onClick={() => navigate(ROUTES.CREATE_MOVEMENT)}
                        sx={{ bgcolor: '#08796C', textTransform: 'none', fontWeight: 600, borderRadius: '8px', '&:hover': { bgcolor: '#065f54' } }}
                    >
                        Initiate Movement
                    </Button>
                }
                stat={{
                    value: branchesLoading
                        ? (<Skeleton width={50} sx={{ display: 'inline-block' }} /> as any)
                        : totalItemLines.toLocaleString(),
                    label: 'stocked item lines',
                    helper: todayLabel,
                }}
            />

            {/* ── Store tiles: lightweight navigation — details live on each store's page ── */}
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                }}
            >
                {STORES.map(store => (
                    <StoreCard key={store.type} store={store} onView={() => navigate(store.path)} />
                ))}
            </Box>

            {/* ── Branches overview, grouped by region ── */}
            <Paper elevation={0} sx={{ mt: 3, borderRadius: 2.5, border: '1px solid #E8EDF3', overflow: 'hidden' }}>
                <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid #EEF2F7', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <AccountBalanceOutlinedIcon sx={{ fontSize: 18, color: '#08796C' }} />
                    <Typography sx={{ fontWeight: 700 }}>Branches Overview</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Grouped by region — expand a region to see its branch stores. Regions with low-stock alerts open automatically.
                    </Typography>
                </Box>

                {branchesLoading ? (
                    <Stack spacing={0} divider={<Box sx={{ borderBottom: '1px solid #EEF2F7' }} />}>
                        {[0, 1, 2].map((i) => (
                            <Box key={i} sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Skeleton variant="rounded" width={28} height={28} />
                                <Skeleton width={160} />
                                <Box sx={{ flex: 1 }} />
                                <Skeleton width={90} />
                                <Skeleton width={60} />
                            </Box>
                        ))}
                    </Stack>
                ) : regionGroups.length > 0 ? (
                    regionGroups.map(({ region, rows, itemLines, low }, idx) => {
                        const open = expandedRegions.has(region);
                        return (
                            <Box key={region} sx={{ borderTop: idx > 0 ? '1px solid #EEF2F7' : 'none' }}>
                                {/* Region header — the whole row toggles */}
                                <Box
                                    onClick={() => toggleRegion(region)}
                                    sx={{
                                        px: 2.5, py: 1.5,
                                        display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
                                        cursor: 'pointer', userSelect: 'none',
                                        bgcolor: open ? alpha('#08796C', 0.025) : 'transparent',
                                        transition: 'background-color 0.15s ease',
                                        '&:hover': { bgcolor: alpha('#08796C', 0.04) },
                                    }}
                                >
                                    <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: alpha('#08796C', 0.08), color: '#08796C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <PublicOutlinedIcon sx={{ fontSize: 15 }} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{region}</Typography>
                                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                        {rows.length} branch{rows.length !== 1 ? 'es' : ''}
                                    </Typography>
                                    <Box sx={{ flex: 1 }} />
                                    <Chip
                                        label={`${itemLines.toLocaleString()} item lines`}
                                        size="small"
                                        sx={{ height: 22, fontWeight: 700, fontSize: '0.68rem', fontVariantNumeric: 'tabular-nums', bgcolor: alpha('#08796C', 0.08), color: '#08796C' }}
                                    />
                                    {low > 0 && (
                                        <Chip
                                            icon={<WarningAmberOutlinedIcon sx={{ fontSize: 13 }} />}
                                            label={`${low} low stock`}
                                            size="small"
                                            sx={{ height: 22, fontWeight: 700, fontSize: '0.68rem', bgcolor: alpha('#B45309', 0.12), color: '#B45309', '& .MuiChip-icon': { color: '#B45309' } }}
                                        />
                                    )}
                                    <IconButton size="small" sx={{ ml: 0.5 }} aria-label={open ? `Collapse ${region}` : `Expand ${region}`}>
                                        <ExpandMoreIcon sx={{ fontSize: 18, color: '#64748B', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                                    </IconButton>
                                </Box>

                                {/* Branches within the region */}
                                <Collapse in={open} timeout="auto" unmountOnExit>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                                    <TableCell sx={{ ...headerCellSx, pl: 7 }}>Branch</TableCell>
                                                    <TableCell align="right" sx={headerCellSx}>Item Lines</TableCell>
                                                    <TableCell align="right" sx={headerCellSx}>Low Stock</TableCell>
                                                    <TableCell align="right" sx={{ ...headerCellSx, pr: 2.5 }}>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows.map((b) => (
                                                    <TableRow key={b.id} hover>
                                                        <TableCell sx={{ fontWeight: 600, pl: 7 }}>{b.name}</TableCell>
                                                        <TableCell align="right">
                                                            <Chip
                                                                label={b.itemLines}
                                                                size="small"
                                                                sx={{
                                                                    height: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                                                                    bgcolor: alpha(b.itemLines === 0 ? '#DC2626' : '#08796C', 0.1),
                                                                    color: b.itemLines === 0 ? '#DC2626' : '#08796C',
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {b.low > 0 ? (
                                                                <Chip label={b.low} size="small" sx={{ height: 22, fontWeight: 700, bgcolor: alpha('#B45309', 0.12), color: '#B45309' }} />
                                                            ) : (
                                                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>—</Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ pr: 2.5 }}>
                                                            <Button size="small" variant="text" startIcon={<SwapHorizOutlinedIcon sx={{ fontSize: 15 }} />}
                                                                onClick={() => navigate(ROUTES.CREATE_MOVEMENT)}
                                                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', color: '#08796C' }}>
                                                                Replenish
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Collapse>
                            </Box>
                        );
                    })
                ) : (
                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.disabled' }}>
                        <Typography variant="body2">No branches found.</Typography>
                    </Box>
                )}
            </Paper>

            {/* ── Consumable balances: set reorder thresholds + see low stock ── */}
            <BalancesPanel />
        </Box>
    );
};

// ── Store card — a clean navigation tile; the breakdown lives on the store page ──

interface StoreCardProps {
    store: StoreDef;
    onView: () => void;
}

const StoreCard = ({ store, onView }: StoreCardProps) => {
    const color = store.accentColor;

    return (
        <Paper
            elevation={0}
            onClick={onView}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(); } }}
            aria-label={`Open ${store.title}`}
            sx={{
                borderRadius: 2.5,
                border: '1px solid #E8EDF3',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
                '&:hover': {
                    borderColor: alpha(color, 0.4),
                    boxShadow: `0 10px 28px -10px ${alpha(color, 0.28)}`,
                    transform: 'translateY(-2px)',
                    '& .store-card-cta': { color },
                    '& .store-card-arrow': {
                        bgcolor: color,
                        borderColor: color,
                        color: '#fff',
                        transform: 'translateX(2px)',
                    },
                },
                '&:focus-visible': { outline: `2px solid ${color}`, outlineOffset: 2 },
            }}
        >
            {/* Accent strip keeps the store's identity without tinting the whole border */}
            <Box sx={{ height: 3, bgcolor: color, flexShrink: 0 }} />

            {/* Body — stacks vertically so extra width just becomes breathing room */}
            <Stack direction="row" spacing={1.75} alignItems="flex-start" sx={{ p: 2.5, pb: 2.25, flex: 1 }}>
                <Avatar
                    sx={{
                        width: 44,
                        height: 44,
                        bgcolor: alpha(color, 0.09),
                        color,
                        borderRadius: '12px',
                        flexShrink: 0,
                        border: `1px solid ${alpha(color, 0.18)}`,
                    }}
                >
                    <store.Icon sx={{ fontSize: 22 }} />
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3, mb: 0.25 }}
                        noWrap
                        title={store.title}
                    >
                        {store.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#64748B',
                            fontSize: '0.8rem',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {store.subtitle}
                    </Typography>
                </Box>
            </Stack>

            {/* Footer — a full-width action bar anchors the card at any width */}
            <Box
                sx={{
                    px: 2.5,
                    py: 1.25,
                    borderTop: '1px solid #EEF2F7',
                    bgcolor: '#FAFBFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                }}
            >
                <Typography
                    className="store-card-cta"
                    variant="caption"
                    sx={{
                        fontWeight: 700,
                        color: '#64748B',
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        fontSize: '0.66rem',
                        transition: 'color 0.15s ease',
                    }}
                >
                    View store
                </Typography>
                <Box
                    className="store-card-arrow"
                    sx={{
                        color,
                        bgcolor: alpha(color, 0.08),
                        border: `1px solid ${alpha(color, 0.18)}`,
                        borderRadius: '8px',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                    }}
                >
                    <ArrowForwardIosOutlinedIcon sx={{ fontSize: 12 }} />
                </Box>
            </Box>
        </Paper>
    );
};

export default Store;
