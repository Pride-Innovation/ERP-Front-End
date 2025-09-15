/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Paper,
    Stack,
    Typography,
    Divider,
    alpha,
    useTheme,
    Button,
    Fade,
    Chip,
    Button as MuiButton
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { IDeleteRequest, IRequestAxiosResponse } from './interface';
import GlobalRequestUtill from './utill';
import { deleteTranportRequestService } from './transportRequest/service';
import { toast } from 'react-toastify';
import TransportRequestUtills from './transportRequest/utills';
import { deleteAssetRequestService } from './assetRequest/service';
import RequestUtills from './assetRequest/utills';

const DeleteRequest = ({
    request,
    handleClose,
    sendingRequest,
    setSendingRequest,
    buttonText = "Delete Request"
}: IDeleteRequest) => {
    const theme = useTheme();
    const { isIRequest, isITransportRequest } = GlobalRequestUtill();
    const { removeTransportRequestFromStore } = TransportRequestUtills();
    const { removeAssetRequestFromStore } = RequestUtills();

    // Determine request type and extract key information
    const isAssetRequest = isIRequest(request);
    const isTransportRequest = isITransportRequest(request);

    const requestName = isAssetRequest ? request?.name :
        isTransportRequest ? request.purpose :
            "Unknown Request";

    const requestDescription = isAssetRequest ? request?.description :
        isTransportRequest ? request.purpose :
            "No description available";

    const requestType = isAssetRequest ? "Asset Request" :
        isTransportRequest ? "Transport Request" :
            "Request";

    const deleteTranportRequest = async () => {
        setSendingRequest(true);
        try {
            const response = isTransportRequest
                ? await deleteTranportRequestService(request?.id as string)
                : await deleteAssetRequestService(request?.id as string) as IRequestAxiosResponse;

            if (response.status === 201) {
                if (isTransportRequest) {
                    removeTransportRequestFromStore(request);
                } else {
                    removeAssetRequestFromStore(request);
                }
                toast.success(response?.data?.message || "Request deleted successfully");
                handleClose();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete the request. Please try again.");
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Fade in={true}>
            <Box sx={{ width: '100%' }}>
                {/* Warning Header */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 2.5,
                        borderRadius: '12px 12px 0 0',
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                        borderBottom: `3px solid ${theme.palette.error.main}`,
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                borderRadius: '50%',
                                width: 48,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <WarningAmberIcon
                                sx={{
                                    color: theme.palette.error.main,
                                    fontSize: 28
                                }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                Delete Confirmation
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                This action will permanently delete this request and cannot be undone.
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {/* Request Details */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        mb: 2.5
                    }}
                >
                    <Stack spacing={2}>
                        {/* Request Type & ID */}
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <InfoOutlinedIcon
                                    sx={{
                                        color: theme.palette.primary.main,
                                        fontSize: 20
                                    }}
                                />
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={500}
                                    color={theme.palette.primary.main}
                                >
                                    Request Details
                                </Typography>
                            </Stack>

                            <Chip
                                label={requestType}
                                size="small"
                                sx={{
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    color: theme.palette.info.dark,
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                }}
                            />
                        </Stack>

                        <Divider sx={{ opacity: 0.6 }} />

                        {/* Request Name */}
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: 'block',
                                    mb: 0.5,
                                    fontWeight: 500
                                }}
                            >
                                REQUEST NAME
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {requestName}
                            </Typography>
                        </Box>

                        {/* Request ID if available */}
                        {request?.id && (
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display: 'block',
                                        mb: 0.5,
                                        fontWeight: 500
                                    }}
                                >
                                    REQUEST ID
                                </Typography>
                                <Chip
                                    label={`#${request.id}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        height: 24,
                                        fontSize: '0.75rem'
                                    }}
                                />
                            </Box>
                        )}

                        {/* Request Description */}
                        {requestDescription && (
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display: 'block',
                                        mb: 0.5,
                                        fontWeight: 500,
                                        // display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    <DescriptionOutlinedIcon sx={{ fontSize: 14 }} />
                                    DESCRIPTION
                                </Typography>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        bgcolor: alpha(theme.palette.background.default, 0.5),
                                        borderRadius: 1,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        {requestDescription}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </Paper>

                {/* Action Buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 3
                    }}
                >
                    <Typography
                        variant="caption"
                        color="error.main"
                        sx={{
                            fontStyle: 'italic',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}
                    >
                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                        This action cannot be undone
                    </Typography>

                    <Stack direction="row" spacing={2}>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            color="inherit"
                            size="large"
                            sx={{
                                px: 3,
                                borderColor: alpha('#000', 0.12),
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    borderColor: alpha('#000', 0.25),
                                    bgcolor: alpha('#000', 0.03)
                                }
                            }}
                        >
                            Cancel
                        </Button>

                        <MuiButton
                            onClick={deleteTranportRequest}
                            color="error"
                            type="submit"
                            // sendingRequest={sendingRequest}
                            variant='outlined'
                            // buttonText={buttonText}
                            startIcon={<DeleteOutlineIcon />}
                            sx={{
                                px: 3,
                                // boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.25)}`,
                                '&:hover': {
                                    boxShadow: `0 6px 14px ${alpha(theme.palette.error.main, 0.3)}`,
                                }
                            }}
                        >{buttonText}</MuiButton>
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
};

export default DeleteRequest;