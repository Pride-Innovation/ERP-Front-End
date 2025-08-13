import {
    Avatar,
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Stack,
    Chip,
    Paper,
    CircularProgress,
    alpha,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import MaleLogo from '../../../statics/images/male.jpg'
import FemaleLogo from '../../../statics/images/Female.jpg'
import { formatDistanceToNow } from 'date-fns';
import Rating from '@mui/material/Rating';
import SectionUtills from './utills';
import { DashboardContext } from '../../../context/dashboard';
import { ICommodity } from '../../settings/commodity/interface';
import DescriptionText from './DescriptionText';
import ExpandableTable from './PersonalAssetsReport';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';

// Primary brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

// Status color mapping - refined with opacity options
const statusColors = {
    requestApproved: {
        main: "#1e8e3e", // darker green
        light: alpha("#1e8e3e", 0.1),
        border: alpha("#1e8e3e", 0.3)
    },
    requestPending: {
        main: "#f59300", // warmer orange
        light: alpha("#f59300", 0.1),
        border: alpha("#f59300", 0.3)
    },
    requestRejected: {
        main: "#d93025", // refined red
        light: alpha("#d93025", 0.1),
        border: alpha("#d93025", 0.3)
    },
    default: {
        main: "#5f6368", // neutral gray
        light: alpha("#5f6368", 0.1),
        border: alpha("#5f6368", 0.3)
    }
};

const LatestRequest = () => {
    const { findLatestPendingRequestsWithDetails } = SectionUtills();
    const { latestPendingRequests } = useContext(DashboardContext);

    const getTimeAgo = (date?: string | null) => {
        if (!date) return "Unknown";
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    useEffect(() => { findLatestPendingRequestsWithDetails() }, []);

    const getStatusColor = (status?: string) => {
        const statusKey = status as keyof typeof statusColors || 'default';
        return statusColors[statusKey] || statusColors.default;
    };

    return (
        <>
            <Grid item xs={12} md={8}>
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 1,
                        border: `1px solid ${alpha('#000', 0.08)}`,
                        boxShadow: `0 1px 3px ${alpha('#000', 0.1)}, 0 1px 2px ${alpha('#000', 0.06)}`,
                        mb: 2.5
                    }}
                >
                    <Box
                        sx={{
                            px: 3,
                            py: 2.5,
                            borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Box display="flex" alignItems="center">
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                    color: PRIMARY_COLOR,
                                    mr: 2
                                }}
                            >
                                <AssignmentIcon fontSize="small" />
                            </Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    fontSize: '1.1rem'
                                }}
                            >
                                Latest Requests
                            </Typography>
                        </Box>
                        <Chip
                            label={`${latestPendingRequests.length} Requests`}
                            size="small"
                            sx={{
                                bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                color: PRIMARY_COLOR,
                                fontWeight: 600,
                                border: 'none'
                            }}
                        />
                    </Box>

                    <CardContent sx={{ px: 3, py: 2.5 }}>
                        {latestPendingRequests.length === 0 ? (
                            <Box py={5} textAlign="center">
                                <CircularProgress size={24} sx={{ mb: 2, color: PRIMARY_COLOR }} />
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    Loading requests or no requests available
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2.5}>
                                {latestPendingRequests.map((request, index) => {
                                    const statusColor = getStatusColor(request.status?.status as string);

                                    return (
                                        <Paper
                                            key={request.id || index}
                                            elevation={0}
                                            sx={{
                                                border: `1px solid ${alpha('#000', 0.08)}`,
                                                borderRadius: 1,
                                                p: 0,
                                                overflow: 'hidden',
                                                transition: 'box-shadow 0.2s ease-in-out',
                                                '&:hover': {
                                                    boxShadow: `0 4px 12px ${alpha('#000', 0.05)}`
                                                }
                                            }}
                                        >
                                            {/* Request Header - Requester & Status */}
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start",
                                                    bgcolor: alpha(statusColor.main, 0.03),
                                                    p: 2,
                                                    borderBottom: `1px solid ${alpha('#000', 0.06)}`
                                                }}
                                            >
                                                {/* Requester Info */}
                                                <Box display="flex" alignItems="center">
                                                    <Avatar
                                                        src={request.requester?.profileImage ||
                                                            (request.requester?.gender?.toLowerCase() === 'male' ? MaleLogo : FemaleLogo)
                                                        }
                                                        sx={{
                                                            width: 42,
                                                            height: 42,
                                                            border: `2px solid ${alpha(statusColor.main, 0.3)}`
                                                        }}
                                                    />
                                                    <Box ml={2}>
                                                        <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                                            {request.requester?.firstName + " " + request.requester?.lastName}
                                                        </Typography>
                                                        <Box display="flex" alignItems="center" mt={0.3}>
                                                            <Box display="flex" alignItems="center" mr={1.5}>
                                                                <AccessTimeIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {getTimeAgo(request.createDate)}
                                                                </Typography>
                                                            </Box>
                                                            <Box display="flex" alignItems="center">
                                                                <LocationOnIcon sx={{ fontSize: '0.875rem', color: PRIMARY_COLOR, mr: 0.5 }} />
                                                                <Typography
                                                                    variant="caption"
                                                                    fontWeight="500"
                                                                    sx={{ color: PRIMARY_COLOR }}
                                                                >
                                                                    {request.requester?.branch?.name}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>

                                                {/* Status Badge */}
                                                <Chip
                                                    label={request.status?.name || "Unknown Status"}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: statusColor.light,
                                                        color: statusColor.main,
                                                        fontWeight: 600,
                                                        border: `1px solid ${statusColor.border}`,
                                                        height: 24
                                                    }}
                                                />
                                            </Box>

                                            {/* Request Body */}
                                            <Box sx={{ p: 2.5 }}>
                                                {/* Request Title & Priority */}
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                    mb={1.5}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={600}
                                                        color="text.primary"
                                                        sx={{ fontSize: '1rem' }}
                                                    >
                                                        {request.name || "Unnamed Request"}
                                                    </Typography>
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        sx={{
                                                            bgcolor: alpha(SECONDARY_COLOR, 0.05),
                                                            px: 1.5,
                                                            py: 0.5,
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        <Typography variant="caption" color="text.secondary" mr={1}>
                                                            Priority:
                                                        </Typography>
                                                        <Rating
                                                            name="read-only"
                                                            value={request.priority === "low" ? 3 :
                                                                request.priority === "medium" ? 4 : 5}
                                                            readOnly
                                                            size="small"
                                                            sx={{ color: SECONDARY_COLOR }}
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* Description */}
                                                <Box sx={{ mb: 2 }}>
                                                    <DescriptionText
                                                        description={request.description as string}
                                                        MAX_LENGTH={150}
                                                    />
                                                </Box>

                                                {/* Commodities */}
                                                {(request.commodities?.length as number) > 0 && (
                                                    <Box
                                                        mt={2}
                                                        p={1.5}
                                                        bgcolor={alpha('#f5f5f5', 0.5)}
                                                        borderRadius={1}
                                                        border={`1px solid ${alpha('#000', 0.05)}`}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            fontWeight={500}
                                                            display="block"
                                                            mb={1}
                                                        >
                                                            Requested Items:
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.8}>
                                                            {(request.commodities as Array<{
                                                                commodity: ICommodity,
                                                                quantity: number
                                                            }>).map((commodity, idx) => (
                                                                <Chip
                                                                    key={commodity.commodity.id}
                                                                    avatar={
                                                                        <Avatar
                                                                            sx={{
                                                                                bgcolor: idx % 2 === 0 ? PRIMARY_COLOR : SECONDARY_COLOR,
                                                                                color: 'white !important',
                                                                                width: 24,
                                                                                height: 24,
                                                                                fontSize: '0.75rem'
                                                                            }}
                                                                        >
                                                                            {commodity.quantity}
                                                                        </Avatar>
                                                                    }
                                                                    label={commodity.commodity.name}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: idx % 2 === 0 ? alpha(PRIMARY_COLOR, 0.05) : alpha(SECONDARY_COLOR, 0.05),
                                                                        borderColor: idx % 2 === 0 ? alpha(PRIMARY_COLOR, 0.2) : alpha(SECONDARY_COLOR, 0.2),
                                                                        color: idx % 2 === 0 ? PRIMARY_COLOR : SECONDARY_COLOR,
                                                                        '& .MuiChip-label': {
                                                                            fontWeight: 500,
                                                                            px: 1
                                                                        }
                                                                    }}
                                                                />
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                )}

                                                {/* Current Approver & Actions */}
                                                <Box
                                                    mt={2.5}
                                                    pt={2}
                                                    display="flex"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    sx={{ borderTop: `1px solid ${alpha('#000', 0.06)}` }}
                                                >
                                                    <Box display="flex" alignItems="center">
                                                        {request.currentApprover && (
                                                            <>
                                                                <PersonIcon
                                                                    sx={{
                                                                        color: alpha('#000', 0.5),
                                                                        fontSize: '0.875rem',
                                                                        mr: 0.7
                                                                    }}
                                                                />
                                                                <Typography variant="caption" color="text.secondary" mr={0.5}>
                                                                    Current Approver:
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    fontWeight="600"
                                                                    color="text.primary"
                                                                >
                                                                    {request.currentApprover.firstName} {request.currentApprover.lastName}
                                                                </Typography>
                                                            </>
                                                        )}
                                                    </Box>

                                                    <Link
                                                        to={`/assets-mgt/asset-request/view/${request.id}`}
                                                        style={{ textDecoration: 'none' }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            color={PRIMARY_COLOR}
                                                            fontWeight="600"
                                                            sx={{
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                px: 1.5,
                                                                py: 0.6,
                                                                borderRadius: 1,
                                                                transition: 'all 0.2s',
                                                                '&:hover': {
                                                                    bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                                                }
                                                            }}
                                                        >
                                                            View Details →
                                                        </Typography>
                                                    </Link>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        )}
                    </CardContent>
                </Card>

                {/* Personal Assets Report */}
                <ExpandableTable />
            </Grid>
        </>
    );
};

export default LatestRequest;