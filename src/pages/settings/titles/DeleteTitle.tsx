/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack, Typography, Box, alpha, useTheme, Alert, Divider } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ButtonComponent from '../../../components/forms/Button';
import { toast } from 'react-toastify';
import { IDeleteTitle, ITitleAxiosResponse } from './interface';
import { deleteTitleService } from './service';
import TitleUtills from './utills';

const DeleteTitle = ({ sendingRequest, setSendingRequest, handleClose, buttonText, title }: IDeleteTitle) => {
    const { removeTitleFromStore } = TitleUtills();
    const theme = useTheme();

    const deleteTitle = async () => {
        setSendingRequest(true);
        try {
            const response = await deleteTitleService(title?.id as string) as ITitleAxiosResponse;
            if (response.status === 204) {
                toast.success("Title deleted successfully", { position: 'bottom-right' });
                removeTitleFromStore(title);
            }
        } catch (error) {
            console.error("Error deleting title:", error);
            toast.error("Failed to delete title. Please try again.", { position: 'bottom-right' });
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
                    This action cannot be undone. The title and its associations will be permanently removed.
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
                        Deleting this title may affect employees and organizational structure.
                    </Typography>
                </Alert>

                {/* Title details */}
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
                        <WorkOutlineOutlinedIcon color="primary" />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {title.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ID: {title.id}
                            </Typography>
                        </Box>
                    </Stack>

                    {title.reportsTo && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>Reports To:</strong> {title.reportsTo.name}
                        </Typography>
                    )}

                    {title.role && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            <strong>Role:</strong> {title.role.name}
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
                    Are you sure you want to delete this title?
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
                        handleClick={deleteTitle}
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                        // sx={{ px: 3 }}
                    />
                </Stack>
            </Grid>
        </Grid>
    );
};

export default DeleteTitle;