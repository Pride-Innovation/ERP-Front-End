import { Star, StarBorder } from '@mui/icons-material'
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
} from '@mui/material'
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import RequestUtills from '../../request/assetRequest/utills';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import MaleLogo from '../../../statics/images/male.jpg'
import FemaleLogo from '../../../statics/images/Female.jpg'
import { formatDistanceToNow } from 'date-fns';

const iconSet = [
    { icon: <ComputerOutlinedIcon color='primary' />, color: 'primary' },
    { icon: <TableRestaurantOutlinedIcon sx={{ color: "#1976D2" }} />, color: 'success' },
    { icon: <MenuBookOutlinedIcon color='warning' />, color: 'primary' },
] as const;

const LatestRequest = () => {
    const { fetchAllRequests } = RequestUtills();
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)

    useEffect(() => {
        /**
         * This should contain the Status ID for Request Approved by Managers
         */
        const params = {
            statusIds: 3,
            status: "PENDING",
            pageSize: 3
        }

        fetchAllRequests(params);

    }, []);

    const getTimeAgo = (date?: string | null) => {
        if (!date) return "Unknown";
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    return (
        <>
            <Grid item xs={12} md={9}>
                <Card>
                    <CardContent sx={{ px: 3, py: 4 }}>
                        <Typography variant="h6" color="#888" mb={3}>Latest Requests</Typography>

                        {requests.length > 0 && requests.map((request, index) => (
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
                                    {[...Array(
                                        request.priority === "low" ? 3 :
                                            request.priority === "medium" ? 4 : 5
                                    )].map((_, i) =>
                                        i < (
                                            request.priority === "low" ? 3 :
                                                request.priority === "medium" ? 4 : 5
                                        ) ? (
                                            <Star key={i} sx={{ color: '#FFA534', fontSize: 20 }} />
                                        ) : (
                                            <StarBorder key={i} sx={{ color: '#CCC', fontSize: 20 }} />
                                        )
                                    )}
                                </Box>

                                <Typography mt={1.5} fontSize={14} color="text.secondary">
                                    {request.description}
                                </Typography>
                                {/* 
                                {review.images.length > 0 && (
                                    <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                                        {iconSet.map((item, idx) => (
                                            <Badge
                                                key={idx}
                                                badgeContent={(idx + 1) * 3}
                                                color={item.color}
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                            >
                                                <TooltipComponent title={`Image ${idx + 1}`} key={idx}>
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 2,
                                                            backgroundColor: '#F5F8FC',
                                                            color: '#555',
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </Box>
                                                </TooltipComponent>

                                            </Badge>
                                        ))}
                                    </Box>
                                )} */}

                                {/* Actions: Like + View Details */}
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