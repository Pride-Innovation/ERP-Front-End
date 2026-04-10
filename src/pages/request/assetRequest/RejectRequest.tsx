/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Stack,
    Typography,
    TextField,
    CircularProgress,
    Paper,
    alpha,
    Chip,
    useTheme,
    Fade,
    Card,
    Avatar,
    Button as MuiButton,
} from "@mui/material";
import { toast } from "react-toastify";
import {
    assetRequestApprovalRejectionService,
    findAssetRequestByIDService
} from "./service";
import { ICommodity } from "../../settings/commodity/interface";
import { IRejectRequest, IRequestAxiosResponse } from "../interface";
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import AssetTable from "../../../components/assetTable";
import DescriptionText from "../../dashboard/sections/DescriptionText";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { removeRequest } from "./slice";

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';
const ERROR_COLOR = '#d32f2f';

const RejectRequest = ({
    setSendingRequest,
    handleClose,
    request,
    sendingRequest,
    buttonText = "Reject Request",
}: IRejectRequest) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [requestCommodities, setRequestCommodities] = useState<
        Array<{ commodity: ICommodity; quantity: number }>
    >([]);

    // Format date helper
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const fetchRequestCommodities = async () => {
        setLoading(true);
        try {
            const response = (await findAssetRequestByIDService(
                request.id as number
            )) as IRequestAxiosResponse;

            if (
                response.status === 200 &&
                (response.data.commodities as Array<{ commodity: ICommodity; quantity: number }>)?.length > 0
            ) {
                setRequestCommodities(response.data.commodities as Array<{ commodity: ICommodity; quantity: number }>);
            } else {
                setRequestCommodities([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load commodities.");
            setRequestCommodities([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequestCommodities();
    }, []);

    const handleRequestRejection = async () => {
        if (!comment.trim()) {
            toast.error("Please provide a comment before rejecting.");
            return;
        }

        setSendingRequest(true);
        try {
            /**
             * NB: Please note that the status ID must match the Rejected Status ID in the Database.
             */
            const data = {
                requestId: request.id,
                approverId: request.currentApprover?.id,
                statusId: 2, // ID 2 must match the Rejected Status ID in the Database
                comment
            }
            const response = await assetRequestApprovalRejectionService(data) as IRequestAxiosResponse;
            if (response.status === 201) {
                toast.success("Request has been rejected.");
                dispatch(removeRequest(response.data)); // Filter out the rejected request from the store
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject request. Please try again.");
        } finally {
            setSendingRequest(false);
            handleClose();
        }
    };

    return (
        <Fade in={true}>
            <Box sx={{
                width: '100%',
                maxHeight: '90vh',  // Limit maximum height to 90% of viewport height
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // Hide overflow to respect maxHeight
            }}>
                {/* Warning Header Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(to right, ${alpha(ERROR_COLOR, 0.05)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                        border: `1px solid ${alpha(ERROR_COLOR, 0.2)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0 // Prevent header from shrinking
                    }}
                >
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: ERROR_COLOR }} />

                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} sm={7}>
                            <Stack spacing={0.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <WarningAmberIcon
                                        sx={{
                                            color: ERROR_COLOR,
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        Request Rejection
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    <InventoryOutlinedIcon sx={{ color: PRIMARY_COLOR, fontSize: '1.2rem' }} />
                                    {request.name}
                                </Typography>
                            </Stack>
                        </Grid>

                        <Grid item xs={12} sm={5}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 0.5 }}>
                                <Chip
                                    size="small"
                                    label={`Request #${request.id}`}
                                    sx={{
                                        bgcolor: alpha(ERROR_COLOR, 0.1),
                                        color: ERROR_COLOR,
                                        fontWeight: 500,
                                        height: 22
                                    }}
                                />

                                {request.createDate && (
                                    <Typography variant="caption" color="text.secondary">
                                        Submitted on {formatDate(request.createDate)}
                                    </Typography>
                                )}

                                {request.requester && (
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            By:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Avatar
                                                sx={{
                                                    width: 18,
                                                    height: 18,
                                                    fontSize: '0.7rem',
                                                    bgcolor: SECONDARY_COLOR
                                                }}
                                            >
                                                {request.requester.firstName?.charAt(0) || 'U'}
                                            </Avatar>
                                            <Typography variant="caption" fontWeight={500}>
                                                {request.requester.firstName} {request.requester.lastName}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Scrollable Content Area */}
                <Box sx={{
                    flex: 1,
                    overflow: 'auto',
                    minHeight: 0, // Important for nested flexbox scrolling
                    pb: 1.5
                }}>
                    <Grid container spacing={2}>
                        {/* Rejection Warning */}
                        <Grid item xs={12}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: alpha(ERROR_COLOR, 0.03),
                                    border: `1px solid ${alpha(ERROR_COLOR, 0.15)}`,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CancelOutlinedIcon sx={{ color: ERROR_COLOR }} />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 500,
                                            color: ERROR_COLOR,
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        Are you sure you want to reject this request?
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        mt: 0.5,
                                        color: 'text.secondary',
                                        pl: 3
                                    }}
                                >
                                    This action will deny the requestor access to the requested items.
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Description Section */}
                        <Grid item xs={12} md={5}>
                            <Card
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha('#000', 0.05)}`,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                                    <DescriptionOutlinedIcon
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            color: theme.palette.text.primary,
                                        }}
                                    >
                                        Request Description
                                    </Typography>
                                </Stack>

                                <Box sx={{
                                    bgcolor: alpha('#f5f5f5', 0.5),
                                    p: 1.5,
                                    borderRadius: 1,
                                    flex: 1,
                                    overflow: 'auto', // Make description scrollable if too long
                                    minHeight: 0 // Important for nested flexbox scrolling
                                }}>
                                    <DescriptionText
                                        description={request.description as string || 'No description provided.'}
                                        MAX_LENGTH={200}
                                    />
                                </Box>

                                {request.currentApprover && (
                                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px dashed ${alpha('#000', 0.1)}` }}>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <AssignmentIndOutlinedIcon
                                                sx={{
                                                    color: SECONDARY_COLOR,
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                                                You are rejecting as:
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        ml: 0.5,
                                                        color: SECONDARY_COLOR,
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {request.currentApprover.firstName} {request.currentApprover.lastName}
                                                </Typography>
                                            </Typography>
                                        </Stack>
                                    </Box>
                                )}
                            </Card>
                        </Grid>

                        {/* Commodities Section */}
                        <Grid item xs={12} md={7}>
                            <Card
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha('#000', 0.05)}`,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%'
                                }}
                            >
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                                    <InventoryOutlinedIcon
                                        sx={{
                                            color: SECONDARY_COLOR,
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            color: SECONDARY_COLOR,
                                        }}
                                    >
                                        Requested Commodities
                                    </Typography>
                                </Stack>

                                <Box sx={{
                                    flex: 1,
                                    overflow: 'auto', // Make table scrollable
                                    minHeight: 0, // Important for nested flexbox scrolling
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    {loading ? (
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            py: 3,
                                            flex: 1
                                        }}>
                                            <CircularProgress size={24} />
                                            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                                                Loading commodities...
                                            </Typography>
                                        </Box>
                                    ) : requestCommodities.length > 0 ? (
                                        <Box sx={{
                                            borderRadius: 1,
                                            border: `1px solid ${alpha('#000', 0.08)}`,
                                            overflow: 'auto',
                                            flex: 1
                                        }}>
                                            <AssetTable commodities={requestCommodities} />
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: alpha('#f5f5f5', 0.5),
                                            borderRadius: 1,
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                                                No commodities found for this request.
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Card>
                        </Grid>

                        {/* Comment Section */}
                        <Grid item xs={12}>
                            <Card
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(ERROR_COLOR, 0.1)}`,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}
                            >
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                                    <CommentOutlinedIcon
                                        sx={{
                                            color: ERROR_COLOR,
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            color: ERROR_COLOR,
                                        }}
                                    >
                                        Rejection Reason
                                    </Typography>
                                </Stack>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}  // Limited rows to save space
                                    placeholder="Please provide a reason for rejecting this request..."
                                    variant="outlined"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    size="small"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 1,
                                            bgcolor: alpha('#f5f5f5', 0.3),
                                            borderColor: alpha(ERROR_COLOR, 0.3),
                                            '&.Mui-focused': {
                                                borderColor: ERROR_COLOR
                                            }
                                        }
                                    }}
                                />

                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 0.5,
                                        display: 'block',
                                        color: alpha(theme.palette.text.secondary, 0.8),
                                        fontStyle: 'italic',
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    * Rejection reason is required and will be visible to the requester
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Footer with Buttons - Fixed Height */}
                <Box
                    sx={{
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: `1px solid ${alpha('#000', 0.08)}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0 // Prevent footer from shrinking
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: alpha(ERROR_COLOR, 0.7),
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.8rem'
                        }}
                    >
                        <WarningAmberIcon sx={{ fontSize: '0.9rem' }} />
                        This action cannot be undone
                    </Typography>

                    <Stack direction="row" spacing={1.5}>
                        <MuiButton
                            onClick={handleClose}
                            color="inherit"
                            type="button"
                            variant="outlined"
                            size="small"
                            sx={{
                                px: 2,
                                borderColor: alpha('#000', 0.12),
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    borderColor: alpha('#000', 0.25),
                                    bgcolor: alpha('#000', 0.03)
                                }
                            }}
                        >Cancel</MuiButton>
                        <MuiButton
                            onClick={handleRequestRejection}
                            color="error"
                            type="submit"
                            variant="contained"
                            disabled={sendingRequest}
                            size="small"
                            startIcon={<CancelOutlinedIcon />}
                            sx={{
                                px: 2,
                                boxShadow: `0 4px 8px ${alpha(ERROR_COLOR, 0.2)}`,
                                '&:hover': {
                                    boxShadow: `0 4px 12px ${alpha(ERROR_COLOR, 0.25)}`,
                                }
                            }}
                        >{buttonText || "Reject Request"}</MuiButton>
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
};

export default RejectRequest;