/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

import {
    Box,
    Button as MuiButton,
    Chip,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    alpha,
} from "@mui/material";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import {
    PriorityHigh as PriorityHighIcon,
    DoNotDisturbAlt as MediumIcon,
    ArrowDownward as LowIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
} from '@mui/icons-material';

import Loading from "../../../../components/loading";
import OtherDetails from "./OtherDetails";
import RequestCommodties from "./RequestCommodties";
import MovementHistory from "./MovementHistory";
import RequestMovements from "./RequestMovements";
import AttachmentViewer from "./AttachmentViewer";
import ModalComponent from "../../../../components/modal";
import ApproveRequest from "../ApprovedRequest";
import RejectRequest from "../RejectRequest";

import { RequestContext } from "../../../../context/request/RequestContext";
import RequestUtills from "../utills";
import { toast } from "react-toastify";
import { fetchWorkflowStepLogsService, findAssetRequestByIDService } from "../service";
import { IStepLog, printEligibility } from "./approvalTrail";
import { generateApprovalPdf } from "./generateApprovalPdf";
import RoutesUtills from "../../../../core/routes/utills";
import { ROUTES } from "../../../../core/routes/routes";
import usePermissions from "../../../../core/permissions/usePermissions";
import {
    canAcknowledgeReceipt, canAcknowledgeRequest, canApproveIssuance, canApproveRequest,
    canEditRequest, canIssueItems, canRejectRequest,
} from "../actionRules";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { requestApproverLabel } from "../../approverLabel";
import StatusUtills from "../../../settings/statuses/Utills";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AcknowledgeRequest from "../AcknowledgeRequest";
import AcknowledgeReceipt from "../AcknowledgeReceipt";
import ApproveIssuance from "../ApproveIssuance";
import { heroActionBase, heroSecondarySx } from "../../../../components/buttons/heroActionStyles";


import { IRequest, IRequestAxiosResponse } from "../../interface";
import { ICommodity } from "../../../settings/commodity/interface";
import { brand, neutral, border, surface } from "../../../../utils/tokens";
import { camelCaseToWords } from "../../../../utils/helpers";
import { requestedFromLabel } from '../../requestedFromLabel';

/**
 * Approve and Reject: the hero's proportions, their own meaning.
 *
 * <p>These cannot take `heroPrimarySx` — green and red are carrying meaning here, not decoration, and
 * repainting them brand teal would say the two decisions are interchangeable. What they must share is
 * the geometry: they sit in the same row as Print Approvals and Edit, so at `size="small"` the row
 * would run at two different heights.
 */
const decisionSx = (bg: string, hover: string) => ({
    ...heroActionBase,
    bgcolor: bg,
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: 'none',
    '&:hover': { bgcolor: hover, transform: 'translateY(-1px)' },
});

const TEAL = '#08796C';

// ─── Status configuration ─────────────────────────────────────────────────────
// Keys are the seeded status *codes* lowercased (see StatusSeeder on the backend). Every code
// the seeder defines should appear here, since an entry is what gives the chip its colour.
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    requestcreated:          { label: 'Submitted',                color: '#1565C0', bg: '#E3F2FD' },
    requestapproved:         { label: 'Approved',                 color: '#2E7D32', bg: '#E8F5E9' },
    managerapproved:         { label: 'Manager Approved',         color: '#2E7D32', bg: '#E8F5E9' },
    hodapproved:             { label: 'HOD Approved',             color: '#1B5E20', bg: '#C8E6C9' },
    bomapproved:             { label: 'BOM Approved',             color: '#33691E', bg: '#DCEDC8' },
    branchmanagerapproved:   { label: 'Branch Manager Approved',  color: '#1A237E', bg: '#E8EAF6' },
    supervisorapproved:      { label: 'Supervisor Approved',      color: '#2E7D32', bg: '#E8F5E9' },
    unitacknowledged:        { label: 'Unit Acknowledged',        color: '#00695C', bg: '#E0F2F1' },
    requestrejected:         { label: 'Rejected',                 color: '#C62828', bg: '#FFEBEE' },
    issuanceavailable:       { label: 'Available for Issuance',   color: '#00838F', bg: '#E0F7FA' },
    issuanceapproved:        { label: 'Issuance Approved',        color: '#6A1B9A', bg: '#F3E5F5' },
    issued:                  { label: 'Issued',                   color: '#00695C', bg: '#E0F2F1' },
    assetissued:             { label: 'Issued',                   color: '#00695C', bg: '#E0F2F1' },
    intransit:               { label: 'In Transit',               color: '#4338CA', bg: '#E8EAF6' },
    inmaintenance:           { label: 'In Maintenance',           color: '#E65100', bg: '#FFF3E0' },
    receiptacknowledged:     { label: 'Receipt Acknowledged',     color: '#1B5E20', bg: '#F1F8E9' },
    assetassigned:           { label: 'Assigned',                 color: '#0277BD', bg: '#E1F5FE' },
    pendingdisposal:         { label: 'Pending Disposal',         color: '#8D6E63', bg: '#EFEBE9' },
    requireupdate:           { label: 'Requires Update',          color: '#F57F17', bg: '#FFFDE7' },
    stockpending:            { label: 'Stock Pending',            color: '#BF360C', bg: '#FBE9E7' },
    stockcompleted:          { label: 'Stock Completed',          color: '#33691E', bg: '#F9FBE7' },
    stockclosedshort:        { label: 'Closed Short',             color: '#BF360C', bg: '#FBE9E7' },
    senttostore:             { label: 'Sent to Store',            color: '#4A148C', bg: '#EDE7F6' },
};

/**
 * Falls back to spacing out the camelCase code rather than printing it raw.
 *
 * A code missing from the map above used to reach the user verbatim — "supervisorApproved" on
 * the chip — which reads as a bug to anyone who is not a developer. Statuses are seeded and can
 * be added without a frontend change, so the fallback has to stay readable on its own.
 * `camelCaseToWords` is the same helper the request table uses, so both views agree.
 */
const getStatusConfig = (statusCode?: string) => {
    if (!statusCode) return { label: 'Unknown', color: '#616161', bg: '#F5F5F5' };
    return STATUS_CONFIG[statusCode.toLowerCase()]
        ?? { label: camelCaseToWords(statusCode), color: '#616161', bg: '#F5F5F5' };
};

const StatusChip = ({ statusCode }: { statusCode?: string }) => {
    const cfg = getStatusConfig(statusCode);
    return (
        <Chip
            size="small"
            label={cfg.label}
            sx={{
                bgcolor: cfg.bg,
                color: cfg.color,
                fontWeight: 700,
                fontSize: '0.72rem',
                border: `1px solid ${alpha(cfg.color, 0.25)}`,
                height: 24,
            }}
        />
    );
};

const PriorityChip = ({ priority }: { priority?: string }) => {
    if (!priority) return null;
    const map: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
        high:   { label: 'High',   color: '#C62828', bg: '#FFEBEE', icon: <PriorityHighIcon sx={{ fontSize: 13 }} /> },
        medium: { label: 'Medium', color: '#E65100', bg: '#FFF3E0', icon: <MediumIcon sx={{ fontSize: 13 }} /> },
        low:    { label: 'Low',    color: '#2E7D32', bg: '#E8F5E9', icon: <LowIcon sx={{ fontSize: 13 }} /> },
    };
    const cfg = map[priority.toLowerCase()] ?? { label: priority, color: '#616161', bg: '#F5F5F5', icon: null };
    return (
        <Chip
            size="small"
            icon={<Box sx={{ color: cfg.color, display: 'flex', pl: 0.5 }}>{cfg.icon}</Box>}
            label={cfg.label}
            sx={{
                bgcolor: cfg.bg,
                color: cfg.color,
                fontWeight: 700,
                fontSize: '0.72rem',
                border: `1px solid ${alpha(cfg.color, 0.25)}`,
                height: 24,
                '& .MuiChip-icon': { ml: 0.5 },
            }}
        />
    );
};

// ─── Info Row ────────────────────────────────────────────────────────────────
const InfoRow = ({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            py: 1.25,
            borderBottom: `1px solid ${alpha('#000', 0.05)}`,
            '&:last-child': { borderBottom: 'none' },
        }}
    >
        <Box sx={{ color: TEAL, mt: 0.1, flexShrink: 0, '& svg': { fontSize: 17 } }}>
            {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1.2, mb: 0.3 }}>
                {label}
            </Typography>
            <Box>{children}</Box>
        </Box>
    </Box>
);

// ─── Hero "at a glance" fact (light tile across the base of the hero) ───────────
const HeroFact = ({ label, value, first }: { label: string; value?: string | null; first?: boolean }) => {
    const empty = value === null || value === undefined || value === '';
    return (
        <Box
            sx={{
                flex: '1 1 150px',
                minWidth: 140,
                px: { xs: 2, md: 2.75 },
                py: 1.5,
                borderLeft: { xs: 'none', sm: first ? 'none' : `1px solid ${border.subtle}` },
            }}
        >
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: neutral[500] }}>
                {label}
            </Typography>
            <Typography noWrap sx={{
                fontSize: '0.9rem', mt: 0.35,
                fontWeight: empty ? 400 : 700,
                fontStyle: empty ? 'italic' : 'normal',
                color: empty ? neutral[400] : neutral[800],
            }}>
                {empty ? 'Not specified' : value}
            </Typography>
        </Box>
    );
};

// ─── Attachment pill ──────────────────────────────────────────────────────────
const AttachmentPill = ({ filePath, onView }: { filePath: string; onView: () => void }) => {
    const name = filePath.split(/[/\\]/).pop() ?? 'attachment';
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
    const isPdf = ext === 'pdf';
    const Icon = isImage ? ImageOutlinedIcon : isPdf ? PictureAsPdfOutlinedIcon : DescriptionOutlinedIcon;
    const iconColor = isImage ? '#1565C0' : isPdf ? '#C62828' : TEAL;

    return (
        <Paper
            variant="outlined"
            onClick={onView}
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 5,
                cursor: 'pointer',
                borderColor: alpha(TEAL, 0.2),
                bgcolor: alpha(TEAL, 0.02),
                transition: 'all 0.15s',
                '&:hover': { borderColor: TEAL, bgcolor: alpha(TEAL, 0.06) },
            }}
        >
            <Icon sx={{ fontSize: 16, color: iconColor }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                {name}
            </Typography>
            <Tooltip title="View attachment">
                <VisibilityOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            </Tooltip>
        </Paper>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
const RequestDetails = () => {
    const [request, setRequest] = useState<IRequest>({} as IRequest);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [isAttachmentViewerOpen, setIsAttachmentViewerOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [acknowledgeRequestOpen, setAcknowledgeRequestOpen] = useState(false);
    const [approveIssuanceOpen, setApproveIssuanceOpen] = useState(false);
    const [acknowledgeReceiptOpen, setAcknowledgeReceiptOpen] = useState(false);
    const [sendingAction, setSendingAction] = useState(false);
    const [stepLogs, setStepLogs] = useState<IStepLog[]>([]);
    const [stepLogsLoaded, setStepLogsLoaded] = useState(false);
    const [printing, setPrinting] = useState(false);

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getCurrentUser } = RoutesUtills();
    const { has } = usePermissions();
    const currentUser = getCurrentUser();

    const { acknowledgeIssuance, acknowledgeRequest, issuanceApproval, currentIssuance } =
        useContext(RequestContext);

    const {
        findAcknowledgeIssuanceReceiptByRequestId,
        findAcknowledgeRequestReceiptByRequestId,
        findIssuanceApprovalRecordByRequestId,
        fetchIssuanceByRequestId,
    } = RequestUtills();

    const fetchRequestDetails = async () => {
        setLoading(true);
        try {
            const response = (await findAssetRequestByIDService(id as string)) as IRequestAxiosResponse;
            if (response.status === 200) setRequest(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // The workflow trail decides both whether the approval certificate may be printed and what
    // goes in it, so it is fetched with the page rather than only when the button is pressed.
    const fetchStepLogs = async () => {
        if (!id) return;
        setStepLogsLoaded(false);
        const response = (await fetchWorkflowStepLogsService(id)) as { status?: number; data?: IStepLog[] };
        setStepLogs(response?.status === 200 ? (response.data ?? []) : []);
        setStepLogsLoaded(true);
    };

    useEffect(() => { if (id) { fetchRequestDetails(); fetchStepLogs(); } }, [id]);

    /*
     * The status catalogue, because the lifecycle modals resolve their target status by code.
     *
     * `AcknowledgeRequest`, `ApproveIssuance` and `AcknowledgeReceipt` each read `StatusesStore` and
     * call `statusIdByCode(...)` — correctly, since ids depend on seed order. On the list page the
     * parent already loads it for the tabs; this page never did, because until now it had no action
     * that needed a status. Without it the lookup returns undefined and the acknowledgement posts a
     * null statusId — a failure no typecheck can see.
     */
    const { fetchAllStatuses } = StatusUtills();
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    useEffect(() => { if (statuses.length === 0) fetchAllStatuses(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (request.id) {
            findAcknowledgeIssuanceReceiptByRequestId(request.id as number);
            findAcknowledgeRequestReceiptByRequestId(request.id as number);
            findIssuanceApprovalRecordByRequestId(request.id as number);
            fetchIssuanceByRequestId(request.id as number);
        }
    }, [request]);

    const actor = { id: currentUser?.id, unitId: currentUser?.unit?.id, has };
    const canEdit = canEditRequest(request, actor);
    const canApprove = canApproveRequest(request, actor);
    const canReject = canRejectRequest(request, actor);

    /*
     * The rest of the lifecycle, driven by the workflow's current step.
     *
     * A request runs on past approval — acknowledged by Infra or Admin, issued, the issuance signed
     * off, and finally receipted by the requester. This page offered none of those, so whoever's turn
     * it was at any of them opened the request, read it, and had to go back to the list to act.
     *
     * Each rule reads `request.currentStepType` — what the workflow says is due — rather than
     * guessing from the status. The list menu now reads the same field, so the two screens cannot
     * offer different actions for the same request.
     */
    const canAckRequest = canAcknowledgeRequest(request, actor);
    const canIssue = canIssueItems(request, actor);
    const canApproveIssue = canApproveIssuance(request, actor);
    const canAckReceipt = canAcknowledgeReceipt(request, actor);

    const printable = printEligibility(request, stepLogs, stepLogsLoaded);

    const handlePrintApprovals = async () => {
        setPrinting(true);
        try {
            await generateApprovalPdf(request, stepLogs);
        } catch (err) {
            console.error(err);
            toast.error('Could not generate the approval certificate. Please try again.');
        } finally {
            setPrinting(false);
        }
    };

    const TABS = [
        { label: 'Requested Items', icon: <ListAltOutlinedIcon fontSize="small" /> },
        { label: 'Processing',      icon: <TimelineOutlinedIcon fontSize="small" /> },
        { label: 'Movement',        icon: <HistoryOutlinedIcon fontSize="small" /> },
        { label: 'Approval History',icon: <AccountTreeOutlinedIcon fontSize="small" /> },
    ];

    return (
        <Box sx={{ bgcolor: surface.page, minHeight: '100vh', px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>

            {/* ── Hero header (light card idiom, matching the asset pages) ── */}
            <Box
                sx={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    mb: 3,
                    bgcolor: '#fff',
                    boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
                }}
            >
                {/* Faint brand accents for a touch of depth on the white card */}
                <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 92% -10%, ${alpha(brand[500], 0.07)} 0%, transparent 42%)`, pointerEvents: 'none' }} />
                <InboxOutlinedIcon sx={{ position: 'absolute', right: -18, top: -20, fontSize: 180, color: alpha(brand[500], 0.05), transform: 'rotate(-12deg)', pointerEvents: 'none' }} />

                <Box sx={{ position: 'relative', px: { xs: 2.5, md: 3.5 }, pt: 2.25, pb: 2.5 }}>
                    {/* Back nav + breadcrumb */}
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.25 }}>
                        <IconButton
                            size="small"
                            onClick={() => navigate(-1)}
                            sx={{
                                color: brand[600],
                                border: `1px solid ${alpha(brand[500], 0.25)}`,
                                bgcolor: alpha(brand[50], 0.6),
                                '&:hover': { bgcolor: alpha(brand[100], 0.7), borderColor: brand[500] },
                            }}
                        >
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <HomeOutlinedIcon sx={{ fontSize: 14, color: neutral[400] }} />
                            <Typography variant="caption" sx={{ color: neutral[500] }}>Asset Requests</Typography>
                            <Typography variant="caption" sx={{ color: neutral[300] }}>/</Typography>
                            <Typography variant="caption" sx={{ color: brand[700], fontWeight: 700 }}>Details</Typography>
                        </Stack>
                    </Stack>

                    {/* Title row */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                        <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 0 }}>
                            {/* Icon tile */}
                            <Box
                                sx={{
                                    width: 56, height: 56, borderRadius: '16px', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    bgcolor: alpha(brand[500], 0.1), color: brand[600], border: `1px solid ${alpha(brand[500], 0.16)}`,
                                }}
                            >
                                <InboxOutlinedIcon sx={{ fontSize: 28 }} />
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    sx={{ fontSize: { xs: '1.35rem', md: '1.6rem' }, fontWeight: 800, color: neutral[900], letterSpacing: '-0.4px', lineHeight: 1.15 }}
                                >
                                    {request.name || 'Asset Request'}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                    <Chip
                                        size="small"
                                        label={`#${request.id || '—'}`}
                                        sx={{
                                            bgcolor: alpha(brand[500], 0.1),
                                            color: brand[700],
                                            fontWeight: 700,
                                            fontSize: '0.72rem',
                                            height: 24,
                                            border: `1px solid ${alpha(brand[500], 0.2)}`,
                                        }}
                                    />
                                    <StatusChip statusCode={request.status?.status ?? undefined} />
                                    <PriorityChip priority={request.priority} />
                                </Stack>
                            </Box>
                        </Stack>

                        {/* Action buttons */}
                        <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: 'wrap', gap: 1, alignItems: 'flex-start' }}>
                            {/* Shown disabled rather than hidden, unlike Edit/Approve/Reject: those
                                depend on who you are, so a hidden button is simply "not yours".
                                This one depends on how far the request has got, so anyone may
                                eventually print it — and the tooltip says what is still missing. */}
                            <Tooltip
                                arrow
                                title={printable.allowed
                                    ? 'Download the approval certificate as a PDF'
                                    : printable.reason}
                            >
                                {/* A disabled button fires no events, so the tooltip needs a live
                                    wrapper to hang off — otherwise the explanation never shows on
                                    exactly the rows where it matters. */}
                                <Box component="span" sx={{ display: 'inline-flex' }}>
                                    <MuiButton
                                        variant="text"
                                        disableElevation
                                        disabled={!printable.allowed || printing}
                                        startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 18 }} />}
                                        onClick={handlePrintApprovals}
                                        sx={heroSecondarySx}
                                    >
                                        {printing ? 'Preparing…' : 'Print Approvals'}
                                    </MuiButton>
                                </Box>
                            </Tooltip>

                            {/* Hidden rather than disabled, to match Approve and Reject below —
                                a permanently dead button on every request you did not raise
                                reads as a fault rather than as "not yours to edit". */}
                            {canEdit && (
                                <MuiButton
                                    variant="text"
                                    disableElevation
                                    startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => navigate(`${ROUTES.UPDATE_REQUEST}/${request.id}`)}
                                    sx={heroSecondarySx}
                                >
                                    {/* Names the object, like "Edit Asset" — "Edit" alone gives a
                                        60px control beside a 56px icon tile. */}
                                    Edit Request
                                </MuiButton>
                            )}

                            {canApprove && (
                                <MuiButton
                                    variant="contained"
                                    size="small"
                                    disableElevation
                                    startIcon={<ApproveIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => setApproveModalOpen(true)}
                                    sx={decisionSx('#2E7D32', '#1B5E20')}
                                >
                                    Approve
                                </MuiButton>
                            )}

                            {/*
                              * The later stages. Only one of these can be live at a time — they are
                              * keyed off the single pending step — so the row never crowds.
                              */}
                            {canAckRequest && (
                                <MuiButton
                                    variant="contained"
                                    disableElevation
                                    startIcon={<ThumbUpOffAltIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => setAcknowledgeRequestOpen(true)}
                                    sx={decisionSx('#0277BD', '#01579B')}
                                >
                                    Acknowledge Request
                                </MuiButton>
                            )}

                            {canIssue && (
                                <MuiButton
                                    variant="contained"
                                    disableElevation
                                    startIcon={<ExitToAppIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => navigate(`${ROUTES.ISSUE_REQUEST}/${request.id}`)}
                                    sx={decisionSx('#6A1B9A', '#4A148C')}
                                >
                                    Issue Items
                                </MuiButton>
                            )}

                            {canApproveIssue && (
                                <MuiButton
                                    variant="contained"
                                    disableElevation
                                    startIcon={<ThumbUpOffAltIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => setApproveIssuanceOpen(true)}
                                    sx={decisionSx('#2E7D32', '#1B5E20')}
                                >
                                    Approve Issuance
                                </MuiButton>
                            )}

                            {canAckReceipt && (
                                <MuiButton
                                    variant="contained"
                                    disableElevation
                                    startIcon={<TaskAltIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => setAcknowledgeReceiptOpen(true)}
                                    sx={decisionSx('#2E7D32', '#1B5E20')}
                                >
                                    Acknowledge Receipt
                                </MuiButton>
                            )}

                            {canReject && (
                                <MuiButton
                                    variant="contained"
                                    size="small"
                                    disableElevation
                                    startIcon={<RejectIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => setRejectModalOpen(true)}
                                    sx={decisionSx('#C62828', '#B71C1C')}
                                >
                                    Reject
                                </MuiButton>
                            )}
                        </Stack>
                    </Box>

                    {/* Attachment pill */}
                    {request.signaturePath && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(brand[500], 0.1)}` }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <AttachFileOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                                    Attachment:
                                </Typography>
                                <AttachmentPill
                                    filePath={request.signaturePath}
                                    onView={() => setIsAttachmentViewerOpen(true)}
                                />
                            </Stack>
                        </Box>
                    )}
                </Box>

                {/* At-a-glance strip — key facts as light tiles across the base of the hero */}
                <Box sx={{ position: 'relative', display: 'flex', flexWrap: 'wrap', bgcolor: alpha(brand[500], 0.03), borderTop: `1px solid ${border.subtle}` }}>
                    {/* The same rule the register's "Requested from" column uses: the department
                        at Head Office, the branch name everywhere else. Reading "Head Office" here
                        while the list this page was opened from says "Finance" is the kind of small
                        disagreement that makes a reader distrust both. The label moved with the
                        value - "Branch / Location" would be wrong on exactly the rows the rule
                        exists for. */}
                    <HeroFact first label="Requested From" value={requestedFromLabel(request.requester)} />
                    {/* Names the unit when the step is routed to one — see requestApproverLabel.
                        Reading "Not specified" for a request genuinely sitting with Admin says the
                        workflow has stalled, which is the opposite of the truth. */}
                    <HeroFact label="Current Approver" value={requestApproverLabel(request)} />
                    <HeroFact label="Submitted" value={request.createDate ? moment(request.createDate).format('D MMM YYYY') : null} />
                    <HeroFact label="Requested Items" value={request.commodities?.length ? `${request.commodities.length} ${request.commodities.length === 1 ? 'item' : 'items'}` : null} />
                </Box>
            </Box>

            {/* ── Body ── */}
            {loading ? (
                <Loading items="Asset Request" />
            ) : (
                <Grid container spacing={3}>
                    {/* ── Left: Summary card ── */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: `1px solid ${border.subtle}`,
                                overflow: 'hidden',
                                bgcolor: '#fff',
                            }}
                        >
                            {/* Card header */}
                            <Box
                                sx={{
                                    px: 2.5,
                                    py: 1.75,
                                    borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                                    bgcolor: alpha(brand[500], 0.03),
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '7px',
                                        background: `linear-gradient(135deg, ${brand[500]}, ${brand[700]})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <ListAltOutlinedIcon sx={{ fontSize: 15, color: '#fff' }} />
                                </Box>
                                <Typography variant="subtitle2" fontWeight={700} color={brand[600]}>
                                    Request Summary
                                </Typography>
                            </Box>

                            {/* Info rows */}
                            <Box sx={{ px: 2.5, py: 1.5 }}>
                                <InfoRow icon={<PersonOutlineIcon />} label="Requested By">
                                    <Typography variant="body2" fontWeight={600}>
                                        {request.requester
                                            ? `${request.requester.firstName} ${request.requester.lastName}`
                                            : '—'}
                                    </Typography>
                                </InfoRow>

                                <InfoRow icon={<BadgeOutlinedIcon />} label="Staff Number">
                                    <Typography variant="body2" fontWeight={500}>
                                        {request.requester?.staffNumber ?? '—'}
                                    </Typography>
                                </InfoRow>

                                <InfoRow icon={<CategoryOutlinedIcon />} label="Asset Category">
                                    <Typography variant="body2" fontWeight={500}>
                                        {request.assetType?.name ?? '—'}
                                    </Typography>
                                </InfoRow>

                                <InfoRow icon={<UpdateOutlinedIcon />} label="Last Modified">
                                    <Typography variant="body2" fontWeight={500}>
                                        {request.lastModified
                                            ? moment(request.lastModified).format('D MMM YYYY, h:mm A')
                                            : '—'}
                                    </Typography>
                                </InfoRow>
                            </Box>

                            {/* Description */}
                            {request.description && (
                                <>
                                    <Divider />
                                    <Box sx={{ px: 2.5, py: 2 }}>
                                        <Typography
                                            variant="caption"
                                            color="text.disabled"
                                            sx={{ display: 'block', mb: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                        >
                                            Description
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}
                                        >
                                            {request.description}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </Grid>

                    {/* ── Right: Tab panel ── */}
                    <Grid item xs={12} md={8} lg={9}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: `1px solid ${border.subtle}`,
                                overflow: 'hidden',
                                bgcolor: '#fff',
                            }}
                        >
                            {/* Tab bar */}
                            <Tabs
                                value={activeTab}
                                onChange={(_, v) => setActiveTab(v)}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    px: 2,
                                    borderBottom: `1px solid ${alpha('#000', 0.07)}`,
                                    minHeight: 48,
                                    bgcolor: alpha(brand[500], 0.025),
                                    '& .MuiTab-root': {
                                        minHeight: 48,
                                        textTransform: 'none',
                                        fontSize: '0.82rem',
                                        fontWeight: 500,
                                        color: 'text.secondary',
                                        gap: 0.75,
                                        px: 2,
                                    },
                                    '& .Mui-selected': { color: brand[600], fontWeight: 700 },
                                    '& .MuiTabs-indicator': { bgcolor: brand[500], height: 3, borderRadius: '3px 3px 0 0' },
                                }}
                            >
                                {TABS.map((tab, i) => (
                                    <Tab key={i} label={tab.label} icon={tab.icon} iconPosition="start" />
                                ))}
                            </Tabs>

                            {/* Tab panels */}
                            <Box sx={{ p: { xs: 2, md: 3 } }}>
                                {activeTab === 0 && (
                                    <RequestCommodties
                                        requestCommodties={
                                            request.commodities as Array<{
                                                commodity: ICommodity;
                                                quantity: number;
                                            }>
                                        }
                                    />
                                )}
                                {activeTab === 1 && (
                                    <OtherDetails
                                        acknowledgeIssuance={acknowledgeIssuance}
                                        acknowledgeRequest={acknowledgeRequest}
                                        issuanceApproval={issuanceApproval}
                                        issuance={currentIssuance}
                                        request={request}
                                    />
                                )}
                                {activeTab === 2 && (
                                    <RequestMovements requestId={request.id} />
                                )}
                                {activeTab === 3 && <MovementHistory request={request} />}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Attachment Viewer */}
            <AttachmentViewer
                open={isAttachmentViewerOpen}
                onClose={() => setIsAttachmentViewerOpen(false)}
                filePath={request.signaturePath || null}
                fileName={request.signaturePath?.split(/[/\\]/).pop() ?? ''}
            />

            {/* Approve modal */}
            <ModalComponent width="60%" title="Approve Request" open={approveModalOpen} handleClose={() => setApproveModalOpen(false)}>
                <ApproveRequest
                    request={request}
                    sendingRequest={sendingAction}
                    setSendingRequest={setSendingAction}
                    handleClose={() => { setApproveModalOpen(false); fetchRequestDetails(); fetchStepLogs(); }}
                    buttonText="Approve"
                />
            </ModalComponent>

            {/* Acknowledge Request — Infra or Admin confirming they have it, before issuance */}
            <ModalComponent width="70%" title="Acknowledge Request" open={acknowledgeRequestOpen}
                handleClose={() => setAcknowledgeRequestOpen(false)}>
                <AcknowledgeRequest
                    request={request}
                    sendingRequest={sendingAction}
                    setSendingRequest={setSendingAction}
                    handleClose={() => { setAcknowledgeRequestOpen(false); fetchRequestDetails(); fetchStepLogs(); }}
                    buttonText="Acknowledge"
                />
            </ModalComponent>

            {/* Approve Issuance — signing off what was handed over */}
            <ModalComponent width="60%" title="Approve Issuance" open={approveIssuanceOpen}
                handleClose={() => setApproveIssuanceOpen(false)}>
                <ApproveIssuance
                    request={request}
                    sendingRequest={sendingAction}
                    setSendingRequest={setSendingAction}
                    handleClose={() => { setApproveIssuanceOpen(false); fetchRequestDetails(); fetchStepLogs(); }}
                    buttonText="Approve"
                />
            </ModalComponent>

            {/* Acknowledge Receipt — the requester confirming what actually arrived */}
            <ModalComponent width="60%" title="Acknowledge Receipt" open={acknowledgeReceiptOpen}
                handleClose={() => setAcknowledgeReceiptOpen(false)}>
                <AcknowledgeReceipt
                    request={request}
                    sendingRequest={sendingAction}
                    setSendingRequest={setSendingAction}
                    handleClose={() => { setAcknowledgeReceiptOpen(false); fetchRequestDetails(); fetchStepLogs(); }}
                    buttonText="Acknowledge"
                />
            </ModalComponent>

            {/* Reject modal */}
            <ModalComponent width="60%" title="Reject Request" open={rejectModalOpen} handleClose={() => setRejectModalOpen(false)}>
                <RejectRequest
                    request={request}
                    sendingRequest={sendingAction}
                    setSendingRequest={setSendingAction}
                    handleClose={() => { setRejectModalOpen(false); fetchRequestDetails(); fetchStepLogs(); }}
                    buttonText="Reject"
                />
            </ModalComponent>
        </Box>
    );
};

export default RequestDetails;
