/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import { Box, Paper, Skeleton, Typography, alpha } from '@mui/material';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { SvgIconComponent } from '@mui/icons-material';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { StoreContext } from '../../context/store';
import { fetchRowsService } from '../../core/apis/globalService';
import { IStoresAxiosResponse } from './interface';
import { IAssetType } from '../settings/assetTypes/interface';

/** Icon + accent colour for a category, inferred from its name. */
export const getCategoryStyle = (name: string): { color: string; Icon: SvgIconComponent } => {
    const lower = (name ?? '').toLowerCase();

    // Office & Furniture
    if (lower.includes('office') || lower.includes('desk') || lower.includes('workstation') || lower.includes('chair') || lower.includes('furniture') || lower.includes('table'))
        return { color: '#6366f1', Icon: ChairOutlinedIcon };

    // IT & Computers
    if (lower.includes('it') || lower.includes('tech') || lower.includes('computer') || lower.includes('laptop') || lower.includes('pc') || lower.includes('server') || lower.includes('network'))
        return { color: '#0ea5e9', Icon: LaptopOutlinedIcon };

    // Vehicles & Fleet
    if (lower.includes('fleet') || lower.includes('vehicle') || lower.includes('car') || lower.includes('transport') || lower.includes('motorcycle') || lower.includes('truck'))
        return { color: '#f59e0b', Icon: DirectionsCarOutlinedIcon };

    // Storage, Server & Infrastructure
    if (lower.includes('storage') || lower.includes('infrastructure') || lower.includes('data center'))
        return { color: '#8b5cf6', Icon: StorageOutlinedIcon };

    // Consumables & Supplies
    if (lower.includes('consumable') || lower.includes('supply') || lower.includes('stationery') || lower.includes('supplies') || lower.includes('office supply'))
        return { color: '#f97316', Icon: ShoppingBagOutlinedIcon };

    // Printing & Scanning
    if (lower.includes('printer') || lower.includes('copier') || lower.includes('scanner') || lower.includes('print') || lower.includes('station') || lower.includes('paper'))
        return { color: '#10b981', Icon: PrintOutlinedIcon };

    // Camera & AV Equipment
    if (lower.includes('camera') || lower.includes('projector') || lower.includes('av') || lower.includes('audio') || lower.includes('video') || lower.includes('monitor'))
        return { color: '#06b6d4', Icon: PhotoCameraOutlinedIcon };

    // Fallback
    return { color: '#6b7280', Icon: CategoryOutlinedIcon };
};

interface CategorySummaryProps {
    accentColor: string;
}

/**
 * Compact "items per category" tiles for the branch currently selected in
 * `StoreContext`. Lives on the store detail pages (Admin/IT/Disposal) so the
 * store landing page can stay a lightweight navigation surface.
 */
const CategorySummary = ({ accentColor }: CategorySummaryProps) => {
    const { branchId, storeType } = useContext(StoreContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const [counts, setCounts] = useState<Record<string | number, number>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // storeType is stamped by StoreViewPage (the only host of this panel); waiting for it
        // avoids a first unscoped probe that would flash branch-wide counts before correcting.
        if (!branchId || !storeType || assetTypes.length === 0) return;
        (async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    assetTypes.map(async (type: IAssetType) => {
                        const response = await fetchRowsService({
                            pageNumber: 0,
                            pageSize: 1,
                            endPoint: 'store',
                            params: {
                                branchId,
                                assetTypeId: type.id,
                                // Scope the counts to this page's store container (ADMIN / IT /
                                // DISPOSAL) — without it every store page shows branch-wide totals.
                                ...(storeType ? { storeType: storeType.toUpperCase() } : {}),
                            },
                        }) as IStoresAxiosResponse;
                        return {
                            id: type.id,
                            count: response?.status === 200 ? response.data.totalElements : 0,
                        };
                    })
                );
                const next: Record<string | number, number> = {};
                results.forEach(r => { if (r.id !== undefined) next[r.id] = r.count; });
                setCounts(next);
            } catch (e) {
                console.log(e);
            }
            setLoading(false);
        })();
    }, [branchId, assetTypes, storeType]);

    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

    // Filter asset types to show only those with items in this store
    const visibleAssetTypes = assetTypes.filter(type => {
        const count = type.id !== undefined ? counts[type.id] : 0;
        return count > 0;
    });

    return (
        <Paper
            elevation={0}
            sx={{ mb: 3, borderRadius: 2, border: `1px solid ${alpha(accentColor, 0.15)}`, overflow: 'hidden', bgcolor: '#fff' }}
        >
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #EEF2F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                    variant="caption"
                    sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}
                >
                    Inventory by category
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    {loading ? <Skeleton width={70} sx={{ display: 'inline-block' }} /> : `${total.toLocaleString()} item line${total === 1 ? '' : 's'} in this store`}
                </Typography>
            </Box>

            <Box
                sx={{
                    p: 2,
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                }}
            >
                {loading && assetTypes.length > 0
                    ? [null, null, null, null].map((_, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: 1.5, border: '1px solid #EEF2F7' }}>
                            <Skeleton variant="rounded" width={32} height={32} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton width={40} height={20} />
                                <Skeleton width={80} height={14} />
                            </Box>
                        </Box>
                    ))
                    : visibleAssetTypes.length > 0
                    ? visibleAssetTypes.map((type: IAssetType) => {
                        const { color, Icon } = getCategoryStyle(type.name);
                        const count = type.id !== undefined ? counts[type.id] : 0;
                        return (
                            <Box
                                key={type.id}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, minWidth: 0,
                                    borderRadius: 1.5, border: `1px solid ${alpha(color, 0.16)}`, bgcolor: alpha(color, 0.03),
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 32, height: 32, borderRadius: 1.25, flexShrink: 0,
                                        bgcolor: alpha(color, 0.1), color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Icon sx={{ fontSize: 16 }} />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#1E293B', lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>
                                        {count.toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }} noWrap title={type.name}>
                                        {type.name}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })
                    : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', gridColumn: '1 / -1', textAlign: 'center', py: 3 }}>
                            No items in this store yet
                        </Typography>
                    )}
            </Box>
        </Paper>
    );
};

export default CategorySummary;
