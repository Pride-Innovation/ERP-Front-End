/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Stack,
    Typography,
    Box,
    alpha,
    useTheme,
    Divider,
    Paper,
    Avatar,
    Button as MuiButton,
    CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { toast } from 'react-toastify';
import { IDeleteAssetType } from './interface';
import { deleteAssetTypeService } from './service';
import AssetTypeUtills from './utills';

const DeleteAssetType = ({
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText,
    assetType,
}: IDeleteAssetType) => {
    const { removeAssetTypeFromStore } = AssetTypeUtills();
    const theme = useTheme();

    const handleDelete = async () => {
        setSendingRequest(true);
        try {
            const response = await deleteAssetTypeService(assetType.id as string) as any;
            if (response?.status === 200) {
                removeAssetTypeFromStore(assetType);
                handleClose();
                toast.success('Asset category deleted successfully', { position: 'bottom-right' });
            }
        } catch (error: any) {
            const status = error?.response?.status;
            const detail = error?.response?.data?.detail;
            const message = error?.response?.data?.message;
            if (status === 409) {
                toast.error(
                    'Cannot delete this category. It is still linked to commodities or assets.',
                    { position: 'bottom-right' }
                );
            } else if (detail) {
                toast.error(detail, { position: 'bottom-right' });
            } else if (message) {
                toast.error(message, { position: 'bottom-right' });
            } else {
                toast.error('Failed to delete asset category. Please try again.', { position: 'bottom-right' });
            }
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* Warning Header */}
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
                        Confirm Category Deletion
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This action is permanent and cannot be undone
                    </Typography>
                </Box>
            </Box>

            {/* Body */}
            <Box sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: '#1E293B' }}>
                    Deleting this asset category will:
                </Typography>
                <Box sx={{ ml: 2, pl: 2, mb: 3, borderLeft: `3px solid ${alpha(theme.palette.warning.main, 0.5)}` }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        • Permanently remove the category from the system
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        • This may affect commodities and assets linked to this category
                    </Typography>
                    <Typography variant="body2">
                        • Categories with existing commodities or assets cannot be deleted
                    </Typography>
                </Box>

                {/* Category Info Card */}
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
                            <CategoryOutlinedIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                {assetType.name}
                            </Typography>
                            {assetType.shortCode && (
                                <Typography variant="body2" color="text.secondary">
                                    Code: <strong>{assetType.shortCode}</strong>
                                </Typography>
                            )}
                            {assetType.description && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                    {assetType.description}
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
                        type="button"
                        variant="outlined"
                        color="inherit"
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
                        onClick={handleDelete}
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

export default DeleteAssetType;
