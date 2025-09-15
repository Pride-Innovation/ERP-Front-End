import { useEffect, useState } from "react";
import {
    Grid,
    Stack,
    Typography,
    TextField,
    CircularProgress,
    useTheme,
    Box,
    Paper,
    alpha,
    Chip,
    Button as MuiButton
} from "@mui/material";
import {
    IAcknowledegeRequest,
    IRequestAxiosResponse
} from "../interface"
import { ICommodity } from "../../settings/commodity/interface";
import {
    acknowledgeRequestService,
    findAssetRequestByIDService
} from "./service";
import { toast } from "react-toastify";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import AssetTable from "../../../components/assetTable";
import DescriptionText from "../../dashboard/sections/DescriptionText";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { updateRequest } from "./slice";

const AcknowledgeRequest = ({
    request,
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText = "Acknowledge Request"
}: IAcknowledegeRequest) => {
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [requestCommodities, setRequestCommodities] = useState<
        Array<{ commodity: ICommodity; quantity: number }>
    >([]);
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    // Format date helper function
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

    const handleRequestAcknowledgement = async () => {
        if (!comment.trim()) {
            toast.error("Please provide a comment before approving.");
            return;
        }

        setSendingRequest(true);
        try {
            /**
             * NB: Please note that the status ID must match the Acknowledege Request Status ID in the Database.
             */
            const data = {
                requestId: request.id,
                statusId: 4, // Acknowledge Request Status ID
                comment
            }

            const response = await acknowledgeRequestService(data) as IRequestAxiosResponse;

            if (response.status === 201) {
                toast.success("Request acknowledged successfully.");
                dispatch(updateRequest(response.data));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to acknowledge request.");
        } finally {
            setSendingRequest(false);
            handleClose();
        }
    };

    // Get requester and current approver names
    const requesterName = request.requester?.firstName + ' ' + request.requester?.lastName || 'Unknown Requester';
    const currentApproverName = request.currentApprover?.firstName + ' ' + request.currentApprover?.lastName || 'Pending Approval';

    return (
        <Box sx={{
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <Paper elevation={0} sx={{
                p: 2,
                mb: 2,
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: alpha(theme.palette.primary.light, 0.03)
            }}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Request Acknowledgement
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <ThumbUpOffAltIcon color="primary" />
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                                    {request.name}
                                </Typography>
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                        }}>
                            <Chip
                                size="small"
                                icon={<ArticleOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />}
                                label={`Request #${request.id}`}
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    fontWeight: 500,
                                    '& .MuiChip-label': { px: 1 }
                                }}
                            />
                            <Chip
                                size="small"
                                label={`Created: ${formatDate(request.createDate as string)}`}
                                sx={{
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    color: theme.palette.secondary.main,
                                    fontWeight: 500,
                                    '& .MuiChip-label': { px: 1 }
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Main Content Area - horizontal layout */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                flex: 1,
                minHeight: 0, // Important for nested flex containers
            }}>
                <Grid container spacing={2} sx={{ height: '100%' }}>
                    {/* Left Side */}
                    <Grid item xs={12} md={4} sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            gap: 2
                        }}>
                            {/* People Info Panel */}
                            <Paper elevation={0} sx={{
                                p: 2,
                                borderRadius: 1,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                flex: '0 0 auto'
                            }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mb: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    <PersonOutlineIcon fontSize="small" />
                                    People
                                </Typography>

                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Requester:
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {requesterName}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Current Approver:
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {currentApproverName}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>

                            {/* Description Panel */}
                            <Paper elevation={0} sx={{
                                p: 2,
                                borderRadius: 1,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                flex: 1,
                                overflow: 'auto',
                                minHeight: 0
                            }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mb: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    <ArticleOutlinedIcon fontSize="small" />
                                    Description
                                </Typography>

                                <Box sx={{
                                    p: 1.5,
                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                                }}>
                                    <DescriptionText
                                        description={request.description as string || 'No description provided.'}
                                        MAX_LENGTH={500}
                                    />
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Right Side */}
                    <Grid item xs={12} md={8} sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            gap: 2
                        }}>
                            {/* Commodities Panel */}
                            <Paper elevation={0} sx={{
                                p: 2,
                                borderRadius: 1,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                flex: 3,
                                overflow: 'auto',
                                minHeight: 0
                            }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mb: 1.5,
                                        color: theme.palette.secondary.main,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    <InventoryOutlinedIcon fontSize="small" />
                                    Requested Commodities
                                </Typography>

                                {loading ? (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        height: 150
                                    }}>
                                        <CircularProgress size={24} />
                                        <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                                            Loading commodities...
                                        </Typography>
                                    </Box>
                                ) : requestCommodities.length > 0 ? (
                                    <Box sx={{
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        borderRadius: 1,
                                        overflow: 'hidden'
                                    }}>
                                        <AssetTable commodities={requestCommodities} />
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        bgcolor: alpha(theme.palette.background.default, 0.5),
                                        borderRadius: 1
                                    }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No commodities found for this request.
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>

                            {/* Comments Panel */}
                            <Paper elevation={0} sx={{
                                p: 2,
                                borderRadius: 1,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                flex: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0
                            }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mb: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    <CommentOutlinedIcon fontSize="small" />
                                    Acknowledgement Comment
                                </Typography>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Enter your comment for acknowledging this request..."
                                    variant="outlined"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    size="small"
                                    sx={{
                                        flex: 1,
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: alpha(theme.palette.background.default, 0.5),
                                            height: '100%',
                                        },
                                        '& .MuiInputBase-multiline': {
                                            height: '100% !important',
                                            alignItems: 'flex-start',
                                        },
                                        '& textarea': {
                                            height: '100% !important'
                                        }
                                    }}
                                />

                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                    * Comment is required before acknowledging
                                </Typography>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Footer with Actions */}
            <Box sx={{
                pt: 2,
                mt: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Please review all details before acknowledging
                </Typography>

                <Stack direction="row" spacing={2}>
                    <MuiButton
                        onClick={handleClose}
                        color="inherit"
                        type="button"
                        variant="outlined"
                        disabled={false}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        onClick={handleRequestAcknowledgement}
                        color="primary"
                        type="submit"
                        variant="outlined"
                        disabled={sendingRequest}
                        startIcon={<ThumbUpOffAltIcon />}
                    >
                        {buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default AcknowledgeRequest;