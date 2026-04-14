/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Stack, Typography, Box, alpha, useTheme, Divider, Paper, Avatar, Button as MuiButton, CircularProgress } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { toast } from 'react-toastify';
import { IDeleteSupplier, ISupplierAxiosResponse } from './interface';
import { deleteSupplierService } from './service';
import SupplierUtills from './Utills';

const DeleteSupplier = ({
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText,
    supplier
}: IDeleteSupplier) => {
    const { removeSupplierToStore } = SupplierUtills();
    const theme = useTheme();

    const deleteSupplier = async () => {
        setSendingRequest(true);
        try {
            const response = await deleteSupplierService(supplier?.id as number) as ISupplierAxiosResponse;
            if (response.status === 204) {
                toast.success("Supplier deleted successfully", { position: 'bottom-right' });
                removeSupplierToStore(supplier);
            }
        } catch (error) {
            console.error("Error deleting supplier:", error);
            toast.error("Failed to delete supplier. Please try again.", { position: 'bottom-right' });
        }
        setSendingRequest(false);
        handleClose();
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
                        Confirm Supplier Deletion
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This action is permanent and cannot be undone
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: '#1E293B' }}>
                    Deleting this supplier will:
                </Typography>
                <Box sx={{ ml: 2, pl: 2, mb: 3, borderLeft: `3px solid ${alpha(theme.palette.warning.main, 0.5)}` }}>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                        • Permanently remove the supplier and all associated data
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                        • Affect procurement records and supply chain operations linked to this supplier
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        • Remove the supplier from all commodity and inventory records
                    </Typography>
                </Box>

                {/* Supplier Info Card */}
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
                            <LocalShippingOutlinedIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                {supplier.name}
                            </Typography>
                            {supplier.email && (
                                <Typography variant="body2" color="text.secondary">
                                    {supplier.email}
                                </Typography>
                            )}
                            {supplier.telephone && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                    {supplier.telephone}
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
                        onClick={deleteSupplier}
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

export default DeleteSupplier;