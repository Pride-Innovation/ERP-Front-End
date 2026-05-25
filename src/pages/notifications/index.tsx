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
    FormControl,
    InputAdornment,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

import { PageHero } from '../../components/layout';
import { useNotifications } from '../../context/notification/NotificationContext';
import {
    IAppNotification,
    INotificationPage,
    fetchNotifications,
    markRead,
} from '../../context/notification/service';

const PRIMARY = '#08796C';
const PAGE_SIZE = 20;

type ReadFilter = 'all' | 'unread' | 'read';
type TypeFilter = 'all' | 'STEP_PENDING' | 'STEP_REJECTED' | 'WORKFLOW_COMPLETED' | 'OTHER';

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

const Notifications = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { handleMarkAllRead, loadNotifications: refreshNavbar } = useNotifications();

    const [page, setPage] = useState(0);
    const [pageData, setPageData] = useState<INotificationPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [readFilter, setReadFilter] = useState<ReadFilter>('all');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

    const load = useCallback(async (pageNumber: number) => {
        setLoading(true);
        try {
            // Fetch a wider window so we can apply client-side filters without
            // having to add new query params to the backend. For typical
            // notification volumes this is well within reason.
            const { data } = await fetchNotifications(pageNumber, PAGE_SIZE);
            setPageData(data);
        } catch (e) {
            console.error('Failed to load notifications', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(page);
    }, [page, load]);

    const filtered = useMemo(() => {
        const all = pageData?.content ?? [];
        const q = search.trim().toLowerCase();
        return all.filter((n) => {
            if (readFilter === 'unread' && n.isRead) return false;
            if (readFilter === 'read' && !n.isRead) return false;
            if (typeFilter !== 'all') {
                const known = ['STEP_PENDING', 'STEP_REJECTED', 'WORKFLOW_COMPLETED'];
                if (typeFilter === 'OTHER' && known.includes(n.type)) return false;
                if (typeFilter !== 'OTHER' && n.type !== typeFilter) return false;
            }
            if (q && !(`${n.title} ${n.message}`.toLowerCase().includes(q))) return false;
            return true;
        });
    }, [pageData, search, readFilter, typeFilter]);

    const handleClickNotification = async (n: IAppNotification) => {
        if (!n.isRead) {
            try {
                await markRead(n.id);
                setPageData((prev) => prev && {
                    ...prev,
                    content: prev.content.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
                });
                refreshNavbar();
            } catch (e) {
                // surfaced by axios interceptor
            }
        }
        if (n.link) {
            // Strip origin if the backend sent an absolute URL
            try {
                const url = new URL(n.link, window.location.origin);
                navigate(url.pathname + url.search + url.hash);
            } catch {
                navigate(n.link);
            }
        }
    };

    const markAll = async () => {
        await handleMarkAllRead();
        load(page);
        toast.success('All notifications marked as read.');
    };

    const todayLabel = useMemo(
        () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        []
    );

    const total = pageData?.totalElements ?? 0;
    const totalPages = pageData?.totalPages ?? 0;
    const unread = (pageData?.content ?? []).filter((n) => !n.isRead).length;

    return (
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <PageHero
                title="Notifications"
                subtitle="Everything that needs your attention — approvals, rejections, acknowledgements, and system updates."
                icon={<NotificationsNoneIcon />}
                stat={{
                    value: total.toLocaleString(),
                    label: 'total',
                    helper: todayLabel,
                }}
                actions={
                    unread > 0 ? (
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
                                '&:hover': { bgcolor: '#065E53' },
                                boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
                            }}
                        >
                            Mark all as read
                        </Button>
                    ) : null
                }
            />

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                sx={{ mb: 2 }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flex: 1 }}>
                    <TextField
                        size="small"
                        placeholder="Search notifications..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            minWidth: 240,
                            flex: { xs: 1, md: 'unset' },
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
                    <FilterSelect<ReadFilter>
                        value={readFilter}
                        onChange={setReadFilter}
                        options={[
                            { value: 'all', label: 'All' },
                            { value: 'unread', label: 'Unread' },
                            { value: 'read', label: 'Read' },
                        ]}
                    />
                    <FilterSelect<TypeFilter>
                        value={typeFilter}
                        onChange={setTypeFilter}
                        options={(Object.keys(TYPE_LABELS) as TypeFilter[]).map((k) => ({
                            value: k,
                            label: TYPE_LABELS[k],
                        }))}
                    />
                </Stack>
            </Stack>

            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                    overflow: 'hidden',
                }}
            >
                {loading ? (
                    <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={28} sx={{ color: PRIMARY }} />
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <NotificationsNoneIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                            Nothing to show
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {search || readFilter !== 'all' || typeFilter !== 'all'
                                ? 'No notifications match the current filters.'
                                : 'You have no notifications yet.'}
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {filtered.map((n, idx) => (
                            <NotificationRow
                                key={n.id}
                                notification={n}
                                isLast={idx === filtered.length - 1}
                                onClick={() => handleClickNotification(n)}
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
    onClick,
}: {
    notification: IAppNotification;
    isLast: boolean;
    onClick: () => void;
}) => {
    const theme = useTheme();
    return (
        <Box
            onClick={onClick}
            sx={{
                px: 2.5,
                py: 1.75,
                display: 'flex',
                gap: 2,
                cursor: 'pointer',
                bgcolor: n.isRead ? 'transparent' : alpha(PRIMARY, 0.04),
                borderBottom: isLast ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: alpha(PRIMARY, 0.07) },
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
        </Box>
    );
};

function FilterSelect<T extends string>({
    value,
    onChange,
    options,
}: {
    value: T;
    onChange: (v: T) => void;
    options: Array<{ value: T; label: string }>;
}) {
    return (
        <FormControl
            size="small"
            variant="outlined"
            sx={{
                minWidth: 160,
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    height: 36,
                    bgcolor: '#fff',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: PRIMARY },
                    '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
                },
            }}
        >
            <Select value={value} onChange={(e) => onChange(e.target.value as T)}>
                {options.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                        {o.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default Notifications;
