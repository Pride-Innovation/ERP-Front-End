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
    Grid,
    Paper,
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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';

import axiosInstance from '../../core/apis/axiosInstance';
import { IAsset } from '../assets/interface';
import { ROUTES } from '../../core/routes/routes';
import { PageHero, StatTile } from '../../components/layout';
import { brand, neutral, border, radii, status as statusTokens } from '../../utils/tokens';

/**
 * What the signed-in user is holding.
 *
 * <p>Reads like a personal store without being one. Consumables are expensed when they are issued —
 * nobody records using a pen, so a personal balance would only ever grow and drift permanently
 * wrong — so this shows the serialized assets the person is accountable for.
 */
const MyItems = () => {
    const [assets, setAssets] = useState<IAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get('inventory/my-items');
                setAssets((res.data as IAsset[]) ?? []);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const underRepair = assets.filter(
        (a) => (a.assetStatus?.status ?? '').toLowerCase() === 'inmaintenance'
    ).length;

    return (
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="My Items"
                subtitle="Assets currently assigned to you"
                icon={<BadgeOutlinedIcon />}
                stat={{
                    value: loading ? '…' : assets.length.toLocaleString(),
                    label: 'items held',
                    helper: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4}>
                    <StatTile
                        label="Assets Held"
                        value={loading ? '…' : assets.length}
                        helper="you are accountable for these"
                        icon={<DevicesOutlinedIcon />}
                        accent="brand"
                    />
                </Grid>
                <Grid item xs={6} sm={4}>
                    <StatTile
                        label="Under Repair"
                        value={loading ? '…' : underRepair}
                        helper="away being fixed"
                        icon={<BuildOutlinedIcon />}
                        accent="warning"
                    />
                </Grid>
            </Grid>

            {loading && (
                <Stack alignItems="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: brand[500] }} />
                </Stack>
            )}

            {!loading && error && <Alert severity="error">Could not load your items. Please try again.</Alert>}

            {!loading && !error && assets.length === 0 && (
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff' }}>
                    <Stack alignItems="center" spacing={1} sx={{ py: 6, color: neutral[400] }}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 36 }} />
                        <Typography variant="body2">You are not currently holding any assets.</Typography>
                    </Stack>
                </Paper>
            )}

            {!loading && !error && assets.length > 0 && (
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ minWidth: 680 }}>
                            <TableHead>
                                <TableRow sx={{
                                    '& th': {
                                        bgcolor: alpha(brand[500], 0.04),
                                        borderBottom: `1px solid ${border.subtle}`,
                                        fontWeight: 700, fontSize: '0.68rem', color: brand[700],
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        py: 1.4, whiteSpace: 'nowrap',
                                    },
                                }}>
                                    <TableCell>Asset</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Engraved No.</TableCell>
                                    <TableCell>Branch</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Open</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assets.map((a, idx) => (
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
                                        <TableCell sx={{ color: neutral[600] }}>{a.branch?.name || '—'}</TableCell>
                                        <TableCell>
                                            {a.assetStatus?.name ? (
                                                <Chip
                                                    size="small"
                                                    label={a.assetStatus.name}
                                                    sx={{
                                                        height: 21, fontSize: '0.7rem', fontWeight: 600,
                                                        bgcolor: (a.assetStatus.status ?? '').toLowerCase() === 'inmaintenance'
                                                            ? statusTokens.warning.soft : alpha(brand[500], 0.08),
                                                        color: (a.assetStatus.status ?? '').toLowerCase() === 'inmaintenance'
                                                            ? statusTokens.warning.strong : brand[700],
                                                    }}
                                                />
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box
                                                component="button"
                                                onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${a.assetType?.id}/view/${a.id}`)}
                                                sx={{
                                                    border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                                                    color: brand[600], display: 'inline-flex', p: 0.5, borderRadius: `${radii.sm}px`,
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
                </Paper>
            )}
        </Box>
    );
};

export default MyItems;
