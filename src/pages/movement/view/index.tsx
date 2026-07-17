/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    alpha, Avatar, Box, Button, Card, Chip, Divider, Grid, Paper, Stack, Typography,
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
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { toast } from 'react-toastify';
import { IMovement } from '../interface';
import { findMovementByIdService, fetchMovementApprovalsService, uploadMovementDocumentService } from '../service';
import { generateReleaseNote } from './generateReleaseNote';
import { ROUTES } from '../../../core/routes/routes';
import Loading from '../../../components/loading';
import ModalComponent from '../../../components/modal';
import { PageHero, StatusChip, EmptyState } from '../../../components/layout';
import MovementActionModal from '../MovementActionModal';
import RoutesUtills from '../../../core/routes/utills';
import { brand, gold, neutral, border, status } from '../../../utils/tokens';
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

const P = brand[500];
const BLUE = status.info.main;
const GOLD = gold[500];
const INDIGO = '#4338CA';

// ── Shared local presentational helpers ─────────────────────────────────────
// Borrowed from the Admin Dashboard (pages/dashboard/dashboardUsers/AdminDashBoard.tsx +
// pages/dashboard/sections/*): an uppercase micro-label + divider to group related widgets,
// and a widget card with a tinted icon-chip header band.

/** Full-width divider heading grouping a row of related widgets. */
const SectionLabel = ({ icon, label, mt = 4 }: { icon: React.ReactNode; label: string; mt?: number }) => (
    <Box display="flex" alignItems="center" gap={1} mb={2} mt={mt}>
        <Box sx={{ color: P, display: 'flex' }}>{icon}</Box>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8} fontSize="0.72rem">
            {label}
        </Typography>
        <Divider sx={{ flex: 1 }} />
    </Box>
);

/** A single widget panel with a tinted icon + title header band, matching the dashboard's chart cards. */
const WidgetCard = ({
    icon, title, subtitle, headerAction, accent = P, borderColor, children,
}: {
    icon: React.ReactNode; title: string; subtitle?: string; headerAction?: React.ReactNode;
    accent?: string; borderColor?: string; children: React.ReactNode;
}) => (
    <Card elevation={0} sx={{ height: '100%', border: `1px solid ${borderColor ?? border.default}`, borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box
            px={2.5} py={1.75} display="flex" alignItems="center" gap={1.5}
            sx={{ borderBottom: `1px solid ${border.subtle}`, background: `linear-gradient(90deg, ${alpha(accent, 0.05)} 0%, transparent 65%)` }}
        >
            <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: alpha(accent, 0.1), color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
            </Box>
            <Box flex={1} minWidth={0}>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>{title}</Typography>
                {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </Box>
            {headerAction}
        </Box>
        <Box p={2.5} sx={{ flex: 1 }}>{children}</Box>
    </Card>
);

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <Box sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
        <Typography variant="caption" sx={{ color: neutral[500], fontWeight: 600, display: 'block' }}>{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: neutral[800] }}>{value ?? '—'}</Typography>
    </Box>
);

const SubHeading = ({ children }: { children: React.ReactNode }) => (
    <Typography
        variant="caption"
        sx={{ display: 'block', mb: 1.25, fontWeight: 700, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}
    >
        {children}
    </Typography>
);

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null);
const fmtDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString('en-GB') : null);

// ── Lifecycle stepper ───────────────────────────────────────────────────────

const STEP_META: Record<string, { label: string; icon: JSX.Element }> = {
    DRAFT: { label: 'Approval', icon: <HowToRegOutlinedIcon sx={{ fontSize: 18 }} /> },
    INITIATED: { label: 'Initiated', icon: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} /> },
    DISPATCHED: { label: 'Dispatched', icon: <LocalShippingOutlinedIcon sx={{ fontSize: 18 }} /> },
    IN_TRANSIT: { label: 'In Transit', icon: <FlightTakeoffOutlinedIcon sx={{ fontSize: 18 }} /> },
    RECEIVED: { label: 'Received', icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 18 }} /> },
    COMPLETED: { label: 'Completed', icon: <TaskAltOutlinedIcon sx={{ fontSize: 18 }} /> },
};

const buildLifecycleSteps = (movement: IMovement, hadApproval: boolean): string[] => {
    const steps: string[] = [];
    if (hadApproval) steps.push('DRAFT');
    steps.push('INITIATED');
    if (movement.movementCategory === 'INTER_LOCATION') steps.push('DISPATCHED', 'IN_TRANSIT', 'RECEIVED');
    steps.push('COMPLETED');
    return steps;
};

const MovementStepper = ({ steps, currentIndex }: { steps: string[]; currentIndex: number }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', pb: 0.5 }}>
        {steps.map((step, i) => {
            const state: 'done' | 'current' | 'upcoming' =
                currentIndex < 0 ? 'upcoming' : i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
            const meta = STEP_META[step];
            return (
                <Box key={step} sx={{ display: 'flex', alignItems: 'flex-start', flex: i === steps.length - 1 ? '0 0 auto' : 1 }}>
                    <Stack alignItems="center" spacing={0.75} sx={{ minWidth: 88, flexShrink: 0 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: state === 'upcoming' ? neutral[100] : alpha(P, state === 'current' ? 0.14 : 0.1),
                            color: state === 'upcoming' ? neutral[400] : P,
                            border: `2px solid ${state === 'current' ? P : 'transparent'}`,
                            boxShadow: state === 'current' ? `0 0 0 4px ${alpha(P, 0.12)}` : 'none',
                            transition: 'all 0.2s ease',
                        }}
                        >
                            {state === 'done' ? <CheckCircleOutlineIcon sx={{ fontSize: 18 }} /> : meta.icon}
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{ fontWeight: state === 'upcoming' ? 500 : 700, color: state === 'upcoming' ? neutral[400] : neutral[800], whiteSpace: 'nowrap' }}
                        >
                            {meta.label}
                        </Typography>
                    </Stack>
                    {i < steps.length - 1 && (
                        <Box sx={{ flex: 1, height: 2, mt: '17px', mx: 0.5, minWidth: 24, borderRadius: 1, bgcolor: i < currentIndex ? P : neutral[200] }} />
                    )}
                </Box>
            );
        })}
    </Box>
);

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

    const isCancelled = movement.status === 'CANCELLED';
    const hadApproval = approvals.length > 0 || movement.status === 'DRAFT';
    const lifecycleSteps = buildLifecycleSteps(movement, hadApproval);
    const currentStepIndex = lifecycleSteps.indexOf(movement.status ?? '');
    const showApproval = approvals.length > 0 || isPendingApproval(movement);
    const showLogistics = movement.movementCategory === 'INTER_LOCATION';

    return (
        // Same page padding PageShell applied, so swapping the header for PageHero keeps alignment.
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
            <PageHero
                title={`Movement #${movement.id}`}
                subtitle={`${movementTypeLabel(movement.movementType)}${movement.movementCategory ? ` · ${categoryLabels[movement.movementCategory]}` : ''}`}
                icon={<SwapHorizOutlinedIcon />}
                stat={{
                    value: movement.items?.length ?? 0,
                    label: movement.items?.length === 1 ? 'item' : 'items',
                    helper: fmtDate(movement.createDate) ?? undefined,
                }}
                actions={
                    <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.MOVEMENT)} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: '#fff' }}>Back</Button>
                        {canApproveMovement(movement, currentUserId) && (
                            <>
                                <Button variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={() => openAction('approve')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: status.success.strong }}>Approve</Button>
                                <Button variant="outlined" startIcon={<HighlightOffIcon />} onClick={() => openAction('reject')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: '#fff', borderColor: status.danger.main, color: status.danger.main }}>Reject</Button>
                            </>
                        )}
                        {canDispatch(movement) && <Button variant="contained" startIcon={<LocalShippingOutlinedIcon />} onClick={() => openAction('dispatch')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BLUE }}>Dispatch</Button>}
                        {canMarkInTransit(movement) && <Button variant="contained" startIcon={<FlightTakeoffOutlinedIcon />} onClick={() => openAction('in-transit')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: INDIGO }}>In Transit</Button>}
                        {canReceive(movement) && <Button variant="contained" startIcon={<AssignmentTurnedInOutlinedIcon />} onClick={() => openAction('receive')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: status.success.strong }}>Receive</Button>}
                        {canComplete(movement) && <Button variant="contained" startIcon={<TaskAltOutlinedIcon />} onClick={() => openAction('complete')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: status.success.strong }}>Complete</Button>}
                        {canCancel(movement) && <Button variant="outlined" startIcon={<CancelOutlinedIcon />} onClick={() => openAction('cancel')} sx={{ height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: '#fff', borderColor: status.danger.main, color: status.danger.main }}>Cancel</Button>}
                    </Stack>
                }
            />
            {/* ── Overview: status chips + lifecycle progress (mirrors the dashboard's gradient greeting banner) ── */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 2,
                    border: `1px solid ${alpha('#000', 0.06)}`,
                    background: `linear-gradient(135deg, ${alpha(P, 0.04)} 0%, ${alpha(P, 0.01)} 100%)`,
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: isCancelled ? 0 : 2.5 }}>
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
                {isCancelled ? (
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(status.danger.main, 0.06), border: `1px solid ${alpha(status.danger.main, 0.2)}` }}>
                        <BlockOutlinedIcon sx={{ color: status.danger.main, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: status.danger.strong, fontWeight: 600 }}>
                            This movement was cancelled and will not progress further.
                        </Typography>
                    </Stack>
                ) : (
                    <MovementStepper steps={lifecycleSteps} currentIndex={currentStepIndex} />
                )}
            </Paper>

            {/* ── Route & Items ── */}
            <SectionLabel icon={<StorefrontOutlinedIcon fontSize="small" />} label="Route & Items" mt={4} />
            <Grid container spacing={2.5} alignItems="stretch">
                <Grid item xs={12} md={5}>
                    <WidgetCard icon={<StorefrontOutlinedIcon fontSize="small" />} title="Route" subtitle="Source → destination">
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                            <Box sx={{ flex: 1, p: 1.75, borderRadius: 2, bgcolor: alpha(P, 0.04), border: `1px solid ${alpha(P, 0.15)}`, width: '100%' }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                    <StorefrontOutlinedIcon sx={{ fontSize: 16, color: P }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: P }}>SOURCE</Typography>
                                </Stack>
                                <Typography variant="body2" fontWeight={700}>{movement.sourceStore?.name ?? '—'}</Typography>
                                <Typography variant="caption" color="text.secondary">{movement.sourceStore?.location?.name ?? ''}</Typography>
                            </Box>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: neutral[100], transform: { xs: 'rotate(90deg)', sm: 'none' },
                            }}
                            >
                                <ArrowForwardIcon sx={{ fontSize: 16, color: neutral[400] }} />
                            </Box>
                            <Box sx={{ flex: 1, p: 1.75, borderRadius: 2, bgcolor: alpha(GOLD, 0.05), border: `1px solid ${alpha(GOLD, 0.2)}`, width: '100%' }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                    {recipient ? <PersonOutlineIcon sx={{ fontSize: 16, color: GOLD }} /> : <StorefrontOutlinedIcon sx={{ fontSize: 16, color: GOLD }} />}
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: GOLD }}>DESTINATION</Typography>
                                </Stack>
                                <Typography variant="body2" fontWeight={700}>{movement.destStore?.name ?? recipient ?? '—'}</Typography>
                                <Typography variant="caption" color="text.secondary">{movement.destStore?.location?.name ?? movement.recipientUser?.branch?.name ?? ''}</Typography>
                            </Box>
                        </Stack>
                    </WidgetCard>
                </Grid>
                <Grid item xs={12} md={7}>
                    <WidgetCard
                        icon={<Inventory2OutlinedIcon fontSize="small" />}
                        title="Items"
                        subtitle="Assets & consumables on this movement"
                        accent={GOLD}
                        headerAction={<Chip label={movement.items?.length ?? 0} size="small" sx={{ bgcolor: alpha(GOLD, 0.08), color: GOLD, fontWeight: 700, height: 24, fontSize: '0.72rem' }} />}
                    >
                        {movement.items && movement.items.length > 0 ? (
                            <Stack spacing={1}>
                                {movement.items.map((it, i) => (
                                    <Stack key={it.id ?? i} direction="row" spacing={1.25} alignItems="center" sx={{ p: 1.25, borderRadius: 1.5, border: `1px solid ${border.subtle}`, transition: 'background-color 0.15s ease', '&:hover': { bgcolor: neutral[50] } }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(it.asset ? P : GOLD, 0.1), color: it.asset ? P : GOLD }}>
                                            {it.asset ? <FingerprintIcon sx={{ fontSize: 16 }} /> : <Inventory2OutlinedIcon sx={{ fontSize: 16 }} />}
                                        </Avatar>
                                        <Box flex={1} minWidth={0}>
                                            <Typography variant="caption" fontWeight={700} display="block" noWrap>
                                                {it.asset ? `${it.asset.engravedNumber} — ${it.asset.assetName}` : it.commodity?.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {it.asset ? (it.serialNumber || it.assetTag || 'Serialized asset') : 'Consumable item'}
                                            </Typography>
                                        </Box>
                                        {!it.asset && <Chip label={`× ${it.quantity}`} size="small" sx={{ height: 22, fontWeight: 700, bgcolor: alpha(GOLD, 0.08), color: GOLD }} />}
                                    </Stack>
                                ))}
                            </Stack>
                        ) : (
                            <EmptyState variant="inline" title="No items listed" icon={<Inventory2OutlinedIcon />} />
                        )}
                    </WidgetCard>
                </Grid>
            </Grid>

            {/* ── Logistics & Documents ── */}
            <SectionLabel icon={<LocalShippingOutlinedIcon fontSize="small" />} label="Logistics & Documents" />
            <Grid container spacing={2.5} alignItems="stretch">
                {showLogistics && (
                    <Grid item xs={12} md={6}>
                        <WidgetCard icon={<LocalShippingOutlinedIcon fontSize="small" />} title="Logistics" subtitle="Courier & delivery window" accent={BLUE} borderColor={alpha(BLUE, 0.2)}>
                            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, alignItems: 'start' }}>
                                <Field label="Courier" value={movement.courier?.name ?? movement.courierService} />
                                <Field label="Plate Number" value={movement.plateNumber} />
                                <Field label="Tracking #" value={movement.trackingNumber} />
                                <Field label="Dispatch Date" value={fmtDate(movement.dispatchDate)} />
                                <Field label="Expected Delivery" value={fmtDate(movement.expectedDeliveryDate)} />
                                {movement.status !== 'INITIATED' && movement.status !== 'DRAFT' && (
                                    <Field label="Custody" value={movement.custodyTransferSettled ? `With ${movement.courier?.name ?? 'courier'} / delivered` : 'Not yet handed to courier'} />
                                )}
                            </Box>
                        </WidgetCard>
                    </Grid>
                )}
                <Grid item xs={12} md={showLogistics ? 6 : 12}>
                    <WidgetCard
                        icon={<DescriptionOutlinedIcon fontSize="small" />}
                        title="Documents"
                        subtitle="Signed release & delivery notes"
                        headerAction={
                            <Stack direction="row" spacing={1}>
                                <Button size="small" variant="text" startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => generateReleaseNote(movement)}
                                    sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.72rem', color: P }}>
                                    Release Note
                                </Button>
                                <Button size="small" variant="outlined" startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 16 }} />} disabled={uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.72rem' }}>
                                    {uploading ? 'Uploading…' : 'Upload'}
                                </Button>
                            </Stack>
                        }
                    >
                        <input ref={fileInputRef} type="file" hidden onChange={handleUploadDocument} />
                        {movement.deliveryDocuments && movement.deliveryDocuments.length > 0 ? (
                            <Stack spacing={0.75}>
                                {movement.deliveryDocuments.map((doc, i) => {
                                    const name = doc.split('/').pop();
                                    return (
                                        <Stack key={i} direction="row" spacing={1} alignItems="center" component="a" href={`/statics/${name}`} target="_blank" rel="noopener noreferrer"
                                            sx={{ p: 1, borderRadius: 1.5, border: `1px solid ${border.subtle}`, textDecoration: 'none', color: 'inherit', '&:hover': { bgcolor: alpha(P, 0.04) } }}>
                                            <DescriptionOutlinedIcon sx={{ fontSize: 16, color: P }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{name}</Typography>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        ) : (
                            <EmptyState
                                variant="inline"
                                title="No documents attached"
                                description="Upload the signed release / delivery note."
                                icon={<DescriptionOutlinedIcon />}
                            />
                        )}
                    </WidgetCard>
                </Grid>
            </Grid>

            {/* ── Approval & Records ── */}
            <SectionLabel icon={<HowToRegOutlinedIcon fontSize="small" />} label="Approval & Records" />
            <Grid container spacing={2.5} alignItems="stretch">
                {showApproval && (
                    <Grid item xs={12} md={6}>
                        <WidgetCard icon={<HowToRegOutlinedIcon fontSize="small" />} title="Approval" subtitle="Ladder trail for this movement" borderColor={alpha(P, 0.18)}>
                            {isPendingApproval(movement) && movement.currentApprover && (
                                <Box sx={{ mb: 1.5, p: 1.25, borderRadius: 1.5, bgcolor: alpha(status.warning.strong, 0.08), border: `1px solid ${alpha(status.warning.strong, 0.2)}` }}>
                                    <Typography variant="caption" sx={{ color: status.warning.strong, fontWeight: 700 }}>
                                        Awaiting approval by {movement.currentApprover.firstName} {movement.currentApprover.lastName}
                                    </Typography>
                                </Box>
                            )}
                            <Stack spacing={1}>
                                {approvals.map((a) => {
                                    const tone = a.action === 'APPROVED' ? status.success.strong : a.action === 'REJECTED' ? status.danger.main : status.warning.strong;
                                    return (
                                        <Stack key={a.id} direction="row" spacing={1.25} alignItems="flex-start" sx={{ p: 1, borderRadius: 1.5, border: `1px solid ${border.subtle}` }}>
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
                        </WidgetCard>
                    </Grid>
                )}
                <Grid item xs={12} md={showApproval ? 6 : 12}>
                    <WidgetCard icon={<InfoOutlinedIcon fontSize="small" />} title="Details" subtitle="Parties, receiving & record metadata" accent={INDIGO}>
                        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: showApproval ? '1fr' : '1fr 1fr 1fr' }, alignItems: 'start' }}>
                            <Box>
                                <SubHeading>Parties</SubHeading>
                                <Field label="Initiator" value={movement.initiator ? `${movement.initiator.firstName} ${movement.initiator.lastName}` : null} />
                                {recipient && <Field label="Recipient" value={recipient} />}
                                {movement.request && <Field label="Linked Request" value={`#${movement.request.id}`} />}
                                {movement.repair && <Field label="Linked Repair" value={`#${movement.repair.id}`} />}
                            </Box>

                            <Box>
                                <SubHeading>Receiving</SubHeading>
                                <Field label="Receiving Officer" value={movement.receivingOfficer ? `${movement.receivingOfficer.firstName} ${movement.receivingOfficer.lastName}` : null} />
                                <Field label="Receipt Date" value={fmtDate(movement.receiptDate)} />
                                <Field label="Receipt Status" value={movement.receiptStatus ? receiptStatusLabels[movement.receiptStatus] : null} />
                                <Field label="Remarks" value={movement.remarks} />
                            </Box>

                            <Box>
                                <SubHeading>Record</SubHeading>
                                <Stack spacing={0.9}>
                                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Created</Typography><Typography variant="caption" fontWeight={600}>{fmtDateTime(movement.createDate) ?? '—'}</Typography></Stack>
                                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Last Modified</Typography><Typography variant="caption" fontWeight={600}>{fmtDateTime(movement.lastModified) ?? '—'}</Typography></Stack>
                                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Completed</Typography><Typography variant="caption" fontWeight={600}>{fmtDateTime(movement.completionDate) ?? '—'}</Typography></Stack>
                                </Stack>
                            </Box>
                        </Box>
                    </WidgetCard>
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
