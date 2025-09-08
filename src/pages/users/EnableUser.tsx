/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Grid,
    Stack,
    Typography,
    Divider,
    Paper,
    Avatar,
    alpha,
    useTheme,
    useMediaQuery,
    Button as MuiButton
} from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { IEnable, IUserAxiosResponse } from './interface';
import { enableUserService } from './service';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { toast } from 'react-toastify';
import { updateUser } from './slice';

const EnableUser = ({
    user,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText = "Enable Account",
}: IEnable) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const dispatch = useDispatch<AppDispatch>();

    const handleEnable = async () => {
        setSendingRequest(true);
        try {
            const response = await enableUserService(user.id as number) as IUserAxiosResponse;
            if (response.status === 200 || response.status === 204) {
                toast.success("User account successfully enabled!");
                dispatch(updateUser(response.data));
            }
        } catch (error) {
            console.error("Error enabling user account:", error);
            toast.error("Failed to enable user account. Please try again.");
        }
        setSendingRequest(false);
        handleClose();
    };

    // Get user's initials for avatar fallback
    const getInitials = () => {
        return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Compact Header */}
            <Box
                sx={{
                    p: { xs: 2, md: 2 },
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                        width: 36,
                        height: 36
                    }}
                >
                    <PersonAddAltIcon fontSize="small" />
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                        Reactivate Employee Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                        Enable system access for a returning employee
                    </Typography>
                </Box>
            </Box>

            {/* Content - Scrollable area */}
            <Box sx={{
                p: { xs: 2, md: 2.5 },
                overflow: 'auto',
                flexGrow: 1
            }}>
                <Grid container spacing={2}>
                    {/* Two-column layout on larger screens */}
                    <Grid item xs={12} md={5} order={{ xs: 2, md: 1 }}>
                        {/* User information card */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha('#f5f5f5', 0.5),
                                border: `1px solid ${alpha('#000', 0.08)}`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar
                                    sx={{
                                        bgcolor: theme.palette.primary.main,
                                        width: 46,
                                        height: 46
                                    }}
                                >
                                    {getInitials()}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                    <Typography
                                        variant="subtitle1"
                                        color="primary.main"
                                        sx={{
                                            fontWeight: 500,
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {user.firstName} {user.lastName} {user.otherName}
                                    </Typography>
                                    <Box
                                        sx={{
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            color: theme.palette.error.main,
                                            py: 0.25,
                                            px: 1,
                                            borderRadius: 0.5,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            mt: 0.5
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                bgcolor: 'error.main'
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                            Disabled
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 1.5 }} />

                            <Stack spacing={0.75}>
                                <Box sx={{ display: 'flex' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                                        Staff ID:
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {user.staffNumber || "N/A"}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                                        Title:
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {user.title?.name || "N/A"}
                                    </Typography>
                                </Box>

                                {user.department && (
                                    <Box sx={{ display: 'flex' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                                            Department:
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {user.department.name}
                                        </Typography>
                                    </Box>
                                )}

                                {user.branch?.name && (
                                    <Box sx={{ display: 'flex' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                                            Branch:
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {user.branch.name}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>

                            {/* Password reset note - inside user card on small screens */}
                            {!isLarge && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        border: `1px dashed ${alpha(theme.palette.warning.main, 0.5)}`,
                                        bgcolor: alpha(theme.palette.warning.main, 0.03),
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1
                                    }}
                                >
                                    <BadgeOutlinedIcon
                                        sx={{
                                            color: theme.palette.warning.main,
                                            fontSize: '1rem',
                                            mt: 0.25
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        <strong>Note:</strong> After enabling, user will need to reset their password.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Information message column */}
                    <Grid item xs={12} md={7} order={{ xs: 1, md: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            You're about to reactivate an account for a returning employee. This action:
                        </Typography>

                        <Box
                            sx={{
                                ml: 1,
                                pl: 1.5,
                                borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                                mb: 2
                            }}
                        >
                            <Typography variant="body2" sx={{ mb: 0.75, color: 'text.primary', fontSize: '0.875rem' }}>
                                • Will fully restore the user's account and system access
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.75, color: 'text.primary', fontSize: '0.875rem' }}>
                                • Reactivates previously assigned permissions and roles
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.75, color: 'text.primary', fontSize: '0.875rem' }}>
                                • Reconnects the user with their previous history and records
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                                • Allows immediate login after password reset
                            </Typography>
                        </Box>

                        {/* Password reset note - separate on large screens */}
                        {isLarge && (
                            <Box
                                sx={{
                                    mt: 1.5,
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    border: `1px dashed ${alpha(theme.palette.warning.main, 0.5)}`,
                                    bgcolor: alpha(theme.palette.warning.main, 0.03),
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1
                                }}
                            >
                                <BadgeOutlinedIcon
                                    sx={{
                                        color: theme.palette.warning.main,
                                        mt: 0.25
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Note:</strong> After enabling this account, the user will need to reset their password before they can log in.
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>

            {/* Action Buttons */}
            <Box
                sx={{
                    p: { xs: 2, md: 2 },
                    display: "flex",
                    justifyContent: "flex-end",
                    bgcolor: alpha('#f9f9f9', 0.8),
                    borderTop: `1px solid ${alpha('#000', 0.09)}`
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{
                        width: { xs: "100%", sm: "auto" }
                    }}
                >
                    <MuiButton
                        onClick={handleClose}
                        color='inherit'
                        type='button'
                        variant="outlined"
                        size="small"
                        sx={{
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            order: { xs: 2, sm: 1 },
                            px: { xs: 2, sm: 2 },
                            py: 1,
                            '&:hover': {
                                borderColor: alpha('#000', 0.3),
                                bgcolor: alpha('#000', 0.05)
                            }
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        onClick={handleEnable}
                        color='primary'
                        type='button'
                        variant="contained"
                        startIcon={<PersonAddAltIcon />}
                        size="small"
                        disabled={sendingRequest}
                        sx={{
                            order: { xs: 1, sm: 2 },
                            fontWeight: 500,
                            minWidth: { xs: '100%', sm: 140 },
                            px: { xs: 2, sm: 2 },
                            py: 1
                        }}
                    >
                        {sendingRequest ? "Processing..." : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Paper>
    );
};

export default EnableUser;