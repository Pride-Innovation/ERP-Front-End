import { Star, StarBorder } from '@mui/icons-material'
import {
    Avatar,
    Badge,
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Tooltip as TooltipComponent
} from '@mui/material'
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { Link } from 'react-router-dom';

const iconSet = [
    { icon: <ComputerOutlinedIcon color='primary' />, color: 'primary' },
    { icon: <TableRestaurantOutlinedIcon sx={{ color: "#1976D2" }} />, color: 'success' },
    { icon: <MenuBookOutlinedIcon color='warning' />, color: 'primary' },
] as const;

const LatestRequest = () => {
    return (
        <>
            <Grid item xs={12} md={9}>
                <Card>
                    <CardContent sx={{ px: 3, py: 4 }}>
                        <Typography variant="h6" color="#888" mb={3}>Latest Requests</Typography>

                        {[
                            {
                                name: 'Deena Timmons',
                                avatar: 'https://i.pravatar.cc/150?img=11',
                                time: '5 hours ago',
                                source: 'Business Technology',
                                rating: 5,
                                flagged: true,
                                text:
                                    'I must once again praise Dr. Coleman for her outstanding advise and medical care. Her skills as a physician are stellar, and she will only recommend procedures that can enhance your physical beauty. The office is immaculate, colorful and inviting.',
                                images: [
                                    'https://placehold.co/60x60/EEE/333?text=Img1',
                                    'https://placehold.co/60x60/EEE/333?text=Img2',
                                    'https://placehold.co/60x60/EEE/333?text=Img3',
                                    'https://placehold.co/60x60/EEE/333?text=Img4',
                                ],
                            },
                            {
                                name: 'Sheila Lee',
                                avatar: 'https://i.pravatar.cc/150?img=12',
                                time: '2 days ago',
                                source: 'Finance',
                                rating: 5,
                                flagged: false,
                                text:
                                    'Dr. Coleman is the consummate professional. I have seen dermatologists in NYC and Beverly Hills, and she is by far the most knowledgeable. As a physician, her primary concern is health, skin care, and screening.',
                                images: [],
                            },
                            {
                                name: 'Sarah Doyle',
                                avatar: 'https://i.pravatar.cc/150?img=13',
                                time: '5 days ago',
                                source: 'Marketing',
                                rating: 4,
                                flagged: false,
                                text:
                                    'Dr. Coleman clearly cares about her patients and spent time walking me through my skin\'s health and things I can do to stay looking my best.',
                                images: [],
                            },
                        ].map((review, index) => (
                            <Box key={index} mb={index < 2 ? 4 : 0} pb={index < 2 ? 4 : 0} borderBottom={index < 2 ? '1px solid #eee' : 'none'}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center">
                                        <Avatar src={review.avatar} />
                                        <Box ml={2}>
                                            <Typography fontWeight="bold">{review.name}</Typography>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {review.time} from <span style={{ color: '#42a5f5' }}>{review.source}</span>
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box mt={1} display="flex" alignItems="center">
                                    {[...Array(5)].map((_, i) =>
                                        i < review.rating ? (
                                            <Star key={i} sx={{ color: '#FFA534', fontSize: 20 }} />
                                        ) : (
                                            <StarBorder key={i} sx={{ color: '#CCC', fontSize: 20 }} />
                                        )
                                    )}
                                </Box>

                                <Typography mt={1.5} fontSize={14} color="text.secondary">
                                    {review.text}
                                </Typography>

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
                                )}

                                {/* Actions: Like + View Details */}
                                <Box mt={2} display="flex" gap={2} alignItems="center">
                                    <Typography variant="body2" sx={{ cursor: 'pointer', color: '#42a5f5', fontWeight: 500 }}>
                                        <Link to={`/dashboard/review/${review.avatar}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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