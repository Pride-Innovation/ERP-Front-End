/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Avatar,
    Box,
    Chip,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

import { ITitleDetails } from './interface';
import { getCardColor } from '../cardColors';

const TitleCard = ({ title, updateTitle, deleteTitle, index = 0 }: ITitleDetails) => {
    const color = getCardColor(index);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2.5,
                border: `1px solid ${alpha(color, 0.18)}`,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: `0 4px 20px ${alpha(color, 0.15)}`,
                    transform: 'translateY(-2px)',
                    borderColor: alpha(color, 0.35),
                },
            }}
        >
            <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                        sx={{
                            width: 48,
                            height: 48,
                            bgcolor: alpha(color, 0.1),
                            color,
                            borderRadius: '12px',
                            flexShrink: 0,
                            border: `1px solid ${alpha(color, 0.2)}`,
                        }}
                    >
                        <WorkOutlineOutlinedIcon fontSize="small" />
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}
                                noWrap
                                title={title.name}
                            >
                                {title.name}
                            </Typography>
                            {title.shortCode && (
                                <Chip
                                    label={title.shortCode}
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        bgcolor: alpha(color, 0.1),
                                        color,
                                        border: `1px solid ${alpha(color, 0.3)}`,
                                        '& .MuiChip-label': { px: 1 },
                                    }}
                                />
                            )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            Position
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 2, borderColor: alpha(color, 0.1) }} />

                {/* Detail rows */}
                <Stack spacing={1.25}>
                    <DetailRow
                        icon={<SupervisorAccountOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />}
                        label="Reports to"
                        value={title.reportsTo?.name}
                        emptyLabel="None"
                    />
                    <DetailRow
                        icon={<SecurityOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />}
                        label="Role"
                        value={title.role?.name}
                        emptyLabel="Not assigned"
                    />
                </Stack>

                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
                    <Tooltip title="Edit title" arrow>
                        <IconButton
                            size="small"
                            onClick={() => updateTitle(title)}
                            sx={{
                                color,
                                bgcolor: alpha(color, 0.06),
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha(color, 0.14) },
                            }}
                        >
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete title" arrow>
                        <IconButton
                            size="small"
                            onClick={() => deleteTitle(title)}
                            sx={{
                                color: 'error.main',
                                bgcolor: alpha('#ef4444', 0.06),
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha('#ef4444', 0.14) },
                            }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>
        </Paper>
    );
};

const DetailRow = ({
    icon,
    label,
    value,
    emptyLabel,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
    emptyLabel: string;
}) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        {icon}
        <Typography
            variant="caption"
            sx={{ color: '#64748B', fontWeight: 600, minWidth: 70, flexShrink: 0 }}
        >
            {label}
        </Typography>
        <Typography
            variant="body2"
            sx={{
                flex: 1,
                minWidth: 0,
                color: value ? '#334155' : '#94A3B8',
                fontStyle: value ? 'normal' : 'italic',
                fontWeight: value ? 500 : 400,
                fontSize: '0.8rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
            title={value ?? undefined}
        >
            {value || emptyLabel}
        </Typography>
    </Stack>
);

export default TitleCard;
