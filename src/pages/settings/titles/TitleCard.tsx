/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Button,
    Card,
    Stack,
    Typography,
    useTheme,
    alpha,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ITitleDetails } from './interface';

const TitleCard = ({ title, updateTitle, deleteTitle }: ITitleDetails) => {
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                transition: 'all 0.25s ease-in-out',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                    transform: 'translateY(-4px)',
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                }
            }}
        >
            {/* Header with title name */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.12)
                        }}
                    >
                        <WorkOutlineOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {title.name}
                        </Typography>
                        <Chip
                            size="small"
                            label="Position"
                            sx={{
                                mt: 0.5,
                                fontSize: '0.7rem',
                                height: 20,
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                color: theme.palette.secondary.main,
                                fontWeight: 500
                            }}
                        />
                    </Box>
                </Stack>

                <Tooltip title="More options">
                    <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2.5, flex: 1 }}>
                <Stack spacing={2}>
                    {/* Reports To */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <SupervisorAccountOutlinedIcon
                            fontSize="small"
                            sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                        />
                        <Stack>
                            <Typography variant="caption" color="text.secondary">Reports To</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {title.reportsTo ? title.reportsTo.name : 'None'}
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Role */}
                    {title.role && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <SecurityOutlinedIcon
                                fontSize="small"
                                sx={{ color: alpha(theme.palette.secondary.main, 0.8), mt: 0.25 }}
                            />
                            <Stack>
                                <Typography variant="caption" color="text.secondary">Role</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {title.role.name}
                                </Typography>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Box>

            {/* Actions */}
            <Box
                sx={{
                    mt: 'auto',
                    p: 2,
                    pt: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1
                }}
            >
                <Button
                    onClick={() => updateTitle(title)}
                    variant="outlined"
                    fullWidth
                    size="small"
                    sx={{
                        textTransform: 'none',
                        color: theme.palette.primary.main,
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        '&:hover': {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.04)
                        },
                        fontWeight: 500,
                        borderRadius: 1.5
                    }}
                    startIcon={<EditOutlinedIcon />}
                >
                    Update
                </Button>
                <Button
                    onClick={() => deleteTitle(title)}
                    variant="outlined"
                    fullWidth
                    size="small"
                    color="error"
                    sx={{
                        textTransform: 'none',
                        borderColor: alpha(theme.palette.error.main, 0.3),
                        '&:hover': {
                            borderColor: theme.palette.error.main,
                            bgcolor: alpha(theme.palette.error.main, 0.04)
                        },
                        fontWeight: 500,
                        borderRadius: 1.5
                    }}
                    startIcon={<DeleteOutlineOutlinedIcon />}
                >
                    Delete
                </Button>
            </Box>
        </Card>
    );
};

export default TitleCard;