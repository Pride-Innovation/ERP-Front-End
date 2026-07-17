/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Button,
    Chip,
    Collapse,
    Grid,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import { SvgIconComponent } from '@mui/icons-material';

import { PageHero, StatTile } from '../../components/layout';
import { ROUTES } from '../../core/routes/routes';
import { fetchRowsService } from '../../core/apis/globalService';
import { fetchBalancesService, fetchLowStockService } from './service';
import BalancesPanel, { IBalanceView } from './BalancesPanel';

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

// ── Component ─────────────────────────────────────────────────────────────────

const Store = () => {
    const navigate = useNavigate();

    // Cross-branch snapshot for the Admin: stocked item lines + low-stock count per branch store.
    const [branchRows, setBranchRows] = useState<IBranchRow[]>([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

    // Consumable balances — lifted from BalancesPanel so the KPI strip can read the
    // counts and the low-stock tile can toggle the panel's filter.
    const [balanceRows, setBalanceRows] = useState<IBalanceView[]>([]);
    const [balancesLoading, setBalancesLoading] = useState(true);
    const [lowOnly, setLowOnly] = useState(false);
    const balancesRef = useRef<HTMLDivElement | null>(null);

    const loadBalances = async () => {
        setBalancesLoading(true);
        try {
            const res = (await fetchBalancesService()) as any;
            if (res?.status === 200) setBalanceRows(res.data ?? []);
        } finally {
            setBalancesLoading(false);
        }
    };

    useEffect(() => { fetchBranchesOverview(); loadBalances(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    const branchesStocked = branchRows.filter((b) => b.itemLines > 0).length;
    const lowStockCount = balanceRows.filter((r) => r.lowStock).length;

    const jumpToLowStock = () => {
        setLowOnly(true);
        balancesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        // Same page padding as PageShell / the other module pages so everything aligns.
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
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
                tabs={
                    // Store quick links — accent-colored pills; each store's own page carries
                    // the full identity, so the tile descriptions now live in tooltips.
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ py: 1.25 }}>
                        {STORES.map((store) => (
                            <Tooltip key={store.type} title={store.subtitle} arrow>
                                <Button
                                    onClick={() => navigate(store.path)}
                                    startIcon={<store.Icon sx={{ fontSize: '16px !important' }} />}
                                    endIcon={<ArrowForwardIosOutlinedIcon sx={{ fontSize: '10px !important' }} />}
                                    sx={{
                                        height: 34,
                                        px: 1.75,
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: '0.78rem',
                                        color: store.accentColor,
                                        bgcolor: alpha(store.accentColor, 0.07),
                                        border: `1px solid ${alpha(store.accentColor, 0.2)}`,
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                            bgcolor: alpha(store.accentColor, 0.14),
                                            borderColor: alpha(store.accentColor, 0.45),
                                        },
                                    }}
                                >
                                    {store.title}
                                </Button>
                            </Tooltip>
                        ))}
                    </Stack>
                }
            />

            {/* ── KPI strip ── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <StatTile
                        label="Branches Stocked"
                        value={branchesLoading ? '…' : branchesStocked}
                        helper={`of ${branchRows.length} branches`}
                        icon={<AccountBalanceOutlinedIcon />}
                        accent="brand"
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatTile
                        label="Total Item Lines"
                        value={branchesLoading ? '…' : totalItemLines.toLocaleString()}
                        helper="across all branch stores"
                        icon={<FormatListNumberedOutlinedIcon />}
                        accent="gold"
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatTile
                        label="Low-Stock Alerts"
                        value={balancesLoading ? '…' : lowStockCount}
                        helper="click to review"
                        icon={<WarningAmberOutlinedIcon />}
                        accent="warning"
                        onClick={jumpToLowStock}
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatTile
                        label="Consumable Balances"
                        value={balancesLoading ? '…' : balanceRows.length}
                        helper="tracked balance lines"
                        icon={<Inventory2OutlinedIcon />}
                        accent="info"
                    />
                </Grid>
            </Grid>

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

                                {/* Branches within the region — lean clickable rows that drill into
                                    the branch's Admin store (pre-filtered via ?branchId=). */}
                                <Collapse in={open} timeout="auto" unmountOnExit>
                                    {rows.map((b, bi) => (
                                        <Box
                                            key={b.id}
                                            onClick={() => navigate(`${ROUTES.STORE_ADMIN}?branchId=${b.id}`)}
                                            role="link"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`${ROUTES.STORE_ADMIN}?branchId=${b.id}`); } }}
                                            aria-label={`Open ${b.name} store`}
                                            sx={{
                                                pl: 7, pr: 2.5, py: 1.1,
                                                display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap',
                                                cursor: 'pointer',
                                                borderTop: bi === 0 ? '1px solid #EEF2F7' : 'none',
                                                borderBottom: '1px solid #F4F7FA',
                                                transition: 'background-color 0.13s ease',
                                                '&:hover': { bgcolor: alpha('#08796C', 0.035) },
                                                '&:hover .branch-row-arrow': { color: '#08796C', transform: 'translateX(2px)' },
                                                '&:focus-visible': { outline: '2px solid #08796C', outlineOffset: -2 },
                                            }}
                                        >
                                            <StorefrontOutlinedIcon sx={{ fontSize: 15, color: '#94A3B8', flexShrink: 0 }} />
                                            <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: '#1E293B' }}>{b.name}</Typography>
                                            <Box sx={{ flex: 1 }} />
                                            <Chip
                                                label={`${b.itemLines} line${b.itemLines !== 1 ? 's' : ''}`}
                                                size="small"
                                                sx={{
                                                    height: 22, fontWeight: 700, fontSize: '0.68rem', fontVariantNumeric: 'tabular-nums',
                                                    bgcolor: alpha(b.itemLines === 0 ? '#DC2626' : '#08796C', 0.1),
                                                    color: b.itemLines === 0 ? '#DC2626' : '#08796C',
                                                }}
                                            />
                                            {b.low > 0 && (
                                                <Chip
                                                    icon={<WarningAmberOutlinedIcon sx={{ fontSize: 12 }} />}
                                                    label={`${b.low} low`}
                                                    size="small"
                                                    sx={{ height: 22, fontWeight: 700, fontSize: '0.68rem', bgcolor: alpha('#B45309', 0.12), color: '#B45309', '& .MuiChip-icon': { color: '#B45309' } }}
                                                />
                                            )}
                                            <Button
                                                size="small" variant="text"
                                                startIcon={<SwapHorizOutlinedIcon sx={{ fontSize: 15 }} />}
                                                onClick={(e) => { e.stopPropagation(); navigate(ROUTES.CREATE_MOVEMENT); }}
                                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', color: '#08796C' }}
                                            >
                                                Replenish
                                            </Button>
                                            <ArrowForwardIosOutlinedIcon
                                                className="branch-row-arrow"
                                                sx={{ fontSize: 11, color: '#CBD5E1', flexShrink: 0, transition: 'all 0.15s ease' }}
                                            />
                                        </Box>
                                    ))}
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
            <Box ref={balancesRef} sx={{ scrollMarginTop: 80 }}>
                <BalancesPanel
                    rows={balanceRows}
                    setRows={setBalanceRows}
                    loading={balancesLoading}
                    lowOnly={lowOnly}
                    onLowOnlyChange={setLowOnly}
                />
            </Box>
        </Box>
    );
};

export default Store;
