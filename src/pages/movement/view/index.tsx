/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    alpha, Avatar, Box, Button, Chip, Grid, Paper, Stack, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { toast } from 'react-toastify';
import { IMovement } from '../interface';
import { findMovementByIdService } from '../service';
import { ROUTES } from '../../../core/routes/routes';
import Loading from '../../../components/loading';
import ModalComponent from '../../../components/modal';
import MovementActionModal from '../MovementActionModal';
import {
    getStatusConfig, movementTypeLabel, categoryLabels, receiptStatusLabels,
    canDispatch, canMarkInTransit, canReceive, canComplete, canCancel,
} from '../constants';

const PRIMARY = '#08796C';
const BLUE = '#2563EB';
const SECONDARY_ICON = '#BC892C';

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block' }}>{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{value ?? '—'}</Typography>
    </Box>
);

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null);
const fmtDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString('en-GB') : null);

const MovementDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [movement, setMovement] = useState<IMovement | null>(null);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState('');
    const [open, setOpen] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const response = (await findMovementByIdService(id as string)) as any;
            if (response?.status === 200) setMovement(response.data);
            else toast.error('Could not load movement details');
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    if (loading) return <Loading items="movement" />;

    if (!movement) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
                <Typography variant="h6" color="text.secondary">Movement not found.</Typography>
                <Button onClick={() => navigate(ROUTES.MOVEMENT)} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>Back to Movements</Button>
            </Box>
        );
    }

    const statusCfg = getStatusConfig(movement.status);
    const recipient = movement.recipientUser ? `${movement.recipientUser.firstName} ${movement.recipientUser.lastName}` : null;
    const openAction = (a: string) => { setAction(a); setOpen(true); };

    return (
        <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%' }}>
            {/* Top bar */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(PRIMARY, 0.14)}`, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${PRIMARY} 0%, #BC892C 100%)` }} />
                <Box sx={{ px: { xs: 2.5, md: 4 }, py: 2.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY }}>
                            <SwapHorizOutlinedIcon />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Movement #{movement.id}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center" mt={0.5} flexWrap="wrap">
                                <Chip label={statusCfg.label} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: statusCfg.bg, color: statusCfg.color }} />
                                <Chip label={movementTypeLabel(movement.movementType)} size="small" sx={{ height: 20, fontSize: '0.66rem', bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, fontWeight: 600 }} />
                                {movement.movementCategory && (
                                    <Chip label={categoryLabels[movement.movementCategory]} size="small" sx={{ height: 20, fontSize: '0.66rem', bgcolor: alpha(BLUE, 0.08), color: BLUE, fontWeight: 600 }} />
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.MOVEMENT)} sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.78rem' }}>Back</Button>
                        {canDispatch(movement) && <Button variant="contained" startIcon={<LocalShippingOutlinedIcon />} onClick={() => openAction('dispatch')} sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.78rem', bgcolor: BLUE }}>Dispatch</Button>}
                        {canMarkInTransit(movement) && <Button variant="contained" startIcon={<FlightTakeoffOutlinedIcon />} onClick={() => openAction('in-transit')} sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.78rem', bgcolor: '#4338CA' }}>In Transit</Button>}
                        {canReceive(movement) && <Button variant="contained" startIcon={<AssignmentTurnedInOutlinedIcon />} onClick={() => openAction('receive')} sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.78rem', bgcolor: '#047857' }}>Receive</Button>}
                        {canComplete(movement) && <Button variant="contained" startIcon={<TaskAltOutlinedIcon />} onClick={() => openAction('complete')} sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.78rem', bgcolor: '#15803D' }}>Complete</Button>}
                        {canCancel(movement) && <Button variant="outlined" startIcon={<CancelOutlinedIcon />} onClick={() => openAction('cancel')} sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.78rem', borderColor: '#DC2626', color: '#DC2626' }}>Cancel</Button>}
                    </Stack>
                </Box>
            </Paper>

            <Grid container spacing={3} alignItems="flex-start">
                {/* Left: route + items */}
                <Grid item xs={12} md={7}>
                    <Stack spacing={2.5}>
                        {/* Route */}
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: PRIMARY }}>Route</Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                                <Paper elevation={0} sx={{ flex: 1, p: 1.75, borderRadius: 2, border: `1px solid ${alpha('#000', 0.07)}`, width: '100%' }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                        <StorefrontOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>SOURCE</Typography>
                                    </Stack>
                                    <Typography variant="body2" fontWeight={700}>{movement.sourceStore?.name ?? '—'}</Typography>
                                    <Typography variant="caption" color="text.secondary">{movement.sourceStore?.location?.name ?? ''}</Typography>
                                </Paper>
                                <ArrowForwardIcon sx={{ color: 'text.disabled' }} />
                                <Paper elevation={0} sx={{ flex: 1, p: 1.75, borderRadius: 2, border: `1px solid ${alpha('#000', 0.07)}`, width: '100%' }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                        {recipient ? <PersonOutlineIcon sx={{ fontSize: 16, color: SECONDARY_ICON }} /> : <StorefrontOutlinedIcon sx={{ fontSize: 16, color: SECONDARY_ICON }} />}
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>DESTINATION</Typography>
                                    </Stack>
                                    <Typography variant="body2" fontWeight={700}>{movement.destStore?.name ?? recipient ?? '—'}</Typography>
                                    <Typography variant="caption" color="text.secondary">{movement.destStore?.location?.name ?? movement.recipientUser?.branch?.name ?? ''}</Typography>
                                </Paper>
                            </Stack>
                        </Paper>

                        {/* Items */}
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Items</Typography>
                                <Chip label={movement.items?.length ?? 0} size="small" sx={{ height: 20, fontWeight: 700, bgcolor: alpha('#BC892C', 0.1), color: '#BC892C' }} />
                            </Stack>
                            {movement.items && movement.items.length > 0 ? (
                                <Stack spacing={1}>
                                    {movement.items.map((it, i) => (
                                        <Stack key={it.id ?? i} direction="row" spacing={1.25} alignItems="center" sx={{ p: 1.25, borderRadius: 1.5, border: `1px solid ${alpha('#000', 0.06)}` }}>
                                            <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(it.asset ? PRIMARY : '#BC892C', 0.1), color: it.asset ? PRIMARY : '#BC892C' }}>
                                                {it.asset ? <FingerprintIcon sx={{ fontSize: 16 }} /> : <CategoryOutlinedIcon sx={{ fontSize: 16 }} />}
                                            </Avatar>
                                            <Box flex={1} minWidth={0}>
                                                <Typography variant="caption" fontWeight={700} display="block" noWrap>
                                                    {it.asset ? `${it.asset.engravedNumber} — ${it.asset.assetName}` : it.commodity?.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {it.asset ? (it.serialNumber || it.assetTag || 'Serialized asset') : `Quantity: ${it.quantity}`}
                                                </Typography>
                                            </Box>
                                            {!it.asset && <Chip label={`× ${it.quantity}`} size="small" sx={{ height: 20, fontWeight: 700 }} />}
                                        </Stack>
                                    ))}
                                </Stack>
                            ) : <Typography variant="caption" color="text.disabled">No items listed.</Typography>}
                        </Paper>

                        {/* Logistics */}
                        {movement.movementCategory === 'INTER_LOCATION' && (
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(BLUE, 0.18)}` }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: BLUE }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BLUE }}>Logistics</Typography>
                                </Stack>
                                <Grid container spacing={1.5}>
                                    <Grid item xs={6}><Field label="Courier" value={movement.courierService} /></Grid>
                                    <Grid item xs={6}><Field label="Tracking #" value={movement.trackingNumber} /></Grid>
                                    <Grid item xs={6}><Field label="Dispatch Date" value={fmtDate(movement.dispatchDate)} /></Grid>
                                    <Grid item xs={6}><Field label="Expected Delivery" value={fmtDate(movement.expectedDeliveryDate)} /></Grid>
                                </Grid>
                            </Paper>
                        )}
                    </Stack>
                </Grid>

                {/* Right: parties / receiving / meta */}
                <Grid item xs={12} md={5}>
                    <Stack spacing={2.5}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: PRIMARY }}>Parties</Typography>
                            <Field label="Initiator" value={movement.initiator ? `${movement.initiator.firstName} ${movement.initiator.lastName}` : null} />
                            {recipient && <Field label="Recipient" value={recipient} />}
                            {movement.request && <Field label="Linked Request" value={`#${movement.request.id}`} />}
                            {movement.repair && <Field label="Linked Repair" value={`#${movement.repair.id}`} />}
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: PRIMARY }}>Receiving</Typography>
                            <Field label="Receiving Officer" value={movement.receivingOfficer ? `${movement.receivingOfficer.firstName} ${movement.receivingOfficer.lastName}` : null} />
                            <Field label="Receipt Date" value={fmtDate(movement.receiptDate)} />
                            <Field label="Receipt Status" value={movement.receiptStatus ? receiptStatusLabels[movement.receiptStatus] : null} />
                            <Field label="Remarks" value={movement.remarks} />
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}>Record Metadata</Typography>
                            <Stack spacing={0.75}>
                                <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Created</Typography><Typography variant="caption" fontWeight={600}>{fmtDateTime(movement.createDate) ?? '—'}</Typography></Stack>
                                <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Last Modified</Typography><Typography variant="caption" fontWeight={600}>{fmtDateTime(movement.lastModified) ?? '—'}</Typography></Stack>
                                <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Completed</Typography><Typography variant="caption" fontWeight={600}>{fmtDateTime(movement.completionDate) ?? '—'}</Typography></Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>

            <ModalComponent open={open} handleClose={() => setOpen(false)} title="">
                <MovementActionModal
                    action={action as any}
                    movement={movement}
                    handleClose={() => setOpen(false)}
                    sendingRequest={sendingRequest}
                    setSendingRequest={setSendingRequest}
                    onDone={load}
                />
            </ModalComponent>
        </Box>
    );
};

export default MovementDetails;
