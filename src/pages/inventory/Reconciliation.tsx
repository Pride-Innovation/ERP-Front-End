/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
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
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import { useNavigate } from 'react-router';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import { fetchStockReconciliationService } from './service';
import { IStockReconciliationReport, IStockReconciliationRow } from './interface';
import { ROUTES } from '../../core/routes/routes';
import { brand, gold, neutral, border, surface, elevation, radii, status as statusTokens } from '../../utils/tokens';

/**
 * Read-only cross-check of the three records that describe a received unit: what the order line
 * says was delivered, what the GRN trail can account for, and what is on the asset register.
 *
 * <p>They can disagree because, until receiving became a single dedicated path, the correction form
 * could raise a line's delivered figure on its own — no GRN, no store credit, no assets. This page
 * finds those lines. It reports only: what to do about each one (write it off, receive it properly,
 * or correct the order) is a business decision, not something to patch silently.
 */
const Reconciliation = () => {
    const [report, setReport] = useState<IStockReconciliationReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();

    const load = async (allRows: boolean) => {
        setLoading(true);
        try {
            const response = await fetchStockReconciliationService(!allRows);
            setReport(response.data as IStockReconciliationReport);
        } catch (e) {
            console.error('Failed to load the reconciliation report', e);
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(showAll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showAll]);

    const rows = report?.rows ?? [];
    const clean = !loading && report != null && report.linesWithDiscrepancies === 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%', maxWidth: 1400, mx: 'auto', px: { xs: 1, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
            {/* Header */}
            <Box sx={{ borderRadius: `${radii.lg}px`, border: `1px solid ${border.subtle}`, bgcolor: surface.card, overflow: 'hidden', boxShadow: elevation.card }}>
                <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: 2.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: alpha(brand[500], 0.08), border: `1px solid ${alpha(brand[500], 0.18)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FactCheckOutlinedIcon sx={{ fontSize: 22, color: brand[600] }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                                Stock Reconciliation
                            </Typography>
                            <Typography variant="body2" sx={{ color: neutral[500], mt: 0.25 }}>
                                Order lines where the delivered quantity, the GRN trail and the asset register disagree
                            </Typography>
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1.25}>
                        <Button
                            variant="outlined"
                            onClick={() => setShowAll(!showAll)}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: `${radii.pill}px`, borderColor: border.default, color: neutral[600] }}
                        >
                            {showAll ? 'Show discrepancies only' : 'Show all lines'}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshRoundedIcon />}
                            onClick={() => load(showAll)}
                            disabled={loading}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: `${radii.pill}px`, borderColor: border.default, color: neutral[600] }}
                        >
                            Refresh
                        </Button>
                    </Stack>
                </Box>
            </Box>

            {/* Totals */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <StatCard icon={<Inventory2OutlinedIcon />} label="Lines examined" value={report?.linesExamined ?? 0} tone={neutral} />
                <StatCard icon={<FactCheckOutlinedIcon />} label="Lines with discrepancies" value={report?.linesWithDiscrepancies ?? 0} tone={report?.linesWithDiscrepancies ? gold : neutral} />
                <StatCard icon={<ReceiptLongOutlinedIcon />} label="Units never credited to a store" value={report?.totalQuantityMissingFromGrn ?? 0} tone={report?.totalQuantityMissingFromGrn ? gold : neutral} />
                <StatCard icon={<DevicesOutlinedIcon />} label="Missing asset records" value={report?.totalAssetsMissing ?? 0} tone={report?.totalAssetsMissing ? gold : neutral} />
            </Stack>

            {loading && (
                <Stack alignItems="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: brand[500] }} />
                </Stack>
            )}

            {clean && (
                <Alert icon={<CheckCircleOutlineIcon fontSize="small" />} severity="success">
                    Every order line agrees with its GRN trail and asset register. Nothing to reconcile.
                </Alert>
            )}

            {!loading && rows.length > 0 && (
                <>
                    <Alert severity="info">
                        This report does not change anything. <strong>Units never credited to a store</strong> were added to an
                        order line without a delivery being recorded, so the store balance was never increased by them.
                        <strong> Missing asset records</strong> are received units of an asset-tracked category that were never
                        registered, so they cannot be assigned, moved or depreciated.
                    </Alert>

                    <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table sx={{ minWidth: 1040 }} size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { bgcolor: alpha(brand[500], 0.04), borderBottom: `1px solid ${border.subtle}`, fontWeight: 700, fontSize: '0.68rem', color: brand[700], textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, whiteSpace: 'nowrap' } }}>
                                        <TableCell>Stock / LPO</TableCell>
                                        <TableCell>Commodity</TableCell>
                                        <TableCell align="center">Ordered</TableCell>
                                        <TableCell align="center">Delivered</TableCell>
                                        <TableCell align="center">On GRNs</TableCell>
                                        <TableCell align="center">Assets</TableCell>
                                        <TableCell align="center">Not in store</TableCell>
                                        <TableCell align="center">Assets missing</TableCell>
                                        <TableCell align="center">Open</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row) => (
                                        <ReconciliationRow
                                            key={`${row.stockId}-${row.commodityId}`}
                                            row={row}
                                            onOpen={() => navigate(`${ROUTES.READ_INVENTORY}/${row.stockId}`)}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </>
            )}

            {!loading && !clean && rows.length === 0 && report != null && (
                <Alert severity="warning">No lines returned. Try “Show all lines” to see the full picture.</Alert>
            )}

            {!loading && report == null && (
                <Alert severity="error">Could not load the reconciliation report. Please try again.</Alert>
            )}
        </Box>
    );
};

const ReconciliationRow = ({ row, onOpen }: { row: IStockReconciliationRow; onOpen: () => void }) => {
    const grnGap = row.quantityMissingFromGrn;
    const assetGap = row.assetsMissing;
    const overGrn = row.grnCoveredQuantity > row.deliveredQuantity;

    return (
        <TableRow
            hover
            sx={{
                '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.4, fontSize: '0.83rem' },
                bgcolor: row.discrepant ? alpha(gold[500], 0.04) : 'transparent',
            }}
        >
            <TableCell>
                <Typography sx={{ fontSize: '0.83rem', fontWeight: 700, color: neutral[900] }}>
                    {row.lpoNumber || `#${row.stockId}`}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: neutral[500] }}>
                    {row.stockName || '—'}{row.branchName ? ` · ${row.branchName}` : ''}
                </Typography>
            </TableCell>
            <TableCell>
                <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: neutral[800] }}>
                    {row.commodityName}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: neutral[500] }}>
                    {row.assetTypeName || '—'}{row.tracksAssets ? '' : ' · consumable'}
                </Typography>
            </TableCell>
            <TableCell align="center">{row.orderedQuantity}</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>{row.deliveredQuantity}</TableCell>
            <TableCell align="center">
                <Tooltip
                    arrow
                    title={overGrn
                        ? 'More has been receipted than the line says was delivered — the line was corrected downwards after the goods arrived.'
                        : 'Total quantity documented by receipts against this line.'}
                >
                    <Box component="span" sx={{ color: overGrn ? statusTokens.danger.strong : 'inherit', fontWeight: overGrn ? 700 : 400 }}>
                        {row.grnCoveredQuantity}
                    </Box>
                </Tooltip>
            </TableCell>
            <TableCell align="center">
                {row.tracksAssets ? row.assetsOnRegister : <Typography component="span" sx={{ color: neutral[400] }}>n/a</Typography>}
            </TableCell>
            <TableCell align="center">
                <GapChip value={grnGap} />
            </TableCell>
            <TableCell align="center">
                {row.tracksAssets ? <GapChip value={assetGap} /> : <Typography component="span" sx={{ color: neutral[400] }}>n/a</Typography>}
            </TableCell>
            <TableCell align="center">
                <Tooltip title="Open this stock" arrow>
                    <Button size="small" onClick={onOpen} sx={{ minWidth: 0, p: 0.5, color: brand[600] }}>
                        <OpenInNewRoundedIcon sx={{ fontSize: 17 }} />
                    </Button>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
};

const GapChip = ({ value }: { value: number }) =>
    value > 0 ? (
        <Chip
            label={value}
            size="small"
            sx={{ height: 22, fontWeight: 700, bgcolor: statusTokens.danger.soft, color: statusTokens.danger.strong }}
        />
    ) : (
        <Typography component="span" sx={{ color: neutral[400], fontSize: '0.83rem' }}>—</Typography>
    );

const StatCard = ({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: Record<number, string> }) => (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, p: 1.75, bgcolor: '#fff', border: `1px solid ${border.subtle}`, borderRadius: 2 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: alpha(tone[500], 0.1), color: tone[600], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, '& .MuiSvgIcon-root': { fontSize: 20 } }}>
            {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: neutral[900], lineHeight: 1.2 }}>{value.toLocaleString()}</Typography>
        </Box>
    </Box>
);

export default Reconciliation;
