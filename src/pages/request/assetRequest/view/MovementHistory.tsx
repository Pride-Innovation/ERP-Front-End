import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Chip,
    Avatar,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    alpha,
} from '@mui/material';
import {
    ReceiptLong as ReceiptLongIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    PendingActions as PendingActionsIcon,
    Inventory as InventoryIcon,
    LocalShipping as LocalShippingIcon,
    Verified as VerifiedIcon,
    TaskAlt as TaskAltIcon,
    Cancel as CancelIcon,
    AccessTime as AccessTimeIcon,
    DateRange as DateRangeIcon,
    Comment as CommentIcon,
    History as HistoryIcon,
} from '@mui/icons-material';

// Brand colors (consistent with other components)
const PRIMARY_COLOR = '#08796C';
const ACCENT_COLOR = '#BC892C';

// Define the data structure for movement history
interface MovementStep {
    id: number;
    status: string;
    date: string;
    time: string;
    user: {
        name: string;
        avatar?: string;
        title: string;
        department?: string;
    };
    comments?: string;
    isCompleted: boolean;
    isRejected?: boolean;
    isCurrent?: boolean;
}

// Component for the avatar with optional image or initials
const UserAvatar = ({ user }: { user: MovementStep['user'] }) => {
    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return user.avatar ? (
        <Avatar alt={user.name} src={user.avatar} sx={{ width: 36, height: 36 }} />
    ) : (
        <Avatar sx={{
            width: 36,
            height: 36,
            bgcolor: alpha(PRIMARY_COLOR, 0.8),
            fontWeight: 600,
            fontSize: '0.9rem'
        }}>
            {initials}
        </Avatar>
    );
};

// Helper to get appropriate icon for the step
const getStepIcon = (step: MovementStep) => {
    if (step.isRejected) return <CancelIcon />;

    switch (step.status) {
        case 'Request Created':
            return <ReceiptLongIcon />;
        case 'Manager Approval':
            return <CheckCircleOutlineIcon />;
        case 'Admin Acknowledgment':
            return <PendingActionsIcon />;
        case 'Items Stocked':
            return <InventoryIcon />;
        case 'Items Issued':
            return <LocalShippingIcon />;
        case 'Issuance Approved':
            return <VerifiedIcon />;
        case 'Items Received':
            return <TaskAltIcon />;
        default:
            return <AccessTimeIcon />;
    }
};

// Helper to get appropriate color for the step
const getStepColor = (step: MovementStep): string => {
    if (step.isRejected) return '#f44336'; // error
    if (!step.isCompleted) return '#9e9e9e'; // grey
    if (step.isCurrent) return PRIMARY_COLOR; // primary

    switch (step.status) {
        case 'Request Created':
            return '#2196f3'; // info
        case 'Manager Approval':
            return '#4caf50'; // success
        case 'Admin Acknowledgment':
            return '#9c27b0'; // secondary
        case 'Items Stocked':
            return '#ff9800'; // warning
        case 'Items Issued':
            return '#2196f3'; // info
        case 'Issuance Approved':
            return '#4caf50'; // success
        case 'Items Received':
            return '#4caf50'; // success
        default:
            return PRIMARY_COLOR; // primary
    }
};

// Mock data for demonstration
const movementHistoryData: MovementStep[] = [
    {
        id: 1,
        status: 'Request Created',
        date: '14 Sep 2025',
        time: '09:11 AM',
        user: {
            name: 'Super Admin',
            title: 'Super Admin',
            department: 'IT Department'
        },
        comments: 'Requesting for a chair and computer to settle our interns.',
        isCompleted: true
    },
    {
        id: 2,
        status: 'Manager Approval',
        date: '15 Sep 2025',
        time: '11:30 AM',
        user: {
            name: 'Pride Pride',
            title: 'Department Manager',
            department: 'IT Department'
        },
        comments: 'Approved. This is a necessary request for the new interns.',
        isCompleted: true
    },
    {
        id: 3,
        status: 'Admin Acknowledgment',
        date: '15 Sep 2025',
        time: '02:15 PM',
        user: {
            name: 'Jane Smith',
            title: 'Admin Officer',
            department: 'Administration'
        },
        comments: 'Acknowledged. Will proceed with processing this request.',
        isCompleted: true
    },
    {
        id: 4,
        status: 'Items Stocked',
        date: '16 Sep 2025',
        time: '10:45 AM',
        user: {
            name: 'Jane Smith',
            title: 'Admin Officer',
            department: 'Administration'
        },
        comments: 'Items have been verified in stock and prepared for issuance.',
        isCompleted: true
    },
    {
        id: 5,
        status: 'Items Issued',
        date: '16 Sep 2025',
        time: '03:20 PM',
        user: {
            name: 'Jane Smith',
            title: 'Admin Officer',
            department: 'Administration'
        },
        comments: 'Items have been issued and are ready for collection.',
        isCompleted: true,
        isCurrent: true
    },
    {
        id: 6,
        status: 'Issuance Approved',
        date: 'Pending',
        time: '',
        user: {
            name: 'David Johnson',
            title: 'Admin Manager',
            department: 'Administration'
        },
        isCompleted: false
    },
    {
        id: 7,
        status: 'Items Received',
        date: 'Pending',
        time: '',
        user: {
            name: 'Super Admin',
            title: 'Super Admin',
            department: 'IT Department'
        },
        isCompleted: false
    }
];

const MovementHistory = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Find the current step
    const currentStep = movementHistoryData.find(step => step.isCurrent)?.id ||
        movementHistoryData.filter(step => step.isCompleted).length;

    return (
        <Box>
            {/* Header section - more compact for tab content */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Box
                    sx={{
                        color: PRIMARY_COLOR,
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        p: 0.5,
                        mr: 1.5,
                        width: 34,
                        height: 34
                    }}
                >
                    <HistoryIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        Asset Request Workflow
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track approval, processing, and delivery status
                    </Typography>
                </Box>
            </Box>

            {/* Progress indicator - streamlined */}
            <Box
                sx={{
                    mb: 3,
                    px: { xs: 0, md: 1 },
                    py: 1,
                    bgcolor: alpha('#f5f5f5', 0.5),
                    borderRadius: 1,
                    border: `1px solid ${alpha('#000', 0.06)}`
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                Current Stage:
                            </Typography>
                            <Chip
                                label={
                                    movementHistoryData.find(step => step.isCurrent)?.status ||
                                    movementHistoryData[Math.min(currentStep - 1, movementHistoryData.length - 1)].status
                                }
                                size="small"
                                sx={{
                                    fontWeight: 600,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.9),
                                    color: 'white'
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <Box sx={{ position: 'relative', height: 6, bgcolor: alpha(PRIMARY_COLOR, 0.1), borderRadius: 3 }}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: `${(currentStep / movementHistoryData.length) * 100}%`,
                                    background: `linear-gradient(90deg, ${PRIMARY_COLOR} 0%, ${ACCENT_COLOR} 100%)`,
                                    borderRadius: 3,
                                    transition: 'width 1s ease-in-out'
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                Start
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {Math.round((currentStep / movementHistoryData.length) * 100)}% Complete
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Custom Timeline implementation - centered alignment */}
            <Box sx={{ position: 'relative' }}>
                {/* Vertical line */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: 16, // Consistent left positioning for all screen sizes
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background: `linear-gradient(to bottom, 
                            ${alpha(PRIMARY_COLOR, 0.7)}, 
                            ${alpha(PRIMARY_COLOR, 0.2)} 70%, 
                            ${alpha(PRIMARY_COLOR, 0.1)})`,
                        zIndex: 0
                    }}
                />

                {movementHistoryData.map((step, index) => (
                    <Box
                        key={step.id}
                        sx={{
                            display: 'flex',
                            flexDirection: 'row', // Always right-aligned
                            mb: 3.5,
                            position: 'relative'
                        }}
                    >
                        {/* Timeline dot - consistently on the left */}
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: step.isCompleted ? getStepColor(step) : '#fff',
                                border: step.isCompleted ? 'none' : `2px solid ${getStepColor(step)}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: step.isCompleted ? 'white' : getStepColor(step),
                                zIndex: 2,
                                position: 'absolute',
                                left: 0,
                                boxShadow: step.isCurrent
                                    ? `0 0 0 4px ${alpha(PRIMARY_COLOR, 0.15)}, 0 2px 8px ${alpha('#000', 0.1)}`
                                    : step.isCompleted
                                        ? `0 2px 4px ${alpha('#000', 0.2)}`
                                        : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Box sx={{ fontSize: step.isCompleted ? 18 : 16 }}>
                                {getStepIcon(step)}
                            </Box>
                        </Box>

                        {/* Content - consistently on the right */}
                        <Box
                            sx={{
                                flex: 1,
                                pl: 4.5, // Consistent padding from timeline
                                pr: 1,
                                position: 'relative',
                                width: 'calc(100% - 32px)',
                            }}
                        >
                            {/* Date display - always left aligned */}
                            <Box
                                sx={{
                                    mb: 0.5,
                                    textAlign: 'left'
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        color: step.isCompleted
                                            ? step.isCurrent
                                                ? PRIMARY_COLOR
                                                : 'text.primary'
                                            : 'text.disabled'
                                    }}
                                >
                                    {step.status}
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    opacity: step.isCompleted ? 1 : 0.5
                                }}>
                                    <DateRangeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                    <Typography variant="caption">{step.date}</Typography>
                                    {step.time && (
                                        <>
                                            <Typography variant="caption" sx={{ mx: 0.5 }}>•</Typography>
                                            <Typography variant="caption">{step.time}</Typography>
                                        </>
                                    )}
                                </Box>
                            </Box>

                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 1.5,
                                    mb: { xs: 1, sm: 2 },
                                    border: `1px solid ${step.isCurrent
                                        ? alpha(PRIMARY_COLOR, 0.3)
                                        : alpha(theme.palette.divider, 0.1)}`,
                                    transition: 'all 0.25s ease',
                                    boxShadow: step.isCurrent
                                        ? `0 3px 10px ${alpha(PRIMARY_COLOR, 0.15)}`
                                        : '0 1px 3px rgba(0,0,0,0.03)',
                                    transform: step.isCurrent ? 'translateY(-1px)' : 'none',
                                    opacity: step.isCompleted ? 1 : 0.7,
                                    bgcolor: step.isCurrent ? alpha(PRIMARY_COLOR, 0.02) : '#fff',
                                    '&:hover': {
                                        boxShadow: `0 3px 8px ${step.isCurrent
                                            ? alpha(PRIMARY_COLOR, 0.2)
                                            : 'rgba(0,0,0,0.08)'}`,
                                        transform: 'translateY(-2px)',
                                        borderColor: step.isCurrent
                                            ? alpha(PRIMARY_COLOR, 0.4)
                                            : alpha(theme.palette.primary.main, 0.2)
                                    }
                                }}
                            >
                                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: step.comments ? 1 : 0
                                    }}>
                                        <UserAvatar user={step.user} />
                                        <Box sx={{ ml: 1.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {step.user.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {step.user.title}
                                                </Typography>
                                                {step.user.department && (
                                                    <>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>•</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {step.user.department}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>

                                    {step.comments && (
                                        <Box
                                            sx={{
                                                mt: 1,
                                                p: 1.5,
                                                bgcolor: alpha('#f5f5f5', 0.5),
                                                borderRadius: 1,
                                                borderLeft: `3px solid ${alpha(
                                                    step.isCurrent ? PRIMARY_COLOR : '#64748B',
                                                    step.isCurrent ? 0.7 : 0.4
                                                )}`
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                <CommentIcon sx={{
                                                    fontSize: 16,
                                                    mr: 1,
                                                    mt: 0.3,
                                                    color: alpha(step.isCurrent ? PRIMARY_COLOR : '#64748B', 0.7)
                                                }} />
                                                <Typography
                                                    variant="body2"
                                                    color={step.isCurrent ? 'text.primary' : 'text.secondary'}
                                                    sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}
                                                >
                                                    {step.comments}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {step.isCurrent && (
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            mt: step.comments ? 2 : 1,
                                            alignItems: 'center'
                                        }}>
                                            <Chip
                                                size="small"
                                                label="Current Stage"
                                                sx={{
                                                    fontWeight: 500,
                                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                                    color: PRIMARY_COLOR,
                                                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
                                                    height: 24
                                                }}
                                            />
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Box
                sx={{
                    textAlign: 'center',
                    mt: 2,
                    pt: 1.5,
                    pb: 0.5,
                    borderTop: `1px dashed ${alpha(theme.palette.divider, 0.3)}`
                }}
            >
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    This request was initiated on <b>14 Sep 2025</b> and is currently in the <b>Items Issued</b> stage.
                </Typography>
            </Box>

            {/* Add custom animation for the pulsing dot */}
            <Box
                sx={{
                    '@keyframes pulse': {
                        '0%': {
                            boxShadow: `0 0 0 0 ${alpha(PRIMARY_COLOR, 0.7)}`,
                        },
                        '70%': {
                            boxShadow: `0 0 0 6px ${alpha(PRIMARY_COLOR, 0)}`,
                        },
                        '100%': {
                            boxShadow: `0 0 0 0 ${alpha(PRIMARY_COLOR, 0)}`,
                        },
                    }
                }}
            />
        </Box>
    );
};

export default MovementHistory;