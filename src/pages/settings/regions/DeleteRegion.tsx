/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack, Typography, Box, alpha, useTheme, Alert, Divider } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ButtonComponent from '../../../components/forms/Button';
import { toast } from 'react-toastify';
import { IDeleteRegion } from './interface';
import RegionUtills from './utills';
import { deleteRegionService } from './service';
import { IResponseData } from '../../users/interface';

const DeleteRegion = ({
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText,
    region
}: IDeleteRegion) => {
    const { removeRegionFromStore } = RegionUtills();
    const theme = useTheme();

    const deleteRegion = async () => {
        setSendingRequest(true);
        try {
            const response = await deleteRegionService(region?.id as string) as IResponseData;
            if (response?.status === "success") {
                removeRegionFromStore(region);
                handleClose();
                toast.success(response?.data?.message || "Region deleted successfully");
            } else {
                toast.error("Failed to delete region");
            }
        } catch (error) {
            console.error('Error deleting region:', error);
            toast.error("An error occurred while deleting the region");
        } finally {
            setSendingRequest(false);
        }
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
                    This action cannot be undone. The region and all associated data will be permanently removed.
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
                        Deleting this region may affect branches and organizational structure assigned to it.
                    </Typography>
                </Alert>

                {/* Region details */}
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        mb: 3
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <PublicOutlinedIcon color="primary" />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {region.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ID: {region.id}
                            </Typography>
                        </Box>
                    </Stack>
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
                    Are you sure you want to delete this region?
                </Typography>

                <Stack direction="row" spacing={2}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor="inherit"
                        type="button"
                        variant="outlined"
                        sendingRequest={false}
                        buttonText="Cancel"
                    />
                    <ButtonComponent
                        buttonColor="error"
                        type="button"
                        handleClick={deleteRegion}
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                    />
                </Stack>
            </Grid>
        </Grid>
    );
};

export default DeleteRegion;