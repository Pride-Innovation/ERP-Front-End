/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    Stack,
    Typography,
    Container,
    alpha,
    Paper,
    Breadcrumbs,
    Link as MuiLink,
    Button as MuiButton,
    Chip,
    Tooltip
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import ButtonComponent from "../../../../components/forms/Button";
import { useContext, useEffect, useState } from "react";
import { IRequest, IRequestAxiosResponse, IRequestReport } from "../../interface";
import { findAssetRequestByIDService } from "../service";
import TabComponent from "../../../../components/tabs";
import OtherDetails from "./OtherDetails";
import RequestCommodties from "./RequestCommodties";
import { ICommodity } from "../../../settings/commodity/interface";
import RequestReports from "./RequestReports";
import RequestUtills from "../utills";
import { RequestContext } from "../../../../context/request/RequestContext";
import Loading from "../../../../components/loading";
import moment from "moment";

// Icons
import HomeIcon from '@mui/icons-material/Home';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import InventoryIcon from '@mui/icons-material/Inventory';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import TimelineDot from "../../../../components/timeLineDots";

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

// Enhanced Detail Section Component (similar to ITEquipmentDetails)
const EnhancedDetailSection = ({
    label,
    text,
    icon,
    chip,
    emptyMessage = "Not specified"
}: {
    label: string;
    text: string | null | undefined;
    icon?: JSX.Element;
    chip?: JSX.Element;
    emptyMessage?: string;
}) => {
    const isEmpty = text === null || text === undefined || text === '';

    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                p: 1.8,
                mb: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${alpha('#000', 0.06)}`,
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: alpha(PRIMARY_COLOR, 0.3),
                    boxShadow: `0 2px 8px ${alpha('#000', 0.05)}`,
                    bgcolor: alpha('#fff', 0.9)
                }
            }}
        >
            <Box
                sx={{
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    bgcolor: alpha(PRIMARY_COLOR, 0.08),
                    color: PRIMARY_COLOR,
                    width: 34,
                    height: 34,
                    flexShrink: 0
                }}
            >
                {icon}
            </Box>

            <Box sx={{ width: '100%' }}>
                <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                    sx={{ fontWeight: 500, mb: 0.5 }}
                >
                    {label}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: isEmpty ? 400 : 500,
                        color: isEmpty ? 'text.disabled' : 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    {chip ? (
                        chip
                    ) : (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {label === "Status" && text && <Box sx={{ mr: 1 }}><TimelineDot status={text} /></Box>}

                            {isEmpty ? (
                                <Typography variant="body2" fontStyle="italic" color="text.disabled">
                                    {emptyMessage}
                                </Typography>
                            ) : (
                                text
                            )}
                        </Box>
                    )}
                </Typography>
            </Box>
        </Paper>
    );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'requestcreated':
                return '#3f51b5'; // Indigo
            case 'approved':
                return '#4caf50'; // Green
            case 'rejected':
                return '#f44336'; // Red
            case 'pending':
                return '#ff9800'; // Orange
            default:
                return '#757575'; // Grey
        }
    };

    const color = getStatusColor(status);

    return (
        <Chip
            size="small"
            label={status.replace(/([A-Z])/g, ' $1').trim()}
            sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                fontWeight: 500,
                border: `1px solid ${alpha(color, 0.2)}`
            }}
        />
    );
};

const RequestDetails = () => {
    const [request, setRequest] = useState<IRequest>({} as IRequest);
    const [loading, setLoading] = useState<boolean>(true);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        acknowledgeIssuance,
        acknowledgeRequest,
        issuanceApproval,
        currentIssuance
    } = useContext(RequestContext);

    const {
        findAcknowledgeIssuanceReceiptByRequestId,
        findAcknowledgeRequestReceiptByRequestId,
        findIssuanceApprovalRecordByRequestId,
        fetchIssuanceByRequestId
    } = RequestUtills();

    const fetchRequestDetails = async () => {
        setLoading(true);
        try {
            const response = await findAssetRequestByIDService(id as string) as IRequestAxiosResponse;
            if (response.status === 200) {
                setRequest(response.data);
            }
        } catch (error) {
            console.error("Error fetching request details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchRequestDetails();
        }
    }, [id]);

    useEffect(() => {
        if (request.id) {
            findAcknowledgeIssuanceReceiptByRequestId(request.id as number);
            findAcknowledgeRequestReceiptByRequestId(request.id as number);
            findIssuanceApprovalRecordByRequestId(request.id as number);
            fetchIssuanceByRequestId(request.id as number);
        }
    }, [request]);

    const getPriorityChip = (priority: string | undefined) => {
        if (!priority) return null;

        switch (priority.toLowerCase()) {
            case 'high':
                return (
                    <Chip
                        icon={<PriorityHighIcon fontSize="small" />}
                        label="High Priority"
                        size="small"
                        sx={{
                            bgcolor: alpha('#f44336', 0.1),
                            color: '#f44336',
                            fontWeight: 500,
                            border: `1px solid ${alpha('#f44336', 0.2)}`
                        }}
                    />
                );
            case 'medium':
                return (
                    <Chip
                        icon={<DoNotDisturbAltIcon fontSize="small" />}
                        label="Medium Priority"
                        size="small"
                        sx={{
                            bgcolor: alpha(SECONDARY_COLOR, 0.1),
                            color: SECONDARY_COLOR,
                            fontWeight: 500,
                            border: `1px solid ${alpha(SECONDARY_COLOR, 0.2)}`
                        }}
                    />
                );
            case 'low':
                return (
                    <Chip
                        icon={<SpeedIcon fontSize="small" />}
                        label="Low Priority"
                        size="small"
                        sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            fontWeight: 500,
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ pt: 3, pb: 3, bgcolor: '#F3F7FB', borderRadius: 2, border: `1px solid ${alpha('#000', 0.08)}` }}>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography
                            variant="h5"
                            fontWeight={600}
                            color={PRIMARY_COLOR}
                        >
                            {request.name || "Asset Request"}
                        </Typography>
                        {getPriorityChip(request.priority)}
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                        ID: # {request.id} • Created on: {moment(request.createDate).format('MMM DD, YYYY')}
                    </Typography>
                </Box>
            </Box>

            {loading ? (
                <Loading items='Asset Request' />
            ) : (
                <>
                    <Grid container spacing={3}>
                        {/* Left column - Request Summary */}
                        <Grid item xs={12} md={4}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                    height: '100%'
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color="text.secondary"
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <LibraryBooksIcon fontSize="small" />
                                            Request Summary
                                        </Typography>
                                        <Divider sx={{ mt: 1, mb: 2 }} />
                                    </Box>

                                    <EnhancedDetailSection
                                        label="Requested By"
                                        text={request.requester ? `${request.requester.firstName} ${request.requester.lastName}` : null}
                                        icon={<PersonIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Staff Number"
                                        text={request.requester?.staffNumber || null}
                                        icon={<AssignmentIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Department/Branch"
                                        text={request.requester?.branch?.name || null}
                                        icon={<LocationOnIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Request Status"
                                        text={request.status?.status || null}
                                        icon={<InventoryIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Date Created"
                                        text={request.createDate ? moment(request.createDate).format('MMMM DD, YYYY - h:mm A') : null}
                                        icon={<EventIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Last Modified"
                                        text={request.lastModified ? moment(request.lastModified).format('MMMM DD, YYYY - h:mm A') : null}
                                        icon={<AccessTimeIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Current Approver"
                                        text={request.currentApprover ? `${request.currentApprover.firstName} ${request.currentApprover.lastName}` : null}
                                        icon={<CheckCircleOutlineIcon fontSize="small" />}
                                    />

                                    <EnhancedDetailSection
                                        label="Request Status"
                                        text={request.status?.name || request.status?.status || null}
                                        icon={<InventoryIcon fontSize="small" />}
                                        chip={request?.status ? <StatusBadge status={request.status.status as string} /> : undefined}
                                    />

                                    <EnhancedDetailSection
                                        label="Priority"
                                        text={request.priority ? request.priority.charAt(0).toUpperCase() + request.priority.slice(1) : null}
                                        icon={<PriorityHighIcon fontSize="small" />}
                                        chip={getPriorityChip(request.priority) || undefined}
                                    />

                                    {request.description && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={600}
                                                color="text.secondary"
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    mb: 1
                                                }}
                                            >
                                                <DescriptionIcon fontSize="small" />
                                                Description
                                            </Typography>

                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 1.5,
                                                    bgcolor: alpha('#f5f5f5', 0.5),
                                                    border: `1px solid ${alpha('#000', 0.06)}`
                                                }}
                                            >
                                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                                    {request.description}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Right column - Tabs */}
                        <Grid item xs={12} md={8}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                    height: '100%'
                                }}
                            >
                                <CardContent>
                                    <TabComponent
                                        headers={[
                                            {
                                                label: "Requested Items",
                                                position: 0,
                                                content: (
                                                    <Box>
                                                        <RequestCommodties
                                                            requestCommodties={
                                                                request.commodities as Array<{
                                                                    commodity: ICommodity
                                                                    quantity: number
                                                                }>
                                                            }
                                                        />
                                                    </Box>
                                                )
                                            },
                                            {
                                                label: "Processing Details",
                                                position: 1,
                                                content: (
                                                    <Box>
                                                        <OtherDetails
                                                            acknowledgeIssuance={acknowledgeIssuance}
                                                            acknowledgeRequest={acknowledgeRequest}
                                                            issuanceApproval={issuanceApproval}
                                                            issuance={currentIssuance}
                                                            request={request}
                                                        />
                                                    </Box>
                                                )
                                            },
                                            {
                                                label: "Reports",
                                                position: 2,
                                                content: (
                                                    <Box>
                                                        <RequestReports
                                                            requestReports={request.requestReports as Array<IRequestReport>}
                                                        />
                                                    </Box>
                                                )
                                            }
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Action buttons */}
                    <Box
                        sx={{
                            mt: 3,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <MuiButton
                            color="inherit"
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                borderColor: alpha('#000', 0.2),
                                color: 'text.secondary',
                                '&:hover': {
                                    borderColor: alpha('#000', 0.3),
                                    backgroundColor: alpha('#000', 0.05)
                                }
                            }}
                        >
                            Back to Requests
                        </MuiButton>

                        <Stack direction="row" spacing={1.5}>
                            <MuiButton
                                color="primary"
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/requests/edit/${request.id}`)}
                                disabled={request.status?.status !== "requestCreated"}
                            >
                                Edit Request
                            </MuiButton>

                            {request.status?.status === "requestCreated" && (
                                <MuiButton
                                    color="success"
                                    variant="contained"
                                    onClick={() => navigate(`/requests/approve/${request.id}`)}
                                >
                                    Process Request
                                </MuiButton>
                            )}
                        </Stack>
                    </Box>
                </>
            )}
        </Container>
    );
};

export default RequestDetails;