/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Stack, Typography, Box, alpha, useTheme, Divider, Paper, Avatar, Button as MuiButton, CircularProgress } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { toast } from 'react-toastify';
import { IDeleteDepartment } from './interface';
import { deleteDepartmentService } from './service';
import DepartmentUtills from './utills';

const DeleteDepartment = ({
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText,
    department
}: IDeleteDepartment) => {
    const { removeDepartmentFromStore } = DepartmentUtills();
    const theme = useTheme();

    const deleteDepartment = async () => {
        setSendingRequest(true);
        try {
            const response = await deleteDepartmentService(department?.id as string) as any;
            if (response?.status === 200) {
                removeDepartmentFromStore(department);
                handleClose();
                toast.success("Department deleted successfully", { position: 'bottom-right' });
            }
        } catch (error: any) {
            const status = error?.response?.status;
            const detail = error?.response?.data?.detail;
            const message = error?.response?.data?.message;
            if (status === 409) {
                toast.error("Cannot delete this department. It may still have users or records assigned to it.", { position: 'bottom-right' });
            } else if (detail) {
                toast.error(detail, { position: 'bottom-right' });
            } else if (message) {
                toast.error(message, { position: 'bottom-right' });
            } else {
                toast.error("Failed to delete department. Please try again.", { position: 'bottom-right' });
            }
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* Error Header */}
            <Box
                sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.12), color: 'error.main', width: 42, height: 42 }}>
                    <WarningAmberIcon />
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600, lineHeight: 1.3 }}>
                        Confirm Department Deletion
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This action is permanent and cannot be undone
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: '#1E293B' }}>
                    Deleting this department will:
                </Typography>
                <Box sx={{ ml: 2, pl: 2, mb: 3, borderLeft: `3px solid ${alpha(theme.palette.warning.main, 0.5)}` }}>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                        • Permanently remove the department and all its associated data
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                        • Affect employees and users currently assigned to this department
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        • Remove the department from all organizational hierarchy records
                    </Typography>
                </Box>

                {/* Department Info Card */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: alpha('#f5f5f5', 0.6),
                        border: `1px solid ${alpha('#000', 0.07)}`,
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: '#08796C', width: 52, height: 52 }}>
                            <AccountTreeOutlinedIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                {department.name}
                            </Typography>
                            {department.headOfDepartment && (
                                <Typography variant="body2" color="text.secondary">
                                    Head: {department.headOfDepartment.firstName} {department.headOfDepartment.lastName}
                                </Typography>
                            )}
                            {department.branch && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                    Branch: {department.branch.name || 'Head Office'}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Paper>
            </Box>

            {/* Footer */}
            <Divider />
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end', bgcolor: alpha('#f9f9f9', 0.8) }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <MuiButton
                        onClick={handleClose}
                        color="inherit"
                        type="button"
                        variant="outlined"
                        sx={{
                            borderRadius: '8px',
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            '&:hover': { borderColor: alpha('#000', 0.3) },
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        onClick={deleteDepartment}
                        color="error"
                        variant="contained"
                        disabled={sendingRequest}
                        sx={{
                            px: 3,
                            borderRadius: '8px',
                            boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.3)}`,
                        }}
                    >
                        {sendingRequest ? <CircularProgress size={20} color="inherit" /> : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Paper>
    );
};

export default DeleteDepartment;