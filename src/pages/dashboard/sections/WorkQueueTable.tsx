import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { DashboardContext } from '../../../context/dashboard';
import SectionUtills from './utills';
import { IRequest } from '../../request/interface';
import { ROUTES } from '../../../core/routes/routes';

const PRIMARY_COLOR = '#08796C';

const getAgingDays = (dateStr: string | null | undefined): number => {
    if (!dateStr) return 0;
    return Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    );
};

const getAgingStyle = (days: number) => {
    if (days > 7) return { color: '#d32f2f', weight: 700 };
    if (days > 3) return { color: '#f59300', weight: 700 };
    return { color: '#2e7d32', weight: 400 };
};

const getPriorityStyle = (priority?: string) => {
    switch (priority?.toLowerCase()) {
        case 'high':
            return { bg: alpha('#d32f2f', 0.08), color: '#d32f2f' };
        case 'medium':
            return { bg: alpha('#f59300', 0.08), color: '#f59300' };
        default:
            return { bg: alpha('#4285F4', 0.08), color: '#4285F4' };
    }
};

const TABLE_HEADERS = [
    'Request',
    'Requester',
    'Date Submitted',
    'Age',
    'Priority',
    'Current Approver',
    'Actions',
];

const WorkQueueTable = () => {
    const { latestPendingRequests } = useContext(DashboardContext);
    const { findLatestPendingRequestsWithDetails } = SectionUtills();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        findLatestPendingRequestsWithDetails().finally(() => setLoading(false));
    }, []);

    const pendingCount = latestPendingRequests?.length || 0;
    const highAgingCount =
        latestPendingRequests?.filter(
            (r) => getAgingDays(r.createDate) > 3
        ).length || 0;

    return (
        <Card
            elevation={0}
            sx={{ border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 2 }}
        >
            {/* Header */}
            <Box
                px={3}
                py={2}
                borderBottom={`1px solid ${alpha('#000', 0.06)}`}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={1.5}
            >
                <Box display="flex" alignItems="center">
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1,
                            bgcolor: alpha(PRIMARY_COLOR, 0.08),
                            color: PRIMARY_COLOR,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                        }}
                    >
                        <PendingActionsOutlinedIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Actionable Work Queue
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Pending items requiring your review or action
                        </Typography>
                    </Box>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                        label={`${pendingCount} Pending`}
                        size="small"
                        sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.08),
                            color: PRIMARY_COLOR,
                            fontWeight: 600,
                            height: 26,
                        }}
                    />
                    {highAgingCount > 0 && (
                        <Chip
                            icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                            label={`${highAgingCount} aging >3 days`}
                            size="small"
                            sx={{
                                bgcolor: alpha('#f59300', 0.1),
                                color: '#c77800',
                                fontWeight: 600,
                                height: 26,
                                '& .MuiChip-icon': { color: '#c77800' },
                            }}
                        />
                    )}
                </Stack>
            </Box>

            {/* Content */}
            {loading ? (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    py={7}
                >
                    <CircularProgress size={32} sx={{ color: PRIMARY_COLOR }} />
                </Box>
            ) : pendingCount === 0 ? (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    py={7}
                    gap={1.5}
                >
                    <CheckCircleOutlineIcon
                        sx={{ fontSize: 52, color: alpha('#000', 0.12) }}
                    />
                    <Typography color="text.secondary" fontWeight={500}>
                        No pending items — all clear!
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow
                                sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.03) }}
                            >
                                {TABLE_HEADERS.map((h) => (
                                    <TableCell
                                        key={h}
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.72rem',
                                            color: 'text.secondary',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            py: 1.5,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {latestPendingRequests.map((req: IRequest) => {
                                const ageDays = getAgingDays(req.createDate);
                                const ageStyle = getAgingStyle(ageDays);
                                const priorityStyle = getPriorityStyle(
                                    req.priority
                                );

                                const requesterName = req.requester
                                    ? `${req.requester.firstName || ''} ${req.requester.lastName || ''}`.trim()
                                    : '—';
                                const approverName = req.currentApprover
                                    ? `${req.currentApprover.firstName || ''} ${req.currentApprover.lastName || ''}`.trim()
                                    : 'Unassigned';
                                const initials = requesterName
                                    .split(' ')
                                    .map((n) => n[0] || '')
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2);

                                return (
                                    <TableRow
                                        key={req.id}
                                        hover
                                        sx={{
                                            '&:last-child td': {
                                                borderBottom: 0,
                                            },
                                            cursor: 'pointer',
                                        }}
                                        onClick={() =>
                                            navigate(
                                                `${ROUTES.READ_REQUEST}/${req.id}`
                                            )
                                        }
                                    >
                                        {/* Request name */}
                                        <TableCell
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                noWrap
                                                sx={{ maxWidth: 200 }}
                                            >
                                                {req.name}
                                            </Typography>
                                            {req.description && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    noWrap
                                                    display="block"
                                                    sx={{ maxWidth: 200 }}
                                                >
                                                    {req.description}
                                                </Typography>
                                            )}
                                        </TableCell>

                                        {/* Requester */}
                                        <TableCell>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        fontSize: '0.7rem',
                                                        bgcolor: alpha(
                                                            PRIMARY_COLOR,
                                                            0.15
                                                        ),
                                                        color: PRIMARY_COLOR,
                                                    }}
                                                >
                                                    {initials || '?'}
                                                </Avatar>
                                                <Typography
                                                    variant="body2"
                                                    noWrap
                                                    sx={{ maxWidth: 130 }}
                                                >
                                                    {requesterName}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                noWrap
                                            >
                                                {req.createDate
                                                    ? new Date(
                                                          req.createDate
                                                      ).toLocaleDateString(
                                                          'en-GB',
                                                          {
                                                              day: '2-digit',
                                                              month: 'short',
                                                              year: 'numeric',
                                                          }
                                                      )
                                                    : '—'}
                                            </Typography>
                                        </TableCell>

                                        {/* Age */}
                                        <TableCell>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={0.5}
                                            >
                                                <AccessTimeIcon
                                                    sx={{
                                                        fontSize: 13,
                                                        color: ageStyle.color,
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: ageStyle.color,
                                                        fontWeight:
                                                            ageStyle.weight,
                                                    }}
                                                >
                                                    {ageDays === 0
                                                        ? 'Today'
                                                        : `${ageDays}d`}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        {/* Priority */}
                                        <TableCell>
                                            <Chip
                                                label={req.priority || 'Normal'}
                                                size="small"
                                                sx={{
                                                    bgcolor: priorityStyle.bg,
                                                    color: priorityStyle.color,
                                                    fontWeight: 600,
                                                    height: 22,
                                                    '& .MuiChip-label': {
                                                        px: 1,
                                                        fontSize: '0.7rem',
                                                    },
                                                }}
                                            />
                                        </TableCell>

                                        {/* Approver */}
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                noWrap
                                                sx={{ maxWidth: 150 }}
                                            >
                                                {approverName}
                                            </Typography>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Tooltip title="View full details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        navigate(
                                                            `${ROUTES.READ_REQUEST}/${req.id}`
                                                        )
                                                    }
                                                    sx={{
                                                        color: PRIMARY_COLOR,
                                                        '&:hover': {
                                                            bgcolor: alpha(
                                                                PRIMARY_COLOR,
                                                                0.08
                                                            ),
                                                        },
                                                    }}
                                                >
                                                    <VisibilityOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            )}

            {/* Footer */}
            {pendingCount > 0 && !loading && (
                <Box
                    px={3}
                    py={1.5}
                    borderTop={`1px solid ${alpha('#000', 0.06)}`}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="caption" color="text.secondary">
                        Showing {pendingCount} most recent pending requests
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => navigate(ROUTES.REQUEST)}
                        sx={{
                            color: PRIMARY_COLOR,
                            fontWeight: 600,
                            textTransform: 'none',
                        }}
                    >
                        View All Requests →
                    </Button>
                </Box>
            )}
        </Card>
    );
};

export default WorkQueueTable;
