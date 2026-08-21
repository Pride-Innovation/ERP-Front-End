/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { useNavigate } from 'react-router-dom';
import { border, brand, neutral, status as statusTokens, surface } from '../../../utils/tokens';
import { StatusChip } from '../../../components/layout';
import { StatusTone } from '../../../components/layout/StatusChip';
import { ROUTES } from '../../../core/routes/routes';
import { ISSUED_REQUEST_CODES, PENDING_REQUEST_CODES } from '../../../utils/constants';
import { camelCaseToWords } from '../../../utils/helpers';
import { IRequest } from '../../request/interface';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';

interface IMyRequestsProps {
    requests: IAsyncData<IRequest[]>;
    /** Signed-in user's id — used to pick their own requests out of the open queue. */
    currentUserId: number | string | null;
    /** Max rows before the footer takes over. Keeps the card in step with "My Assets" beside it. */
    limit?: number;
}

/**
 * The four things that happen to a request, in order.
 *
 * Derived from the seeded status codes rather than from their display names: codes are stable
 * across re-seeds, names are editable in Settings. The previous implementation matched substrings
 * against the name — `.includes('approv')` — which mapped "Supervisor Approved" to *success*, so
 * a request that had merely cleared its first approval stage looked finished to the person
 * waiting on it. That is precisely the question this widget exists to answer, so it has to be
 * right.
 */
const STAGES = ['Submitted', 'In approval', 'Issued', 'Received'] as const;

interface IStage {
    /** Index into STAGES, or -1 when the request was rejected. */
    index: number;
    rejected: boolean;
}

const stageOf = (code?: string | null): IStage => {
    const value = code || '';
    if (value === 'requestRejected') return { index: -1, rejected: true };
    if (value === 'receiptAcknowledged') return { index: 3, rejected: false };
    if (ISSUED_REQUEST_CODES.includes(value)) return { index: 2, rejected: false };
    if (PENDING_REQUEST_CODES.includes(value)) return { index: 1, rejected: false };
    return { index: 0, rejected: false };
};

const stageTone = (stage: IStage): StatusTone => {
    if (stage.rejected) return 'danger';
    if (stage.index >= 3) return 'success';
    if (stage.index >= 1) return 'pending';
    return 'info';
};

/** Whole days since submission. Returns null when there is no usable date. */
const ageInDays = (value?: string | null): number | null => {
    if (!value) return null;
    const raised = new Date(value).getTime();
    if (Number.isNaN(raised)) return null;
    return Math.max(Math.floor((Date.now() - raised) / 86_400_000), 0);
};

const waitingLabel = (days: number | null): string => {
    if (days === null) return '';
    if (days === 0) return 'raised today';
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
};

const personName = (person?: { firstName?: string; lastName?: string } | null): string =>
    [person?.firstName, person?.lastName].filter(Boolean).join(' ').trim();

/** Prefers the backend's human label, falling back to a de-camel-cased code. Never shows a raw code. */
const statusLabel = (request: IRequest): string =>
    request.status?.name
    || (request.status?.status ? camelCaseToWords(request.status.status) : 'Open');

/**
 * The signed-in user's own open requests, and — critically — how far each one has got.
 *
 * "Where has my request got to" is the single most common question this dashboard should
 * answer for an ordinary member of staff, and nothing on the previous personal dashboard
 * answered it: it listed requests without ever naming the current approver.
 *
 * Each row now carries a four-segment progress track (Submitted → In approval → Issued →
 * Received). A status chip alone said *what state* a request was in but not *how much is left*,
 * which is the actual question — and with twenty-odd seeded statuses, the chip's label often
 * meant nothing to the person reading it. The track is filled from the same status code the chip
 * is derived from, so the two can never disagree.
 *
 * Filtered client-side from the open queue because there is no "my requests" endpoint yet;
 * when one lands this switches to it without changing the component.
 */
const MyRequests = ({ requests, currentUserId, limit = 5 }: IMyRequestsProps) => {
    const { data, loading, failed, reload } = requests;
    const navigate = useNavigate();

    const mine = useMemo(() => {
        if (currentUserId == null) return [];
        const asString = String(currentUserId);
        return data
            .filter((request) => {
                const requesterId = request.requester?.id ?? request.createdBy;
                return requesterId != null && String(requesterId) === asString;
            })
            // Longest-waiting first — the one most likely to need chasing is the one to show.
            .map((request) => ({ request, days: ageInDays(request.createDate) }))
            .sort((a, b) => (b.days ?? -1) - (a.days ?? -1));
    }, [data, currentUserId]);

    const shown = mine.slice(0, limit);

    return (
        <WidgetCard
            title="My Open Requests"
            subtitle={`${mine.length} ${mine.length === 1 ? 'request' : 'requests'} in progress`}
            icon={<ReceiptLongOutlinedIcon />}
            helpText="Requests you raised that have not reached you yet. One stays here through every approval step, through issuance, and while the item is in transit — it leaves only when you acknowledge receiving it."
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={mine.length === 0}
            emptyTitle="No open requests"
            emptyDescription="Requests you raise stay here until the item reaches you."
            actions={
                <Button
                    size="small"
                    onClick={() => navigate(ROUTES.REQUEST)}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}
                >
                    All requests
                </Button>
            }
        >
            <Stack divider={<Box sx={{ borderBottom: `1px solid ${border.subtle}` }} />}>
                {shown.map(({ request, days }) => {
                    const approver = personName(request.currentApprover);
                    const stage = stageOf(request.status?.status);
                    const trackColour = stage.rejected ? statusTokens.danger.main : brand[500];

                    return (
                        <Box
                            key={request.id}
                            onClick={() => navigate(`${ROUTES.READ_REQUEST}/${request.id}`)}
                            sx={{
                                py: 1.5,
                                px: 1,
                                mx: -1,
                                borderRadius: 1,
                                cursor: 'pointer',
                                transition: 'background-color 120ms',
                                '&:hover': { bgcolor: surface.muted },
                                '&:hover .mr-chevron': { color: brand[600], transform: 'translateX(2px)' },
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1.25}>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, color: neutral[900], minWidth: 0, flexGrow: 1 }}
                                    noWrap
                                    title={request.name || 'Untitled request'}
                                >
                                    {request.name || 'Untitled request'}
                                </Typography>
                                <StatusChip
                                    label={statusLabel(request)}
                                    tone={stageTone(stage)}
                                    icon={stage.rejected ? <BlockOutlinedIcon sx={{ fontSize: 13 }} /> : undefined}
                                />
                                <ChevronRightIcon
                                    className="mr-chevron"
                                    sx={{
                                        fontSize: 18,
                                        color: neutral[400],
                                        flexShrink: 0,
                                        transition: 'color 120ms, transform 120ms',
                                    }}
                                />
                            </Stack>

                            {/* Progress track. Four segments rather than a continuous bar, because
                                the stages are discrete and countable — a reader should be able to
                                see "two of four done" without reading a percentage. */}
                            <Tooltip
                                arrow
                                placement="top"
                                title={
                                    stage.rejected
                                        ? 'This request was rejected and did not progress.'
                                        : `${STAGES[stage.index]} — stage ${stage.index + 1} of ${STAGES.length}`
                                }
                            >
                                <Stack direction="row" spacing={0.5} sx={{ mt: 1, mb: 0.75, cursor: 'default' }}>
                                    {STAGES.map((stageName, index) => {
                                        // A rejected request reached "Submitted" and stopped, so
                                        // only the first segment fills — the track shows where it
                                        // got to, not how far it would have gone.
                                        const filled = stage.rejected
                                            ? index === 0
                                            : index <= stage.index;
                                        return (
                                            <Box
                                                key={stageName}
                                                sx={{
                                                    height: 4,
                                                    flexGrow: 1,
                                                    borderRadius: 999,
                                                    bgcolor: filled ? trackColour : neutral[200],
                                                }}
                                            />
                                        );
                                    })}
                                </Stack>
                            </Tooltip>

                            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="caption"
                                    sx={{ color: neutral[600], minWidth: 0, flexGrow: 1 }}
                                    noWrap
                                >
                                    {stage.rejected
                                        ? 'Rejected — open it to read the reason'
                                        : approver
                                            ? `Waiting on ${approver}`
                                            : 'Not yet assigned to an approver'}
                                </Typography>
                                {days !== null && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: (days > 7 && !stage.rejected) ? statusTokens.warning.strong : neutral[500],
                                            fontWeight: (days > 7 && !stage.rejected) ? 700 : 400,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {waitingLabel(days)}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    );
                })}
            </Stack>

            {mine.length > shown.length && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        mx: -2.5,
                        mb: -2.5,
                        mt: 'auto',
                        px: 2.5,
                        py: 1.25,
                        borderTop: `1px solid ${border.subtle}`,
                        bgcolor: surface.muted,
                    }}
                >
                    <Typography variant="caption" sx={{ color: neutral[500] }}>
                        Showing {shown.length} of {mine.length}
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => navigate(ROUTES.REQUEST)}
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

export default MyRequests;
