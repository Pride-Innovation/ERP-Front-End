/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useRef, useState } from 'react';
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { toast } from 'react-toastify';
import { IMovement } from '../interface';
import { findMovementByIdService, fetchMovementApprovalsService, uploadMovementDocumentService } from '../service';
import { generateReleaseNote } from './generateReleaseNote';
import { ROUTES } from '../../../core/routes/routes';
import Loading from '../../../components/loading';
import ModalComponent from '../../../components/modal';
import { PageShell, StatusChip } from '../../../components/layout';
import MovementActionModal from '../MovementActionModal';
import RoutesUtills from '../../../core/routes/utills';
import {
    movementTypeLabel, statusLabel, statusTone, categoryLabels, receiptStatusLabels,
    canDispatch, canMarkInTransit, canReceive, canComplete, canCancel,
    canApproveMovement, isPendingApproval,
} from '../constants';

interface IApprovalRecord {
    id: number;
    actor?: { firstName?: string; lastName?: string } | null;
    action: 'PENDING' | 'APPROVED' | 'REJECTED';
    tierRole?: string | null;
    comment?: string | null;
    createDate?: string | null;
}

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
    const [approvals, setApprovals] = useState<IApprovalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState('');
    const [open, setOpen] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);

    const currentUserId = RoutesUtills().getCurrentUser()?.id;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;
        setUploading(true);
        try {
            const res = (await uploadMovementDocumentService(id, file)) as any;
            if (res?.status === 200) {
                toast.success('Document uploaded');
                await load();
            } else {
                toast.error(res?.data?.message ?? 'Failed to upload document');
            }
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const load = async () => {
        setLoading(true);
        try {
            const response = (await findMovementByIdService(id as string)) as any;
            if (response?.status === 200) setMovement(response.data);
            else toast.error('Could not load movement details');
            const trail = (await fetchMovementApprovalsService(id as string)) as any;
            if (trail?.status === 200) setApprovals(trail.data ?? []);
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

    const recipient = movement.recipientUser ? `${movement.recipientUser.firstName} ${movement.recipientUser.lastName}` : null;
    const openAction = (a: string) => { setAction(a); setOpen(true); };

    return (
        <PageShell
            title={`Movement #${movement.id}`}
            subtitle={`${movementTypeLabel(movement.movementType)}${movement.movementCategory ? ` · ${categoryLabels[movement.movementCategory]}` : ''}`}
            icon={<SwapHorizOutlinedIcon />}
            breadcrumbs={[
                { label: 'Movements', href: ROUTES.MOVEMENT },
                { label: `Movement #${movement.id}` },
            ]}
            actions={
                <>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.MOVEMENT)} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}>Back</Button>
                    {canApproveMovement(movement, currentUserId) && (
                        <>
                            <Button variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={() => openAction('approve')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: '#15803D' }}>Approve</Button>
                            <Button variant="outlined" startIcon={<HighlightOffIcon />} onClick={() => openAction('reject')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', borderColor: '#B91C1C', color: '#B91C1C' }}>Reject</Button>
                        </>
                    )}
                    {canDispatch(movement) && <Button variant="contained" startIcon={<LocalShippingOutlinedIcon />} onClick={() => openAction('dispatch')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BLUE }}>Dispatch</Button>}
                    {canMarkInTransit(movement) && <Button variant="contained" startIcon={<FlightTakeoffOutlinedIcon />} onClick={() => openAction('in-transit')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: '#4338CA' }}>In Transit</Button>}
                    {canReceive(movement) && <Button variant="contained" startIcon={<AssignmentTurnedInOutlinedIcon />} onClick={() => openAction('receive')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: '#047857' }}>Receive</Button>}
                    {canComplete(movement) && <Button variant="contained" startIcon={<TaskAltOutlinedIcon />} onClick={() => openAction('complete')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: '#15803D' }}>Complete</Button>}
                    {canCancel(movement) && <Button variant="outlined" startIcon={<CancelOutlinedIcon />} onClick={() => openAction('cancel')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', borderColor: '#DC2626', color: '#DC2626' }}>Cancel</Button>}
                </>
            }
        >
            {/* Status strip */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                <StatusChip label={statusLabel(movement.status)} tone={statusTone(movement.status)} size="md" />
                {movement.receiptStatus && movement.receiptStatus !== 'PENDING' && (
                    <StatusChip
                        label={receiptStatusLabels[movement.receiptStatus]}
                        tone={movement.receiptStatus === 'RECEIVED_OK' ? 'success' : 'pending'}
                        size="md"
                        variant="outlined"
                    />
                )}
                {movement.trackingNumber && (
                    <StatusChip label={`Tracking · ${movement.trackingNumber}`} tone="info" size="md" variant="outlined" />
                )}
            </Stack>

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

                        {/* Documents (signed release / delivery notes) */}
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <DescriptionOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Documents</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                    <Button size="small" variant="text" startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />}
                                        onClick={() => generateReleaseNote(movement)}
                                        sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.72rem', color: PRIMARY }}>
                                        Release Note
                                    </Button>
                                    <Button size="small" variant="outlined" startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 16 }} />} disabled={uploading}
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.72rem' }}>
                                        {uploading ? 'Uploading…' : 'Upload'}
                                    </Button>
                                </Stack>
                                <input ref={fileInputRef} type="file" hidden onChange={handleUploadDocument} />
                            </Stack>
                            {movement.deliveryDocuments && movement.deliveryDocuments.length > 0 ? (
                                <Stack spacing={0.75}>
                                    {movement.deliveryDocuments.map((doc, i) => {
                                        const name = doc.split('/').pop();
                                        return (
                                            <Stack key={i} direction="row" spacing={1} alignItems="center" component="a" href={`/statics/${name}`} target="_blank" rel="noopener noreferrer"
                                                sx={{ p: 1, borderRadius: 1.5, border: `1px solid ${alpha('#000', 0.06)}`, textDecoration: 'none', color: 'inherit', '&:hover': { bgcolor: alpha(PRIMARY, 0.04) } }}>
                                                <DescriptionOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{name}</Typography>
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            ) : (
                                <Typography variant="caption" color="text.disabled">
                                    No documents attached. Upload the signed release / delivery note.
                                </Typography>
                            )}
                        </Paper>
                    </Stack>
                </Grid>

                {/* Right: parties / receiving / meta */}
                <Grid item xs={12} md={5}>
                    <Stack spacing={2.5}>
                        {(approvals.length > 0 || isPendingApproval(movement)) && (
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(PRIMARY, 0.16)}` }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                                    <HowToRegOutlinedIcon sx={{ fontSize: 18, color: PRIMARY }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: PRIMARY }}>Approval</Typography>
                                </Stack>
                                {isPendingApproval(movement) && movement.currentApprover && (
                                    <Box sx={{ mb: 1.5, p: 1.25, borderRadius: 1.5, bgcolor: alpha('#A16207', 0.08), border: `1px solid ${alpha('#A16207', 0.2)}` }}>
                                        <Typography variant="caption" sx={{ color: '#A16207', fontWeight: 700 }}>
                                            Awaiting approval by {movement.currentApprover.firstName} {movement.currentApprover.lastName}
                                        </Typography>
                                    </Box>
                                )}
                                <Stack spacing={1}>
                                    {approvals.map((a) => {
                                        const tone = a.action === 'APPROVED' ? '#15803D' : a.action === 'REJECTED' ? '#B91C1C' : '#A16207';
                                        return (
                                            <Stack key={a.id} direction="row" spacing={1.25} alignItems="flex-start" sx={{ p: 1, borderRadius: 1.5, border: `1px solid ${alpha('#000', 0.06)}` }}>
                                                <Chip label={a.action} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(tone, 0.1), color: tone }} />
                                                <Box flex={1} minWidth={0}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                                                        {a.tierRole ?? 'Tier'}{a.actor ? ` · ${a.actor.firstName} ${a.actor.lastName}` : ''}
                                                    </Typography>
                                                    {a.comment && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{a.comment}</Typography>}
                                                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>{fmtDateTime(a.createDate) ?? ''}</Typography>
                                                </Box>
                                            </Stack>
                                        );
                                    })}
                                </Stack>
                            </Paper>
                        )}

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
        </PageShell>
    );
};

export default MovementDetails;
