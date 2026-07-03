/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    alpha, Box, Button, Card, Chip, CircularProgress, IconButton, InputAdornment,
    Paper, Stack, Tab, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { MovementContext } from '../../../context/movement/MovementContext';
import { ROUTES } from '../../../core/routes/routes';
import ModalComponent from '../../../components/modal';
import MovementUtills from '../utills';
import MovementActionModal from '../MovementActionModal';
import { IMovement } from '../interface';
import {
    getStatusConfig, movementTypeLabel,
    canDispatch, canMarkInTransit, canReceive, canComplete, canCancel, canApproveMovement,
} from '../constants';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import RoutesUtills from '../../../core/routes/utills';

const PRIMARY = '#08796C';
const SECONDARY = '#BC892C';

const STATUS_TABS: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'DRAFT', label: 'Awaiting Approval' },
    { value: 'INITIATED', label: 'Initiated' },
    { value: 'DISPATCHED', label: 'Dispatched' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'RECEIVED', label: 'Received' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const StatusChip = ({ status }: { status?: string }) => {
    const cfg = getStatusConfig(status);
    return <Chip label={cfg.label} size="small" sx={{ height: 20, fontSize: '0.67rem', fontWeight: 700, bgcolor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, '& .MuiChip-label': { px: 1.25 } }} />;
};

const destLabel = (m: IMovement) =>
    m.destStore?.name ?? (m.recipientUser ? `${m.recipientUser.firstName} ${m.recipientUser.lastName}` : '—');

const AllMovements = () => {
    const navigate = useNavigate();
    const { movements } = useSelector((state: RootState) => state.MovementStore);
    const { setCurrentMovement } = useContext(MovementContext);
    const {
        fetchAllMovements, loading, count, modalState, setModalState,
        open, handleOpen, handleClose, sendingRequest, setSendingRequest,
        currentMovement,
    } = MovementUtills();

    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const refresh = () => fetchAllMovements({ pageSize: 100 });
    useEffect(() => { refresh(); }, []);

    const filtered = movements.filter((m) => {
        const matchesSearch = !search || [
            `#${m.id}`,
            movementTypeLabel(m.movementType),
            m.sourceStore?.name,
            destLabel(m),
            m.trackingNumber,
        ].some((f) => f?.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusTab === 'all' || m.status === statusTab;
        return matchesSearch && matchesStatus;
    });

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const statusCounts = movements.reduce((acc: Record<string, number>, m) => {
        const s = m.status ?? '';
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
    }, {});

    const summaryTiles: Array<{ status: string; label: string; icon: JSX.Element }> = [
        { status: 'DRAFT', label: 'Awaiting Approval', icon: <PendingActionsOutlinedIcon sx={{ fontSize: 18 }} /> },
        { status: 'INITIATED', label: 'Initiated', icon: <SwapHorizOutlinedIcon sx={{ fontSize: 18 }} /> },
        { status: 'DISPATCHED', label: 'Dispatched', icon: <LocalShippingOutlinedIcon sx={{ fontSize: 18 }} /> },
        { status: 'RECEIVED', label: 'Received', icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 18 }} /> },
        { status: 'COMPLETED', label: 'Completed', icon: <TaskAltOutlinedIcon sx={{ fontSize: 18 }} /> },
    ];

    const currentUserId = RoutesUtills().getCurrentUser()?.id;

    const openModal = (state: string, movement: IMovement) => {
        setCurrentMovement(movement);
        setModalState(state);
        handleOpen();
    };

    const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#F1F5FB', pb: 4 }}>
            {/* Gradient Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #08796C 0%, #065E53 60%, #044a42 100%)', px: { xs: 2, md: 4 }, pt: 3, pb: 3, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <SwapHorizOutlinedIcon sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>All Movements</Typography>
                            <Typography variant="body2" sx={{ color: alpha('#fff', 0.70), mt: 0.25 }}>Store-to-store and asset transfers across locations</Typography>
                        </Box>
                    </Stack>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 2, px: 2.5, py: 1.25, textAlign: 'right', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1 }}>{(count ?? 0).toLocaleString()}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, display: 'block', mt: 0.25 }}>total movements</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', display: 'block', mt: 0.5 }}>{todayLabel}</Typography>
                    </Box>
                </Stack>
            </Box>

            <Box sx={{ px: { xs: 1, md: 3 }, pt: 3, width: '100%', maxWidth: '1500px' }}>
                {/* Status summary tiles */}
                <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                    {summaryTiles.map((t) => {
                        const cfg = getStatusConfig(t.status);
                        const cnt = statusCounts[t.status] ?? 0;
                        const active = statusTab === t.status;
                        return (
                            <Paper
                                key={t.status}
                                elevation={0}
                                onClick={() => { setStatusTab(t.status); setPage(0); }}
                                sx={{
                                    flex: '1 1 150px', minWidth: 150, p: 1.5, borderRadius: 2.5, cursor: 'pointer', bgcolor: '#fff',
                                    border: `1px solid ${active ? cfg.color : '#E8EDF3'}`,
                                    boxShadow: active ? `0 3px 12px ${alpha(cfg.color, 0.2)}` : 'none',
                                    transition: 'all .15s ease',
                                    '&:hover': { borderColor: cfg.color, transform: 'translateY(-1px)' },
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1.25}>
                                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(cfg.color, 0.1), color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{t.icon}</Box>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>{cnt}</Typography>
                                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', mt: 0.5 }} noWrap>{t.label}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>

                <Card sx={{ width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 24px rgba(0,0,0,0.05)', borderRadius: '14px', overflow: 'hidden', border: 'none' }}>
                    {/* Toolbar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 1.5, flexWrap: 'wrap', gap: 1.5, bgcolor: '#fff', borderBottom: '1px solid #F1F5F9' }}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <SwapHorizOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', lineHeight: 1.2 }}>All Movements</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>{count} total movement{count !== 1 ? 's' : ''}</Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" gap={1} alignItems="center">
                            <Tooltip title="Refresh" arrow>
                                <IconButton onClick={refresh} sx={{ width: 38, height: 38, borderRadius: 1.5, border: '1px solid #E2E8F0', color: '#64748B', '&:hover': { borderColor: PRIMARY, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.04) } }}>
                                    <RefreshIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.CREATE_MOVEMENT)}
                                sx={{ height: 38, px: 2.5, borderRadius: '8px', bgcolor: PRIMARY, color: '#fff', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.30)}`, '&:hover': { bgcolor: '#065E54' } }}>
                                New Movement
                            </Button>
                        </Stack>
                    </Box>

                    {/* Filters */}
                    <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #EEF2F7' }}>
                        <Box sx={{ px: 3, pt: 2, pb: 0 }}>
                            <TextField fullWidth size="small" placeholder="Search by id, type, store, destination, or tracking..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment>, sx: { borderRadius: 1.5 } }} />
                        </Box>
                        <Tabs value={statusTab} onChange={(_, v) => { setStatusTab(v); setPage(0); }} variant="scrollable" scrollButtons="auto"
                            sx={{ px: 1.5, '& .MuiTab-root': { fontSize: '0.75rem', fontWeight: 600, minWidth: 80, textTransform: 'none' }, '& .MuiTabs-indicator': { bgcolor: PRIMARY }, '& .MuiTab-root.Mui-selected': { color: PRIMARY } }}>
                            {STATUS_TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
                        </Tabs>
                    </Box>

                    {/* Table */}
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow sx={{ '& .MuiTableCell-head': { background: 'linear-gradient(120deg, #08796C 0%, #065E53 100%)', color: 'rgba(255,255,255,0.92)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap', borderBottom: '2px solid rgba(255,255,255,0.15)', py: 1.5, px: 2.5 } }}>
                                    <TableCell>Ref</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Source → Destination</TableCell>
                                    <TableCell align="center">Items</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, border: 'none' }}><CircularProgress size={32} sx={{ color: PRIMARY }} /></TableCell></TableRow>
                                ) : paginated.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, border: 'none' }}>
                                        <SwapHorizOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                                        <Typography variant="body2" color="text.disabled">No movements found.</Typography>
                                    </TableCell></TableRow>
                                ) : paginated.map((mov, idx) => (
                                    <TableRow key={mov.id} sx={{ bgcolor: idx % 2 === 1 ? '#FAFBFC' : '#fff', '&:hover': { bgcolor: '#F0FDF9', boxShadow: `inset 3px 0 0 ${PRIMARY}` }, '& .MuiTableCell-root': { py: 1.5, px: 2.5, fontSize: '0.78rem', color: '#0F172A', borderBottom: '1px solid #EEF2F7' } }}>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, fontFamily: 'monospace' }}>#{mov.id}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={movementTypeLabel(mov.movementType)} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: alpha(PRIMARY, 0.06), color: PRIMARY }} />
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontSize: '0.62rem', mt: 0.25 }}>
                                                {mov.movementCategory === 'INTER_LOCATION' ? 'Inter-location' : 'Intra-location'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                                <Typography variant="caption" sx={{ fontWeight: 500 }} noWrap>{mov.sourceStore?.name ?? '—'}</Typography>
                                                <ArrowForwardIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{destLabel(mov)}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={mov.items?.length ?? 0} size="small" sx={{ height: 20, fontWeight: 700, bgcolor: alpha(SECONDARY, 0.1), color: SECONDARY }} />
                                        </TableCell>
                                        <TableCell><StatusChip status={mov.status} /></TableCell>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                {mov.createDate ? new Date(mov.createDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Tooltip title="View details">
                                                    <IconButton size="small" onClick={() => navigate(`${ROUTES.READ_MOVEMENT}/${mov.id}`)} sx={{ color: PRIMARY, '&:hover': { bgcolor: alpha(PRIMARY, 0.08) } }}>
                                                        <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                {canApproveMovement(mov, currentUserId) && (
                                                    <>
                                                        <Tooltip title="Approve"><IconButton size="small" onClick={() => openModal('approve', mov)} sx={{ color: '#15803D' }}><CheckCircleOutlineIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                        <Tooltip title="Reject"><IconButton size="small" onClick={() => openModal('reject', mov)} sx={{ color: '#B91C1C' }}><HighlightOffIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                    </>
                                                )}
                                                {canDispatch(mov) && (
                                                    <Tooltip title="Dispatch"><IconButton size="small" onClick={() => openModal('dispatch', mov)} sx={{ color: '#2563EB' }}><LocalShippingOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                )}
                                                {canMarkInTransit(mov) && (
                                                    <Tooltip title="Mark in transit"><IconButton size="small" onClick={() => openModal('in-transit', mov)} sx={{ color: '#4338CA' }}><FlightTakeoffOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                )}
                                                {canReceive(mov) && (
                                                    <Tooltip title="Receive"><IconButton size="small" onClick={() => openModal('receive', mov)} sx={{ color: '#047857' }}><AssignmentTurnedInOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                )}
                                                {canComplete(mov) && (
                                                    <Tooltip title="Complete"><IconButton size="small" onClick={() => openModal('complete', mov)} sx={{ color: '#15803D' }}><TaskAltOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                )}
                                                {canCancel(mov) && (
                                                    <Tooltip title="Cancel"><IconButton size="small" onClick={() => openModal('cancel', mov)} sx={{ color: '#DC2626' }}><CancelOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {filtered.length > 0 && (
                        <Box sx={{ borderTop: '1px solid #EEF2F7', bgcolor: '#FAFBFC' }}>
                            <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)}
                                rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                                rowsPerPageOptions={[5, 10, 25, 50]} />
                        </Box>
                    )}
                </Card>

                <ModalComponent open={open} handleClose={handleClose} title="">
                    <MovementActionModal
                        action={modalState as any}
                        movement={currentMovement}
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        onDone={refresh}
                    />
                </ModalComponent>
            </Box>
        </Box>
    );
};

export default AllMovements;
