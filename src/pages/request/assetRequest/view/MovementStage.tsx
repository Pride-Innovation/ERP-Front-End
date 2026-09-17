import { alpha, Avatar, Box, Card, CardContent, Chip, Typography } from '@mui/material'
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

// A single, restrained palette — completed steps use the brand colour, rejected
// steps use red, pending steps use grey. No per-stage rainbow.
const PRIMARY_COLOR = '#08796C';
const REJECT_COLOR = '#DC2626';
const PENDING_COLOR = '#94A3B8';

const getStepIcon = (step: MovementStep) => {
    if (step.isRejected) return <CancelIcon />;
    switch (step.status) {
        case 'Request Submitted':
        case 'Request Created':
            return <ReceiptLongIcon />;
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
            return step.isCompleted ? <CheckCircleOutlineIcon /> : <AccessTimeIcon />;
    }
};

const getStepColor = (step: MovementStep): string => {
    if (step.isRejected) return REJECT_COLOR;
    if (!step.isCompleted) return PENDING_COLOR;
    return PRIMARY_COLOR;
};

const UserAvatar = ({ user, color }: { user: MovementStep['user']; color: string }) => {
    const initials = (user.name || '')
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return user.avatar ? (
        <Avatar alt={user.name} src={user.avatar} sx={{ width: 34, height: 34 }} />
    ) : (
        <Avatar sx={{
            width: 34,
            height: 34,
            bgcolor: alpha(color, 0.12),
            color,
            fontWeight: 700,
            fontSize: '0.8rem',
        }}>
            {initials || '?'}
        </Avatar>
    );
};

const MovementStage = ({ step }: { step: MovementStep }) => {
    const color = getStepColor(step);

    return (
        <Box sx={{ display: 'flex', mb: 3, position: 'relative' }}>
            {/* Timeline dot */}
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: step.isCompleted ? color : '#fff',
                    border: step.isCompleted ? 'none' : `2px solid ${PENDING_COLOR}`,
                    color: step.isCompleted ? '#fff' : PENDING_COLOR,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    position: 'absolute',
                    left: 0,
                    boxShadow: step.isCurrent ? `0 0 0 4px ${alpha(color, 0.15)}` : 'none',
                    '& svg': { fontSize: 17 },
                }}
            >
                {getStepIcon(step)}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, pl: 4.5, pr: 1, width: 'calc(100% - 32px)' }}>
                <Box sx={{ mb: 0.75 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 700,
                            color: step.isRejected
                                ? REJECT_COLOR
                                : step.isCompleted ? 'text.primary' : 'text.disabled',
                        }}
                    >
                        {step.status}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.disabled' }}>
                        <DateRangeIcon sx={{ fontSize: 13, mr: 0.5 }} />
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
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: step.isRejected
                            ? alpha(REJECT_COLOR, 0.3)
                            : step.isCurrent ? alpha(PRIMARY_COLOR, 0.3) : 'divider',
                        bgcolor: '#fff',
                    }}
                >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <UserAvatar user={step.user} color={color} />
                            <Box sx={{ ml: 1.5, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {step.user.name?.trim() || '—'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', color: 'text.secondary' }}>
                                    {step.user.title && (
                                        <Typography variant="caption">{step.user.title}</Typography>
                                    )}
                                    {step.user.title && step.user.department && (
                                        <Typography variant="caption" sx={{ mx: 0.5 }}>•</Typography>
                                    )}
                                    {step.user.department && (
                                        <Typography variant="caption">{step.user.department}</Typography>
                                    )}
                                </Box>
                            </Box>
                            {step.isCurrent && (
                                <Chip
                                    size="small"
                                    label="Current"
                                    sx={{
                                        ml: 'auto',
                                        height: 22,
                                        fontWeight: 600,
                                        fontSize: '0.68rem',
                                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                        color: PRIMARY_COLOR,
                                    }}
                                />
                            )}
                        </Box>

                        {step.comments && (
                            <Box
                                sx={{
                                    mt: 1.5,
                                    p: 1.25,
                                    bgcolor: step.isRejected ? alpha(REJECT_COLOR, 0.04) : alpha('#000', 0.02),
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <CommentIcon sx={{ fontSize: 15, mr: 1, mt: 0.3, color: 'text.disabled' }} />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.85rem', lineHeight: 1.5 }}
                                >
                                    {step.comments}
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}

export default MovementStage
