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
    alpha,
} from '@mui/material';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import { border, brand, neutral, status, surface } from '../../../utils/tokens';
import { StatusChip } from '../../../components/layout';
import { ROUTES } from '../../../core/routes/routes';
import { IRequest } from '../../request/interface';
import { requestApproverLabel } from '../../request/approverLabel';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';

interface IWorkQueueProps {
    requests: IAsyncData<IRequest[]>;
    /*
     * No `scope`: this queue is not a scoped listing.
     *
     * It shows what the workflow routed to this person, which is a fact about the workflow rather
     * than a question of breadth — widening it by branch would show an approver work that is not
     * theirs to do. The scoped view of requests is the "Open Requests" widget beside it.
     */
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
const OVERDUE_AFTER_DAYS = 7;

/** Colour for the waiting time. Always paired with text and, when late, an icon — never colour alone. */
const ageColour = (days: number | null): string => {
    if (days === null) return neutral[400];
    if (days > OVERDUE_AFTER_DAYS) return status.danger.strong;
    if (days > STALE_AFTER_DAYS) return status.warning.strong;
    return neutral[700];
};

/** "Today" / "1 day" / "12 days" — a bare "0d" reads as missing data rather than as fresh. */
const ageLabel = (days: number | null): string => {
    if (days === null) return 'Unknown';
    if (days === 0) return 'Today';
    return `${days} ${days === 1 ? 'day' : 'days'}`;
};

const PRIORITY_DOTS: Record<string, string> = {
    high: status.danger.main,
    medium: status.warning.main,
    low: neutral[400],
};

const priorityColour = (priority?: string): string =>
    PRIORITY_DOTS[(priority || '').toLowerCase()] ?? neutral[300];

const personName = (person?: { firstName?: string; lastName?: string } | null): string => {
    const name = [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim();
    return name || 'Unassigned';
};

const initials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0 || name === 'Unassigned') return '?';
    return parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
};

const HEADERS: Array<{ label: string; align?: 'left' | 'right' }> = [
    { label: 'Request' },
    { label: 'Requester' },
    { label: 'Waiting' },
    { label: 'Priority' },
    { label: 'With' },
    { label: '', align: 'right' },
];

const cellSx = {
    borderBottom: `1px solid ${border.subtle}`,
    py: 1.5,
};

/**
 * Open requests, oldest first.
 *
 * Sorted by age rather than by id, because the queue's job is to surface what has been waiting
 * longest — that is the thing an approver needs to see first, and it was previously buried in
 * whatever order the API returned.
 *
 * Layout notes, since a dashboard table earns its space differently from a full listing page:
 *
 *   - "Submitted" and "Age" were two columns showing one fact — the second was derived from the
 *     first. They are now one "Waiting" column with the elapsed time as the headline and the
 *     submission date beneath it, which is the reading order an approver actually uses.
 *   - Every row carried two filled chips (age and priority). At eight rows that is sixteen
 *     saturated blocks competing for attention, so nothing stood out. Priority is now a dot plus
 *     a label, and waiting time is coloured text; the only chip left is the overdue count in the
 *     header, which is the one thing that should shout.
 *   - The row itself is the click target, with a chevron as the affordance. Previously the only
 *     way in was a small icon button at the right edge.
 *   - A left accent bar marks rows past the stale threshold, so the queue can be triaged by
 *     scanning down the edge rather than reading every age.
 */
const WorkQueue = ({ requests, limit = 8 }: IWorkQueueProps) => {
    const { data, loading, failed, reload } = requests;
    const navigate = useNavigate();

    const rows = useMemo(() => {
        const withAge = data.map((request) => ({ request, days: ageInDays(request.createDate) }));
        return withAge.sort((a, b) => (b.days ?? -1) - (a.days ?? -1));
    }, [data]);

    const staleCount = rows.filter((row) => (row.days ?? 0) > STALE_AFTER_DAYS).length;
    const shown = rows.slice(0, limit);

    const openRequest = (id?: string | number) => {
        if (id !== undefined && id !== null) navigate(`${ROUTES.READ_REQUEST}/${id}`);
    };

    return (
        <WidgetCard
            title="Awaiting My Decision"
            subtitle={`${rows.length} ${rows.length === 1 ? 'request' : 'requests'} waiting on you`}
            icon={<PendingActionsOutlinedIcon />}
            helpText={`Requests the workflow has routed to you — assigned to you personally, or to a unit you belong to. Oldest first. Anything older than ${STALE_AFTER_DAYS} days is flagged; past ${OVERDUE_AFTER_DAYS} days it is marked overdue. A request leaves this list as soon as you act on it.`}
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={rows.length === 0}
            emptyTitle="Nothing waiting on you"
            emptyDescription="Requests routed to you for a decision will appear here."
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
            {/* Bleeds to the card edges so the table reads as a full-width band rather than a
                boxed-in element, which is what makes a dashboard table look inset and cramped. */}
            <Box sx={{ overflowX: 'auto', mx: -2.5 }}>
                <Table size="small" sx={{ minWidth: 820 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: surface.muted }}>
                            {HEADERS.map(({ label, align }, index) => (
                                <TableCell
                                    key={label || `actions-${index}`}
                                    align={align ?? 'left'}
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '0.66rem',
                                        color: neutral[500],
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.07em',
                                        whiteSpace: 'nowrap',
                                        borderBottom: `1px solid ${border.subtle}`,
                                        borderTop: `1px solid ${border.subtle}`,
                                        py: 1.15,
                                        // Keeps the first and last columns off the card edge without
                                        // giving up the full-bleed background. The transparent
                                        // 3px border matches the body rows' accent gutter, so the
                                        // header label sits over its column rather than 3px left
                                        // of it.
                                        ...(index === 0 ? { pl: 2.5, borderLeft: '3px solid transparent' } : {}),
                                        ...(index === HEADERS.length - 1 ? { pr: 2.5 } : {}),
                                    }}
                                >
                                    {label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {shown.map(({ request, days }) => {
                            const requester = personName(request.requester ?? request.createdBy);
                            const isStale = (days ?? 0) > STALE_AFTER_DAYS;
                            const accent = days === null || !isStale
                                ? 'transparent'
                                : ageColour(days);

                            return (
                                <TableRow
                                    key={request.id}
                                    hover
                                    onClick={() => openRequest(request.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'background-color 120ms',
                                        '&:hover .wq-chevron': { color: brand[600], transform: 'translateX(2px)' },
                                        '&:last-child td': { borderBottom: 'none' },
                                    }}
                                >
                                    <TableCell
                                        sx={{
                                            ...cellSx,
                                            pl: 2.5,
                                            // Always 3px, transparent when the row is not flagged,
                                            // so flagging a row tints the gutter instead of
                                            // shifting its text sideways.
                                            borderLeft: `3px solid ${accent}`,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 600, color: neutral[900], maxWidth: 240 }}
                                            noWrap
                                            title={request.name || 'Untitled request'}
                                        >
                                            {request.name || 'Untitled request'}
                                        </Typography>
                                        {request.assetType?.name && (
                                            <Typography variant="caption" sx={{ color: neutral[500] }}>
                                                {request.assetType.name}
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell sx={cellSx}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Box
                                                sx={{
                                                    width: 26,
                                                    height: 26,
                                                    flexShrink: 0,
                                                    borderRadius: '50%',
                                                    bgcolor: alpha(brand[500], 0.1),
                                                    color: brand[700],
                                                    fontSize: '0.66rem',
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {initials(requester)}
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: neutral[700], maxWidth: 150 }}
                                                noWrap
                                                title={requester}
                                            >
                                                {requester}
                                            </Typography>
                                        </Stack>
                                    </TableCell>

                                    <TableCell sx={{ ...cellSx, whiteSpace: 'nowrap' }}>
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            {isStale && (
                                                <WarningAmberIcon sx={{ fontSize: 14, color: ageColour(days) }} />
                                            )}
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 700, color: ageColour(days) }}
                                            >
                                                {ageLabel(days)}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                                            {request.createDate
                                                ? new Date(request.createDate).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })
                                                : '—'}
                                        </Typography>
                                    </TableCell>

                                    <TableCell sx={{ ...cellSx, whiteSpace: 'nowrap' }}>
                                        <Stack direction="row" alignItems="center" spacing={0.75}>
                                            <Box
                                                sx={{
                                                    width: 7,
                                                    height: 7,
                                                    borderRadius: '50%',
                                                    flexShrink: 0,
                                                    bgcolor: priorityColour(request.priority),
                                                }}
                                            />
                                            <Typography
                                                variant="body2"
                                                sx={{ color: neutral[700], textTransform: 'capitalize' }}
                                            >
                                                {request.priority || 'Normal'}
                                            </Typography>
                                        </Stack>
                                    </TableCell>

                                    <TableCell sx={cellSx}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                // Greyed and italic only when nobody genuinely has it.
                                                // A unit-routed step has a real holder, so it reads as
                                                // ordinary text like a named approver does.
                                                color: requestApproverLabel(request) ? neutral[700] : neutral[400],
                                                fontStyle: requestApproverLabel(request) ? 'normal' : 'italic',
                                                maxWidth: 150,
                                            }}
                                            noWrap
                                            title={requestApproverLabel(request) ?? personName(null)}
                                        >
                                            {requestApproverLabel(request) ?? personName(null)}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="right" sx={{ ...cellSx, pr: 2.5, width: 44 }}>
                                        <Tooltip title="Open request" arrow>
                                            <ChevronRightIcon
                                                className="wq-chevron"
                                                sx={{
                                                    fontSize: 20,
                                                    color: neutral[400],
                                                    verticalAlign: 'middle',
                                                    transition: 'color 120ms, transform 120ms',
                                                }}
                                            />
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>

            {/* Outside the scroll container on purpose — as a child of it this slid out of view
                whenever the table was scrolled sideways. */}
            {rows.length > shown.length && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        mx: -2.5,
                        mb: -2.5,
                        px: 2.5,
                        py: 1.25,
                        borderTop: `1px solid ${border.subtle}`,
                        bgcolor: surface.muted,
                    }}
                >
                    <Typography variant="caption" sx={{ color: neutral[500] }}>
                        Showing the {shown.length} oldest of {rows.length}
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => navigate(ROUTES.LIST_PENDING)}
                        endIcon={<ChevronRightIcon />}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                    >
                        See the rest
                    </Button>
                </Stack>
            )}
        </WidgetCard>
    );
};

export default WorkQueue;
