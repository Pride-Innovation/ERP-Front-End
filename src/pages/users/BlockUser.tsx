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
    Button as MuiButton
} from '@mui/material';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import BlockIcon from '@mui/icons-material/Block';
import { IDisable, IUserAxiosResponse } from './interface';
import { blockUserService } from './service';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { toast } from 'react-toastify';
import { updateUser } from './slice';

const BlockUserAccount = ({
    user,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText = "Block Account",
}: IDisable) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const handleBlock = async () => {
        setSendingRequest(true);
        try {
            const response = await blockUserService(user.id as number) as IUserAxiosResponse;
            if (response.status === 201) {
                toast.success("User account blocked successfully!");
                dispatch(updateUser(response.data));
            }
        } catch (error) {
            console.error("Error blocking user account:", error);
            toast.error("Failed to block user account. Please try again.");
        } finally {
            setSendingRequest(false);
            handleClose();
        }
    };

    const getInitials = () => {
        return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* Header */}
            <Box
                sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.error.dark, 0.08),
                    borderBottom: `1px solid ${alpha(theme.palette.error.dark, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: alpha(theme.palette.error.dark, 0.12),
                        color: theme.palette.error.dark,
                        width: 40,
                        height: 40
                    }}
                >
                    <GppBadOutlinedIcon />
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ color: 'error.dark', fontWeight: 600 }}>
                        Confirm Account Block
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This is a security action that prevents the user from logging in
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                            Are you sure you want to block this user account? This action:
                        </Typography>
                        <Box
                            sx={{
                                ml: 2,
                                pl: 2,
                                borderLeft: `3px solid ${alpha(theme.palette.error.main, 0.5)}`,
                            }}
                        >
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                • Will immediately revoke login access for this user
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                • Is typically used as a security measure (e.g., suspicious activity)
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                • The user will see: <em>"Your account has been blocked. Please contact your admin."</em>
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                • Can be reversed by an administrator using the <strong>Unblock</strong> action
                            </Typography>
                        </Box>
                    </Grid>

                    {/* User Info Card */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.grey[500], 0.06),
                                border: `1px solid ${alpha(theme.palette.grey[500], 0.15)}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Avatar
                                src={user.profileImage || undefined}
                                sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: '#08796C',
                                    color: '#fff',
                                    fontWeight: 600
                                }}
                            >
                                {!user.profileImage && getInitials()}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {user.firstName} {user.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user.title?.name} &nbsp;|&nbsp; {user.staffNumber}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Divider />

            {/* Actions */}
            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: 2 }}>
                <MuiButton
                    variant="outlined"
                    color="inherit"
                    onClick={handleClose}
                    disabled={sendingRequest}
                    sx={{ minWidth: 100 }}
                >
                    Cancel
                </MuiButton>
                <MuiButton
                    variant="contained"
                    color="error"
                    startIcon={<BlockIcon />}
                    onClick={handleBlock}
                    disabled={sendingRequest}
                    sx={{ minWidth: 140 }}
                >
                    {sendingRequest ? 'Blocking...' : buttonText}
                </MuiButton>
            </Stack>
        </Paper>
    );
};

export default BlockUserAccount;
