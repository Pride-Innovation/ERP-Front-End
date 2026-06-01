/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Avatar,
    Box,
    Divider,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

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
import { SvgIconComponent } from '@mui/icons-material';

import { PageHero } from '../../components/layout';
import { ROUTES } from '../../core/routes/routes';
import { RootState } from '../../store';
import AssetTypeUtills from '../settings/assetTypes/utills';
import RoutesUtills from '../../core/routes/utills';
import { fetchRowsService } from '../../core/apis/globalService';
import { IStoresAxiosResponse } from './interface';
import { IAssetType } from '../settings/assetTypes/interface';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getCategoryStyle = (name: string): { color: string; Icon: SvgIconComponent } => {
    const lower = (name ?? '').toLowerCase();
    if (lower.includes('office')) return { color: '#6366f1', Icon: BusinessCenterOutlinedIcon };
    if (lower.includes('it') || lower.includes('tech') || lower.includes('computer') || lower.includes('laptop'))
        return { color: '#0ea5e9', Icon: MonitorOutlinedIcon };
    if (lower.includes('fleet') || lower.includes('vehicle') || lower.includes('car') || lower.includes('transport'))
        return { color: '#f59e0b', Icon: DirectionsCarOutlinedIcon };
    if (lower.includes('station') || lower.includes('paper') || lower.includes('print'))
        return { color: '#10b981', Icon: ContentPasteOutlinedIcon };
    return { color: '#8b5cf6', Icon: CategoryOutlinedIcon };
};

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

// ── Component ─────────────────────────────────────────────────────────────────

const Store = () => {
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

    const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const totalItems = Object.values(categoryCounts).reduce((sum, n) => sum + n, 0);

    return (
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <PageHero
                title="Store Management"
                subtitle="Overview of all organizational stores and inventory"
                icon={<StorefrontOutlinedIcon />}
                stat={{
                    value: countsLoading
                        ? (<Skeleton width={50} sx={{ display: 'inline-block' }} /> as any)
                        : totalItems.toLocaleString(),
                    label: 'total items',
                    helper: todayLabel,
                }}
            />

            <Box className="settings-card-grid--wide">
                {STORES.map(store => (
                    <StoreCard
                        key={store.type}
                        store={store}
                        assetTypes={assetTypes}
                        categoryCounts={categoryCounts}
                        countsLoading={countsLoading}
                        onView={() => navigate(store.path)}
                    />
                ))}
            </Box>
        </Box>
    );
};

// ── Store card ────────────────────────────────────────────────────────────────

interface StoreCardProps {
    store: StoreDef;
    assetTypes: IAssetType[];
    categoryCounts: Record<string | number, number>;
    countsLoading: boolean;
    onView: () => void;
}

const StoreCard = ({ store, assetTypes, categoryCounts, countsLoading, onView }: StoreCardProps) => {
    const color = store.accentColor;
    const subtotal = assetTypes.reduce(
        (sum, t) => sum + (t.id !== undefined ? (categoryCounts[t.id] ?? 0) : 0),
        0
    );

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2.5,
                border: `1px solid ${alpha(color, 0.18)}`,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: `0 6px 22px ${alpha(color, 0.18)}`,
                    transform: 'translateY(-2px)',
                    borderColor: alpha(color, 0.35),
                },
            }}
        >
            <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header — icon tile + title/subtitle */}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                        sx={{
                            width: 48,
                            height: 48,
                            bgcolor: alpha(color, 0.1),
                            color,
                            borderRadius: '12px',
                            flexShrink: 0,
                            border: `1px solid ${alpha(color, 0.2)}`,
                        }}
                    >
                        <store.Icon fontSize="small" />
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3, mb: 0.5 }}
                            noWrap
                            title={store.title}
                        >
                            {store.title}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.78rem', lineHeight: 1.45 }}
                        >
                            {store.subtitle}
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 2, borderColor: alpha(color, 0.1) }} />

                {/* Inventory breakdown — one row per asset type */}
                <Box sx={{ mb: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#94A3B8',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            fontSize: '0.65rem',
                            display: 'block',
                            mb: 1,
                        }}
                    >
                        Inventory by category
                    </Typography>

                    <Stack spacing={0.75}>
                        {assetTypes.length > 0
                            ? assetTypes.map(type => {
                                const { color: catColor, Icon: CatIcon } = getCategoryStyle(type.name);
                                const count = type.id !== undefined ? categoryCounts[type.id] : undefined;
                                return (
                                    <Stack
                                        key={type.id}
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{ minWidth: 0, py: 0.25 }}
                                    >
                                        <Box
                                            sx={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: 1,
                                                bgcolor: alpha(catColor, 0.1),
                                                color: catColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <CatIcon sx={{ fontSize: 13 }} />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,
                                                color: '#334155',
                                                fontSize: '0.8rem',
                                                fontWeight: 500,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                            title={type.name}
                                        >
                                            {type.name}
                                        </Typography>
                                        {countsLoading ? (
                                            <Skeleton width={32} height={18} />
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: '#1E293B',
                                                    fontSize: '0.85rem',
                                                    flexShrink: 0,
                                                    fontVariantNumeric: 'tabular-nums',
                                                }}
                                            >
                                                {(count ?? 0).toLocaleString()}
                                            </Typography>
                                        )}
                                    </Stack>
                                );
                            })
                            : [0, 1, 2, 3].map(i => (
                                <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ py: 0.25 }}>
                                    <Skeleton variant="rounded" width={22} height={22} />
                                    <Skeleton variant="text" sx={{ flex: 1 }} />
                                    <Skeleton variant="text" width={32} />
                                </Stack>
                            ))}
                    </Stack>
                </Box>

                <Divider sx={{ my: 2, borderColor: alpha(color, 0.1) }} />

                {/* Footer — total + view action */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: 'auto' }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#94A3B8',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                fontSize: '0.65rem',
                                display: 'block',
                                lineHeight: 1,
                                mb: 0.5,
                            }}
                        >
                            Total items
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                color: '#1E293B',
                                lineHeight: 1.1,
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            {countsLoading
                                ? <Skeleton width={50} sx={{ display: 'inline-block' }} />
                                : subtotal.toLocaleString()}
                        </Typography>
                    </Box>

                    <Tooltip title={`Open ${store.title}`} arrow>
                        <IconButton
                            onClick={onView}
                            aria-label={`Open ${store.title}`}
                            sx={{
                                color,
                                bgcolor: alpha(color, 0.08),
                                borderRadius: '10px',
                                width: 36,
                                height: 36,
                                border: `1px solid ${alpha(color, 0.18)}`,
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                    bgcolor: alpha(color, 0.16),
                                    transform: 'translateX(2px)',
                                    borderColor: alpha(color, 0.32),
                                },
                            }}
                        >
                            <ArrowForwardIosOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>
        </Paper>
    );
};

export default Store;
