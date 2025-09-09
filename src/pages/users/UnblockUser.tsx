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
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { IUnBolock, IUserAxiosResponse } from './interface';
import { unBlockUserService } from './service';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { toast } from 'react-toastify';
import { updateUser } from './slice';

const UnblockUser = ({
    user,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText = "Unblock Account",
}: IUnBolock) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch<AppDispatch>();

    const handleUnblock = async () => {
        setSendingRequest(true);
        try {
            const response = await unBlockUserService(user.id as number) as IUserAxiosResponse;
            if (response.status === 201) {
                toast.success("User account unblocked successfully!");
                dispatch(updateUser(response.data));
            }
        } catch (error) {
            console.error("Error unblocking user account:", error);
            toast.error("Failed to unblock user account. Please try again.");
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
                overflow: 'hidden'
            }}
        >
            {/* Success Header */}
            <Box
                sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.12),
                        color: theme.palette.success.main,
                        width: 40,
                        height: 40
                    }}
                >
                    <LockOpenOutlinedIcon />
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
                        Confirm Account Unblock
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This action will restore user access to the system
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Information message */}
                    <Grid item xs={12}>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                            Are you sure you want to unblock this user account? This action:
                        </Typography>
                        <Box
                            sx={{
                                ml: 2,
                                pl: 2,
                                borderLeft: `3px solid ${alpha(theme.palette.success.main, 0.5)}`,
                            }}
                        >
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                • Will restore the user's ability to log in to the system
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                • Grants immediate access to all previously assigned permissions
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                • Can be reversed if needed by disabling the account again
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
                                        <CheckCircleOutlineIcon sx={{ fontSize: '0.85rem', color: 'success.main' }} />
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
                        onClick={handleUnblock}
                        color='success'
                        type='button'
                        // sendingRequest={sendingRequest}
                        // buttonText={buttonText}
                        variant='outlined'
                        startIcon={<LockOpenOutlinedIcon />}
                        sx={{
                            order: { xs: 1, sm: 2 },
                            fontWeight: 500,
                            minWidth: { xs: '100%', sm: 140 }
                        }}
                    >Unblock</MuiButton>
                </Stack>
            </Box>
        </Paper>
    );
};

export default UnblockUser;