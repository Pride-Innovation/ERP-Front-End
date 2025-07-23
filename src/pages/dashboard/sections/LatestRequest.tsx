import {
    Avatar,
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Link as MuiLink,
    Stack,
    Chip,
} from '@mui/material'
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import RequestUtills from '../../request/assetRequest/utills';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import MaleLogo from '../../../statics/images/male.jpg'
import FemaleLogo from '../../../statics/images/Female.jpg'
import { formatDistanceToNow } from 'date-fns';
import Rating from '@mui/material/Rating';
import SectionUtills from './utills';
import { DashboardContext } from '../../../context/dashboard';
import { ICommodity } from '../../settings/commodity/interface';

const iconSet = [
    { icon: <ComputerOutlinedIcon color='primary' />, color: 'primary' },
    { icon: <TableRestaurantOutlinedIcon sx={{ color: "#1976D2" }} />, color: 'success' },
    { icon: <MenuBookOutlinedIcon color='warning' />, color: 'primary' },
] as const;



const DescriptionText: React.FC<{ description: string }> = ({ description }) => {
    const MAX_LENGTH = 190;
    const [expanded, setExpanded] = useState(false);

    const isLongText = description.length > MAX_LENGTH;
    const displayText = expanded || !isLongText
        ? description
        : `${description.slice(0, MAX_LENGTH)}...`;

    const toggleExpanded = () => setExpanded(prev => !prev);

    return (
        <Typography mt={1.5} fontSize={14} color="text.secondary">
            {displayText}
            {isLongText && (
                <>
                    &nbsp;
                    <MuiLink
                        component="button"
                        variant="body2"
                        onClick={toggleExpanded}
                        sx={{ color: 'primary.main', textDecoration: 'none', cursor: 'pointer' }}
                    >
                        {expanded ? 'View less' : 'View more'}
                    </MuiLink>
                </>
            )}
        </Typography>
    );
};

const LatestRequest = () => {
    const { findLatestPendingRequestsWithDetails } = SectionUtills()
    const { latestPendingRequests } = useContext(DashboardContext);
    const getTimeAgo = (date?: string | null) => {
        if (!date) return "Unknown";
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    useEffect(() => { findLatestPendingRequestsWithDetails() }, [])

    return (
        <>
            <Grid item xs={12} md={9}>
                <Card>
                    <CardContent sx={{ px: 3, py: 4 }}>
                        <Typography variant="h6" color="#888" mb={3}>Latest Requests</Typography>

                        {latestPendingRequests.length > 0 && latestPendingRequests.map((request, index) => (
                            <Box key={index} mb={index < 2 ? 4 : 0} pb={index < 2 ? 4 : 0} borderBottom={index < 2 ? '1px solid #eee' : 'none'}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center">
                                        <Avatar src={request.requester?.profileImage
                                            || (request.requester?.gender === 'male' ? MaleLogo : FemaleLogo)}
                                        />
                                        <Box ml={2}>
                                            <Typography fontWeight="bold">{
                                                request.requester?.firstName + " " + request.requester?.lastName
                                            }</Typography>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {getTimeAgo(request.createDate)} from <span style={{ color: '#42a5f5' }}>
                                                        {request.requester?.branch?.name}
                                                    </span>
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box mt={1} display="flex" alignItems="center">
                                    <Rating
                                        name="read-only"
                                        value={request.priority === "low" ? 3 :
                                            request.priority === "medium" ? 4 : 5}
                                        readOnly
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                </Box>

                                <DescriptionText description={request.description as string} />

                                {(request.commodities?.length as number) > 0 && (
                                    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                                        {(request.commodities as Array<{
                                            commodity: ICommodity,
                                            quantity: number
                                        }>).map((commodity, index) => (
                                            <Chip
                                                key={commodity.commodity.id}
                                                avatar={<Avatar sx={{ bgcolor: "teal" }}>
                                                    <span style={{ color: "white" }}>{commodity.quantity}</span></Avatar>}
                                                label={commodity.commodity.name}
                                                variant={index % 2 === 0 ? "filled" : "outlined"}
                                            />
                                        ))}
                                    </Stack>
                                )}
                                <Box mt={2} display="flex" gap={2} alignItems="center">
                                    <Typography variant="body2" sx={{ cursor: 'pointer', color: '#42a5f5', fontWeight: 500 }}>
                                        <Link to={`/dashboard/review/${request.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            View Details
                                        </Link>
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Grid>
        </>
    )
}

export default LatestRequest