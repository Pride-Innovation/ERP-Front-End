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
    CircularProgress
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

// Status color mapping
const statusColors = {
    requestApproved: "#4caf50", // green
    requestPending: "#ff9800", // orange
    requestRejected: "#f44336", // red
    default: "#9e9e9e" // gray
};

const LatestRequest = () => {
    const { findLatestPendingRequestsWithDetails } = SectionUtills();
    const { latestPendingRequests } = useContext(DashboardContext);

    const getTimeAgo = (date?: string | null) => {
        if (!date) return "Unknown";
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    useEffect(() => { findLatestPendingRequestsWithDetails() }, []);

    return (
        <>
            <Grid item xs={12} md={9}>
                <Card elevation={3}>
                    <CardContent sx={{ px: 3, py: 4 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" color="#888" >Latest Requests</Typography>
                            <Chip
                                label={`${latestPendingRequests.length} Requests`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>

                        {latestPendingRequests.length === 0 ? (
                            <Box py={5} textAlign="center">
                                <CircularProgress size={20} sx={{ mb: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Loading requests or no requests available
                                </Typography>
                            </Box>
                        ) : (
                            latestPendingRequests.map((request, index) => (
                                <Paper
                                    key={request.id || index}
                                    elevation={1}

                                    sx={{
                                        mb: index < latestPendingRequests.length - 1 ? 3 : 0,
                                        boxShadow: "none",
                                        border: '1px solid #e0e0e0',
                                        p: 2.5,
                                        // borderRadius: 2,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '4px',
                                            backgroundColor: statusColors[request.status?.status as keyof typeof statusColors] || statusColors.default,
                                        }
                                    }}
                                >
                                    {/* Header Section with Requester Info and Status */}
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        {/* Requester Info */}
                                        <Box display="flex" alignItems="center">
                                            <Avatar
                                                src={request.requester?.profileImage ||
                                                    (request.requester?.gender?.toLowerCase() === 'male' ? MaleLogo : FemaleLogo)
                                                }
                                                sx={{ width: 45, height: 45 }}
                                            />
                                            <Box ml={2}>
                                                <Typography variant="subtitle1" fontWeight="600">
                                                    {request.requester?.firstName + " " + request.requester?.lastName}
                                                </Typography>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {getTimeAgo(request.createDate)} •
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            color="primary"
                                                            fontWeight="500"
                                                            sx={{ ml: 0.5 }}
                                                        >
                                                            {request.requester?.branch?.name}
                                                        </Typography>
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Status Badge */}
                                        <Chip
                                            label={request.status?.name || "Unknown Status"}
                                            size="small"
                                            sx={{
                                                backgroundColor: statusColors[request.status?.status as keyof typeof statusColors] || statusColors.default,
                                                color: 'white',
                                                fontWeight: 500,
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    </Box>

                                    <Box mb={1.5}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Typography variant="body1" fontWeight="500">
                                                {request.name || "Unnamed Request"}
                                            </Typography>
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="caption" color="text.secondary" mr={1}>
                                                    Priority:
                                                </Typography>
                                                <Rating
                                                    name="read-only"
                                                    value={request.priority === "low" ? 3 :
                                                        request.priority === "medium" ? 4 : 5}
                                                    readOnly
                                                    size="small"
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Description */}
                                    <DescriptionText description={request.description as string} MAX_LENGTH={150} />

                                    {/* Commodities */}
                                    {(request.commodities?.length as number) > 0 && (
                                        <Box mt={2}>
                                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                Requested Items:
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                {(request.commodities as Array<{
                                                    commodity: ICommodity,
                                                    quantity: number
                                                }>).map((commodity, idx) => (
                                                    <Chip
                                                        key={commodity.commodity.id}
                                                        avatar={
                                                            <Avatar sx={{ bgcolor: 'primary.main', color: 'white !important' }}>
                                                                {commodity.quantity}
                                                            </Avatar>
                                                        }
                                                        label={commodity.commodity.name}
                                                        variant={idx % 2 === 0 ? "filled" : "outlined"}
                                                        size="small"
                                                        sx={{
                                                            '& .MuiChip-label': {
                                                                fontWeight: 500
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}

                                    {/* Current Approver & Actions */}
                                    <Box mt={2} pt={1.5} display="flex" justifyContent="space-between" alignItems="center" borderTop="1px solid #f0f0f0">
                                        <Box display="flex" alignItems="center">
                                            {request.currentApprover && (
                                                <>
                                                    <Typography variant="caption" color="text.secondary" mr={1}>
                                                        Current Approver:
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight="500">
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
                                                color="primary"
                                                fontWeight="600"
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                View Details →
                                            </Typography>
                                        </Link>
                                    </Box>
                                </Paper>
                            ))
                        )}
                    </CardContent>
                </Card>
                <ExpandableTable />
            </Grid>
        </>
    )
}

export default LatestRequest