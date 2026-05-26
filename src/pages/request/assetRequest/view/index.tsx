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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
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
import AttachmentViewer from "./AttachmentViewer";
import WorkflowTimeline from "./WorkflowTimeline";
import ModalComponent from "../../../../components/modal";
import ApproveRequest from "../ApprovedRequest";
import RejectRequest from "../RejectRequest";

import { RequestContext } from "../../../../context/request/RequestContext";
import RequestUtills from "../utills";
import { findAssetRequestByIDService } from "../service";
import RoutesUtills from "../../../../core/routes/utills";
import usePermissions from "../../../../core/permissions/usePermissions";
import { PERMISSIONS } from "../../../../core/permissions/constants";

import { IRequest, IRequestAxiosResponse } from "../../interface";
import { ICommodity } from "../../../settings/commodity/interface";

const TEAL = '#08796C';
const TEAL_DARK = '#065E53';

// ─── Status configuration — covers every backend status code ─────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    requestcreated:          { label: 'Submitted',                color: '#1565C0', bg: '#E3F2FD' },
    requestapproved:         { label: 'Approved',                 color: '#2E7D32', bg: '#E8F5E9' },
    managerapproved:         { label: 'Manager Approved',         color: '#2E7D32', bg: '#E8F5E9' },
    hodapproved:             { label: 'HOD Approved',             color: '#1B5E20', bg: '#C8E6C9' },
    bomapproved:             { label: 'BOM Approved',             color: '#33691E', bg: '#DCEDC8' },
    branchmanagerapproved:   { label: 'Branch Manager Approved',  color: '#1A237E', bg: '#E8EAF6' },
    requestrejected:         { label: 'Rejected',                 color: '#C62828', bg: '#FFEBEE' },
    issuanceapproved:        { label: 'Issuance Approved',        color: '#6A1B9A', bg: '#F3E5F5' },
    issued:                  { label: 'Issued',                   color: '#00695C', bg: '#E0F2F1' },
    inmaintenance:           { label: 'In Maintenance',           color: '#E65100', bg: '#FFF3E0' },
    receiptacknowledged:     { label: 'Receipt Acknowledged',     color: '#1B5E20', bg: '#F1F8E9' },
    assetassigned:           { label: 'Assigned',                 color: '#0277BD', bg: '#E1F5FE' },
    requireupdate:           { label: 'Requires Update',          color: '#F57F17', bg: '#FFFDE7' },
    stockpending:            { label: 'Stock Pending',            color: '#BF360C', bg: '#FBE9E7' },
    stockcompleted:          { label: 'Stock Completed',          color: '#33691E', bg: '#F9FBE7' },
    senttostore:             { label: 'Sent to Store',            color: '#4A148C', bg: '#EDE7F6' },
};

const getStatusConfig = (statusCode?: string) => {
    if (!statusCode) return { label: 'Unknown', color: '#616161', bg: '#F5F5F5' };
    return STATUS_CONFIG[statusCode.toLowerCase()] ?? { label: statusCode, color: '#616161', bg: '#F5F5F5' };
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

// ─── Info Row — lightweight label + value ────────────────────────────────────
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
    const [sendingAction, setSendingAction] = useState(false);

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

    useEffect(() => { if (id) fetchRequestDetails(); }, [id]);

    useEffect(() => {
        if (request.id) {
            findAcknowledgeIssuanceReceiptByRequestId(request.id as number);
            findAcknowledgeRequestReceiptByRequestId(request.id as number);
            findIssuanceApprovalRecordByRequestId(request.id as number);
            fetchIssuanceByRequestId(request.id as number);
        }
    }, [request]);

    const canEdit =
        request.status?.status === 'requestCreated' ||
        request.status?.status === 'requestRejected';

    const TERMINAL_STATUSES = new Set(['requestRejected', 'receiptAcknowledged', 'issued', 'assetAssigned']);
    const isDesignatedApprover =
        !!request.currentApprover?.id &&
        !!currentUser?.id &&
        String(request.currentApprover.id) === String(currentUser.id);
    const hasNoDesignatedApprover = !request.currentApprover?.id;
    const isApprovable = !!request.status?.status && !TERMINAL_STATUSES.has(request.status.status);
    const canApprove = (isDesignatedApprover || hasNoDesignatedApprover) && isApprovable && has(PERMISSIONS.APPROVE_REQUEST);
    const canReject  = (isDesignatedApprover || hasNoDesignatedApprover) && isApprovable && has(PERMISSIONS.REJECT_REQUEST);

    const TABS = [
        { label: 'Requested Items', icon: <ListAltOutlinedIcon fontSize="small" /> },
        { label: 'Processing',      icon: <TimelineOutlinedIcon fontSize="small" /> },
        { label: 'Movement',        icon: <HistoryOutlinedIcon fontSize="small" /> },
        { label: 'Approval History',icon: <AccountTreeOutlinedIcon fontSize="small" /> },
    ];

    return (
        <Box sx={{ bgcolor: '#F7F9FC', minHeight: '100vh' }}>
            {/* ── Header ── */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 60%, #033c35 100%)`,
                    px: { xs: 2, md: 4 },
                    pt: { xs: 2.5, md: 3 },
                    pb: { xs: 2, md: 2.5 },
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -60,
                        right: -60,
                        width: 260,
                        height: 260,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        pointerEvents: 'none',
                    },
                }}
            >
                {/* Back nav */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <IconButton
                        size="small"
                        onClick={() => navigate(-1)}
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' },
                        }}
                    >
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Asset Requests
                    </Typography>
                </Stack>

                {/* Title row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{ color: '#fff', mb: 0.75, letterSpacing: '-0.3px', lineHeight: 1.2 }}
                        >
                            {request.name || 'Asset Request'}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip
                                size="small"
                                label={`#${request.id || '—'}`}
                                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                            />
                            <StatusChip statusCode={request.status?.status ?? undefined} />
                            <PriorityChip priority={request.priority} />
                            {request.createDate && (
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                    {moment(request.createDate).format('D MMM YYYY')}
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    {/* Action buttons */}
                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: 'wrap', gap: 1 }}>
                        <MuiButton
                            variant="outlined"
                            size="small"
                            startIcon={<EditOutlinedIcon fontSize="small" />}
                            disabled={!canEdit}
                            onClick={() => navigate(`/requests/edit/${request.id}`)}
                            sx={{
                                color: canEdit ? '#fff' : 'rgba(255,255,255,0.35)',
                                borderColor: canEdit ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                                '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.12)' },
                            }}
                        >
                            Edit
                        </MuiButton>

                        {canApprove && (
                            <MuiButton
                                variant="contained"
                                size="small"
                                startIcon={<ApproveIcon fontSize="small" />}
                                onClick={() => setApproveModalOpen(true)}
                                sx={{
                                    bgcolor: '#2E7D32',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontSize: '0.8rem',
                                    '&:hover': { bgcolor: '#1B5E20' },
                                }}
                            >
                                Approve
                            </MuiButton>
                        )}

                        {canReject && (
                            <MuiButton
                                variant="contained"
                                size="small"
                                startIcon={<RejectIcon fontSize="small" />}
                                onClick={() => setRejectModalOpen(true)}
                                sx={{
                                    bgcolor: '#C62828',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontSize: '0.8rem',
                                    '&:hover': { bgcolor: '#B71C1C' },
                                }}
                            >
                                Reject
                            </MuiButton>
                        )}
                    </Stack>
                </Box>

                {/* Attachment pill in header */}
                {request.signaturePath && (
                    <Box sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AttachFileOutlinedIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mr: 0.5 }}>
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

            {/* ── Body ── */}
            <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
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
                                    border: `1px solid ${alpha('#000', 0.08)}`,
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
                                        bgcolor: alpha(TEAL, 0.03),
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
                                            background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ListAltOutlinedIcon sx={{ fontSize: 15, color: '#fff' }} />
                                    </Box>
                                    <Typography variant="subtitle2" fontWeight={700} color={TEAL}>
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

                                    <InfoRow icon={<AccountBalanceOutlinedIcon />} label="Branch">
                                        <Typography variant="body2" fontWeight={500}>
                                            {request.requester?.branch?.name ?? '—'}
                                        </Typography>
                                    </InfoRow>

                                    <InfoRow icon={<CategoryOutlinedIcon />} label="Asset Category">
                                        <Typography variant="body2" fontWeight={500}>
                                            {request.assetType?.name ?? '—'}
                                        </Typography>
                                    </InfoRow>

                                    <InfoRow icon={<HowToRegOutlinedIcon />} label="Current Approver">
                                        <Typography variant="body2" fontWeight={500}>
                                            {request.currentApprover
                                                ? `${request.currentApprover.firstName} ${request.currentApprover.lastName}`
                                                : '—'}
                                        </Typography>
                                    </InfoRow>

                                    <InfoRow icon={<CalendarTodayOutlinedIcon />} label="Submitted">
                                        <Typography variant="body2" fontWeight={500}>
                                            {request.createDate
                                                ? moment(request.createDate).format('D MMM YYYY, h:mm A')
                                                : '—'}
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
                                    border: `1px solid ${alpha('#000', 0.08)}`,
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
                                        bgcolor: alpha(TEAL, 0.02),
                                        '& .MuiTab-root': {
                                            minHeight: 48,
                                            textTransform: 'none',
                                            fontSize: '0.82rem',
                                            fontWeight: 500,
                                            color: 'text.secondary',
                                            gap: 0.75,
                                            px: 2,
                                        },
                                        '& .Mui-selected': { color: TEAL, fontWeight: 700 },
                                        '& .MuiTabs-indicator': { bgcolor: TEAL, height: 3, borderRadius: '3px 3px 0 0' },
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
                                    {activeTab === 2 && <MovementHistory request={request} />}
                                    {activeTab === 3 && <WorkflowTimeline requestId={request.id as number} />}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Box>

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
                    handleClose={() => { setApproveModalOpen(false); fetchRequestDetails(); }}
                    buttonText="Approve"
                />
            </ModalComponent>

            {/* Reject modal */}
            <ModalComponent width="60%" title="Reject Request" open={rejectModalOpen} handleClose={() => setRejectModalOpen(false)}>
                <RejectRequest
                    request={request}
                    sendingRequest={sendingAction}
                    setSendingRequest={setSendingAction}
                    handleClose={() => { setRejectModalOpen(false); fetchRequestDetails(); }}
                    buttonText="Reject"
                />
            </ModalComponent>
        </Box>
    );
};

export default RequestDetails;
