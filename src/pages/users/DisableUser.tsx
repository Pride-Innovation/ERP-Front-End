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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BlockIcon from '@mui/icons-material/Block';
import { IDisable, IUserAxiosResponse } from './interface';
import { deleteUserService } from './service';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { toast } from 'react-toastify';
import { updateUser } from './slice';

const DisableUserAccount = ({
    user,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText = "Disable Account",
}: IDisable) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch<AppDispatch>();

    const handleDisable = async () => {
        setSendingRequest(true);
        try {
            const response = await deleteUserService(user.id as number) as IUserAxiosResponse;
            if (response.status === 201) {
                toast.success("User account disabled successfully!");
                console.log(response.data, " response data from disable user");
                dispatch(updateUser(response.data));
            }
        } catch (error) {
            console.error("Error disabling user account:", error);
            toast.error("Failed to disable user account. Please try again.");
        } finally {
            setSendingRequest(false);
            handleClose();
        }
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
                overflow: 'hidden'
            }}
        >
            {/* Warning Header */}
            <Box
                sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.12),
                        color: theme.palette.error.main,
                        width: 40,
                        height: 40
                    }}
                >
                    <WarningAmberIcon />
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
                        Confirm Account Disable
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This action will restrict user access to the system
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Warning message */}
                    <Grid item xs={12}>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                            Are you sure you want to disable this user account? This action:
                        </Typography>
                        <Box
                            sx={{
                                ml: 2,
                                pl: 2,
                                borderLeft: `3px solid ${alpha(theme.palette.warning.main, 0.5)}`,
                            }}
                        >
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                • Will prevent the user from logging in to the system
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                • Can be reversed by an administrator later if needed
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                • Will not delete the user's data or history
                            </Typography>
                        </Box>
                    </Grid>

                    {/* User information */}
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                bgcolor: alpha('#f5f5f5', 0.5),
                                border: `1px solid ${alpha('#000', 0.08)}`
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{
                                        bgcolor: theme.palette.primary.main,
                                        width: 56,
                                        height: 56,
                                        fontWeight: 600
                                    }}
                                >
                                    {getInitials()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 500 }}>
                                        {user.firstName} {user.lastName} {user.otherName}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <BlockIcon sx={{ fontSize: '0.85rem', color: 'error.main' }} />
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                            {user.title?.name || "No title assigned"}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        Staff ID: {user.staffNumber || "N/A"}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Action Buttons */}
            <Divider />
            <Box
                sx={{
                    p: 2.5,
                    display: "flex",
                    justifyContent: "flex-end",
                    bgcolor: alpha('#f9f9f9', 0.8)
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{
                        width: { xs: "100%", sm: "auto" }
                    }}
                >
                    <MuiButton
                        onClick={handleClose}
                        color='inherit'
                        type='button'
                        variant="outlined"
                        // sendingRequest={false}
                        // buttonText="Cancel"
                        sx={{
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            order: { xs: 2, sm: 1 },
                            '&:hover': {
                                borderColor: alpha('#000', 0.3),
                                bgcolor: alpha('#000', 0.05)
                            }
                        }}
                    >Cancel</MuiButton>
                    <MuiButton
                        onClick={handleDisable}
                        color='error'
                        type='button'
                        // sendingRequest={sendingRequest}
                        // buttonText={buttonText}
                        variant='outlined'
                        startIcon={<BlockIcon />}
                        sx={{
                            order: { xs: 1, sm: 2 },
                            fontWeight: 500,
                            minWidth: { xs: '100%', sm: 140 }
                        }}
                    >{sendingRequest ? "Loading..." : buttonText}</MuiButton>
                </Stack>
            </Box>
        </Paper>
    );
};

export default DisableUserAccount;