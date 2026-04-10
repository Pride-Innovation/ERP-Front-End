import { alpha, Avatar, Box, Card, CardContent, Chip, Typography, useTheme } from '@mui/material'
import { MovementStep } from './MovementHistory'

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
} from '@mui/icons-material';

// Brand colors (consistent with other components)
const PRIMARY_COLOR = '#08796C';
// const ACCENT_COLOR = '#BC892C';

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

const MovementStage = ({ step }: { step: MovementStep }) => {
    const theme = useTheme();
    return (
        <Box
            // key={step.id}
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
    )
}

export default MovementStage