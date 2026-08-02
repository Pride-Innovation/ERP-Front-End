/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import {
    Box,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { border, neutral, surface } from '../../../utils/tokens';
import { StatusChip } from '../../../components/layout';
import { StatusTone } from '../../../components/layout/StatusChip';
import { ROUTES } from '../../../core/routes/routes';
import { IRequest } from '../../request/interface';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';

interface IWorkQueueProps {
    requests: IAsyncData<IRequest[]>;
    scope: string;
    /** Max rows shown before the "view all" link takes over. */
    limit?: number;
}

/** Whole days since submission. Returns null when there is no usable date. */
const ageInDays = (value?: string | null): number | null => {
    if (!value) return null;
    const submitted = new Date(value).getTime();
    if (Number.isNaN(submitted)) return null;
    return Math.max(Math.floor((Date.now() - submitted) / 86_400_000), 0);
};

/** Anything sitting longer than this is called out — the number an approver actually acts on. */
const STALE_AFTER_DAYS = 3;

const ageTone = (days: number | null): StatusTone => {
    if (days === null) return 'neutral';
    if (days > 7) return 'danger';
    if (days > STALE_AFTER_DAYS) return 'pending';
    return 'success';
};

const priorityTone = (priority?: string): StatusTone => {
    switch ((priority || '').toLowerCase()) {
        case 'high': return 'danger';
        case 'medium': return 'pending';
        case 'low': return 'neutral';
        default: return 'info';
    }
};

const personName = (person?: { firstName?: string; lastName?: string } | null): string => {
    const name = [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim();
    return name || 'Unassigned';
};

const HEADERS = ['Request', 'Requester', 'Submitted', 'Age', 'Priority', 'With', ''];

/**
 * Open requests, oldest first.
 *
 * Sorted by age rather than by id, because the queue's job is to surface what has been waiting
 * longest — that is the thing an approver needs to see first, and it was previously buried in
 * whatever order the API returned.
 */
const WorkQueue = ({ requests, scope, limit = 8 }: IWorkQueueProps) => {
    const { data, loading, failed, reload } = requests;
    const navigate = useNavigate();

    const rows = useMemo(() => {
        const withAge = data.map((request) => ({ request, days: ageInDays(request.createDate) }));
        return withAge.sort((a, b) => (b.days ?? -1) - (a.days ?? -1));
    }, [data]);

    const staleCount = rows.filter((row) => (row.days ?? 0) > STALE_AFTER_DAYS).length;
    const shown = rows.slice(0, limit);

    return (
        <WidgetCard
            title="Work Queue"
            subtitle={`${rows.length} open ${rows.length === 1 ? 'request' : 'requests'} · ${scope}`}
            icon={<PendingActionsOutlinedIcon />}
            helpText={`Requests still awaiting a decision, oldest first. Anything older than ${STALE_AFTER_DAYS} days is flagged.`}
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={rows.length === 0}
            emptyTitle="Nothing waiting"
            emptyDescription="There are no open requests in this queue."
            actions={
                <Stack direction="row" spacing={1} alignItems="center">
                    {staleCount > 0 && (
                        <StatusChip
                            label={`${staleCount} over ${STALE_AFTER_DAYS} days`}
                            tone="pending"
                            icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                        />
                    )}
                    <Button
                        size="small"
                        onClick={() => navigate(ROUTES.LIST_PENDING)}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}
                    >
                        View all
                    </Button>
                </Stack>
            }
        >
            <Box sx={{ overflowX: 'auto', mx: -2.5, mb: -2.5 }}>
                <Table size="small" sx={{ minWidth: 780 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: surface.muted }}>
                            {HEADERS.map((header, index) => (
                                <TableCell
                                    key={header || `actions-${index}`}
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '0.68rem',
                                        color: neutral[500],
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        whiteSpace: 'nowrap',
                                        borderBottom: `1px solid ${border.subtle}`,
                                        py: 1.25,
                                    }}
                                >
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shown.map(({ request, days }) => (
                            <TableRow
                                key={request.id}
                                hover
                                sx={{ '&:last-child td': { borderBottom: 'none' } }}
                            >
                                <TableCell sx={{ borderBottom: `1px solid ${border.subtle}` }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, color: neutral[900], maxWidth: 220 }}
                                        noWrap
                                    >
                                        {request.name || 'Untitled request'}
                                    </Typography>
                                    {request.assetType?.name && (
                                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                                            {request.assetType.name}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell sx={{ borderBottom: `1px solid ${border.subtle}`, color: neutral[600] }}>
                                    <Typography variant="body2" noWrap>
                                        {personName(request.requester ?? request.createdBy)}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ borderBottom: `1px solid ${border.subtle}`, color: neutral[600], whiteSpace: 'nowrap' }}>
                                    <Typography variant="body2">
                                        {request.createDate
                                            ? new Date(request.createDate).toLocaleDateString('en-GB', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })
                                            : '—'}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ borderBottom: `1px solid ${border.subtle}`, whiteSpace: 'nowrap' }}>
                                    <StatusChip
                                        label={days === null ? '—' : `${days}d`}
                                        tone={ageTone(days)}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell sx={{ borderBottom: `1px solid ${border.subtle}` }}>
                                    <StatusChip
                                        label={request.priority || 'Normal'}
                                        tone={priorityTone(request.priority)}
                                    />
                                </TableCell>
                                <TableCell sx={{ borderBottom: `1px solid ${border.subtle}`, color: neutral[600] }}>
                                    <Typography variant="body2" noWrap>
                                        {personName(request.currentApprover)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ borderBottom: `1px solid ${border.subtle}` }}>
                                    <Tooltip title="Open request" arrow>
                                        <Button
                                            size="small"
                                            onClick={() => navigate(`${ROUTES.READ_REQUEST}/${request.id}`)}
                                            sx={{ minWidth: 0, px: 1 }}
                                        >
                                            <VisibilityOutlinedIcon fontSize="small" />
                                        </Button>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {rows.length > shown.length && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        spacing={0.5}
                        sx={{ py: 1.5, borderTop: `1px solid ${border.subtle}`, bgcolor: surface.muted }}
                    >
                        <CheckCircleOutlineIcon sx={{ fontSize: 14, color: neutral[400] }} />
                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                            Showing the {shown.length} oldest of {rows.length}
                        </Typography>
                    </Stack>
                )}
            </Box>
        </WidgetCard>
    );
};

export default WorkQueue;
