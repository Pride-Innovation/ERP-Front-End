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
// An uppercase micro-label above or beside each value throughout, so a reader scans labels and
// values in two passes rather than parsing sentence fragments.

/*
 * One surface for every panel on the page: white, a hairline border and a soft lift.
 *
 * The page sits on the app's blue-grey background, and the journey card used to be a faint teal
 * wash over it - tinted panels on a tinted card on a tinted page, so the most important block on
 * the screen was the one that disappeared. White with a shadow separates by contrast rather than by
 * colour, which is what the repair and disposal modals already do.
 */
const SURFACE_SX = {
    bgcolor: '#fff',
    border: '1px solid #E8EDF3',
    borderRadius: '14px',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -20px rgba(15, 23, 42, 0.22)',
} as const;

/** The modal grammar: a rounded, tinted icon chip with a hairline in its own colour. */
const IconChip = ({ accent, size = 36, children }: { accent: string; size?: number; children: ReactNode }) => (
    <Box sx={{
        width: size, height: size, borderRadius: '10px', flexShrink: 0,
        bgcolor: alpha(accent, 0.09), color: accent, border: `1px solid ${alpha(accent, 0.18)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        '& .MuiSvgIcon-root': { fontSize: Math.round(size * 0.5) },
    }}
    >
        {children}
    </Box>
);

/** A section heading inside a card: micro-label, then a hairline running to the edge. */
const SubHeading = ({ icon, accent, children }: { icon: ReactNode; accent: string; children: ReactNode }) => (
    <Stack direction="row" spacing={1} alignItems="center" mb={1.75}>
        <Box sx={{ color: accent, display: 'flex', '& .MuiSvgIcon-root': { fontSize: 15 } }}>{icon}</Box>
        <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.64rem', whiteSpace: 'nowrap' }}
        >
            {children}
        </Typography>
        <Divider sx={{ flex: 1, borderColor: '#EEF2F7' }} />
    </Stack>
);

const initialsOf = (name?: string | null) => {
    const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

/** A person on the movement: initials avatar, their role in small caps, their name. */
const PersonRow = ({ role, name, accent }: { role: string; name?: string | null; accent: string }) => (
    <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: name ? alpha(accent, 0.1) : '#F1F5F9', color: name ? accent : '#94A3B8',
            border: `1px solid ${name ? alpha(accent, 0.2) : '#E2E8F0'}`,
            fontWeight: 700, fontSize: '0.78rem',
        }}
        >
            {name ? initialsOf(name) : '—'}
        </Box>
        <Box minWidth={0}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block' }}>
                {role}
            </Typography>
            <Typography sx={{ color: name ? '#1E293B' : '#94A3B8', fontWeight: 600, fontSize: '0.86rem' }} noWrap>
                {name || 'Not recorded'}
            </Typography>
        </Box>
    </Stack>
);

/** Label on the left, value on the right, a hairline between rows - reads like a receipt. */
const InfoRow = ({ label, value, last }: { label: string; value?: ReactNode; last?: boolean }) => (
    <Stack
        direction="row" justifyContent="space-between" alignItems="center" spacing={2}
        sx={{ py: 1.1, borderBottom: last ? 'none' : '1px dashed #E2E8F0' }}
    >
        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.76rem', flexShrink: 0 }}>{label}</Typography>
        <Box sx={{ textAlign: 'right', minWidth: 0 }}>
            {typeof value === 'string' || value == null ? (
                <Typography sx={{ color: value ? '#1E293B' : '#94A3B8', fontWeight: 600, fontSize: '0.8rem' }}>
                    {value || '—'}
                </Typography>
            ) : value}
        </Box>
    </Stack>
);

/** A small bordered tile inside a card, for one fact that deserves its own space. */
const Tile = ({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) => (
    <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #EEF2F7', minWidth: 0 }}>
        <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.75, color: '#94A3B8', '& .MuiSvgIcon-root': { fontSize: 14 } }}>
            {icon}
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {label}
            </Typography>
        </Stack>
        {children}
    </Box>
);

/** A reference people read out or copy - tracking, plate - set as a monospace badge. */
const CodeBadge = ({ value }: { value?: string | null }) => (value ? (
    <Box component="span" sx={{
        display: 'inline-block', px: 1, py: 0.35, borderRadius: '6px', bgcolor: '#fff',
        border: '1px solid #E2E8F0', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem',
        color: '#1E293B', letterSpacing: '0.04em', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',
    }}
    >
        {value}
    </Box>
) : (
    <Typography sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.8rem' }}>—</Typography>
));

const DAY_MS = 86_400_000;
/** Whole days between two dates, by calendar day - a delivery due on the 16th is not late at noon. */
const daysBetween = (from: string, to: string) => {
    const a = new Date(from); const b = new Date(to);
    const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((end - start) / DAY_MS);
};

/**
 * Dispatched → expected, as a strip, with whether the delivery kept to it.
 *
 * <p>The verdict is the reason this is drawn rather than listed: two dates side by side make the
 * reader do the subtraction, and "was it late?" is the question anyone opening a delivered movement
 * is asking. Only stated when it can be known - delivered, or past its date and not yet in.
 */
const DeliveryWindow = ({ dispatched, expected, received }: {
    dispatched?: string | null; expected?: string | null; received?: string | null;
}) => {
    const span = dispatched && expected ? daysBetween(dispatched, expected) : null;
    let verdict: { label: string; tone: string } | null = null;
    if (expected && received) {
        const late = daysBetween(expected, received);
        verdict = late > 0
            ? { label: `Delivered ${late} day${late === 1 ? '' : 's'} late`, tone: status.danger.main }
            : { label: 'Delivered on time', tone: status.success.strong };
    } else if (expected && daysBetween(expected, new Date().toISOString()) > 0) {
        verdict = { label: 'Overdue', tone: status.danger.main };
    }

    const end = (label: string, value?: string | null, align: 'left' | 'right' = 'left') => (
        <Box sx={{ textAlign: align, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block' }}>
                {label}
            </Typography>
            <Typography sx={{ color: value ? '#1E293B' : '#94A3B8', fontWeight: 700, fontSize: '0.86rem' }}>
                {fmtDate(value) ?? '—'}
            </Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #EEF2F7' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                {end('Dispatched', dispatched)}
                <Stack alignItems="center" sx={{ flex: 1, minWidth: 40 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.66rem', fontWeight: 600, mb: 0.25 }}>
                        {span != null ? `${span} day${span === 1 ? '' : 's'}` : ' '}
                    </Typography>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: BLUE, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, borderTop: `2px dashed ${alpha(BLUE, 0.35)}` }} />
                        <ArrowForwardIcon sx={{ fontSize: 15, color: BLUE, ml: -0.25 }} />
                    </Box>
                </Stack>
                {end('Expected', expected, 'right')}
            </Stack>
            {verdict && (
                <Stack direction="row" justifyContent="center" sx={{ mt: 1.25 }}>
                    <Box sx={{
                        px: 1.25, py: 0.35, borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
                        color: verdict.tone, bgcolor: alpha(verdict.tone, 0.08), border: `1px solid ${alpha(verdict.tone, 0.22)}`,
                    }}
                    >
                        {verdict.label}
                    </Box>
                </Stack>
            )}
        </Box>
    );
};

/** A widget panel: white surface, icon-chip header, hairline under it. */
const WidgetCard = ({
    icon, title, subtitle, headerAction, accent = P, children,
}: {
    icon: ReactNode; title: string; subtitle?: string; headerAction?: ReactNode;
    accent?: string; children: ReactNode;
}) => (
    <Card
        elevation={0}
        sx={{ ...SURFACE_SX, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
        <Box
            px={2.5} py={1.75} display="flex" alignItems="center" gap={1.5}
            sx={{ borderBottom: '1px solid #EEF2F7' }}
        >
            <IconChip accent={accent}>{icon}</IconChip>
            <Box flex={1} minWidth={0}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.25 }}>{title}</Typography>
                {subtitle && (
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem', display: 'block', lineHeight: 1.4 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {headerAction}
        </Box>
        <Box p={2.5} sx={{ flex: 1 }}>{children}</Box>
    </Card>
);

/**
 * One end of the route — a store, or the person the items end up with.
 *
 * A white card with a coloured rail down its leading edge and the modal's icon chip: the colour says
 * which end it is at a glance, and the name reads at body size rather than as a caption.
 */
const RoutePanel = ({ kind, title, sub, accent, icon }: {
    kind: string; title: string; sub?: string; accent: string; icon: ReactNode;
}) => (
    <Box sx={{
        flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden',
        p: 2, pl: 2.5, borderRadius: '12px', bgcolor: '#fff',
        border: '1px solid #E8EDF3',
        '&::before': {
            content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent,
        },
    }}
    >
        <Stack direction="row" spacing={1.5} alignItems="center">
            <IconChip accent={accent} size={40}>{icon}</IconChip>
            <Box minWidth={0} flex={1}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: accent, letterSpacing: '0.08em', fontSize: '0.62rem', display: 'block' }}>
                    {kind}
                </Typography>
                <Typography sx={{ color: '#1E293B', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }} noWrap>{title}</Typography>
                {sub && (
                    <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: '#64748B', mt: 0.15 }}>
                        <PlaceOutlinedIcon sx={{ fontSize: 13 }} />
                        <Typography variant="caption" sx={{ color: '#64748B' }} noWrap>{sub}</Typography>
                    </Stack>
                )}
            </Box>
        </Stack>
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
            /*
             * Three states that must read apart at a glance: done is a solid disc, current is a ring
             * around a solid disc, upcoming is a hollow outline. They used to be three tints of the
             * same pale teal, which on a tinted card barely read as different at all.
             */
            const disc = state === 'upcoming'
                ? { bgcolor: '#fff', color: '#94A3B8', border: '1.5px dashed #CBD5E1', boxShadow: 'none' }
                : state === 'current'
                    ? { bgcolor: P, color: '#fff', border: `2px solid ${P}`, boxShadow: `0 0 0 5px ${alpha(P, 0.15)}` }
                    : { bgcolor: P, color: '#fff', border: `2px solid ${P}`, boxShadow: `0 2px 6px ${alpha(P, 0.3)}` };
            return (
                <Box key={step} sx={{ display: 'flex', alignItems: 'flex-start', flex: i === steps.length - 1 ? '0 0 auto' : 1 }}>
                    <Stack alignItems="center" spacing={0.75} sx={{ minWidth: 96, flexShrink: 0 }}>
                        <Box sx={{
                            width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease', ...disc,
                        }}
                        >
                            {state === 'done' ? <CheckCircleOutlineIcon sx={{ fontSize: 19 }} /> : meta.icon}
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: state === 'upcoming' ? 600 : 700,
                                color: state === 'upcoming' ? '#94A3B8' : state === 'current' ? P : '#1E293B',
                                whiteSpace: 'nowrap', fontSize: '0.75rem', lineHeight: 1.2,
                            }}
                        >
                            {meta.label}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ color: '#64748B', fontSize: '0.66rem', whiteSpace: 'nowrap', minHeight: 15 }}
                        >
                            {state !== 'upcoming' ? (stamp ?? '') : ''}
                        </Typography>
                    </Stack>
                    {i < steps.length - 1 && (
                        <Box sx={{
                            flex: 1, height: 3, mt: '18px', mx: 0.5, minWidth: 20, borderRadius: 2,
                            bgcolor: i < currentIndex ? P : '#E2E8F0',
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
        ], [
            // The people party to it — what SELF means for a movement, mirroring
            // MovementService.peoplePartyTo and the DAO's SELF predicate.
            movement.initiator?.id,
            movement.sourceUser?.id,
            movement.recipientUser?.id,
            movement.receivingOfficer?.id,
            movement.request?.requesterId,
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
                sx={{ ...SURFACE_SX, p: { xs: 2, sm: 3 }, mb: 3 }}
            >
                {/* Header: what this block is, then where the movement stands. */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.75 }}>
                    <IconChip accent={P} size={38}><SwapHorizOutlinedIcon /></IconChip>
                    <Box flex={1} minWidth={0}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.25 }}>
                            Journey
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                            Where it is, where it is going, and how far it has got
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
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

                    {/*
                      * The connector: a dashed track with the courier riding on it. The dashes run
                      * through the courier on wide screens, so the two panels read as one route.
                      */}
                    <Stack
                        alignItems="center" justifyContent="center" spacing={0.5}
                        sx={{
                            flexShrink: 0, position: 'relative', minWidth: { md: 150 }, py: { xs: 0.5, md: 0 },
                            '&::before': {
                                content: '""', position: 'absolute', left: 0, right: 0, top: '50%',
                                borderTop: `2px dashed ${alpha(BLUE, 0.3)}`,
                                display: { xs: 'none', md: 'block' },
                            },
                        }}
                    >
                        {courierName ? (
                            <>
                                <Box sx={{
                                    position: 'relative', zIndex: 1,
                                    px: 1.5, height: 30, borderRadius: '999px', display: 'flex', alignItems: 'center', gap: 0.75,
                                    bgcolor: '#fff', color: BLUE, maxWidth: 200,
                                    border: `1px solid ${alpha(BLUE, 0.3)}`, boxShadow: `0 2px 8px ${alpha(BLUE, 0.15)}`,
                                }}
                                >
                                    <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.74rem' }} noWrap>
                                        {courierName}
                                    </Typography>
                                </Box>
                                {movement.plateNumber && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            position: 'relative', zIndex: 1, px: 0.75, borderRadius: '4px', bgcolor: '#F8FAFC',
                                            border: '1px solid #E2E8F0', color: '#475569', fontFamily: 'monospace',
                                            fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.04em',
                                        }}
                                    >
                                        {movement.plateNumber}
                                    </Typography>
                                )}
                            </>
                        ) : (
                            <Box sx={{
                                position: 'relative', zIndex: 1,
                                width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)',
                            }}
                            >
                                <ArrowForwardIcon sx={{ fontSize: 16, color: '#64748B', transform: { xs: 'rotate(90deg)', md: 'none' } }} />
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
                    // An inset tray, so the progress reads as its own strip beneath the route.
                    <Box sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 2, sm: 2.25 }, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #EEF2F7' }}>
                        <MovementStepper steps={lifecycleSteps} currentIndex={currentStepIndex} dates={stepDates} />
                    </Box>
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
                            <Stack spacing={1.5}>
                                {/* The courier and its vehicle, as one line. */}
                                <Stack
                                    direction="row" spacing={1.5} alignItems="center"
                                    sx={{ p: 1.5, borderRadius: '10px', border: `1px solid ${alpha(BLUE, 0.18)}`, bgcolor: alpha(BLUE, 0.03) }}
                                >
                                    <IconChip accent={BLUE} size={40}><LocalShippingOutlinedIcon /></IconChip>
                                    <Box flex={1} minWidth={0}>
                                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block' }}>
                                            Courier
                                        </Typography>
                                        <Typography sx={{ color: courierName ? '#1E293B' : '#94A3B8', fontWeight: 700, fontSize: '0.92rem' }} noWrap>
                                            {courierName ?? 'Not yet assigned'}
                                        </Typography>
                                    </Box>
                                    {movement.plateNumber && (
                                        <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
                                            <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: '#94A3B8' }}>
                                                <DirectionsCarOutlinedIcon sx={{ fontSize: 13 }} />
                                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.06em' }}>
                                                    PLATE
                                                </Typography>
                                            </Stack>
                                            <CodeBadge value={movement.plateNumber} />
                                        </Stack>
                                    )}
                                </Stack>

                                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                                    <Tile label="Tracking" icon={<QrCode2OutlinedIcon />}>
                                        <CodeBadge value={movement.trackingNumber} />
                                        {movement.courierReference && (
                                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.75 }} noWrap>
                                                Courier ref · <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>{movement.courierReference}</Box>
                                            </Typography>
                                        )}
                                    </Tile>
                                    {movement.status !== 'INITIATED' && movement.status !== 'DRAFT' && (() => {
                                        /*
                                         * Where the items physically are. "With Safe Boda" on a movement
                                         * that was delivered days ago was the old reading: the hand-over to
                                         * the courier is recorded, the hand-over at the far end is the
                                         * receipt, so a received or completed movement is delivered.
                                         */
                                        const delivered = movement.status === 'COMPLETED' || movement.status === 'RECEIVED';
                                        const custody = delivered
                                            ? { label: 'Delivered', tone: status.success.strong }
                                            : movement.custodyTransferSettled
                                                ? { label: `With ${courierName ?? 'courier'}`, tone: BLUE }
                                                : { label: 'Not yet handed over', tone: status.warning.strong };
                                        return (
                                            <Tile label="Custody" icon={<PlaceOutlinedIcon />}>
                                                <Stack direction="row" spacing={0.75} alignItems="center">
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: custody.tone, boxShadow: `0 0 0 3px ${alpha(custody.tone, 0.15)}` }} />
                                                    <Typography sx={{ color: custody.tone, fontWeight: 700, fontSize: '0.82rem' }} noWrap>
                                                        {custody.label}
                                                    </Typography>
                                                </Stack>
                                            </Tile>
                                        );
                                    })()}
                                </Box>

                                <DeliveryWindow
                                    dispatched={movement.dispatchDate}
                                    expected={movement.expectedDeliveryDate}
                                    received={movement.receiptDate}
                                />
                            </Stack>
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
                        {/*
                          * Three columns, separated by hairlines on wide screens so each reads as its
                          * own group: who was involved, how it was received, and when the record moved.
                          */}
                        <Box sx={{
                            display: 'grid', gap: { xs: 3, md: 0 }, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                            '& > *': { px: { md: 3 } },
                            '& > *:first-of-type': { pl: { md: 0 } },
                            '& > *:last-of-type': { pr: { md: 0 } },
                            '& > * + *': { borderLeft: { md: '1px solid #EEF2F7' } },
                        }}
                        >
                            <Box>
                                <SubHeading icon={<BadgeOutlinedIcon />} accent={INDIGO}>Parties</SubHeading>
                                <Stack spacing={1.75}>
                                    <PersonRow
                                        role="Initiator" accent={INDIGO}
                                        name={movement.initiator ? `${movement.initiator.firstName} ${movement.initiator.lastName}` : null}
                                    />
                                    {recipient && <PersonRow role="Recipient" accent={GOLD} name={recipient} />}
                                </Stack>
                                {(movement.request || movement.repair) && (
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                                        {movement.request && (
                                            <Box sx={{ px: 1.1, py: 0.4, borderRadius: '6px', bgcolor: alpha(P, 0.06), border: `1px solid ${alpha(P, 0.18)}`, color: P, fontSize: '0.72rem', fontWeight: 700 }}>
                                                Request #{movement.request.id}
                                            </Box>
                                        )}
                                        {movement.repair && (
                                            <Box sx={{ px: 1.1, py: 0.4, borderRadius: '6px', bgcolor: alpha(BLUE, 0.06), border: `1px solid ${alpha(BLUE, 0.18)}`, color: BLUE, fontSize: '0.72rem', fontWeight: 700 }}>
                                                Repair #{movement.repair.id}
                                            </Box>
                                        )}
                                    </Stack>
                                )}
                            </Box>

                            <Box>
                                <SubHeading icon={<ReceiptLongOutlinedIcon />} accent={INDIGO}>Receiving</SubHeading>
                                <PersonRow
                                    role="Receiving Officer" accent={status.success.strong}
                                    name={movement.receivingOfficer ? `${movement.receivingOfficer.firstName} ${movement.receivingOfficer.lastName}` : null}
                                />
                                <Box sx={{ mt: 1.25 }}>
                                    <InfoRow label="Receipt date" value={fmtDate(movement.receiptDate)} />
                                    <InfoRow
                                        label="Receipt status"
                                        last={!movement.remarks}
                                        value={movement.receiptStatus && movement.receiptStatus !== 'PENDING'
                                            ? (
                                                <StatusChip
                                                    label={receiptStatusLabels[movement.receiptStatus]}
                                                    tone={movement.receiptStatus === 'RECEIVED_OK' ? 'success' : 'pending'}
                                                />
                                            )
                                            : (movement.receiptStatus ? receiptStatusLabels[movement.receiptStatus] : null)}
                                    />
                                </Box>
                                {movement.remarks && (
                                    <Box sx={{ mt: 1.5, p: 1.25, borderRadius: '8px', bgcolor: '#F8FAFC', borderLeft: `3px solid ${alpha(INDIGO, 0.4)}` }}>
                                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.06em', display: 'block', mb: 0.25 }}>
                                            REMARKS
                                        </Typography>
                                        <Typography sx={{ color: '#334155', fontSize: '0.8rem', fontStyle: 'italic', wordBreak: 'break-word' }}>
                                            {movement.remarks}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Box>
                                <SubHeading icon={<HistoryOutlinedIcon />} accent={INDIGO}>Record</SubHeading>
                                {/* A short timeline: the record's life is a sequence, so it is drawn as one. */}
                                <Stack spacing={0}>
                                    {([
                                        ['Created', movement.createDate],
                                        ['Last modified', movement.lastModified],
                                        ['Completed', movement.completionDate],
                                    ] as Array<[string, string | null | undefined]>).map(([label, value], i, all) => {
                                        const last = i === all.length - 1;
                                        const when = value ? new Date(value) : null;
                                        return (
                                            <Stack key={label} direction="row" spacing={1.5} alignItems="stretch">
                                                <Stack alignItems="center" sx={{ width: 12, flexShrink: 0 }}>
                                                    <Box sx={{
                                                        width: 10, height: 10, borderRadius: '50%', mt: 0.5, flexShrink: 0,
                                                        bgcolor: value ? INDIGO : '#fff',
                                                        border: `2px solid ${value ? INDIGO : '#CBD5E1'}`,
                                                    }}
                                                    />
                                                    {!last && <Box sx={{ width: 2, flex: 1, minHeight: 16, bgcolor: '#E2E8F0', my: 0.4 }} />}
                                                </Stack>
                                                <Box pb={last ? 0 : 1.5} minWidth={0}>
                                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block' }}>
                                                        {label}
                                                    </Typography>
                                                    <Typography sx={{ color: when ? '#1E293B' : '#94A3B8', fontWeight: 600, fontSize: '0.82rem' }}>
                                                        {when ? fmtDate(value) : 'Not yet'}
                                                        {when && (
                                                            <Box component="span" sx={{ color: '#64748B', fontWeight: 500, ml: 0.75, fontSize: '0.74rem' }}>
                                                                {when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                            </Box>
                                                        )}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        );
                                    })}
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
