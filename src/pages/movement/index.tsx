/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    alpha,
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import { ROUTES } from '../../core/routes/routes';
import { mockMovements, statusConfig, MovementStatus } from './mockMovements';

// ── Stat widget ──────────────────────────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    accentColor: string;
    sub?: string;
    onClick?: () => void;
}
const StatCard = ({ label, value, icon, accentColor, sub, onClick }: StatCardProps) => (
    <Paper
        elevation={0}
        onClick={onClick}
        sx={{
            p: 2.5,
            borderRadius: 3,
            border: `1px solid ${alpha(accentColor, 0.18)}`,
            cursor: onClick ? 'pointer' : 'default',
            transition: 'box-shadow 0.2s, transform 0.15s',
            '&:hover': onClick ? { boxShadow: `0 4px 20px ${alpha(accentColor, 0.16)}`, transform: 'translateY(-2px)' } : {},
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        <Box
            sx={{
                position: 'absolute', top: -12, right: -12,
                width: 70, height: 70, borderRadius: '50%',
                bgcolor: alpha(accentColor, 0.08),
            }}
        />
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem', fontWeight: 600 }}>
                    {label}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: accentColor, mt: 0.25, lineHeight: 1.1 }}>
                    {value}
                </Typography>
                {sub && (
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', mt: 0.25, display: 'block' }}>
                        {sub}
                    </Typography>
                )}
            </Box>
            <Box
                sx={{
                    width: 40, height: 40, borderRadius: 2,
                    bgcolor: alpha(accentColor, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: accentColor,
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
        </Stack>
    </Paper>
);

// ── Status chip ───────────────────────────────────────────────────────────────
const StatusChip = ({ status }: { status: MovementStatus }) => {
    const cfg = statusConfig[status];
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{
                height: 20,
                fontSize: '0.67rem',
                fontWeight: 700,
                bgcolor: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
                '& .MuiChip-label': { px: 1.25 },
            }}
        />
    );
};

// ── Workflow step ─────────────────────────────────────────────────────────────
interface WorkflowStepProps {
    step: number;
    label: string;
    description: string;
    color: string;
    icon: React.ReactNode;
    isLast?: boolean;
}
const WorkflowStep = ({ step, label, description, color, icon, isLast }: WorkflowStepProps) => (
    <Stack direction="row" spacing={0} alignItems="flex-start" sx={{ flex: 1 }}>
        <Stack alignItems="center" sx={{ mr: 1.5, minWidth: 36 }}>
            <Box
                sx={{
                    width: 36, height: 36, borderRadius: '50%',
                    bgcolor: alpha(color, 0.12),
                    border: `2px solid ${alpha(color, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color, flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            {!isLast && (
                <Box sx={{ width: 2, flex: 1, minHeight: 24, bgcolor: alpha(color, 0.15), my: 0.5 }} />
            )}
        </Stack>
        <Box sx={{ pt: 0.5, pb: isLast ? 0 : 2 }}>
            <Typography variant="caption" sx={{ color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.63rem' }}>
                Step {step}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                {label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', lineHeight: 1.5 }}>
                {description}
            </Typography>
        </Box>
    </Stack>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const Movement = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const PRIMARY = theme.palette.primary.main;       // #08796C
    const SECONDARY = theme.palette.secondary.main;   // #BC892C

    // Calculated stats from mock data
    const total = mockMovements.length;
    const pending = mockMovements.filter(m => m.status === 'pending_approval').length;
    const approved = mockMovements.filter(m => m.status === 'approved').length;
    const rejected = mockMovements.filter(m => m.status === 'rejected').length;
    const released = mockMovements.filter(m => m.status === 'released').length;
    const completed = mockMovements.filter(m => m.status === 'completed').length;
    const draft = mockMovements.filter(m => m.status === 'draft').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Recent movements – show 6
    const recentMovements = [...mockMovements]
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .slice(0, 6);

    const workflowSteps = [
        { step: 1, label: 'Initiate Request', description: 'Select assets, officer and destination', color: PRIMARY, icon: <AddIcon sx={{ fontSize: 16 }} /> },
        { step: 2, label: 'Submit for Approval', description: 'Supervisor reviews and approves/rejects', color: SECONDARY, icon: <PendingActionsOutlinedIcon sx={{ fontSize: 16 }} /> },
        { step: 3, label: 'Generate Security Pass', description: 'Auto-generated for branch movements', color: '#2563EB', icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 16 }} /> },
        { step: 4, label: 'Release Assets', description: 'Releasing officer signs and dispatches', color: '#7C3AED', icon: <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} /> },
        { step: 5, label: 'Receive & Complete', description: 'Receipt acknowledged, audit trail closed', color: '#059669', icon: <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} /> },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>

            {/* ── Hero header ──────────────────────────────────────────────── */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha(PRIMARY, 0.14)}`,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Gradient accent strip */}
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${PRIMARY} 0%, ${SECONDARY} 60%, #3B82F6 100%)` }} />
                <Box sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 52, height: 52, borderRadius: 2.5,
                                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${theme.palette.primary.dark} 100%)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.4)}`,
                                flexShrink: 0,
                            }}
                        >
                            <SwapHorizOutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.15 }}>
                                Asset Movement
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                Initiate, approve, track and complete asset transfers across branches and departments.
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} flexShrink={0}>
                        <Button
                            variant="outlined"
                            startIcon={<SwapHorizOutlinedIcon />}
                            sx={{
                                borderRadius: 2, fontWeight: 600, px: 2.5,
                                borderColor: alpha(PRIMARY, 0.35), color: PRIMARY,
                                '&:hover': { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) },
                                fontSize: '0.8rem',
                            }}
                            onClick={() => navigate(`${ROUTES.MOVEMENT}/all`)}
                        >
                            All Movements
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                borderRadius: 2, fontWeight: 700, px: 3,
                                bgcolor: PRIMARY,
                                boxShadow: `0 3px 12px ${alpha(PRIMARY, 0.4)}`,
                                '&:hover': { bgcolor: theme.palette.primary.dark, boxShadow: `0 6px 20px ${alpha(PRIMARY, 0.45)}`, transform: 'translateY(-1px)' },
                                transition: 'all 0.2s ease',
                                fontSize: '0.8rem',
                            }}
                            onClick={() => navigate(ROUTES.CREATE_MOVEMENT)}
                        >
                            New Movement
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            {/* ── KPI Stats ────────────────────────────────────────────────── */}
            <Grid container spacing={2}>
                <Grid item xs={6} sm={4} lg={2}>
                    <StatCard label="Total" value={total} accentColor={PRIMARY} icon={<SwapHorizOutlinedIcon sx={{ fontSize: 18 }} />} sub="All movements" />
                </Grid>
                <Grid item xs={6} sm={4} lg={2}>
                    <StatCard label="Drafts" value={draft} accentColor="#6B7280" icon={<DraftsOutlinedIcon sx={{ fontSize: 18 }} />} sub="Not submitted" />
                </Grid>
                <Grid item xs={6} sm={4} lg={2}>
                    <StatCard label="Pending" value={pending} accentColor="#D97706" icon={<PendingActionsOutlinedIcon sx={{ fontSize: 18 }} />} sub="Awaiting approval" />
                </Grid>
                <Grid item xs={6} sm={4} lg={2}>
                    <StatCard label="Approved" value={approved} accentColor="#059669" icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />} sub="Ready to release" />
                </Grid>
                <Grid item xs={6} sm={4} lg={2}>
                    <StatCard label="Released" value={released} accentColor="#2563EB" icon={<LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />} sub="In transit" />
                </Grid>
                <Grid item xs={6} sm={4} lg={2}>
                    <StatCard label="Rejected" value={rejected} accentColor="#DC2626" icon={<CancelOutlinedIcon sx={{ fontSize: 18 }} />} sub="Needs attention" />
                </Grid>
            </Grid>

            {/* ── Completion progress ──────────────────────────────────────── */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}`, px: 3, py: 2.25 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <TrendingUpOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            Completion Rate
                        </Typography>
                    </Stack>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: PRIMARY }}>
                        {completionRate}%
                    </Typography>
                </Stack>
                <LinearProgress
                    variant="determinate"
                    value={completionRate}
                    sx={{
                        height: 7, borderRadius: 4, bgcolor: alpha(PRIMARY, 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: PRIMARY, borderRadius: 4 },
                    }}
                />
                <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
                        {completed} completed of {total} total
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
                        {total - completed} in progress
                    </Typography>
                </Stack>
            </Paper>

            {/* ── Main split: table + sidebar ─────────────────────────────── */}
            <Grid container spacing={3} alignItems="flex-start">

                {/* Recent movements table */}
                <Grid item xs={12} lg={8}>
                    <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}`, overflow: 'hidden' }}>
                        {/* Table header */}
                        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${alpha('#000', 0.06)}`, background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.04)} 0%, transparent 100%)` }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AccessTimeOutlinedIcon sx={{ fontSize: 15, color: PRIMARY }} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem', display: 'block' }}>
                                        Overview
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                        Recent Movements
                                    </Typography>
                                </Box>
                            </Stack>
                            <Button
                                endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                                size="small"
                                sx={{ color: PRIMARY, fontWeight: 600, fontSize: '0.75rem', '&:hover': { bgcolor: alpha(PRIMARY, 0.06) } }}
                                onClick={() => navigate(`${ROUTES.MOVEMENT}/all`)}
                            >
                                View All
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ '& .MuiTableCell-head': { bgcolor: alpha('#000', 0.02), fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 1.25, borderBottom: `1px solid ${alpha('#000', 0.06)}` } }}>
                                        <TableCell>Reference</TableCell>
                                        <TableCell>Officer</TableCell>
                                        <TableCell>Destination</TableCell>
                                        <TableCell align="center">Assets</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentMovements.map((mov, idx) => {
                                        const isEditable = mov.status === 'draft' || mov.status === 'rejected';
                                        return (
                                            <TableRow
                                                key={mov.id}
                                                sx={{
                                                    '&:hover': { bgcolor: alpha(PRIMARY, 0.025) },
                                                    '& .MuiTableCell-root': { py: 1.25, fontSize: '0.78rem', borderBottom: idx === recentMovements.length - 1 ? 'none' : `1px solid ${alpha('#000', 0.05)}` },
                                                    bgcolor: mov.status === 'rejected' ? alpha('#DC2626', 0.018) : 'transparent',
                                                }}
                                            >
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        {mov.status === 'rejected' && (
                                                            <Tooltip title={`Rejected: ${mov.rejectionComment}`}>
                                                                <InfoOutlinedIcon sx={{ fontSize: 13, color: '#DC2626' }} />
                                                            </Tooltip>
                                                        )}
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                            {mov.referenceNo}
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.66rem', display: 'block' }}>
                                                        {mov.createdDate}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Avatar sx={{ width: 26, height: 26, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(PRIMARY, 0.15), color: PRIMARY }}>
                                                            {mov.requestingOfficer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                                                                {mov.requestingOfficer}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.67rem' }}>
                                                                {mov.department}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" sx={{ fontWeight: 500, display: 'block' }}>{mov.destination}</Typography>
                                                    <Chip
                                                        label={mov.destinationType}
                                                        size="small"
                                                        sx={{ height: 16, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha(PRIMARY, 0.07), color: PRIMARY, '& .MuiChip-label': { px: 0.75 }, mt: 0.25 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={mov.assetsCount}
                                                        size="small"
                                                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(SECONDARY, 0.1), color: SECONDARY, '& .MuiChip-label': { px: 1 } }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusChip status={mov.status} />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                        <Tooltip title="View details">
                                                            <IconButton size="small" sx={{ color: PRIMARY, '&:hover': { bgcolor: alpha(PRIMARY, 0.08) } }} onClick={() => navigate(`${ROUTES.READ_MOVEMENT}/${mov.id}`)}>
                                                                <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {isEditable && (
                                                            <Tooltip title="Edit movement">
                                                                <IconButton size="small" sx={{ color: SECONDARY, '&:hover': { bgcolor: alpha(SECONDARY, 0.08) } }} onClick={() => navigate(`${ROUTES.UPDATE_MOVEMENT}/${mov.id}`)}>
                                                                    <EditOutlinedIcon sx={{ fontSize: 15 }} />
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
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Right sidebar: workflow + quick actions */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={2.5}>

                        {/* Quick actions */}
                        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}`, overflow: 'hidden' }}>
                            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${alpha('#000', 0.06)}`, background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.04)} 0%, transparent 100%)` }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Quick Actions</Typography>
                            </Box>
                            <Stack spacing={0} divider={<Divider />} sx={{ p: 0 }}>
                                {[
                                    { label: 'New Asset Movement', sub: 'Start a movement request', icon: <AddIcon sx={{ fontSize: 16 }} />, color: PRIMARY, action: () => navigate(ROUTES.CREATE_MOVEMENT) },
                                    { label: 'Pending Approvals', sub: `${pending} awaiting your review`, icon: <PendingActionsOutlinedIcon sx={{ fontSize: 16 }} />, color: '#D97706', action: () => navigate(`${ROUTES.MOVEMENT}/all`) },
                                    { label: 'Released Movements', sub: `${released} assets in transit`, icon: <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />, color: '#2563EB', action: () => navigate(`${ROUTES.MOVEMENT}/all`) },
                                    { label: 'Rejected Requests', sub: `${rejected} need attention`, icon: <CancelOutlinedIcon sx={{ fontSize: 16 }} />, color: '#DC2626', action: () => navigate(`${ROUTES.MOVEMENT}/all`) },
                                ].map((item) => (
                                    <Stack
                                        key={item.label}
                                        direction="row"
                                        alignItems="center"
                                        spacing={1.5}
                                        onClick={item.action}
                                        sx={{
                                            px: 2.5, py: 1.5, cursor: 'pointer',
                                            transition: 'background 0.15s',
                                            '&:hover': { bgcolor: alpha(item.color, 0.04) },
                                        }}
                                    >
                                        <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: alpha(item.color, 0.1), color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {item.icon}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>{item.label}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{item.sub}</Typography>
                                        </Box>
                                        <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>

                        {/* Workflow guide */}
                        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}`, overflow: 'hidden' }}>
                            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${alpha('#000', 0.06)}`, background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.04)} 0%, transparent 100%)` }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Movement Workflow</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>End-to-end process overview</Typography>
                            </Box>
                            <Box sx={{ p: 2.5 }}>
                                <Stack spacing={0}>
                                    {workflowSteps.map((s, i) => (
                                        <WorkflowStep
                                            key={s.step}
                                            {...s}
                                            isLast={i === workflowSteps.length - 1}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        </Paper>

                        {/* State legend */}
                        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}`, p: 2.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Status Reference</Typography>
                            <Stack spacing={1}>
                                {(Object.entries(statusConfig) as [MovementStatus, typeof statusConfig[MovementStatus]][]).map(([key, cfg]) => (
                                    <Stack key={key} direction="row" alignItems="center" spacing={1.25}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: cfg.color, minWidth: 110, fontSize: '0.73rem' }}>
                                            {cfg.label}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.69rem' }}>
                                            {key === 'draft' && 'Saved but not submitted'}
                                            {key === 'pending_approval' && 'Awaiting supervisor review'}
                                            {key === 'approved' && 'Authorised – ready to release'}
                                            {key === 'rejected' && 'Returned with comment – editable'}
                                            {key === 'released' && 'Assets dispatched, in transit'}
                                            {key === 'received' && 'Recipient acknowledged'}
                                            {key === 'completed' && 'Fully closed, audit trail saved'}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Movement;