/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack, Typography, Box, alpha, useTheme, Alert, Divider } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ButtonComponent from '../../../components/forms/Button';
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
        <Grid item container spacing={3} xs={12} sx={{ mt: 0 }}>
            {/* Header */}
            <Grid item xs={12}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 2
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.error.main, 0.1)
                        }}
                    >
                        <WarningAmberIcon color="error" />
                    </Box>
                    <Typography variant="h6" fontWeight={500} color="error">
                        Confirm Deletion
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    This action cannot be undone. The supplier and all associated data will be permanently removed.
                </Typography>
                <Divider sx={{ my: 2, opacity: 0.6 }} />
            </Grid>

            {/* Warning alert */}
            <Grid item xs={12}>
                <Alert
                    severity="warning"
                    icon={<WarningAmberIcon />}
                    sx={{
                        mb: 3,
                        borderRadius: 1.5,
                        '& .MuiAlert-icon': {
                            alignItems: 'center'
                        }
                    }}
                >
                    <Typography variant="body2">
                        Deleting this supplier may affect procurement and supply chain operations.
                    </Typography>
                </Alert>

                {/* Supplier details */}
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        mb: 3
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <LocalShippingOutlinedIcon color="primary" />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {supplier.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ID: {supplier.id}
                            </Typography>
                        </Box>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <strong>Email:</strong> {supplier.email}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <strong>Phone:</strong> {supplier.telephone}
                    </Typography>

                    {supplier.commodity && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            <strong>Commodity:</strong> {supplier.commodity.name}
                        </Typography>
                    )}
                </Box>
            </Grid>

            {/* Action buttons */}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                    variant="body2"
                    color="error"
                    fontWeight={500}
                    sx={{ alignSelf: 'center' }}
                >
                    Are you sure you want to delete this supplier?
                </Typography>

                <Stack direction="row" spacing={2}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor="inherit"
                        type="button"
                        variant="outlined"
                        sendingRequest={false}
                        buttonText="Cancel"
                    // sx={{ px: 3 }}
                    />
                    <ButtonComponent
                        buttonColor="error"
                        type="button"
                        handleClick={deleteSupplier}
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                    // sx={{ px: 3 }}
                    />
                </Stack>
            </Grid>
        </Grid>
    );
};

export default DeleteSupplier;