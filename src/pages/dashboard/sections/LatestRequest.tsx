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
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import MaleLogo from '../../../statics/images/male.jpg'
import FemaleLogo from '../../../statics/images/Female.jpg'
import { formatDistanceToNow } from 'date-fns';
import Rating from '@mui/material/Rating';
import SectionUtills from './utills';
import { DashboardContext } from '../../../context/dashboard';
import { ICommodity } from '../../settings/commodity/interface';
import DescriptionText from './DescriptionText';




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

                                <DescriptionText description={request.description as string} MAX_LENGTH={190} />

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
                                        <Link to={`/assets-mgt/asset-request/view/${request.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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