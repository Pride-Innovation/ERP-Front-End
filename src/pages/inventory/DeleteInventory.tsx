/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Grid,
    Typography,
    Divider,
    Box,
    Paper,
    alpha,
    Fade,
    Avatar,
    Button as MuiButton,
    Chip
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { IDeleteInventory, IDeleteInventoryResponse } from './interface';
import { useContext, useEffect } from 'react';
import { InventoryContext } from '../../context/inventory';
import moment from 'moment';
import { toast } from 'react-toastify';
import { deleteInventoryService } from './service';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { deleteInventory } from './slice';

// Define brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';
const ERROR_COLOR = '#d32f2f';

const DeleteInventory = ({
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText
}: IDeleteInventory) => {
    const { currentInventory } = useContext(InventoryContext);
    const dispatch = useDispatch<AppDispatch>();
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        return moment(dateString).format('DD MMM YYYY');
    };

    const handleDeactivate = async (id: string | number) => {
        if (!id) return;

        setSendingRequest(true);
        try {
            const response = await deleteInventoryService(id) as IDeleteInventoryResponse;
            if (response.status === 201) {
                dispatch(deleteInventory(currentInventory));
                toast.success(response.data.message || "Inventory deleted successfully");
            }
        } catch (error) {
            console.error("Failed to delete inventory:", error);
            toast.error("Failed to delete inventory");
        } finally {
            setSendingRequest(false);
            handleClose();
        }
    };

    useEffect(() => {
        console.log("Current Inventory to delete:", currentInventory);
    }, [currentInventory]);

    return (
        <Fade in={true}>
            <Box>
                {/* Warning Header */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: 2,
                        bgcolor: alpha(ERROR_COLOR, 0.05),
                        border: `1px solid ${alpha(ERROR_COLOR, 0.2)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <Avatar
                        sx={{
                            bgcolor: alpha(ERROR_COLOR, 0.15),
                            color: ERROR_COLOR,
                            width: 48,
                            height: 48
                        }}
                    >
                        <WarningAmberIcon />
                    </Avatar>

                    <Box>
                        <Typography variant="h6" sx={{ color: ERROR_COLOR, fontWeight: 600 }}>
                            Delete Inventory Item
                        </Typography>
                        <Typography variant="body2" sx={{ color: alpha(ERROR_COLOR, 0.8) }}>
                            This action cannot be undone. Please confirm carefully.
                        </Typography>
                    </Box>
                </Paper>

                {/* Inventory Details */}
                <Box sx={{ mb: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 2,
                            border: `1px solid ${alpha('#000', 0.08)}`,
                            bgcolor: 'white'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1.5,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    color: PRIMARY_COLOR,
                                    width: 36,
                                    height: 36
                                }}
                            >
                                <InventoryOutlinedIcon />
                            </Box>
                            <Typography variant="h6" fontWeight={600}>
                                {currentInventory?.name}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            {/* LPO Number */}
                            {currentInventory?.lpoNumber && (
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 0.8,
                                                bgcolor: alpha(SECONDARY_COLOR, 0.1),
                                                color: SECONDARY_COLOR,
                                                width: 28,
                                                height: 28
                                            }}
                                        >
                                            <ReceiptOutlinedIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                LPO Number
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {currentInventory.lpoNumber}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}

                            {/* Supplier */}
                            {currentInventory?.supplier?.name && (
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 0.8,
                                                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                                color: PRIMARY_COLOR,
                                                width: 28,
                                                height: 28
                                            }}
                                        >
                                            <BusinessOutlinedIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Supplier
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {currentInventory.supplier.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}

                            {/* Create Date */}
                            {currentInventory?.createDate && (
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 0.8,
                                                bgcolor: alpha('#000', 0.05),
                                                color: 'text.secondary',
                                                width: 28,
                                                height: 28
                                            }}
                                        >
                                            <CalendarTodayOutlinedIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Delivery Date
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {formatDate(currentInventory.createDate)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}

                            {/* Status */}
                            {currentInventory?.status && (
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Current Status:
                                        </Typography>
                                        {renderStatusChip(currentInventory.status.status || '')}
                                    </Box>
                                </Grid>
                            )}
                        </Grid>

                        {/* Commodities Summary */}
                        {currentInventory?.commodities && currentInventory.commodities.length > 0 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1 }}>
                                    This inventory contains {currentInventory.commodities.length} commodities
                                </Typography>
                            </>
                        )}
                    </Paper>
                </Box>

                {/* Confirmation Text */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: 2,
                        bgcolor: alpha('#FFF59D', 0.3),
                        border: `1px solid ${alpha('#F57F17', 0.2)}`
                    }}
                >
                    <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                        Are you absolutely sure you want to delete this inventory item?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This will remove all associated data, including commodities, GRN reports, and other related information.
                    </Typography>
                </Paper>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <MuiButton
                        onClick={handleClose}
                        color="inherit"
                        variant="outlined"
                        disabled={sendingRequest}
                        sx={{
                            px: 3,
                            py: 1,
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: alpha('#000', 0.3),
                                bgcolor: alpha('#000', 0.03)
                            }
                        }}
                    >
                        Cancel
                    </MuiButton>

                    <MuiButton
                        onClick={() => handleDeactivate(currentInventory?.id as string)}
                        color="error"
                        variant="contained"
                        disabled={sendingRequest}
                        startIcon={<DeleteOutlineIcon />}
                        sx={{
                            px: 3,
                            py: 1,
                            boxShadow: `0 2px 6px ${alpha(ERROR_COLOR, 0.3)}`,
                            '&:hover': {
                                boxShadow: `0 4px 12px ${alpha(ERROR_COLOR, 0.4)}`,
                            }
                        }}
                    >
                        {sendingRequest ? 'Deleting...' : buttonText}
                    </MuiButton>
                </Box>
            </Box>
        </Fade>
    );
};

// Helper function to render status chip with appropriate color
const renderStatusChip = (status: string) => {
    let color = 'default';
    let bgcolor = alpha('#757575', 0.1);
    let textColor = '#757575';

    switch (status.toLowerCase()) {
        case 'active':
        case 'completed':
            color = 'success';
            bgcolor = alpha('#2e7d32', 0.08);
            textColor = '#2e7d32';
            break;
        case 'pending':
            color = 'warning';
            bgcolor = alpha('#ed6c02', 0.08);
            textColor = '#ed6c02';
            break;
        case 'cancelled':
            color = 'error';
            bgcolor = alpha('#d32f2f', 0.08);
            textColor = '#d32f2f';
            break;
    }

    return (
        <Chip
            label={status}
            size="small"
            sx={{
                fontWeight: 600,
                bgcolor: bgcolor,
                color: textColor,
                border: 'none'
            }}
        />
    );
};

export default DeleteInventory;