/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Stack, Typography, Box, alpha, useTheme, Divider, Paper, Avatar, Button as MuiButton, CircularProgress } from '@mui/material'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { IDeleteRole, IRoleAxiosResponse } from '../interface';
import { deleteRoleService } from './service';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { removeRoles } from './slice';

const DeleteRole = ({
    role,
    handleClose,
    sendingRequest,
    buttonText
}: IDeleteRole) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const deleteRole = async () => {
        try {
            const response = await deleteRoleService(role?.id as number) as IRoleAxiosResponse;
            if (response.status === 204) {
                toast.success("Role has been deleted successfully", { position: 'bottom-right' });
                dispatch(removeRoles(role));
                handleClose();
            }
        } catch (error) {
            console.error("Error deleting role:", error);
            toast.error("Failed to delete role. Please try again.", { position: 'bottom-right' });
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`
            }}
        >
            {/* Error-tinted header */}
            <Box
                sx={{
                    px: 3,
                    py: 2.5,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.error.main, 0.04)} 100%)`,
                    borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.12), width: 44, height: 44 }}>
                    <WarningAmberIcon sx={{ color: theme.palette.error.main }} />
                </Avatar>
                <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.error.main, mb: 0.25 }}>
                        Delete Role
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.error.main, opacity: 0.8 }}>
                        This action is permanent and cannot be undone
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
                {/* Warning bullets */}
                <Box
                    sx={{
                        mb: 2.5,
                        p: 2,
                        borderRadius: 1.5,
                        borderLeft: `3px solid ${theme.palette.warning.main}`,
                        bgcolor: alpha(theme.palette.warning.main, 0.04)
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1E293B' }}>
                        The following will be affected:
                    </Typography>
                    <Stack spacing={0.75}>
                        <Typography variant="body2" color="text.secondary">
                            • Users assigned to this role may lose access to associated features
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • All permission assignments linked to this role will be removed
                        </Typography>
                    </Stack>
                </Box>

                {/* Role info card */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha('#08796C', 0.12)}`,
                        bgcolor: alpha('#08796C', 0.03)
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha('#08796C', 0.1), width: 40, height: 40 }}>
                            <ShieldOutlinedIcon sx={{ color: '#08796C', fontSize: 20 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B' }}>
                                {role.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {(role.permissions as any[])?.length || 0} permissions • ID: {role.id}
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Box>

            <Divider />

            {/* Footer */}
            <Box
                sx={{
                    px: 3,
                    py: 2.5,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1.5,
                    bgcolor: alpha('#f9f9f9', 0.8)
                }}
            >
                <MuiButton
                    onClick={handleClose}
                    color="inherit"
                    type="button"
                    variant="outlined"
                    disabled={sendingRequest}
                    sx={{
                        minWidth: '90px',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: alpha('#000', 0.2),
                        color: 'text.secondary',
                        '&:hover': { borderColor: alpha('#000', 0.3) }
                    }}
                >
                    Cancel
                </MuiButton>
                <MuiButton
                    onClick={deleteRole}
                    color="error"
                    type="button"
                    variant="contained"
                    disabled={sendingRequest}
                    sx={{
                        minWidth: '90px',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.3)}`
                    }}
                >
                    {sendingRequest ? <CircularProgress size={20} color="inherit" /> : buttonText}
                </MuiButton>
            </Box>
        </Paper>
    )
}

export default DeleteRole;