/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    alpha, Avatar, Box, Button, Chip, IconButton, InputAdornment,
    Paper, Stack, Tab, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { MovementContext } from '../../../context/movement/MovementContext';
import { ROUTES } from '../../../core/routes/routes';
import ModalComponent from '../../../components/modal';
import { crudStates } from '../../../utils/constants';
import MovementUtills from '../utills';
import ApproveMovement from '../ApproveMovement';
import RejectMovement from '../RejectMovement';
import ReleaseMovement from '../ReleaseMovement';
import ReceiveMovement from '../ReceiveMovement';
import DeleteMovement from '../DeleteMovement';
import { statusConfig, MovementStatus } from '../mockMovements';
import { IMovement } from '../interface';

const PRIMARY = '#08796C';
const SECONDARY = '#BC892C';

const STATUS_TABS: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'released', label: 'Released' },
    { value: 'received', label: 'Received' },
    { value: 'completed', label: 'Completed' },
];

// ── Status chip ───────────────────────────────────────────────────────────────
const StatusChip = ({ statusName }: { statusName?: string }) => {
    if (!statusName) return null;
    const key = statusName.toLowerCase().replace(' ', '_') as MovementStatus;
    const cfg = statusConfig[key];
    if (!cfg) return <Chip label={statusName} size="small" />;
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{ height: 20, fontSize: '0.67rem', fontWeight: 700, bgcolor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, '& .MuiChip-label': { px: 1.25 } }}
        />
    );
};

const AllMovements = () => {
    const navigate = useNavigate();
    const { movements } = useSelector((state: RootState) => state.MovementStore);
    const { currentMovement, setCurrentMovement } = useContext(MovementContext);
    const {
        fetchAllMovements,
        loading,
        count,
        modalState,
        setModalState,
        open,
        handleOpen,
        handleClose,
        sendingRequest,
        setSendingRequest,
    } = MovementUtills();

    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => { fetchAllMovements({ pageSize: 50 }); }, []);

    // ── Client-side filter ────────────────────────────────────────────────────
    const filtered = movements.filter(m => {
        const matchesSearch = !search || [
            m.referenceNo,
            m.requestingOfficer ? `${m.requestingOfficer.firstName} ${m.requestingOfficer.lastName}` : '',
            m.destination,
        ].some(field => field?.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus = statusTab === 'all' ||
            m.status?.name?.toLowerCase().replace(' ', '_') === statusTab;

        return matchesSearch && matchesStatus;
    });

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const openModal = (state: string, movement: IMovement) => {
        setCurrentMovement(movement);
        setModalState(state);
        handleOpen();
    };

    const renderModal = () => {
        const props = { movement: currentMovement, handleClose, sendingRequest, setSendingRequest };
        switch (modalState) {
            case crudStates.approve: return <ApproveMovement {...props} />;
            case crudStates.reject: return <RejectMovement {...props} />;
            case 'release': return <ReleaseMovement {...props} />;
            case 'receive': return <ReceiveMovement {...props} />;
            case crudStates.delete: return <DeleteMovement {...props} />;
            default: return null;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(PRIMARY, 0.14)}`, overflow: 'hidden' }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }} />
                <Box sx={{ px: { xs: 2.5, md: 4 }, py: 2.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 44, height: 44, borderRadius: 2, background: `linear-gradient(135deg, ${PRIMARY} 0%, #065E54 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 10px ${alpha(PRIMARY, 0.35)}` }}>
                            <SwapHorizOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>All Movements</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {count} total movement{count !== 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.25}>
                        <IconButton size="small" onClick={() => fetchAllMovements({ pageSize: 50 })} sx={{ border: `1px solid ${alpha('#000', 0.12)}`, borderRadius: 1.5 }}>
                            <RefreshIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate(`${ROUTES.MOVEMENT}/create`)}
                            sx={{ borderRadius: 2, fontWeight: 700, bgcolor: PRIMARY, boxShadow: `0 3px 10px ${alpha(PRIMARY, 0.35)}`, '&:hover': { bgcolor: '#065E54' }, fontSize: '0.78rem' }}
                        >
                            New Movement
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            {/* ── Filters bar ─────────────────────────────────────────────── */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                {/* Search */}
                <Box sx={{ px: 2.5, pt: 2, pb: 0 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by reference, officer, or destination..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                        }}
                    />
                </Box>
                {/* Status tabs */}
                <Tabs
                    value={statusTab}
                    onChange={(_, v) => { setStatusTab(v); setPage(0); }}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: 1.5,
                        '& .MuiTab-root': { fontSize: '0.75rem', fontWeight: 600, minWidth: 80, textTransform: 'none' },
                        '& .MuiTabs-indicator': { bgcolor: PRIMARY },
                    }}
                >
                    {STATUS_TABS.map(t => (
                        <Tab key={t.value} value={t.value} label={t.label} />
                    ))}
                </Tabs>
            </Paper>

            {/* ── Table ────────────────────────────────────────────────────── */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}`, overflow: 'hidden' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-head': { bgcolor: alpha('#000', 0.025), fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', py: 1.25, borderBottom: `1px solid ${alpha('#000', 0.07)}` } }}>
                                <TableCell>Reference</TableCell>
                                <TableCell>Officer</TableCell>
                                <TableCell>Destination</TableCell>
                                <TableCell align="center">Assets</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: 'text.disabled' }}>
                                        Loading movements...
                                    </TableCell>
                                </TableRow>
                            ) : paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                                        <SwapHorizOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="body2" color="text.disabled">No movements found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : paginated.map((mov, idx) => {
                                const isEditable = mov.status?.name === 'draft' || mov.status?.name === 'rejected';
                                const isPending = mov.status?.name === 'pending_approval';
                                const isApproved = mov.status?.name === 'approved';
                                const isReleased = mov.status?.name === 'released';
                                const officerName = mov.requestingOfficer
                                    ? `${mov.requestingOfficer.firstName} ${mov.requestingOfficer.lastName}`
                                    : '—';
                                const initials = mov.requestingOfficer
                                    ? `${mov.requestingOfficer.firstName[0]}${mov.requestingOfficer.lastName[0]}`
                                    : '?';

                                return (
                                    <TableRow
                                        key={mov.id}
                                        sx={{
                                            '&:hover': { bgcolor: alpha(PRIMARY, 0.025) },
                                            '& .MuiTableCell-root': {
                                                py: 1.25, fontSize: '0.78rem',
                                                borderBottom: idx === paginated.length - 1 ? 'none' : `1px solid ${alpha('#000', 0.05)}`,
                                            },
                                            bgcolor: mov.status?.name === 'rejected' ? alpha('#DC2626', 0.018) : 'transparent',
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, fontFamily: 'monospace', fontSize: '0.76rem' }}>
                                                {mov.referenceNo ?? `#${mov.id}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{ width: 26, height: 26, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.12), color: PRIMARY }}>
                                                    {initials}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2, display: 'block' }}>
                                                        {officerName}
                                                    </Typography>
                                                    {mov.requestingOfficer?.department?.name && (
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.66rem' }}>
                                                            {mov.requestingOfficer.department.name}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ fontWeight: 500 }}>{mov.destination ?? '—'}</Typography>
                                            {mov.destinationType && (
                                                <Chip label={mov.destinationType} size="small" sx={{ display: 'block', mt: 0.25, height: 15, fontSize: '0.59rem', fontWeight: 600, bgcolor: alpha(PRIMARY, 0.06), color: PRIMARY, '& .MuiChip-label': { px: 0.75 } }} />
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={mov.assetsCount ?? 0} size="small" sx={{ height: 20, fontWeight: 700, bgcolor: alpha(SECONDARY, 0.1), color: SECONDARY }} />
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip statusName={mov.status?.name} />
                                        </TableCell>
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
                                                {isEditable && (
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => navigate(`${ROUTES.UPDATE_MOVEMENT}/${mov.id}`)} sx={{ color: SECONDARY, '&:hover': { bgcolor: alpha(SECONDARY, 0.08) } }}>
                                                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {isPending && (
                                                    <>
                                                        <Tooltip title="Approve">
                                                            <IconButton size="small" onClick={() => openModal(crudStates.approve, mov)} sx={{ color: '#059669', '&:hover': { bgcolor: alpha('#059669', 0.08) } }}>
                                                                <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Reject">
                                                            <IconButton size="small" onClick={() => openModal(crudStates.reject, mov)} sx={{ color: '#DC2626', '&:hover': { bgcolor: alpha('#DC2626', 0.08) } }}>
                                                                <CancelOutlinedIcon sx={{ fontSize: 15 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                {isApproved && (
                                                    <Tooltip title="Release assets">
                                                        <IconButton size="small" onClick={() => openModal('release', mov)} sx={{ color: '#2563EB', '&:hover': { bgcolor: alpha('#2563EB', 0.08) } }}>
                                                            <LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {isReleased && (
                                                    <Tooltip title="Acknowledge receipt">
                                                        <IconButton size="small" onClick={() => openModal('receive', mov)} sx={{ color: '#059669', '&:hover': { bgcolor: alpha('#059669', 0.08) } }}>
                                                            <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {mov.securityPassAvailable && (
                                                    <Tooltip title="Download security pass">
                                                        <IconButton size="small" sx={{ color: '#2563EB', '&:hover': { bgcolor: alpha('#2563EB', 0.08) } }}>
                                                            <DownloadOutlinedIcon sx={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {isEditable && (
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" onClick={() => openModal(crudStates.delete, mov)} sx={{ color: '#DC2626', '&:hover': { bgcolor: alpha('#DC2626', 0.08) } }}>
                                                            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {filtered.length > 0 && (
                    <TablePagination
                        component="div"
                        count={filtered.length}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        sx={{ borderTop: `1px solid ${alpha('#000', 0.06)}`, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem' } }}
                    />
                )}
            </Paper>

            {/* ── Action modal ─────────────────────────────────────────────── */}
            <ModalComponent open={open} handleClose={handleClose} title="">
                {renderModal()}
            </ModalComponent>
        </Box>
    );
};

export default AllMovements;
