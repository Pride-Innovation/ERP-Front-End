/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../core/routes/routes';
import { neutral, border, brand, status as statusTokens } from '../../../utils/tokens';
import { IAuditTrail } from '../../trails/interface';
import { IAsyncData } from '../useDashboardData';
import WidgetCard from './WidgetCard';

interface IRecentActivityProps {
    events: IAsyncData<IAuditTrail[]>;
    limit?: number;
}

/**
 * The last things that happened, drawn from the audit trail.
 *
 * <p>Fills the Records band, which was declared in the registry with no widgets in it and so never
 * rendered — a heading the page promised and never showed.
 *
 * <p>It reads the activity log rather than any one module's listing, because "the underlying items"
 * cuts across all of them: an asset assigned, a movement dispatched, a request approved and a stock
 * receipt are the same kind of fact to someone scanning what has changed. The trail already records
 * every one of those with an actor and a timestamp, so this needs no new endpoint.
 *
 * <p>Severity is the only thing carrying colour: a flagged event should stand out from routine
 * bookkeeping, and everything else is identified by its text.
 */

const toneFor = (severity: string): string => {
    if (severity === 'critical') return statusTokens.danger.main;
    if (severity === 'warning') return statusTokens.warning.main;
    return neutral[300];
};

const timeAgo = (value?: string): string => {
    if (!value) return '';
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return '';
    const minutes = Math.floor((Date.now() - then) / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'yesterday' : `${days}d ago`;
};

const RecentActivity = ({ events, limit = 8 }: IRecentActivityProps) => {
    const { data, loading, failed, reload } = events;
    const navigate = useNavigate();

    const rows = useMemo(() => data.slice(0, limit), [data, limit]);

    return (
        <WidgetCard
            title="Recent Activity"
            subtitle="The latest recorded changes"
            icon={<HistoryOutlinedIcon />}
            helpText="Drawn from the audit trail: assets assigned, movements dispatched, requests decided, stock received. Flagged entries are coloured; everything else is routine."
            loading={loading}
            failed={failed}
            onRetry={reload}
            empty={rows.length === 0}
            emptyTitle="Nothing recorded yet"
            emptyDescription="Activity appears here as people work in the system."
            actions={
                <Button
                    size="small"
                    onClick={() => navigate(ROUTES.AUDIT_TRAILS)}
                    sx={{
                        textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                        color: brand[600], minWidth: 0, px: 1,
                        '&:hover': { bgcolor: alpha(brand[500], 0.06) },
                    }}
                >
                    View all
                </Button>
            }
        >
            <Stack divider={<Box sx={{ height: '1px', bgcolor: border.subtle }} />}>
                {rows.map((event) => (
                    <Stack
                        key={event.id}
                        direction="row"
                        alignItems="flex-start"
                        spacing={1.5}
                        sx={{ py: 1.25 }}
                    >
                        {/* A rail rather than a filled chip: eight saturated blocks would compete
                            with each other and nothing would stand out. */}
                        <Box
                            sx={{
                                width: 3,
                                alignSelf: 'stretch',
                                borderRadius: 999,
                                bgcolor: toneFor(event.severity),
                                flexShrink: 0,
                            }}
                        />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: '0.82rem',
                                    color: neutral[800],
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                                title={event.description}
                            >
                                {event.description}
                            </Typography>
                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                                <Typography sx={{ fontSize: '0.7rem', color: neutral[500] }}>
                                    {event.actor || 'System'}
                                </Typography>
                                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: neutral[300] }} />
                                <Typography sx={{ fontSize: '0.7rem', color: neutral[400] }}>
                                    {event.module}
                                </Typography>
                            </Stack>
                        </Box>
                        <Typography
                            sx={{
                                fontSize: '0.7rem',
                                color: neutral[400],
                                whiteSpace: 'nowrap',
                                bgcolor: alpha(neutral[300], 0.18),
                                px: 0.75,
                                py: 0.25,
                                borderRadius: '6px',
                                flexShrink: 0,
                            }}
                        >
                            {timeAgo(event.timeStamp)}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </WidgetCard>
    );
};

export default RecentActivity;
