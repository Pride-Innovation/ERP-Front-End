/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    alpha,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import axiosInstance from '../../core/apis/axiosInstance';
import { IAsset } from '../assets/interface';
import { ROUTES } from '../../core/routes/routes';
import { brand, neutral, border, radii, status as statusTokens } from '../../utils/tokens';

interface Props {
    branchId?: number | null;
    /** 'ADMIN' | 'IT' | 'DISPOSAL' — the store container whose contents to show. */
    storeType: string;
    accentColor: string;
}

/**
 * The serialized assets a store is holding.
 *
 * <p>Assets are not {@code StoreBalance} rows — they hang off {@code Asset.currentStore} — so the
 * consumable balance table can never show them. The IT and Disposal stores hold nothing but assets,
 * which is why those pages looked empty however full the stores actually were.
 *
 * <p>Scoped by store container, not by store type: there are 50-odd ADMIN stores, so a type-wide
 * query would show every branch's assets on every branch's page.
 */
const StoreAssetsPanel = ({ branchId, storeType, accentColor }: Props) => {
    const [assets, setAssets] = useState<IAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!branchId) return;

        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const storesRes = await axiosInstance.get('inventory/stores', {
                    params: { locationId: branchId, storeType },
                });
                const store = ((storesRes.data as Array<{ id: number }>) ?? [])[0];
                if (!store) {
                    if (!cancelled) { setAssets([]); setLoading(false); }
                    return;
                }
                const assetsRes = await axiosInstance.get(`inventory/stores/${store.id}/assets`);
                if (!cancelled) setAssets((assetsRes.data as IAsset[]) ?? []);
            } catch (e) {
                if (!cancelled) setError('Could not load the assets held by this store.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [branchId, storeType]);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return assets;
        return assets.filter((a) =>
            [a.assetName, a.engravedNumber, a.serialNumber, a.model, a.assetType?.name]
                .some((v) => (v ?? '').toString().toLowerCase().includes(q))
        );
    }, [assets, query]);

    const poolCount = assets.filter((a) => a.temporaryPool === true).length;

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: `1px solid ${border.subtle}` }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
                        bgcolor: alpha(accentColor, 0.1), color: accentColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <DevicesOutlinedIcon sx={{ fontSize: 19 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', color: neutral[900] }}>
                            Assets Held
                        </Typography>
                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                            Serialized items currently booked into this store
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    {poolCount > 0 && (
                        <Chip
                            size="small"
                            label={`${poolCount} loanable`}
                            sx={{ height: 24, fontWeight: 700, bgcolor: statusTokens.warning.soft, color: statusTokens.warning.strong }}
                        />
                    )}
                    <Chip
                        size="small"
                        label={`${assets.length} asset${assets.length === 1 ? '' : 's'}`}
                        sx={{ height: 24, fontWeight: 700, bgcolor: alpha(accentColor, 0.1), color: accentColor }}
                    />
                    <TextField
                        size="small"
                        placeholder="Search…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ fontSize: 17, color: neutral[400], mr: 0.75 }} /> }}
                        sx={{ width: { xs: '100%', sm: 200 }, '& .MuiOutlinedInput-root': { borderRadius: `${radii.md}px` } }}
                    />
                </Stack>
            </Stack>

            {loading && (
                <Stack alignItems="center" sx={{ py: 5 }}>
                    <CircularProgress size={26} sx={{ color: accentColor }} />
                </Stack>
            )}

            {!loading && error && <Box sx={{ p: 2.5 }}><Alert severity="error">{error}</Alert></Box>}

            {!loading && !error && rows.length === 0 && (
                <Stack alignItems="center" spacing={1} sx={{ py: 5, color: neutral[400] }}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 34 }} />
                    <Typography variant="body2">
                        {assets.length === 0 ? 'This store is holding no assets.' : 'No assets match that search.'}
                    </Typography>
                </Stack>
            )}

            {!loading && !error && rows.length > 0 && (
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 720 }}>
                        <TableHead>
                            <TableRow sx={{
                                '& th': {
                                    bgcolor: alpha(accentColor, 0.04),
                                    borderBottom: `1px solid ${border.subtle}`,
                                    fontWeight: 700, fontSize: '0.68rem', color: accentColor,
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                    py: 1.4, whiteSpace: 'nowrap',
                                },
                            }}>
                                <TableCell>Asset</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Engraved No.</TableCell>
                                <TableCell>Serial No.</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Loanable</TableCell>
                                <TableCell align="center">Open</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((a, idx) => (
                                <TableRow
                                    key={a.id ?? idx}
                                    hover
                                    sx={{
                                        '&:nth-of-type(odd)': { bgcolor: alpha(neutral[900], 0.012) },
                                        '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.3, fontSize: '0.83rem' },
                                    }}
                                >
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: neutral[900] }}>
                                            {a.assetName || '—'}
                                        </Typography>
                                        {a.model && (
                                            <Typography sx={{ fontSize: '0.71rem', color: neutral[500] }}>{a.model}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ color: neutral[600] }}>{a.assetType?.name || '—'}</TableCell>
                                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.engravedNumber || '—'}</TableCell>
                                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.serialNumber || '—'}</TableCell>
                                    <TableCell>
                                        {a.assetStatus?.name ? (
                                            <Chip
                                                size="small"
                                                label={a.assetStatus.name}
                                                sx={{ height: 21, fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(brand[500], 0.08), color: brand[700] }}
                                            />
                                        ) : '—'}
                                    </TableCell>
                                    <TableCell align="center">
                                        {a.temporaryPool ? (
                                            <Chip size="small" label="Yes" sx={{ height: 21, fontSize: '0.7rem', fontWeight: 700, bgcolor: statusTokens.warning.soft, color: statusTokens.warning.strong }} />
                                        ) : (
                                            <Typography component="span" sx={{ color: neutral[400] }}>—</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box
                                            component="button"
                                            onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${a.assetType?.id}/view/${a.id}`)}
                                            sx={{
                                                border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                                                color: brand[600], display: 'inline-flex', p: 0.5,
                                                '&:hover': { color: brand[700] },
                                            }}
                                            aria-label={`Open ${a.assetName}`}
                                        >
                                            <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default StoreAssetsPanel;
