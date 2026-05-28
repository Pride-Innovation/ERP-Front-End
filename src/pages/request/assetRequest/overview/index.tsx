/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    alpha,
    Box,
    Card,
    Chip,
    Grid,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip as ChartTooltip,
    Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import CountUp from 'react-countup';
import { fetchRowsService } from '../../../../core/apis/globalService';
import { IRequest, IRequestsAxiosResponse } from '../../interface';
import { workflowApprovalStatusIds, workflowApprovalStatusIdsCsv } from '../../../../utils/constants';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import FiberNewOutlinedIcon from '@mui/icons-material/FiberNewOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import moment from 'moment';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

const PRIMARY = '#08796C';

/* ── Small animated KPI card ──────────────────────────────────────────── */
const KpiCard = ({ label, value, icon, color, sub, loading }: {
    label: string; value: number; icon: React.ReactNode;
    color: string; sub: string; loading: boolean;
}) => (
    <Card elevation={0} sx={{
        border: '1px solid #EEF2F7', borderRadius: 2, p: 2.5, height: '100%',
        position: 'relative', overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: `0 6px 24px ${alpha(color, 0.15)}`, transform: 'translateY(-2px)' },
    }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: color, borderRadius: '2px 0 0 2px' }} />
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                    {label}
                </Typography>
                {loading ? (
                    <Skeleton width={56} height={38} />
                ) : (
                    <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                        <CountUp end={value} duration={1.4} />
                    </Typography>
                )}
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', mt: 0.5 }}>{sub}</Typography>
            </Box>
            <Box sx={{
                width: 42, height: 42, borderRadius: 1.5, bgcolor: alpha(color, 0.10),
                color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                {icon}
            </Box>
        </Stack>
    </Card>
);

/* ── Pipeline step ────────────────────────────────────────────────────── */
const PipelineStep = ({
    icon, label, count, color, pct, loading, last = false,
}: {
    icon: React.ReactNode; label: string; count: number;
    color: string; pct: number; loading: boolean; last?: boolean;
}) => (
    <Stack direction="row" alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{
                p: 2, borderRadius: 2, border: `1px solid ${alpha(color, 0.25)}`,
                bgcolor: alpha(color, 0.05), textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
                {/* Fill bar at bottom */}
                <Box sx={{
                    position: 'absolute', bottom: 0, left: 0, width: `${pct}%`, height: 3,
                    bgcolor: color, borderRadius: '0 2px 2px 0', transition: 'width 1s ease',
                }} />
                <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
                {loading ? (
                    <Skeleton width={40} height={28} sx={{ mx: 'auto' }} />
                ) : (
                    <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                        <CountUp end={count} duration={1.2} />
                    </Typography>
                )}
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color, mt: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mt: 0.25 }}>
                    {loading ? '–' : `${pct}%`}
                </Typography>
            </Box>
        </Box>
        {!last && (
            <Box sx={{ px: 0.75, color: '#CBD5E1', flexShrink: 0 }}>
                <ArrowForwardOutlinedIcon fontSize="small" />
            </Box>
        )}
    </Stack>
);

/* ── Helpers ──────────────────────────────────────────────────────────── */
const priorityDot = (p: string) => {
    const lp = p?.toLowerCase() ?? '';
    return lp === 'high' ? '#DC2626' : lp === 'medium' ? '#D97706' : '#64748B';
};

const statusBadge = (s?: string): { bg: string; text: string; label: string } => {
    const v = (s || '').toLowerCase();
    if (v.includes('reject')) return { bg: alpha('#DC2626', 0.09), text: '#DC2626', label: 'Rejected' };
    if (v.includes('issued') || v.includes('fulfilled') || v.includes('approved') || v.includes('acknowledged'))
        return { bg: alpha('#15803D', 0.09), text: '#15803D', label: s || 'Fulfilled' };
    if (v.includes('pending')) return { bg: alpha('#D97706', 0.09), text: '#D97706', label: 'Pending' };
    return { bg: alpha(PRIMARY, 0.09), text: PRIMARY, label: s || 'Created' };
};

const LegendPill = ({ color, label, count }: { color: string; label: string; count: number }) => (
    <Stack direction="row" alignItems="center" gap={0.75}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.76rem', color: '#475569' }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#0F172A' }}>{count}</Typography>
    </Stack>
);

/* ── Main component ───────────────────────────────────────────────────── */
const RequestOverview = () => {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<IRequest[]>([]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetchRowsService({
                    pageNumber: 0,
                    pageSize: 100,
                    endPoint: 'requests',
                    params: { statusIds: `1,2,3,4,5,6,7,${workflowApprovalStatusIdsCsv}` },
                }) as IRequestsAxiosResponse;
                if (res.status === 200) {
                    setRequests(res.data.content || []);
                }
            } catch (_) { /* silent */ }
            setLoading(false);
        })();
    }, []);

    /* ── Derived counts ─────────────────────────────────────────────── */
    const total = requests.length;
    const created = requests.filter(r => Number(r.status?.id) === 1).length;
    const rejected = requests.filter(r => Number(r.status?.id) === 2).length;
    const pending = requests.filter(r => [3, 4, ...workflowApprovalStatusIds].includes(Number(r.status?.id))).length;
    const issued = requests.filter(r => [5, 6, 7].includes(Number(r.status?.id))).length;

    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

    /* ── Priority counts ─────────────────────────────────────────────── */
    const high = requests.filter(r => r.priority?.toLowerCase() === 'high').length;
    const medium = requests.filter(r => r.priority?.toLowerCase() === 'medium').length;
    const low = requests.filter(r => !['high', 'medium'].includes(r.priority?.toLowerCase() ?? '')).length;

    /* ── Doughnut chart data ─────────────────────────────────────────── */
    const donutData = {
        labels: ['Created', 'Pending', 'Rejected', 'Issued'],
        datasets: [{
            data: [created, pending, rejected, issued],
            backgroundColor: [PRIMARY, '#D97706', '#DC2626', '#15803D'],
            borderColor: ['#fff', '#fff', '#fff', '#fff'],
            borderWidth: 3,
            hoverOffset: 6,
        }],
    };
    const donutOptions = {
        cutout: '70%',
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} (${pct(ctx.parsed)}%)` } },
        },
        maintainAspectRatio: false,
    } as any;

    /* ── Bar chart ───────────────────────────────────────────────────── */
    const barData = {
        labels: ['High', 'Medium', 'Low / Normal'],
        datasets: [{
            label: 'Requests',
            data: [high, medium, low],
            backgroundColor: [alpha('#DC2626', 0.75), alpha('#D97706', 0.75), alpha('#64748B', 0.75)],
            borderRadius: 6,
            borderSkipped: false,
        }],
    };
    const barOptions = {
        indexAxis: 'y' as const,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 } } },
            y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 } } },
        },
        maintainAspectRatio: false,
    };

    /* ── Recent 6 requests as activity feed ─────────────────────────── */
    const recent = [...requests]
        .sort((a, b) => new Date(b.createDate ?? 0).getTime() - new Date(a.createDate ?? 0).getTime())
        .slice(0, 6);

    return (
        <Box>

            {/* ── Row 1: KPI Cards ─────────────────────────────────────── */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {([
                    { label: 'Total Requests', value: total, icon: <InboxOutlinedIcon />, color: PRIMARY, sub: 'All status combined' },
                    { label: 'New / Created', value: created, icon: <FiberNewOutlinedIcon />, color: '#0369A1', sub: 'Awaiting review' },
                    { label: 'Pending Approval', value: pending, icon: <HourglassEmptyOutlinedIcon />, color: '#D97706', sub: 'In approval process' },
                    { label: 'Issued / Fulfilled', value: issued, icon: <MoveToInboxOutlinedIcon />, color: '#15803D', sub: 'Completed requests' },
                    { label: 'Rejected', value: rejected, icon: <BlockOutlinedIcon />, color: '#DC2626', sub: 'Declined requests' },
                ] as { label: string; value: number; icon: React.ReactNode; color: string; sub: string }[]).map(card => (
                    <Grid item xs={12} sm={6} md key={card.label}>
                        <KpiCard {...card} loading={loading} />
                    </Grid>
                ))}
            </Grid>

            {/* ── Row 2: Pipeline ──────────────────────────────────────── */}
            <Card elevation={0} sx={{ border: '1px solid #EEF2F7', borderRadius: 2, p: 2.5, mb: 2.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2 }}>
                    Request Lifecycle Pipeline
                </Typography>
                <Stack direction="row" alignItems="stretch">
                    <PipelineStep icon={<FiberNewOutlinedIcon />} label="Created" count={created} color="#0369A1" pct={pct(created)} loading={loading} />
                    <PipelineStep icon={<HourglassEmptyOutlinedIcon />} label="Pending" count={pending} color="#D97706" pct={pct(pending)} loading={loading} />
                    <PipelineStep icon={<CheckCircleOutlinedIcon />} label="Issued" count={issued} color="#15803D" pct={pct(issued)} loading={loading} />
                    <PipelineStep icon={<BlockOutlinedIcon />} label="Rejected" count={rejected} color="#DC2626" pct={pct(rejected)} loading={loading} last />
                </Stack>
            </Card>

            {/* ── Row 3: Donut + Bar + Activity ────────────────────────── */}
            <Grid container spacing={2}>

                {/* Status doughnut */}
                <Grid item xs={12} md={4}>
                    <Card elevation={0} sx={{ border: '1px solid #EEF2F7', borderRadius: 2, p: 2.5, height: '100%' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2 }}>
                            Status Distribution
                        </Typography>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                                <Skeleton variant="circular" width={160} height={160} />
                            </Box>
                        ) : total === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
                                <InboxOutlinedIcon sx={{ fontSize: 40, mb: 1 }} />
                                <Typography variant="body2">No data yet</Typography>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ position: 'relative', height: 180 }}>
                                    <Doughnut data={donutData} options={donutOptions} />
                                    <Box sx={{
                                        position: 'absolute', top: '50%', left: '50%',
                                        transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none',
                                    }}>
                                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                                            {total}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                                            Total
                                        </Typography>
                                    </Box>
                                </Box>
                                <Stack direction="row" flexWrap="wrap" gap={1.25} sx={{ mt: 2 }}>
                                    <LegendPill color={PRIMARY} label="Created" count={created} />
                                    <LegendPill color="#D97706" label="Pending" count={pending} />
                                    <LegendPill color="#DC2626" label="Rejected" count={rejected} />
                                    <LegendPill color="#15803D" label="Issued" count={issued} />
                                </Stack>
                            </>
                        )}
                    </Card>
                </Grid>

                {/* Priority bar + rate pills */}
                <Grid item xs={12} md={3}>
                    <Card elevation={0} sx={{ border: '1px solid #EEF2F7', borderRadius: 2, p: 2.5, height: '100%' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2 }}>
                            Requests by Priority
                        </Typography>
                        {loading ? (
                            <Stack gap={1.5}>
                                {[...Array(3)].map((_, i) => <Skeleton key={i} height={28} sx={{ borderRadius: 1 }} />)}
                            </Stack>
                        ) : total === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
                                <Typography variant="body2">No data yet</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ height: 160 }}>
                                <Bar data={barData} options={barOptions} />
                            </Box>
                        )}
                        {!loading && total > 0 && (
                            <Stack gap={1} sx={{ mt: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center"
                                    sx={{ px: 1.5, py: 0.75, borderRadius: 1.5, bgcolor: alpha('#15803D', 0.07) }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#475569' }}>Fulfilment rate</Typography>
                                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803D' }}>{pct(issued)}%</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center"
                                    sx={{ px: 1.5, py: 0.75, borderRadius: 1.5, bgcolor: alpha('#DC2626', 0.07) }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#475569' }}>Rejection rate</Typography>
                                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#DC2626' }}>{pct(rejected)}%</Typography>
                                </Stack>
                            </Stack>
                        )}
                    </Card>
                </Grid>

                {/* Activity timeline feed */}
                <Grid item xs={12} md={5}>
                    <Card elevation={0} sx={{ border: '1px solid #EEF2F7', borderRadius: 2, p: 2.5, height: '100%' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2 }}>
                            Recent Activity
                        </Typography>

                        {loading ? (
                            <Stack gap={1.5}>
                                {[...Array(5)].map((_, i) => (
                                    <Stack key={i} direction="row" gap={1.5} alignItems="flex-start">
                                        <Skeleton variant="circular" width={32} height={32} sx={{ flexShrink: 0 }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton width="70%" height={16} />
                                            <Skeleton width="45%" height={13} />
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        ) : recent.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
                                <InboxOutlinedIcon sx={{ fontSize: 36, mb: 1 }} />
                                <Typography variant="body2">No recent activity</Typography>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {recent.map((req, idx) => {
                                    const badge = statusBadge(req.status?.status || req.status?.name);
                                    const isLast = idx === recent.length - 1;
                                    return (
                                        <Stack
                                            key={req.id}
                                            direction="row"
                                            gap={1.5}
                                            alignItems="flex-start"
                                            sx={{ pb: isLast ? 0 : 1.75, position: 'relative' }}
                                        >
                                            {/* Timeline connector */}
                                            {!isLast && (
                                                <Box sx={{
                                                    position: 'absolute', left: 15, top: 32,
                                                    width: 1, height: 'calc(100% - 12px)',
                                                    bgcolor: '#EEF2F7', zIndex: 0,
                                                }} />
                                            )}
                                            {/* Avatar dot */}
                                            <Box sx={{
                                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                                bgcolor: alpha(badge.text, 0.12), color: badge.text,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                zIndex: 1, border: `2px solid ${alpha(badge.text, 0.25)}`,
                                                fontSize: 14, fontWeight: 700,
                                            }}>
                                                {(req.requester?.firstName?.[0] ?? '?').toUpperCase()}
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Typography fontWeight={600} noWrap sx={{ fontSize: '0.82rem', color: '#0F172A', maxWidth: '60%' }}>
                                                        {req.name}
                                                    </Typography>
                                                    <Box sx={{
                                                        px: 0.9, py: 0.2, borderRadius: 10,
                                                        bgcolor: badge.bg, color: badge.text,
                                                        fontSize: '0.67rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                                                    }}>
                                                        {badge.label}
                                                    </Box>
                                                </Stack>
                                                <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: 0.25, flexWrap: 'wrap' }}>
                                                    <Stack direction="row" alignItems="center" gap={0.4}>
                                                        <PersonOutlinedIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                                                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                                                            {req.requester?.firstName} {req.requester?.lastName}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" alignItems="center" gap={0.4}>
                                                        <ScheduleOutlinedIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                                                        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                                            {moment(req.createDate).fromNow()}
                                                        </Typography>
                                                    </Stack>
                                                    <Tooltip title={`Priority: ${req.priority}`}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: priorityDot(req.priority ?? ''), flexShrink: 0 }} />
                                                    </Tooltip>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        )}
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RequestOverview;
