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
    useTheme,
    Paper,
    alpha,
    Chip,
    Fade,
    Card,
    Avatar,
    Button as MuiButton
} from "@mui/material";
import { IAcknowledegeReceipt, IRequestAxiosResponse } from "../interface";
import { ICommodity } from "../../settings/commodity/interface";
import { acknowledgeIssuanceService, findAssetRequestByIDService } from "./service";
import { toast } from "react-toastify";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AssetTable from "../../../components/assetTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { updateRequest } from "./slice";
import DescriptionText from "../../dashboard/sections/DescriptionText";

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

const AcknowledgeReceipt = ({
    request,
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText = "Acknowledge Receipt"
}: IAcknowledegeReceipt) => {
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [requestCommodities, setRequestCommodities] = useState<
        Array<{ commodity: ICommodity; quantity: number }>
    >([]);
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

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

    const handleRequestAcknowledgement = async () => {
        if (!comment.trim()) {
            toast.error("Please provide a comment before acknowledging receipt.");
            return;
        }

        setSendingRequest(true);
        try {
            /**
             * NB: Please note that the status ID must match the Receipt Acknowledged in the Database.
             */
            const data = {
                requestId: request.id,
                statusId: 7, // Receipt Acknowledged Status ID
                comment
            }

            const response = await acknowledgeIssuanceService(data) as IRequestAxiosResponse;
            if (response.status === 201) {
                toast.success("Item Receipt Acknowledged Successfully.");
                dispatch(updateRequest(response.data));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to acknowledge receipt. Please try again.");
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
                {/* Header Section - Fixed Height */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(to right, ${alpha(PRIMARY_COLOR, 0.05)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0 // Prevent header from shrinking
                    }}
                >
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: PRIMARY_COLOR }} />

                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} sm={7}>
                            <Stack spacing={0.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <DoneAllIcon
                                        sx={{
                                            color: SECONDARY_COLOR,
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
                                        Receipt Acknowledgement
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
                                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                        color: PRIMARY_COLOR,
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

                {/* Confirmation Message */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: 1,
                        bgcolor: alpha(SECONDARY_COLOR, 0.05),
                        border: `1px solid ${alpha(SECONDARY_COLOR, 0.2)}`,
                        flexShrink: 0
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleOutlineIcon sx={{ color: SECONDARY_COLOR }} />
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 500,
                                color: SECONDARY_COLOR,
                                fontSize: '0.95rem'
                            }}
                        >
                            Confirm that you've received all requested items
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
                        This will mark the request as completed in the system.
                    </Typography>
                </Paper>

                {/* Scrollable Content Area */}
                <Box sx={{
                    flex: 1,
                    overflow: 'auto',
                    minHeight: 0, // Important for nested flexbox scrolling
                    pb: 1.5
                }}>
                    <Grid container spacing={2}>
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
                                        Requested Items
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
                                    border: `1px solid ${alpha('#000', 0.05)}`,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}
                            >
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                                    <CommentOutlinedIcon
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
                                        Receipt Comment
                                    </Typography>
                                </Stack>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}  // Reduced from 3 to save space
                                    placeholder="Please add any comments about the received items..."
                                    variant="outlined"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    size="small"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 1,
                                            bgcolor: alpha('#f5f5f5', 0.3),
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
                                    * Comment is required to confirm receipt
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
                            color: alpha(PRIMARY_COLOR, 0.7),
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.8rem'
                        }}
                    >
                        <ThumbUpOffAltIcon sx={{ fontSize: '0.9rem' }} />
                        Please confirm all items have been received as requested
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
                            onClick={handleRequestAcknowledgement}
                            color="primary"
                            type="submit"
                            variant="contained"
                            disabled={sendingRequest}
                            size="small"
                            startIcon={<CheckCircleOutlineIcon />}
                            sx={{
                                px: 2,
                                boxShadow: `0 4px 8px ${alpha(PRIMARY_COLOR, 0.2)}`,
                                '&:hover': {
                                    boxShadow: `0 4px 12px ${alpha(PRIMARY_COLOR, 0.25)}`,
                                }
                            }}
                        >{buttonText || "Acknowledge Receipt"}</MuiButton>
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
};

export default AcknowledgeReceipt;