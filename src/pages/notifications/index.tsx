/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { formatDistanceToNow } from 'date-fns';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import { PageHero, StatTile, EmptyState } from '../../components/layout';
import { brand, neutral, border } from '../../utils/tokens';
import { useNotifications } from '../../context/notification/NotificationContext';
import {
    IAppNotification,
    fetchNotifications,
    markRead,
} from '../../context/notification/service';

const PRIMARY = brand[500];
/** Server window fetched once; filtering + pagination happen client-side over it. */
const FETCH_WINDOW = 200;
const PAGE_SIZE = 15;

type ReadFilter = 'all' | 'unread' | 'read';
type TypeFilter = 'all' | 'STEP_PENDING' | 'STEP_REJECTED' | 'WORKFLOW_COMPLETED' | 'OTHER';
const KNOWN_TYPES = ['STEP_PENDING', 'STEP_REJECTED', 'WORKFLOW_COMPLETED'];

const TYPE_LABELS: Record<TypeFilter, string> = {
    all: 'All types',
    STEP_PENDING: 'Action required',
    STEP_REJECTED: 'Rejections',
    WORKFLOW_COMPLETED: 'Completed',
    OTHER: 'Other',
};

const typeIcon = (type: string) => {
    switch (type) {
        case 'STEP_REJECTED':
            return <CancelOutlinedIcon sx={{ color: '#C53030', fontSize: 18 }} />;
        case 'STEP_PENDING':
            return <AssignmentOutlinedIcon sx={{ color: '#BC892C', fontSize: 18 }} />;
        case 'WORKFLOW_COMPLETED':
            return <CheckCircleOutlineIcon sx={{ color: PRIMARY, fontSize: 18 }} />;
        default:
            return <InfoOutlinedIcon sx={{ color: PRIMARY, fontSize: 18 }} />;
    }
};

// ── Filter panel (same idiom as the Reports / Movements filter panels) ──────

interface NotificationFilterValues {
    dateFrom?: string;
    dateTo?: string;
    readStatus?: ReadFilter;
    type?: TypeFilter;
}

const DATE_PRESETS = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'This Year', value: 'year' },
    { label: 'Custom', value: 'custom' },
];

const getDateRange = (preset: string): { from: string; to: string } => {
    const now = dayjs();
    switch (preset) {
        case 'today': return { from: now.startOf('day').toISOString(), to: now.endOf('day').toISOString() };
        case 'week': return { from: now.startOf('week').toISOString(), to: now.endOf('week').toISOString() };
        case 'month': return { from: now.startOf('month').toISOString(), to: now.endOf('month').toISOString() };
        case 'quarter': {
            const month = now.month();
            const quarterStart = now.month(Math.floor(month / 3) * 3).startOf('month');
            const quarterEnd = quarterStart.add(2, 'month').endOf('month');
            return { from: quarterStart.toISOString(), to: quarterEnd.toISOString() };
        }
        case 'year': return { from: now.startOf('year').toISOString(), to: now.endOf('year').toISOString() };
        default: return { from: '', to: '' };
    }
};

const PILL_INPUT_SX = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        bgcolor: '#fff',
        fontSize: '0.8rem',
        height: 36,
        '& fieldset': { borderColor: '#E2E8F0' },
        '&:hover fieldset': { borderColor: PRIMARY },
        '&.Mui-focused fieldset': { borderColor: PRIMARY },
    },
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {children}
    </Typography>
);

const NotificationFilters = ({ onApply }: { onApply: (f: NotificationFilterValues) => void }) => {
    const [showFilters, setShowFilters] = useState(true);
    const [datePreset, setDatePreset] = useState('all');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    // Inbox model: the page shows unread by default; read items are reachable via this filter.
    const [readStatus, setReadStatus] = useState<ReadFilter>('unread');
    const [type, setType] = useState<TypeFilter>('all');

    const handleApply = () => {
        const range = datePreset === 'custom'
            ? { from: customFrom ? dayjs(customFrom).startOf('day').toISOString() : '', to: customTo ? dayjs(customTo).endOf('day').toISOString() : '' }
            : getDateRange(datePreset);
        onApply({
            dateFrom: range.from || undefined,
            dateTo: range.to || undefined,
            readStatus: readStatus !== 'all' ? readStatus : undefined,
            type: type !== 'all' ? type : undefined,
        });
    };

    const handleClear = () => {
        setDatePreset('all');
        setCustomFrom('');
        setCustomTo('');
        setReadStatus('unread');
        setType('all');
        onApply({ readStatus: 'unread' });
    };

    return (
        <Box sx={{ bgcolor: '#fff', border: '1px solid #EEF2F7', borderRadius: 2, mb: 2.5, overflow: 'hidden' }}>
            {/* filter header */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 2.5, py: 1.5,
                borderBottom: showFilters ? '1px solid #EEF2F7' : 'none',
                bgcolor: alpha(PRIMARY, 0.03),
            }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <TuneOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>
                        Filters &amp; Options
                    </Typography>
                </Stack>
                <Tooltip title={showFilters ? 'Collapse filters' : 'Expand filters'}>
                    <IconButton size="small" onClick={() => setShowFilters(p => !p)} sx={{ color: '#64748B' }}>
                        <FilterAltOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            </Box>

            <Collapse in={showFilters}>
                <Box sx={{ px: 2.5, py: 2 }}>
                    <Grid container spacing={1.5} alignItems="flex-end">
                        {/* Date preset */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FieldLabel>Period</FieldLabel>
                            <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                <Select value={datePreset} onChange={e => setDatePreset(e.target.value)}
                                    startAdornment={<InputAdornment position="start"><CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: PRIMARY }} /></InputAdornment>}>
                                    {DATE_PRESETS.map(d => <MenuItem key={d.value} value={d.value} sx={{ fontSize: '0.8rem' }}>{d.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Custom date range */}
                        {datePreset === 'custom' && (
                            <>
                                <Grid item xs={6} sm={3} md={1.5}>
                                    <FieldLabel>From</FieldLabel>
                                    <TextField fullWidth size="small" type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} sx={PILL_INPUT_SX} />
                                </Grid>
                                <Grid item xs={6} sm={3} md={1.5}>
                                    <FieldLabel>To</FieldLabel>
                                    <TextField fullWidth size="small" type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} sx={PILL_INPUT_SX} />
                                </Grid>
                            </>
                        )}

                        {/* Read status */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FieldLabel>Status</FieldLabel>
                            <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                <Select value={readStatus} onChange={e => setReadStatus(e.target.value as ReadFilter)}>
                                    <MenuItem value="unread" sx={{ fontSize: '0.8rem' }}>Unread</MenuItem>
                                    <MenuItem value="read" sx={{ fontSize: '0.8rem' }}>Read</MenuItem>
                                    <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>All</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Type */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FieldLabel>Type</FieldLabel>
                            <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                <Select value={type} onChange={e => setType(e.target.value as TypeFilter)}>
                                    {(Object.keys(TYPE_LABELS) as TypeFilter[]).map(k => (
                                        <MenuItem key={k} value={k} sx={{ fontSize: '0.8rem' }}>{TYPE_LABELS[k]}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Action buttons */}
                        <Grid item xs={12} sm="auto">
                            <Stack direction="row" gap={1} sx={{ mt: { xs: 0.5, md: 0 } }}>
                                <Button
                                    size="small" variant="contained"
                                    onClick={handleApply}
                                    sx={{
                                        height: 36, px: 2, textTransform: 'none', fontWeight: 600,
                                        fontSize: '0.8rem', bgcolor: PRIMARY, borderRadius: '8px',
                                        boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.35)}`,
                                        '&:hover': { bgcolor: alpha(PRIMARY, 0.85), boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.4)}` },
                                    }}
                                >
                                    Apply
                                </Button>
                                <Button
                                    size="small" variant="outlined"
                                    onClick={handleClear}
                                    sx={{
                                        height: 36, px: 1.5, textTransform: 'none', fontWeight: 600,
                                        fontSize: '0.8rem', borderRadius: '8px',
                                        borderColor: '#CBD5E1', color: '#64748B',
                                        '&:hover': { borderColor: PRIMARY, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.04) },
                                    }}
                                >
                                    Clear
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Collapse>
        </Box>
    );
};

// ── Page ─────────────────────────────────────────────────────────────────────

const Notifications = () => {
    const { handleMarkAllRead, loadNotifications: refreshNavbar } = useNotifications();

    const [items, setItems] = useState<IAppNotification[]>([]);
    const [totalOnServer, setTotalOnServer] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    // Inbox model: unread by default — marking read clears an item from view;
    // Status = Read / All in the filter panel brings read items back.
    const [filters, setFilters] = useState<NotificationFilterValues>({ readStatus: 'unread' });
    const [page, setPage] = useState(0);
    /** Rows currently fading out after being marked read (unread view only). */
    const [leaving, setLeaving] = useState<Set<number>>(new Set());

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await fetchNotifications(0, FETCH_WINDOW);
            setItems(data.content ?? []);
            setTotalOnServer(data.totalElements ?? 0);
        } catch (e) {
            console.error('Failed to load notifications', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter((n) => {
            if (filters.readStatus === 'unread' && n.isRead) return false;
            if (filters.readStatus === 'read' && !n.isRead) return false;
            if (filters.type) {
                if (filters.type === 'OTHER' && KNOWN_TYPES.includes(n.type)) return false;
                if (filters.type !== 'OTHER' && n.type !== filters.type) return false;
            }
            if (filters.dateFrom && new Date(n.createDate) < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && new Date(n.createDate) > new Date(filters.dateTo)) return false;
            if (q && !(`${n.title} ${n.message}`.toLowerCase().includes(q))) return false;
            return true;
        });
    }, [items, search, filters]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const unread = items.filter((n) => !n.isRead).length;
    const countType = (t: string) => items.filter((n) => n.type === t).length;

    /**
     * Marks a single notification read — no navigation. In the default unread view the
     * row fades out briefly and then leaves the list (it no longer matches the filter);
     * under Status = Read / All it simply restyles in place.
     */
    const markOne = async (n: IAppNotification) => {
        if (n.isRead) return;
        try {
            await markRead(n.id);
            refreshNavbar();
            const apply = () => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
            if (filters.readStatus === 'unread') {
                setLeaving((prev) => new Set(prev).add(n.id));
                setTimeout(() => {
                    apply();
                    setLeaving((prev) => { const s = new Set(prev); s.delete(n.id); return s; });
                }, 260);
            } else {
                apply();
            }
        } catch (e) {
            // surfaced by axios interceptor
        }
    };

    const markAll = async () => {
        await handleMarkAllRead();
        await load();
        refreshNavbar();
        toast.success('All notifications marked as read.');
    };

    const todayLabel = useMemo(
        () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        []
    );

    /** Type tiles toggle a type filter while keeping the current read-status view. */
    const toggleTileFilter = (partial: NotificationFilterValues, active: boolean) => {
        setFilters((prev) => (active
            ? { readStatus: prev.readStatus }
            : { readStatus: prev.readStatus, ...partial }));
        setPage(0);
    };

    return (
        // Same page padding as PageShell / the movement pages so all modules align.
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="Notifications"
                subtitle="Everything that needs your attention — approvals, rejections, acknowledgements, and system updates."
                icon={<NotificationsNoneIcon />}
                stat={{
                    value: totalOnServer.toLocaleString(),
                    label: 'total',
                    helper: todayLabel,
                }}
                actions={
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <Tooltip title="Refresh" arrow>
                            <IconButton
                                onClick={load}
                                sx={{
                                    width: 36, height: 36, borderRadius: '8px', bgcolor: '#fff',
                                    border: `1px solid ${border.subtle}`, color: neutral[500],
                                    '&:hover': { borderColor: PRIMARY, color: brand[600], bgcolor: alpha(PRIMARY, 0.04) },
                                }}
                            >
                                <RefreshIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        {unread > 0 && (
                            <Button
                                startIcon={<DoneAllIcon />}
                                onClick={markAll}
                                variant="contained"
                                sx={{
                                    height: 36,
                                    px: 2.5,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    bgcolor: PRIMARY,
                                    '&:hover': { bgcolor: brand[700] },
                                    boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
                                }}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </Stack>
                }
            />

            {/* Quick-filter summary tiles (click to filter, click again to clear) */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <StatTile
                        label="Unread"
                        value={unread}
                        icon={<MarkEmailUnreadOutlinedIcon />}
                        accent="warning"
                        onClick={() => { setFilters({ readStatus: 'unread' }); setPage(0); }}
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatTile
                        label="Action Required"
                        value={countType('STEP_PENDING')}
                        icon={<AssignmentOutlinedIcon />}
                        accent="gold"
                        onClick={() => toggleTileFilter({ type: 'STEP_PENDING' }, filters.type === 'STEP_PENDING')}
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatTile
                        label="Rejections"
                        value={countType('STEP_REJECTED')}
                        icon={<CancelOutlinedIcon />}
                        accent="danger"
                        onClick={() => toggleTileFilter({ type: 'STEP_REJECTED' }, filters.type === 'STEP_REJECTED')}
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatTile
                        label="Completed"
                        value={countType('WORKFLOW_COMPLETED')}
                        icon={<CheckCircleOutlineIcon />}
                        accent="success"
                        onClick={() => toggleTileFilter({ type: 'WORKFLOW_COMPLETED' }, filters.type === 'WORKFLOW_COMPLETED')}
                    />
                </Grid>
            </Grid>

            {/* Filters — same styling as the Reports / Movements filter panels */}
            <NotificationFilters onApply={(f) => { setFilters(f); setPage(0); }} />

            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${border.subtle}`,
                    overflow: 'hidden',
                }}
            >
                {/* Toolbar: live search + count */}
                <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', borderBottom: `1px solid ${border.subtle}`, bgcolor: neutral[50] }}>
                    <TextField
                        size="small"
                        placeholder="Search notifications..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flex: 1,
                            minWidth: 240,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                height: 36,
                                bgcolor: '#fff',
                                '& fieldset': { borderColor: '#E2E8F0' },
                                '&:hover fieldset': { borderColor: PRIMARY },
                                '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
                            },
                        }}
                    />
                    <Chip
                        label={`${filtered.length} shown`}
                        size="small"
                        sx={{ height: 26, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(PRIMARY, 0.07), color: brand[700] }}
                    />
                </Box>

                {loading ? (
                    <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={28} sx={{ color: PRIMARY }} />
                    </Box>
                ) : paginated.length === 0 ? (
                    (() => {
                        const onlyDefaultFilters = !search && !filters.type && !filters.dateFrom && !filters.dateTo;
                        const caughtUp = onlyDefaultFilters && filters.readStatus === 'unread';
                        return (
                            <EmptyState
                                variant="inline"
                                title={caughtUp ? "You're all caught up" : 'Nothing to show'}
                                description={caughtUp
                                    ? 'No unread notifications. Set Status to "Read" or "All" in the filters to revisit earlier ones.'
                                    : onlyDefaultFilters && !filters.readStatus
                                        ? 'You have no notifications yet.'
                                        : 'No notifications match the current filters.'}
                                icon={caughtUp ? <CheckCircleOutlineIcon /> : <NotificationsNoneIcon />}
                                accent={caughtUp ? 'brand' : 'gold'}
                            />
                        );
                    })()
                ) : (
                    <Box>
                        {paginated.map((n, idx) => (
                            <NotificationRow
                                key={n.id}
                                notification={n}
                                isLast={idx === paginated.length - 1}
                                leaving={leaving.has(n.id)}
                                onMarkRead={() => markOne(n)}
                            />
                        ))}
                    </Box>
                )}
            </Paper>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={(_, value) => setPage(value - 1)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            )}
        </Box>
    );
};

const NotificationRow = ({
    notification: n,
    isLast,
    leaving,
    onMarkRead,
}: {
    notification: IAppNotification;
    isLast: boolean;
    leaving: boolean;
    onMarkRead: () => void;
}) => (
    <Box
        onClick={onMarkRead}
        sx={{
            px: 2.5,
            py: 1.75,
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            cursor: n.isRead ? 'default' : 'pointer',
            bgcolor: n.isRead ? 'transparent' : alpha(PRIMARY, 0.04),
            borderBottom: isLast ? 'none' : `1px solid ${border.subtle}`,
            // Fade out briefly when marked read in the unread view, then leave the list.
            opacity: leaving ? 0 : 1,
            transition: 'background-color 0.15s ease, opacity 0.25s ease',
            pointerEvents: leaving ? 'none' : 'auto',
            '&:hover': { bgcolor: n.isRead ? neutral[50] : alpha(PRIMARY, 0.07) },
            '&:hover .mark-read-btn': { opacity: 1 },
        }}
    >
        <Box
            sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: alpha(PRIMARY, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.25,
            }}
        >
            {typeIcon(n.type)}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: n.isRead ? 500 : 700,
                        color: '#1E293B',
                    }}
                    noWrap
                >
                    {n.title}
                </Typography>
                {!n.isRead && (
                    <Box
                        sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: PRIMARY,
                            flexShrink: 0,
                        }}
                    />
                )}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: '0.8rem' }}>
                {n.message}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.disabled">
                    {formatDistanceToNow(new Date(n.createDate), { addSuffix: true })}
                </Typography>
                <Chip
                    label={TYPE_LABELS[(n.type as TypeFilter)] ?? n.type}
                    size="small"
                    sx={{
                        height: 18,
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        bgcolor: alpha(PRIMARY, 0.08),
                        color: PRIMARY,
                        '& .MuiChip-label': { px: 0.75 },
                    }}
                />
            </Stack>
        </Box>
        {/* Per-row mark-as-read: explicit control for one-by-one marking */}
        {!n.isRead ? (
            <Tooltip title="Mark as read" arrow>
                <IconButton
                    className="mark-read-btn"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onMarkRead(); }}
                    sx={{
                        opacity: { xs: 1, sm: 0.35 },
                        transition: 'opacity 0.15s ease',
                        color: PRIMARY,
                        alignSelf: 'center',
                        '&:hover': { bgcolor: alpha(PRIMARY, 0.1) },
                    }}
                >
                    <DoneIcon sx={{ fontSize: 17 }} />
                </IconButton>
            </Tooltip>
        ) : (
            <Typography
                variant="caption"
                sx={{ color: neutral[400], alignSelf: 'center', flexShrink: 0, fontSize: '0.66rem', fontWeight: 600 }}
            >
                Read
            </Typography>
        )}
    </Box>
);

export default Notifications;
