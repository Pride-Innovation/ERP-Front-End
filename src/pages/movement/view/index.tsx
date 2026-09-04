import useAccessScope from '../../../core/permissions/useAccessScope';
import { PERMISSIONS } from '../../../core/permissions/constants';
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    alpha, Box, Button, Card, Divider, Grid, Paper, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
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
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { toast } from 'react-toastify';
import { IMovement } from '../interface';
import { findMovementByIdService, fetchMovementApprovalsService, uploadMovementDocumentService } from '../service';
import { generateReleaseNote } from './generateReleaseNote';
import { ROUTES } from '../../../core/routes/routes';
import Loading from '../../../components/loading';
import ModalComponent from '../../../components/modal';
import { PageHero, StatusChip, EmptyState } from '../../../components/layout';
import { dataHeadCellSx, dataBodyCellSx, dataRowSx, dataSurfaceSx } from '../../../components/tables/dataTableSx';
import MovementActionModal from '../MovementActionModal';
import LoadOntoConsignmentModal from '../LoadOntoConsignmentModal';
import RoutesUtills from '../../../core/routes/utills';
import { brand, gold, neutral, border, status } from '../../../utils/tokens';
import {
    movementTypeLabel, statusLabel, statusTone, categoryLabels, receiptStatusLabels,
    canDispatch, canMarkInTransit, canReceive, canComplete, canCancel,
    canApproveMovement, isPendingApproval, canLoadOntoConsignment,
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

const fmtDate = (d?: string | null) =>
    (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null);
const fmtDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString('en-GB') : null);

// ── Presentational primitives ───────────────────────────────────────────────
// Same grammar as the consignment detail: an icon + uppercase micro-label above the value, so a
// reader scans labels down the left and values across, rather than parsing sentence fragments.

const Fact = ({ label, value, icon, mono }: {
    label: string; value?: ReactNode; icon?: ReactNode; mono?: boolean;
}) => (
    <Box>
        <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mb: 0.35 }}>
            {icon && (
                <Box sx={{ color: neutral[400], display: 'flex', '& .MuiSvgIcon-root': { fontSize: 13 } }}>{icon}</Box>
            )}
            <Typography
                variant="caption"
                sx={{ color: neutral[500], textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, fontSize: '0.62rem' }}
            >
                {label}
            </Typography>
        </Stack>
        <Typography
            variant="body2"
            sx={{
                color: value ? neutral[800] : neutral[400],
                fontWeight: 600,
                fontFamily: mono && value ? 'monospace' : undefined,
                fontSize: '0.82rem',
                wordBreak: 'break-word',
            }}
        >
            {value || '—'}
        </Typography>
    </Box>
);

/** A widget panel with a tinted icon-chip header band. */
const WidgetCard = ({
    icon, title, subtitle, headerAction, accent = P, children,
}: {
    icon: ReactNode; title: string; subtitle?: string; headerAction?: ReactNode;
    accent?: string; children: ReactNode;
}) => (
    <Card
        elevation={0}
        sx={{ height: '100%', border: `1px solid ${border.subtle}`, borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
        <Box
            px={2.5} py={1.6} display="flex" alignItems="center" gap={1.5}
            sx={{ borderBottom: `1px solid ${border.subtle}`, background: `linear-gradient(90deg, ${alpha(accent, 0.05)} 0%, transparent 65%)` }}
        >
            <Box sx={{
                width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(accent, 0.1), color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
            >
                {icon}
            </Box>
            <Box flex={1} minWidth={0}>
                <Typography variant="subtitle2" fontWeight={700} lineHeight={1.25}>{title}</Typography>
                {subtitle && (
                    <Typography variant="caption" sx={{ color: neutral[500], fontSize: '0.7rem' }}>{subtitle}</Typography>
                )}
            </Box>
            {headerAction}
        </Box>
        <Box p={2.5} sx={{ flex: 1 }}>{children}</Box>
    </Card>
);

/** One end of the route — a store, or the person the items end up with. */
const RoutePanel = ({ kind, title, sub, accent, icon }: {
    kind: string; title: string; sub?: string; accent: string; icon: ReactNode;
}) => (
    <Box sx={{
        flex: 1, minWidth: 0, p: 1.75, borderRadius: 2,
        bgcolor: alpha(accent, 0.04), border: `1px solid ${alpha(accent, 0.18)}`,
    }}
    >
        <Stack direction="row" spacing={0.75} alignItems="center" mb={0.6}>
            <Box sx={{ color: accent, display: 'flex', '& .MuiSvgIcon-root': { fontSize: 14 } }}>{icon}</Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: accent, letterSpacing: '0.06em', fontSize: '0.62rem' }}>
                {kind}
            </Typography>
        </Stack>
        <Typography variant="body2" fontWeight={700} sx={{ color: neutral[900] }} noWrap>{title}</Typography>
        {sub && <Typography variant="caption" sx={{ color: neutral[500] }} noWrap>{sub}</Typography>}
    </Box>
);

// ── Lifecycle stepper ───────────────────────────────────────────────────────

const STEP_META: Record<string, { label: string; icon: JSX.Element }> = {
    DRAFT: { label: 'Approval', icon: <HowToRegOutlinedIcon sx={{ fontSize: 17 }} /> },
    INITIATED: { label: 'Initiated', icon: <Inventory2OutlinedIcon sx={{ fontSize: 17 }} /> },
    DISPATCHED: { label: 'Dispatched', icon: <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} /> },
    IN_TRANSIT: { label: 'In Transit', icon: <FlightTakeoffOutlinedIcon sx={{ fontSize: 17 }} /> },
    RECEIVED: { label: 'Received', icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 17 }} /> },
    COMPLETED: { label: 'Completed', icon: <TaskAltOutlinedIcon sx={{ fontSize: 17 }} /> },
};

const buildLifecycleSteps = (movement: IMovement, hadApproval: boolean): string[] => {
    const steps: string[] = [];
    if (hadApproval) steps.push('DRAFT');
    steps.push('INITIATED');
    if (movement.movementCategory === 'INTER_LOCATION') steps.push('DISPATCHED', 'IN_TRANSIT', 'RECEIVED');
    steps.push('COMPLETED');
    return steps;
};

/**
 * The journey so far, with the date each step actually happened underneath it.
 *
 * <p>The dates are the point. A row of icons says which stage a movement is at; the stamps say how
 * long it has been sitting there, which is the question anyone chasing a late delivery is really
 * asking. Steps with no recorded timestamp simply show nothing rather than a placeholder.
 */
const MovementStepper = ({ steps, currentIndex, dates }: {
    steps: string[]; currentIndex: number; dates: Record<string, string | null>;
}) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', pb: 0.5 }}>
        {steps.map((step, i) => {
            const state: 'done' | 'current' | 'upcoming' =
                currentIndex < 0 ? 'upcoming' : i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
            const meta = STEP_META[step];
            const stamp = dates[step];
            return (
                <Box key={step} sx={{ display: 'flex', alignItems: 'flex-start', flex: i === steps.length - 1 ? '0 0 auto' : 1 }}>
                    <Stack alignItems="center" spacing={0.6} sx={{ minWidth: 92, flexShrink: 0 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: state === 'upcoming' ? neutral[100] : alpha(P, state === 'current' ? 0.14 : 0.1),
                            color: state === 'upcoming' ? neutral[400] : P,
                            border: `2px solid ${state === 'current' ? P : 'transparent'}`,
                            boxShadow: state === 'current' ? `0 0 0 4px ${alpha(P, 0.12)}` : 'none',
                            transition: 'all 0.2s ease',
                        }}
                        >
                            {state === 'done' ? <CheckCircleOutlineIcon sx={{ fontSize: 17 }} /> : meta.icon}
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: state === 'upcoming' ? 500 : 700,
                                color: state === 'upcoming' ? neutral[400] : neutral[800],
                                whiteSpace: 'nowrap', fontSize: '0.72rem', lineHeight: 1.2,
                            }}
                        >
                            {meta.label}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ color: neutral[400], fontSize: '0.62rem', whiteSpace: 'nowrap', minHeight: 14 }}
                        >
                            {state !== 'upcoming' ? (stamp ?? '') : ''}
                        </Typography>
                    </Stack>
                    {i < steps.length - 1 && (
                        <Box sx={{
                            flex: 1, height: 2, mt: '17px', mx: 0.5, minWidth: 20, borderRadius: 1,
                            bgcolor: i < currentIndex ? P : neutral[200],
                        }}
                        />
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

    const { canActOnAnyOf } = useAccessScope();

    /*
     * Each lifecycle button needs two things, and this page checked only the first.
     *
     * The predicates above — canDispatch, canReceive, canComplete, canCancel — are business state:
     * is this an inter-location movement, has it been dispatched yet, is it on a live consignment.
     * None of them asks whether the viewer holds DISPATCH_MOVEMENT, or whether the movement touches
     * a branch they may act on. So the page offered all four to anyone who could open it, and the
     * click came back 403.
     *
     * A movement has up to four ends and the caller is in reach if any one is theirs — the same rule
     * the movements listing and the backend guard both use. Absent ends are ordinary rather than a
     * fault: a return has no source store, an issuance no source user.
     */
    const mayAct = (permission: string): boolean =>
        !!movement && canActOnAnyOf(permission, 'MOVEMENTS', [
            movement.sourceStore?.location?.id,
            movement.destStore?.location?.id,
            movement.sourceUser?.branch?.id,
            movement.recipientUser?.branch?.id,
        ]);
    const [approvals, setApprovals] = useState<IApprovalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState('');
    const [open, setOpen] = useState(false);
    const [loadingOntoConsignment, setLoadingOntoConsignment] = useState(false);
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
            <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
                <EmptyState
                    title="Movement not found"
                    description="It may have been cancelled, or the link is out of date."
                    icon={<SwapHorizOutlinedIcon />}
                    action={
                        <Button onClick={() => navigate(ROUTES.MOVEMENT)} startIcon={<ArrowBackIcon />} variant="outlined"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Back to Movements
                        </Button>
                    }
                />
            </Box>
        );
    }

    const recipient = movement.recipientUser
        ? `${movement.recipientUser.firstName} ${movement.recipientUser.lastName}` : null;
    const openAction = (a: string) => { setAction(a); setOpen(true); };

    const isCancelled = movement.status === 'CANCELLED';
    const hadApproval = approvals.length > 0 || movement.status === 'DRAFT';
    const lifecycleSteps = buildLifecycleSteps(movement, hadApproval);
    const currentStepIndex = lifecycleSteps.indexOf(movement.status ?? '');
    const showApproval = approvals.length > 0 || isPendingApproval(movement);
    const showLogistics = movement.movementCategory === 'INTER_LOCATION';
    const courierName = movement.courier?.name ?? movement.courierService ?? null;

    /** When each stage happened, for the stamps under the stepper. */
    const stepDates: Record<string, string | null> = {
        DRAFT: fmtDate(movement.createDate),
        INITIATED: fmtDate(movement.createDate),
        DISPATCHED: fmtDate(movement.dispatchDate),
        IN_TRANSIT: null, // no timestamp is recorded for the custody hand-off itself
        RECEIVED: fmtDate(movement.receiptDate),
        COMPLETED: fmtDate(movement.completionDate),
    };

    const items = movement.items ?? [];
    const assetCount = items.filter((it) => it.asset).length;
    const unitCount = items.reduce((sum, it) => sum + (it.asset ? 1 : Number(it.quantity) || 0), 0);

    const actionBtnSx = {
        height: 36, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
    } as const;
    const outlinedBtnSx = { ...actionBtnSx, bgcolor: '#fff' } as const;

    return (
        // Same page padding as PageShell, so this aligns with /movement and /movement/all.
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title={`Movement #${movement.id}`}
                subtitle={`${movementTypeLabel(movement.movementType)}${movement.movementCategory ? ` · ${categoryLabels[movement.movementCategory]}` : ''}`}
                icon={<SwapHorizOutlinedIcon />}
                stat={{
                    value: items.length,
                    label: items.length === 1 ? 'item' : 'items',
                    helper: fmtDate(movement.createDate) ?? undefined,
                }}
                actions={
                    <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.MOVEMENT)} sx={outlinedBtnSx}>Back</Button>
                        {canApproveMovement(movement, currentUserId) && (
                            <>
                                <Button variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={() => openAction('approve')} sx={{ ...actionBtnSx, bgcolor: status.success.strong }}>Approve</Button>
                                <Button variant="outlined" startIcon={<HighlightOffIcon />} onClick={() => openAction('reject')} sx={{ ...outlinedBtnSx, borderColor: status.danger.main, color: status.danger.main }}>Reject</Button>
                            </>
                        )}
                        {/*
                          * Consolidate or drive alone — the two ways an approved inter-location
                          * movement can leave, offered together. Loading was previously reachable
                          * only from the consignments page, so the lone Dispatch button quietly made
                          * a separate van the default for every movement.
                          */}
                        {canLoadOntoConsignment(movement) && (
                            <Tooltip title="Send this with the rest of the load — one courier, one dispatch note">
                                <Button variant="outlined" startIcon={<Inventory2OutlinedIcon />} onClick={() => setLoadingOntoConsignment(true)} sx={{ ...outlinedBtnSx, borderColor: alpha(BLUE, 0.5), color: BLUE }}>Load onto Consignment</Button>
                            </Tooltip>
                        )}
                        {canDispatch(movement) && mayAct(PERMISSIONS.DISPATCH_MOVEMENT) && <Button variant="contained" startIcon={<LocalShippingOutlinedIcon />} onClick={() => openAction('dispatch')} sx={{ ...actionBtnSx, bgcolor: BLUE }}>Dispatch</Button>}
                        {canMarkInTransit(movement) && mayAct(PERMISSIONS.DISPATCH_MOVEMENT) && <Button variant="contained" startIcon={<FlightTakeoffOutlinedIcon />} onClick={() => openAction('in-transit')} sx={{ ...actionBtnSx, bgcolor: INDIGO }}>In Transit</Button>}
                        {canReceive(movement) && mayAct(PERMISSIONS.RECEIVE_MOVEMENT) && <Button variant="contained" startIcon={<AssignmentTurnedInOutlinedIcon />} onClick={() => openAction('receive')} sx={{ ...actionBtnSx, bgcolor: status.success.strong }}>Receive</Button>}
                        {canComplete(movement) && mayAct(PERMISSIONS.RECEIVE_MOVEMENT) && <Button variant="contained" startIcon={<TaskAltOutlinedIcon />} onClick={() => openAction('complete')} sx={{ ...actionBtnSx, bgcolor: status.success.strong }}>Complete</Button>}
                        {canCancel(movement) && mayAct(PERMISSIONS.CANCEL_MOVEMENT) && <Button variant="outlined" startIcon={<CancelOutlinedIcon />} onClick={() => openAction('cancel')} sx={{ ...outlinedBtnSx, borderColor: status.danger.main, color: status.danger.main }}>Cancel</Button>}
                    </Stack>
                }
            />

            {/*
             * ── Journey ──
             * Status, route and progress in one block rather than three stacked cards. These are the
             * three halves of a single question — where is it, where is it going, how far has it got —
             * and splitting them made the reader assemble the answer themselves.
             */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5 }, borderRadius: 2, mb: 3,
                    border: `1px solid ${border.subtle}`,
                    background: `linear-gradient(135deg, ${alpha(P, 0.04)} 0%, ${alpha(P, 0.01)} 60%, transparent 100%)`,
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2.25 }}>
                    <StatusChip label={statusLabel(movement.status)} tone={statusTone(movement.status)} size="md" />
                    {movement.receiptStatus && movement.receiptStatus !== 'PENDING' && (
                        <StatusChip
                            label={receiptStatusLabels[movement.receiptStatus]}
                            tone={movement.receiptStatus === 'RECEIVED_OK' ? 'success' : 'pending'}
                            size="md" variant="outlined"
                        />
                    )}
                    {movement.trackingNumber && (
                        <StatusChip label={`Tracking · ${movement.trackingNumber}`} tone="info" size="md" variant="outlined" />
                    )}
                    <Box sx={{ flex: 1 }} />
                    {/*
                     * The journey this movement rides on. Worth surfacing here because dispatch and
                     * transit belong to the consignment — someone looking for a missing Dispatch
                     * button needs to know the load moves as a whole.
                     */}
                    {movement.consignment && (
                        <Tooltip title="This movement travels with others; it is dispatched and landed as part of that consignment">
                            <Button
                                size="small" variant="outlined"
                                startIcon={<LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />}
                                endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                                onClick={() => navigate(ROUTES.CONSIGNMENTS)}
                                sx={{ ...outlinedBtnSx, height: 30, fontSize: '0.72rem' }}
                            >
                                {movement.consignment.reference ?? `Consignment #${movement.consignment.id}`}
                            </Button>
                        </Tooltip>
                    )}
                </Stack>

                {/* Route strip — the courier sits on the connector, where it physically belongs. */}
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={{ xs: 1.25, md: 2 }}
                    alignItems={{ md: 'center' }}
                    sx={{ mb: isCancelled ? 0 : 2.75 }}
                >
                    <RoutePanel
                        kind="SOURCE"
                        accent={P}
                        icon={movement.sourceUser ? <PersonOutlineIcon /> : <StorefrontOutlinedIcon />}
                        title={movement.sourceStore?.name
                            ?? (movement.sourceUser ? `${movement.sourceUser.firstName} ${movement.sourceUser.lastName}` : '—')}
                        sub={movement.sourceStore?.location?.name ?? movement.sourceUser?.branch?.name}
                    />

                    <Stack alignItems="center" spacing={0.4} sx={{ flexShrink: 0, px: { md: 1 } }}>
                        {courierName ? (
                            <>
                                <Box sx={{
                                    px: 1.25, height: 26, borderRadius: '999px', display: 'flex', alignItems: 'center', gap: 0.6,
                                    bgcolor: alpha(BLUE, 0.1), color: BLUE, maxWidth: 190,
                                }}
                                >
                                    <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem' }} noWrap>
                                        {courierName}
                                    </Typography>
                                </Box>
                                {movement.plateNumber && (
                                    <Typography variant="caption" sx={{ color: neutral[400], fontFamily: 'monospace', fontSize: '0.62rem' }}>
                                        {movement.plateNumber}
                                    </Typography>
                                )}
                            </>
                        ) : (
                            <Box sx={{
                                width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: neutral[100],
                            }}
                            >
                                <ArrowForwardIcon sx={{ fontSize: 15, color: neutral[400], transform: { xs: 'rotate(90deg)', md: 'none' } }} />
                            </Box>
                        )}
                    </Stack>

                    <RoutePanel
                        kind="DESTINATION"
                        accent={GOLD}
                        icon={recipient && !movement.destStore ? <PersonOutlineIcon /> : <StorefrontOutlinedIcon />}
                        title={movement.destStore?.name ?? recipient ?? '—'}
                        sub={movement.destStore?.location?.name ?? movement.recipientUser?.branch?.name}
                    />
                </Stack>

                {isCancelled ? (
                    <Stack
                        direction="row" spacing={1.25} alignItems="center"
                        sx={{ mt: 2.25, p: 1.5, borderRadius: 1.5, bgcolor: alpha(status.danger.main, 0.06), border: `1px solid ${alpha(status.danger.main, 0.2)}` }}
                    >
                        <BlockOutlinedIcon sx={{ color: status.danger.main, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: status.danger.strong, fontWeight: 600 }}>
                            This movement was cancelled and will not progress further.
                        </Typography>
                    </Stack>
                ) : (
                    <>
                        <Divider sx={{ mb: 2, borderColor: alpha(P, 0.1) }} />
                        <MovementStepper steps={lifecycleSteps} currentIndex={currentStepIndex} dates={stepDates} />
                    </>
                )}
            </Paper>

            {/* ── Items ── */}
            <Grid container spacing={2.5} alignItems="stretch" sx={{ mb: 0.5 }}>
                <Grid item xs={12} md={showLogistics ? 7 : 12}>
                    <WidgetCard
                        icon={<Inventory2OutlinedIcon fontSize="small" />}
                        title="Items"
                        subtitle={items.length > 0
                            ? `${assetCount} asset(s) · ${unitCount} unit(s) in total`
                            : 'Assets & consumables on this movement'}
                        accent={GOLD}
                    >
                        {items.length > 0 ? (
                            <Paper elevation={0} sx={dataSurfaceSx}>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ ...dataHeadCellSx, width: 44 }} align="right">#</TableCell>
                                                <TableCell sx={dataHeadCellSx}>Item</TableCell>
                                                <TableCell sx={{ ...dataHeadCellSx, minWidth: 130 }}>Reference</TableCell>
                                                <TableCell sx={{ ...dataHeadCellSx, width: 70 }} align="right">Qty</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {items.map((it, i) => (
                                                <TableRow key={it.id ?? i} hover={false} sx={dataRowSx(i)}>
                                                    <TableCell sx={{ ...dataBodyCellSx, color: neutral[400] }} align="right">{i + 1}</TableCell>
                                                    <TableCell sx={dataBodyCellSx}>
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                                                            <Box sx={{
                                                                width: 24, height: 24, borderRadius: 1, flexShrink: 0,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                bgcolor: alpha(it.asset ? P : GOLD, 0.1), color: it.asset ? P : GOLD,
                                                            }}
                                                            >
                                                                {it.asset
                                                                    ? <FingerprintIcon sx={{ fontSize: 13 }} />
                                                                    : <Inventory2OutlinedIcon sx={{ fontSize: 13 }} />}
                                                            </Box>
                                                            <Box minWidth={0}>
                                                                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: neutral[800] }} noWrap>
                                                                    {it.asset ? it.asset.assetName : it.commodity?.name}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.65rem' }}>
                                                                    {it.asset ? 'Serialized asset' : 'Consumable'}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell sx={{ ...dataBodyCellSx, fontFamily: 'monospace', color: neutral[500], fontSize: '0.72rem' }}>
                                                        {it.asset ? (it.asset.engravedNumber || it.serialNumber || it.assetTag || '—') : '—'}
                                                    </TableCell>
                                                    <TableCell sx={{ ...dataBodyCellSx, fontWeight: 700 }} align="right">
                                                        {it.asset ? 1 : it.quantity}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        ) : (
                            <EmptyState variant="inline" title="No items listed" icon={<Inventory2OutlinedIcon />} />
                        )}
                    </WidgetCard>
                </Grid>

                {showLogistics && (
                    <Grid item xs={12} md={5}>
                        <WidgetCard
                            icon={<LocalShippingOutlinedIcon fontSize="small" />}
                            title="Logistics"
                            subtitle="Courier, vehicle & delivery window"
                            accent={BLUE}
                        >
                            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                                <Fact label="Courier" icon={<LocalShippingOutlinedIcon />} value={courierName} />
                                <Fact label="Plate" icon={<DirectionsCarOutlinedIcon />} value={movement.plateNumber} mono />
                                <Fact label="Tracking" icon={<QrCode2OutlinedIcon />} value={movement.trackingNumber} mono />
                                <Fact label="Dispatched" icon={<EventOutlinedIcon />} value={fmtDate(movement.dispatchDate)} />
                                <Fact label="Expected" icon={<EventOutlinedIcon />} value={fmtDate(movement.expectedDeliveryDate)} />
                                {movement.status !== 'INITIATED' && movement.status !== 'DRAFT' && (
                                    <Fact
                                        label="Custody"
                                        icon={<PlaceOutlinedIcon />}
                                        value={movement.custodyTransferSettled
                                            ? `With ${courierName ?? 'courier'}`
                                            : 'Not yet handed over'}
                                    />
                                )}
                            </Box>
                        </WidgetCard>
                    </Grid>
                )}
            </Grid>

            {/* ── Paper trail ── */}
            <Grid container spacing={2.5} alignItems="stretch" sx={{ mt: 0 }}>
                {showApproval && (
                    <Grid item xs={12} md={6}>
                        <WidgetCard icon={<HowToRegOutlinedIcon fontSize="small" />} title="Approval" subtitle="Ladder trail for this movement">
                            {isPendingApproval(movement) && movement.currentApprover && (
                                <Box sx={{
                                    mb: 2, p: 1.25, borderRadius: 1.5,
                                    bgcolor: alpha(status.warning.main, 0.08), border: `1px solid ${alpha(status.warning.main, 0.25)}`,
                                }}
                                >
                                    <Typography variant="caption" sx={{ color: status.warning.strong, fontWeight: 700 }}>
                                        Awaiting approval by {movement.currentApprover.firstName} {movement.currentApprover.lastName}
                                    </Typography>
                                </Box>
                            )}
                            {/*
                             * A timeline rather than a list of boxes: an approval ladder is a sequence,
                             * and the connecting rail is what makes "who has signed, who is next" legible
                             * at a glance.
                             */}
                            <Stack spacing={0}>
                                {approvals.map((a, i) => {
                                    const tone = a.action === 'APPROVED' ? status.success.strong
                                        : a.action === 'REJECTED' ? status.danger.main
                                            : status.warning.strong;
                                    const last = i === approvals.length - 1;
                                    return (
                                        <Stack key={a.id} direction="row" spacing={1.5} alignItems="stretch">
                                            <Stack alignItems="center" sx={{ flexShrink: 0, width: 20 }}>
                                                <Box sx={{
                                                    width: 10, height: 10, borderRadius: '50%', mt: 0.6, flexShrink: 0,
                                                    bgcolor: tone, boxShadow: `0 0 0 3px ${alpha(tone, 0.15)}`,
                                                }}
                                                />
                                                {!last && <Box sx={{ width: 2, flex: 1, minHeight: 18, bgcolor: neutral[200], my: 0.4 }} />}
                                            </Stack>
                                            <Box flex={1} minWidth={0} pb={last ? 0 : 1.75}>
                                                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: neutral[800] }}>
                                                        {a.tierRole ?? 'Tier'}
                                                    </Typography>
                                                    <StatusChip
                                                        label={a.action}
                                                        tone={a.action === 'APPROVED' ? 'success' : a.action === 'REJECTED' ? 'danger' : 'pending'}
                                                    />
                                                </Stack>
                                                {a.actor && (
                                                    <Typography variant="caption" sx={{ color: neutral[600], display: 'block' }}>
                                                        {a.actor.firstName} {a.actor.lastName}
                                                    </Typography>
                                                )}
                                                {a.comment && (
                                                    <Typography variant="caption" sx={{ color: neutral[500], display: 'block', fontStyle: 'italic' }}>
                                                        “{a.comment}”
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" sx={{ color: neutral[400], fontSize: '0.65rem' }}>
                                                    {fmtDateTime(a.createDate) ?? ''}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        </WidgetCard>
                    </Grid>
                )}

                <Grid item xs={12} md={showApproval ? 6 : 12}>
                    <WidgetCard
                        icon={<DescriptionOutlinedIcon fontSize="small" />}
                        title="Documents"
                        subtitle="Signed release & delivery notes"
                        headerAction={
                            <Stack direction="row" spacing={0.75}>
                                <Button
                                    size="small" variant="text" startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 15 }} />}
                                    onClick={() => generateReleaseNote(movement)}
                                    sx={{ borderRadius: '8px', fontWeight: 600, fontSize: '0.72rem', color: P }}
                                >
                                    Release Note
                                </Button>
                                <Button
                                    size="small" variant="outlined" startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 15 }} />}
                                    disabled={uploading} onClick={() => fileInputRef.current?.click()}
                                    sx={{ borderRadius: '8px', fontWeight: 600, fontSize: '0.72rem' }}
                                >
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
                                        <Stack
                                            key={i} direction="row" spacing={1} alignItems="center"
                                            component="a" href={`/statics/${name}`} target="_blank" rel="noopener noreferrer"
                                            sx={{
                                                p: 1.1, borderRadius: 1.5, border: `1px solid ${border.subtle}`,
                                                textDecoration: 'none', color: 'inherit', transition: 'background-color .15s, border-color .15s',
                                                '&:hover': { bgcolor: alpha(P, 0.04), borderColor: alpha(P, 0.3) },
                                            }}
                                        >
                                            <DescriptionOutlinedIcon sx={{ fontSize: 16, color: P, flexShrink: 0 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }} noWrap>{name}</Typography>
                                            <OpenInNewIcon sx={{ fontSize: 13, color: neutral[400] }} />
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

                {/* ── Parties, receiving & record ── */}
                <Grid item xs={12}>
                    <WidgetCard icon={<InfoOutlinedIcon fontSize="small" />} title="Details" subtitle="Parties, receiving & record metadata" accent={INDIGO}>
                        <Box sx={{ display: 'grid', gap: { xs: 2.5, md: 4 }, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' } }}>
                            <Box>
                                <Stack direction="row" spacing={0.75} alignItems="center" mb={1.5}>
                                    <BadgeOutlinedIcon sx={{ fontSize: 15, color: INDIGO }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: neutral[700], textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>
                                        Parties
                                    </Typography>
                                </Stack>
                                <Stack spacing={1.5}>
                                    <Fact label="Initiator" value={movement.initiator ? `${movement.initiator.firstName} ${movement.initiator.lastName}` : null} />
                                    {recipient && <Fact label="Recipient" value={recipient} />}
                                    {movement.request && <Fact label="Linked Request" value={`#${movement.request.id}`} mono />}
                                    {movement.repair && <Fact label="Linked Repair" value={`#${movement.repair.id}`} mono />}
                                </Stack>
                            </Box>

                            <Box>
                                <Stack direction="row" spacing={0.75} alignItems="center" mb={1.5}>
                                    <ReceiptLongOutlinedIcon sx={{ fontSize: 15, color: INDIGO }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: neutral[700], textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>
                                        Receiving
                                    </Typography>
                                </Stack>
                                <Stack spacing={1.5}>
                                    <Fact label="Receiving Officer" value={movement.receivingOfficer ? `${movement.receivingOfficer.firstName} ${movement.receivingOfficer.lastName}` : null} />
                                    <Fact label="Receipt Date" value={fmtDate(movement.receiptDate)} />
                                    <Fact label="Receipt Status" value={movement.receiptStatus ? receiptStatusLabels[movement.receiptStatus] : null} />
                                    <Fact label="Remarks" value={movement.remarks} />
                                </Stack>
                            </Box>

                            <Box>
                                <Stack direction="row" spacing={0.75} alignItems="center" mb={1.5}>
                                    <HistoryOutlinedIcon sx={{ fontSize: 15, color: INDIGO }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: neutral[700], textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>
                                        Record
                                    </Typography>
                                </Stack>
                                <Stack spacing={1.1}>
                                    {([
                                        ['Created', movement.createDate],
                                        ['Last Modified', movement.lastModified],
                                        ['Completed', movement.completionDate],
                                    ] as Array<[string, string | null | undefined]>).map(([label, value]) => (
                                        <Stack key={label} direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
                                            <Typography variant="caption" sx={{ color: neutral[500] }}>{label}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: value ? neutral[800] : neutral[400], textAlign: 'right' }}>
                                                {fmtDateTime(value) ?? '—'}
                                            </Typography>
                                        </Stack>
                                    ))}
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

            <ModalComponent open={loadingOntoConsignment} handleClose={() => setLoadingOntoConsignment(false)} title="">
                <LoadOntoConsignmentModal
                    movement={movement}
                    handleClose={() => setLoadingOntoConsignment(false)}
                    sendingRequest={sendingRequest}
                    setSendingRequest={setSendingRequest}
                    onDone={load}
                />
            </ModalComponent>
        </Box>
    );
};

export default MovementDetails;
