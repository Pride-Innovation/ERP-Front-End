import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Popover,
    Typography,
} from '@mui/material';
import Grow from '@mui/material/Grow';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useNotifications } from '../../context/notification/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../core/routes/routes';

const TEAL = '#05544B';
const GOLD = '#BC892C';

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'STEP_REJECTED': return <CancelOutlinedIcon sx={{ color: '#C53030', fontSize: '1.2rem' }} />;
        case 'STEP_PENDING': return <AssignmentOutlinedIcon sx={{ color: GOLD, fontSize: '1.2rem' }} />;
        case 'WORKFLOW_COMPLETED': return <CheckCircleOutlineIcon sx={{ color: TEAL, fontSize: '1.2rem' }} />;
        default: return <InfoOutlinedIcon sx={{ color: TEAL, fontSize: '1.2rem' }} />;
    }
};

interface Props {
    anchor: HTMLElement | null;
    onClose: () => void;
}

const NotificationPanel: React.FC<Props> = ({ anchor, onClose }) => {
    const { notifications, unreadCount, handleMarkRead, handleMarkAllRead } = useNotifications();
    const navigate = useNavigate();
    const open = Boolean(anchor);

    const goToAll = () => {
        onClose();
        navigate(ROUTES.NOTIFICATIONS);
    };

    return (
        <Popover
            open={open}
            anchorEl={anchor}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            // Don't lock body scroll — it adds scrollbar-compensation padding
            // that shifts the fixed navbar when the panel opens.
            disableScrollLock
            TransitionComponent={Grow}
            transitionDuration={180}
            PaperProps={{
                elevation: 4,
                sx: {
                    width: 380,
                    maxHeight: 520,
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }
            }}
        >
            {/* Header */}
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: TEAL }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsNoneIcon sx={{ color: '#fff', fontSize: '1.2rem' }} />
                    <Typography variant="subtitle1" fontWeight={700} color="#fff">Notifications</Typography>
                    {unreadCount > 0 && (
                        <Chip label={unreadCount} size="small" sx={{ bgcolor: GOLD, color: '#fff', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                    )}
                </Box>
                {unreadCount > 0 && (
                    <Button size="small" onClick={handleMarkAllRead} sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', textTransform: 'none' }}>
                        Mark all read
                    </Button>
                )}
            </Box>

            <Divider />

            {/* List */}
            <List disablePadding sx={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                        <NotificationsNoneIcon sx={{ color: '#ccc', fontSize: '3rem' }} />
                        <Typography variant="body2" color="text.secondary" mt={1}>No notifications yet</Typography>
                    </Box>
                ) : (
                    notifications.map((n) => (
                        <React.Fragment key={n.id}>
                            <ListItem
                                alignItems="flex-start"
                                onClick={() => !n.isRead && handleMarkRead(n.id)}
                                sx={{
                                    cursor: n.isRead ? 'default' : 'pointer',
                                    bgcolor: n.isRead ? 'transparent' : 'rgba(5,84,75,0.04)',
                                    px: 2,
                                    py: 1.2,
                                    '&:hover': { bgcolor: 'rgba(5,84,75,0.06)' },
                                }}
                            >
                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                    <Avatar sx={{ bgcolor: 'transparent', width: 32, height: 32 }}>
                                        {getTypeIcon(n.type)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="body2" fontWeight={n.isRead ? 400 : 700} color="text.primary" noWrap>
                                                {n.title}
                                            </Typography>
                                            {!n.isRead && (
                                                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: TEAL, flexShrink: 0 }} />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block', lineHeight: 1.5 }}>
                                                {n.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled" component="span" sx={{ mt: 0.3, display: 'block' }}>
                                                {formatDistanceToNow(new Date(n.createDate), { addSuffix: true })}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))
                )}
            </List>

            {/* Footer — link to the full Notifications page. */}
            <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', px: 2, py: 1, bgcolor: '#fafafa' }}>
                <Button
                    fullWidth
                    size="small"
                    onClick={goToAll}
                    sx={{ textTransform: 'none', color: TEAL, fontWeight: 600 }}
                >
                    View all notifications
                </Button>
            </Box>
        </Popover>
    );
};

export default NotificationPanel;
