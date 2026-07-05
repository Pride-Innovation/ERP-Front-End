/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import { Box, Paper, Skeleton, Typography, alpha } from '@mui/material';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import MonitorOutlinedIcon from '@mui/icons-material/MonitorOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
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
    if (lower.includes('office')) return { color: '#6366f1', Icon: BusinessCenterOutlinedIcon };
    if (lower.includes('it') || lower.includes('tech') || lower.includes('computer') || lower.includes('laptop'))
        return { color: '#0ea5e9', Icon: MonitorOutlinedIcon };
    if (lower.includes('fleet') || lower.includes('vehicle') || lower.includes('car') || lower.includes('transport'))
        return { color: '#f59e0b', Icon: DirectionsCarOutlinedIcon };
    if (lower.includes('station') || lower.includes('paper') || lower.includes('print'))
        return { color: '#10b981', Icon: ContentPasteOutlinedIcon };
    return { color: '#8b5cf6', Icon: CategoryOutlinedIcon };
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
    const { branchId } = useContext(StoreContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const [counts, setCounts] = useState<Record<string | number, number>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!branchId || assetTypes.length === 0) return;
        (async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    assetTypes.map(async (type: IAssetType) => {
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
                const next: Record<string | number, number> = {};
                results.forEach(r => { if (r.id !== undefined) next[r.id] = r.count; });
                setCounts(next);
            } catch (e) {
                console.log(e);
            }
            setLoading(false);
        })();
    }, [branchId, assetTypes]);

    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

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
                    {loading ? <Skeleton width={70} sx={{ display: 'inline-block' }} /> : `${total.toLocaleString()} items in this branch`}
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
                {(assetTypes.length > 0 ? assetTypes : [null, null, null, null]).map((type: IAssetType | null, i: number) => {
                    if (!type) {
                        return (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: 1.5, border: '1px solid #EEF2F7' }}>
                                <Skeleton variant="rounded" width={32} height={32} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton width={40} height={20} />
                                    <Skeleton width={80} height={14} />
                                </Box>
                            </Box>
                        );
                    }
                    const { color, Icon } = getCategoryStyle(type.name);
                    const count = type.id !== undefined ? counts[type.id] : undefined;
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
                                    {loading ? <Skeleton width={36} sx={{ display: 'inline-block' }} /> : (count ?? 0).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }} noWrap title={type.name}>
                                    {type.name}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
};

export default CategorySummary;
