/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    alpha,
    Button,
    Chip,
    Divider,
    Grid,
    Paper,
    Skeleton,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LaptopChromebookOutlinedIcon from '@mui/icons-material/LaptopChromebookOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import MonitorOutlinedIcon from '@mui/icons-material/MonitorOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../core/routes/routes";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import AssetTypeUtills from "../settings/assetTypes/utills";
import RoutesUtills from "../../core/routes/utills";
import { fetchRowsService } from "../../core/apis/globalService";
import { IStoresAxiosResponse } from "./interface";
import { IAssetType } from "../settings/assetTypes/interface";
import { SvgIconComponent } from "@mui/icons-material";

// ── Helpers ───────────────────────────────────────────────────────────────────

const getCategoryStyle = (name: string): { color: string; Icon: SvgIconComponent } => {
    const lower = name.toLowerCase();
    if (lower.includes('office')) return { color: '#6366f1', Icon: BusinessCenterOutlinedIcon };
    if (lower.includes('it') || lower.includes('tech') || lower.includes('computer') || lower.includes('laptop'))
        return { color: '#0ea5e9', Icon: MonitorOutlinedIcon };
    if (lower.includes('fleet') || lower.includes('vehicle') || lower.includes('car') || lower.includes('transport'))
        return { color: '#f59e0b', Icon: DirectionsCarOutlinedIcon };
    if (lower.includes('station') || lower.includes('paper') || lower.includes('print'))
        return { color: '#10b981', Icon: ContentPasteOutlinedIcon };
    return { color: '#8b5cf6', Icon: CategoryOutlinedIcon };
};

const STORES = [
    {
        type: 'admin',
        title: 'Admin Store',
        subtitle: 'Administrative supplies & office materials',
        description: 'Manages administrative supplies, stationery, office furniture, and other operational materials issued to branches and staff.',
        gradient: 'linear-gradient(135deg, #08796C 0%, #0cb39e 100%)',
        accentColor: '#08796C',
        Icon: AdminPanelSettingsOutlinedIcon,
        path: ROUTES.STORE_ADMIN,
        badge: 'Operational',
    },
    {
        type: 'it',
        title: 'IT Store',
        subtitle: 'Technology equipment & digital assets',
        description: 'Manages computers, peripherals, networking hardware, software accessories, and all technology-related inventory across branches.',
        gradient: 'linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)',
        accentColor: '#0369a1',
        Icon: LaptopChromebookOutlinedIcon,
        path: ROUTES.STORE_IT,
        badge: 'Operational',
    },
    {
        type: 'disposal',
        title: 'Disposal Store',
        subtitle: 'Items awaiting disposal or write-off',
        description: 'Holds all assets and commodities flagged for disposal, decommissioning, or pending write-off approvals as per policy.',
        gradient: 'linear-gradient(135deg, #b45309 0%, #fb923c 100%)',
        accentColor: '#b45309',
        Icon: DeleteOutlineOutlinedIcon,
        path: ROUTES.STORE_DISPOSAL,
        badge: 'Pending Review',
    },
];

// ── Component ─────────────────────────────────────────────────────────────────

const Store = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const { getCurrentUser } = RoutesUtills();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    // categoryCounts: keyed by assetType.id → totalElements
    const [categoryCounts, setCategoryCounts] = useState<Record<string | number, number>>({});
    const [countsLoading, setCountsLoading] = useState(false);

    useEffect(() => { fetchAllAssetTypes(); }, []);

    useEffect(() => {
        if (assetTypes.length > 0) {
            fetchCounts(assetTypes);
        }
    }, [assetTypes]);

    const fetchCounts = async (types: IAssetType[]) => {
        const branchId = getCurrentUser()?.title?.branch?.id;
        setCountsLoading(true);
        try {
            const results = await Promise.all(
                types.map(async (type) => {
                    const response = await fetchRowsService({
                        pageNumber: 0,
                        pageSize: 1,
                        endPoint: 'store',
                        params: { branchId, assetTypeId: type.id },
                    }) as IStoresAxiosResponse;
                    return {
                        id: type.id,
                        count: response?.status === 200 ? response.data.totalElements : 0,
                    };
                })
            );
            const counts: Record<string | number, number> = {};
            results.forEach(r => { if (r.id !== undefined) counts[r.id] = r.count; });
            setCategoryCounts(counts);
        } catch (e) {
            console.log(e);
        }
        setCountsLoading(false);
    };

    const totalItems = Object.values(categoryCounts).reduce((sum, n) => sum + n, 0);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>

            {/* ── Page Header ── */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: `1px solid ${alpha('#000', 0.07)}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                }}
            >
                <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 2.5,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                    flexShrink: 0,
                                }}
                            >
                                <InventoryOutlinedIcon sx={{ fontSize: 26, color: '#fff' }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.68rem', display: 'block' }}>
                                    Module
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                                    Store Management
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.755rem' }}>
                                    Overview of all organizational stores and inventory
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Live totals row */}
                        <Stack direction="row" spacing={1.5} flexShrink={0} flexWrap="wrap" justifyContent={{ sm: 'flex-end' }}>
                            {assetTypes.map(type => {
                                const { color, Icon } = getCategoryStyle(type.name);
                                return (
                                    <Box
                                        key={type.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.75,
                                            px: 1.25,
                                            py: 0.6,
                                            borderRadius: 1.5,
                                            bgcolor: alpha(color, 0.07),
                                            border: `1px solid ${alpha(color, 0.15)}`,
                                        }}
                                    >
                                        <Icon sx={{ fontSize: 13, color }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700, color, fontSize: '0.75rem' }}>
                                            {countsLoading
                                                ? <Skeleton width={22} sx={{ display: 'inline-block' }} />
                                                : (categoryCounts[type.id] ?? 0)
                                            }
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                            {type.name}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Stack>
                </Box>

                {/* Summary bar */}
                <Box
                    sx={{
                        px: 3.5,
                        py: 1.5,
                        borderTop: `1px solid ${alpha('#000', 0.06)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2.5,
                        flexWrap: 'wrap',
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                        <StorefrontOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            <strong>3</strong> active stores
                        </Typography>
                    </Stack>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#000', 0.08) }} />
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                        <InventoryOutlinedIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            <strong>
                                {countsLoading
                                    ? <Skeleton width={28} sx={{ display: 'inline-block' }} />
                                    : totalItems
                                }
                            </strong>{' '}total items across all categories
                        </Typography>
                    </Stack>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#000', 0.08) }} />
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
                        Select a store below to view records &amp; reports
                    </Typography>
                </Box>
            </Paper>

            {/* ── Store Cards ── */}
            <Grid container spacing={2.5}>
                {STORES.map(store => {
                    const { Icon } = store;
                    return (
                        <Grid item xs={12} md={4} key={store.type}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    border: `1px solid ${alpha('#000', 0.07)}`,
                                    overflow: 'hidden',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'box-shadow 0.25s ease, transform 0.22s ease',
                                    '&:hover': {
                                        boxShadow: `0 10px 30px ${alpha(store.accentColor, 0.22)}`,
                                        transform: 'translateY(-3px)',
                                    },
                                }}
                            >
                                {/* Gradient header */}
                                <Box
                                    sx={{
                                        background: store.gradient,
                                        p: 3,
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box sx={{ position: 'absolute', right: -30, top: -30, width: 110, height: 110, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
                                    <Box sx={{ position: 'absolute', right: 30, bottom: -25, width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

                                    <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ position: 'relative' }}>
                                        <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Icon sx={{ fontSize: 22, color: '#fff' }} />
                                        </Box>
                                        <Box flex={1}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                                                    {store.title}
                                                </Typography>
                                                <Chip
                                                    label={store.badge}
                                                    size="small"
                                                    sx={{
                                                        height: 18,
                                                        fontSize: '0.62rem',
                                                        fontWeight: 700,
                                                        bgcolor: 'rgba(255,255,255,0.18)',
                                                        color: '#fff',
                                                        border: '1px solid rgba(255,255,255,0.3)',
                                                        '& .MuiChip-label': { px: 0.75 },
                                                    }}
                                                />
                                            </Stack>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.73rem', lineHeight: 1.4 }}>
                                                {store.subtitle}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>

                                {/* Card body */}
                                <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.65 }}>
                                        {store.description}
                                    </Typography>

                                    {/* ── Inventory counts ── */}
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem', fontWeight: 600, display: 'block', mb: 1 }}
                                        >
                                            Inventory Overview
                                        </Typography>

                                        {assetTypes.length > 0 ? (
                                            <Grid container spacing={1}>
                                                {assetTypes.map(type => {
                                                    const { color, Icon: CatIcon } = getCategoryStyle(type.name);
                                                    const count = categoryCounts[type.id];
                                                    return (
                                                        <Grid item xs={6} key={type.id}>
                                                            <Box
                                                                sx={{
                                                                    p: 1.25,
                                                                    borderRadius: 2,
                                                                    bgcolor: alpha(color, 0.05),
                                                                    border: `1px solid ${alpha(color, 0.14)}`,
                                                                }}
                                                            >
                                                                <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                                                                    <CatIcon sx={{ fontSize: 12, color }} />
                                                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {type.name}
                                                                    </Typography>
                                                                </Stack>
                                                                {countsLoading ? (
                                                                    <Skeleton variant="text" width="60%" height={28} />
                                                                ) : (
                                                                    <Stack direction="row" alignItems="baseline" spacing={0.4}>
                                                                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.3rem', lineHeight: 1 }}>
                                                                            {count ?? 0}
                                                                        </Typography>
                                                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                                                                            items
                                                                        </Typography>
                                                                    </Stack>
                                                                )}
                                                            </Box>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        ) : (
                                            /* Skeleton placeholders while asset types load */
                                            <Grid container spacing={1}>
                                                {[0, 1, 2, 3].map(i => (
                                                    <Grid item xs={6} key={i}>
                                                        <Skeleton variant="rounded" height={60} sx={{ borderRadius: 2 }} />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        )}
                                    </Box>

                                    {/* CTA */}
                                    <Box sx={{ mt: 'auto', pt: 0.5 }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            endIcon={<ArrowForwardIosOutlinedIcon sx={{ fontSize: 11 }} />}
                                            onClick={() => navigate(store.path)}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '0.82rem',
                                                py: 0.9,
                                                borderColor: alpha(store.accentColor, 0.4),
                                                color: store.accentColor,
                                                '&:hover': {
                                                    borderColor: store.accentColor,
                                                    bgcolor: alpha(store.accentColor, 0.05),
                                                },
                                            }}
                                        >
                                            View {store.title}
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            {/* ── Quick guide bar ── */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha('#000', 0.06)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    p: 2.5,
                }}
            >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                    <Box flex={1}>
                        <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.68rem', display: 'block', mb: 0.4 }}>
                            How it works
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.6 }}>
                            Select a store to view its full inventory report. Use the branch filter to switch between branches, then navigate
                            across category tabs — <strong>Office Equipment</strong>, <strong>IT Equipment</strong>, <strong>Fleet</strong>, and <strong>Stationery</strong> — to view stock levels and records.
                        </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: alpha('#000', 0.07) }} />
                    <Stack direction="row" spacing={1} flexShrink={0}>
                        {STORES.map(s => (
                            <Button
                                key={s.type}
                                size="small"
                                onClick={() => navigate(s.path)}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: s.accentColor,
                                    bgcolor: alpha(s.accentColor, 0.07),
                                    borderRadius: 1.5,
                                    px: 1.5,
                                    '&:hover': { bgcolor: alpha(s.accentColor, 0.14) },
                                }}
                            >
                                {s.title}
                            </Button>
                        ))}
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};

export default Store;
