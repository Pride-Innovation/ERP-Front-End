/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    alpha, Box, Button, Card, Chip, CircularProgress, Grid, IconButton,
    Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import { RootState } from '../../store';
import { ROUTES } from '../../core/routes/routes';
import ModalComponent from '../../components/modal';
import MovementUtills from './utills';
import RepairFlowsModal from './RepairFlowsModal';
import { getStatusConfig, movementTypeLabel, MovementStatus } from './constants';
import { IMovement } from './interface';

const PRIMARY = '#08796C';

const StatCard = ({ icon, label, value, color }: { icon: JSX.Element; label: string; value: number; color: string }) => (
    <Paper elevation={0} sx={{ p: 2.25, borderRadius: 2.5, border: `1px solid ${alpha('#000', 0.06)}`, display: 'flex', alignItems: 'center', gap: 1.75 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: alpha(color, 0.1), color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</Box>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
        </Box>
    </Paper>
);

const StatusChip = ({ status }: { status?: string }) => {
    const cfg = getStatusConfig(status);
    return <Chip label={cfg.label} size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: cfg.bg, color: cfg.color }} />;
};

const destLabel = (m: IMovement) =>
    m.destStore?.name ?? (m.recipientUser ? `${m.recipientUser.firstName} ${m.recipientUser.lastName}` : '—');

const Movement = () => {
    const navigate = useNavigate();
    const { movements } = useSelector((state: RootState) => state.MovementStore);
    const { fetchAllMovements, loading, count } = MovementUtills();
    const [repairOpen, setRepairOpen] = useState(false);

    useEffect(() => { fetchAllMovements({ pageSize: 100 }); }, []);

    const countBy = (s: MovementStatus) => movements.filter((m) => m.status === s).length;
    const inTransit = countBy('DISPATCHED') + countBy('IN_TRANSIT');

    const recent = [...movements]
        .sort((a, b) => new Date(b.createDate ?? 0).getTime() - new Date(a.createDate ?? 0).getTime())
        .slice(0, 8);

    return (
        <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#F1F5FB', pb: 4 }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #08796C 0%, #065E53 60%, #044a42 100%)', px: { xs: 2, md: 4 }, pt: 3, pb: 3, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SwapHorizOutlinedIcon sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>Movement Management</Typography>
                            <Typography variant="body2" sx={{ color: alpha('#fff', 0.70), mt: 0.25 }}>Transfers, replenishment, repairs and disposals</Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.25}>
                        <Button variant="outlined" startIcon={<BuildOutlinedIcon />} onClick={() => setRepairOpen(true)}
                            sx={{ height: 40, borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#fff', borderColor: 'rgba(255,255,255,0.4)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                            Repair / Disposal
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.CREATE_MOVEMENT)}
                            sx={{ height: 40, borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#fff', color: PRIMARY, '&:hover': { bgcolor: '#F1F5F9' } }}>
                            New Movement
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Box sx={{ px: { xs: 1, md: 3 }, pt: 3, width: '100%', maxWidth: 1500 }}>
                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} md={2.4}><StatCard icon={<PendingActionsOutlinedIcon />} label="Initiated" value={countBy('INITIATED')} color="#A16207" /></Grid>
                    <Grid item xs={6} md={2.4}><StatCard icon={<LocalShippingOutlinedIcon />} label="In Transit" value={inTransit} color="#2563EB" /></Grid>
                    <Grid item xs={6} md={2.4}><StatCard icon={<CheckCircleOutlineOutlinedIcon />} label="Received" value={countBy('RECEIVED')} color="#047857" /></Grid>
                    <Grid item xs={6} md={2.4}><StatCard icon={<CheckCircleOutlineOutlinedIcon />} label="Completed" value={countBy('COMPLETED')} color="#15803D" /></Grid>
                    <Grid item xs={6} md={2.4}><StatCard icon={<CancelOutlinedIcon />} label="Cancelled" value={countBy('CANCELLED')} color="#B91C1C" /></Grid>
                </Grid>

                {/* Recent */}
                <Card sx={{ borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: 'none', overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid #F1F5F9' }}>
                        <Stack direction="row" alignItems="center" gap={1.25}>
                            <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <SwapHorizOutlinedIcon sx={{ fontSize: 17, color: PRIMARY }} />
                            </Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Recent Movements</Typography>
                        </Stack>
                        <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate(`${ROUTES.MOVEMENT}/all`)} startIcon={<ListAltOutlinedIcon />}
                            sx={{ textTransform: 'none', fontWeight: 600, color: PRIMARY }}>
                            View All
                        </Button>
                    </Box>

                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& .MuiTableCell-head': { bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 700, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.25, px: 2.5 } }}>
                                    <TableCell>Ref</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Source → Destination</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">View</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, border: 'none' }}><CircularProgress size={28} sx={{ color: PRIMARY }} /></TableCell></TableRow>
                                ) : recent.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 5, border: 'none' }}><Typography variant="body2" color="text.disabled">No movements yet.</Typography></TableCell></TableRow>
                                ) : recent.map((mov, idx) => (
                                    <TableRow key={mov.id} sx={{ '& .MuiTableCell-root': { py: 1.25, px: 2.5, fontSize: '0.78rem', borderBottom: idx === recent.length - 1 ? 'none' : '1px solid #EEF2F7' }, '&:hover': { bgcolor: '#F0FDF9' } }}>
                                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, fontFamily: 'monospace' }}>#{mov.id}</Typography></TableCell>
                                        <TableCell><Chip label={movementTypeLabel(mov.movementType)} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: alpha(PRIMARY, 0.06), color: PRIMARY }} /></TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                                <Typography variant="caption" noWrap>{mov.sourceStore?.name ?? '—'}</Typography>
                                                <ArrowForwardIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{destLabel(mov)}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell><StatusChip status={mov.status} /></TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View details">
                                                <IconButton size="small" onClick={() => navigate(`${ROUTES.READ_MOVEMENT}/${mov.id}`)} sx={{ color: PRIMARY }}>
                                                    <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>

            <ModalComponent open={repairOpen} handleClose={() => setRepairOpen(false)} title="" width="46%">
                <RepairFlowsModal handleClose={() => setRepairOpen(false)} onDone={() => fetchAllMovements({ pageSize: 100 })} />
            </ModalComponent>
        </Box>
    );
};

export default Movement;
