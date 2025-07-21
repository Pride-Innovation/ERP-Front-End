import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Badge,
  Tooltip as TooltipComponent,
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import RequestImage from "../../statics/images/requestDesktop.png"
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import furnitureImage from "../../statics/images/furnitureDesktop.png";
import stationeryImage from "../../statics/images/stationeryDesktop.png";

import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const lineData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Rating',
      data: [3.2, 3.4, 3.3, 3.6, 3.7, 3.5, 3.6, 3.8, 3.9, 4.0, 4.0, 4.0],
      borderColor: '#3f51b5',
      backgroundColor: 'rgba(63, 81, 181, 0.2)',
      tension: 0.4,
      fill: true,
    },
  ],
};


const monthlyAssetStationeryData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Assets',
      data: [20, 30, 25, 40, 35, 45, 70, 100, 110, 150, 180, 220],
      backgroundColor: '#4caf50',
      stack: 'combined',
    },
    {
      label: 'Stationery',
      data: [30, 30, 45, 15, 40, 40, 80, 100, 110, 150, 170, 180],
      backgroundColor: '#E0E0E0',
      stack: 'combined',
    },
  ],
};

const stationeryData = {
  labels: ['Books', 'Pens', 'Loan Forms', 'Others'],
  datasets: [
    {
      data: [300, 150, 100, 50],
      backgroundColor: ['#0A796C', '#FFA000', '#CACACA', '#ab47bc'],
      borderColor: ['#ffffff'],
      borderWidth: 2,
    },
  ],
};

const stationeryOptions = {
  cutout: '80%',
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        boxWidth: 12,
        padding: 20,
      },
    },
  },
};

const iconSet = [
  { icon: <ComputerOutlinedIcon color='primary' />, color: 'primary' },
  { icon: <TableRestaurantOutlinedIcon sx={{ color: "#1976D2" }} />, color: 'success' },
  { icon: <MenuBookOutlinedIcon color='warning' />, color: 'primary' },
] as const;

const Dashboard = () => {

  return (
    <Box p={3} bgcolor="#f5f8fc" minHeight="100vh">
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Request Rating</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="h3" fontWeight="bold" mr={1}>4.0</Typography>
                <Box display="flex" alignItems="center">
                  {[...Array(4)].map((_, i) => <Star key={i} sx={{ color: '#FFA534', fontSize: 20 }} />)}
                  <StarBorder sx={{ color: '#CCC', fontSize: 20 }} />
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#4caf50' }}>+0.5 points from last month</Typography>
              <Box mt={2}>
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                      {
                        label: 'Rating',
                        data: [3.2, 3.4, 3.3, 3.6, 3.7, 3.5, 3.6, 3.8, 3.9, 4.0, 4.0, 4.0],
                        borderColor: '#3f51b5',
                        backgroundColor: 'rgba(63, 81, 181, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { display: false },
                      x: { ticks: { color: '#999' } },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mt: 2, p: 2, bgcolor: "primary.main" }}>
            <Grid container spacing={2}>
              {/* Top Stocked Item */}
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column">
                  <Typography variant="subtitle2" color="background.paper">Top Stocked Item</Typography>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">Pens</Typography>
                  <Typography variant="caption" color="background.paper">Total: 1,230 units</Typography>
                </Box>
              </Grid>

              {/* Least Stocked Item */}
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column">
                  <Typography variant="subtitle2" color="background.paper">Least Stocked Item</Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">Scanners</Typography>
                  <Typography variant="caption" color="background.paper">Remaining: 3 units</Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Asset Stock Reviews</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ border: '1px solid #ddd', px: 1.5, py: 0.5, borderRadius: 2 }}>
                  1 year
                </Typography>
              </Box>

              {/* Review Count */}
              <Box display="flex" justifyContent="space-between" gap={4} mb={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Reviews</Typography>
                  <Typography variant="h4" fontWeight="bold">3,431</Typography>
                </Box>
                <Box bgcolor={"success.main"} p={2} borderRadius={1} textAlign="center">
                  <Typography variant="caption" color="warning.main">Since PatientPop</Typography>
                  <Typography variant="h6" fontWeight="bold" color="white">+1,725</Typography>
                </Box>
              </Box>

              {/* Tab Legend (static UI mimic) */}
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={12} height={12} borderRadius={0.5} bgcolor="#4caf50" />
                  <Typography variant="caption">Since PatientPop</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box width={12} height={12} borderRadius={0.5} bgcolor="#E0E0E0" />
                  <Typography variant="caption">Reviews</Typography>
                </Box>
              </Box>

              {/* Bar Chart */}
              <Box height={"100%"} sx={{ bgcolor: "#f5f8fc" }}>
                <Bar
                  data={monthlyAssetStationeryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      },
                    },
                    scales: {
                      x: {
                        stacked: true,
                        ticks: { color: '#999' },
                        grid: { display: false },
                      },
                      y: {
                        stacked: true,
                        ticks: { color: '#999' },
                        grid: { color: '#eee' },
                        min: 0,
                        max: 500, // Adjust based on your needs
                      },
                    },
                  }}
                />

              </Box>
            </CardContent>
          </Card>
        </Grid>


        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Stationery Stock – {new Date().toLocaleDateString('en-US', { month: 'long' })}
              </Typography>

              <Box display="flex" justifyContent="center" mt={2} mb={1}>
                <Box width={250} height={250}>
                  <Doughnut data={stationeryData} options={stationeryOptions} />
                </Box>
              </Box>

              <Box mt={2} px={1}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Month Distribution:
                </Typography>
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Box display="flex" justifyContent="space-between">
                    <Box display={"flex"} alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        Books
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (dozen)
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">300</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Box display={"flex"} alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        Pens
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (boxes)
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">150</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Box display={"flex"} alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        Loan Forms
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (dozen)
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold" color="#42a5f5">100</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.primary">Others</Typography>
                    <Typography variant="body2" fontWeight="bold" color="#ab47bc">50</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>



        {/* Online Requests */}

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">IT Asset Requests</Typography>
              <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={2}>
                <Box position="relative" display="inline-flex">
                  {/* Background Circle */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={140}
                    thickness={2}
                    sx={{
                      position: 'absolute',
                      color: '#e0e0e0',
                    }}
                  />

                  {/* Foreground Progress */}
                  <CircularProgress
                    variant="determinate"
                    value={70}
                    size={140}
                    thickness={2}
                    sx={{
                      color: '#1976d2'
                    }}
                  />

                  {/* Center Content */}
                  <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                  >
                    <Box component={"img"} src={RequestImage} alt="Request Quote" width={40} height={40} mb={0.5} />
                    <Typography variant="subtitle1" fontWeight="bold">9,245</Typography>
                    <Typography variant="caption" color="text.secondary">Requests</Typography>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between" px={1}>
                <Typography variant="body2" color="primary">Completed: 5.9k</Typography>
                <Typography variant="body2" color="text.secondary">Pending: 3.1k</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Office Asset Requests</Typography>
              <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={2}>
                <Box position="relative" display="inline-flex">
                  {/* Background Circle */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={140}
                    thickness={2}
                    sx={{
                      position: 'absolute',
                      color: '#e0e0e0',
                    }}
                  />

                  {/* Foreground Progress */}
                  <CircularProgress
                    variant="determinate"
                    value={70}
                    size={140}
                    thickness={2}
                    sx={{
                      color: '#ab47bc'
                    }}
                  />

                  {/* Center Content */}
                  <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                  >
                    <Box component={"img"} src={furnitureImage} alt="Request Quote" width={60} height={60} mb={0.5} />
                    <Typography variant="subtitle1" fontWeight="bold">9,245</Typography>
                    <Typography variant="caption" color="text.secondary">Requests</Typography>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between" px={1}>
                <Typography variant="body2" color="primary">Completed: 5.9k</Typography>
                <Typography variant="body2" color="text.secondary">Pending: 3.1k</Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Stationery Requests</Typography>
              <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={2}>
                <Box position="relative" display="inline-flex">
                  {/* Background Circle */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={140}
                    thickness={2}
                    sx={{
                      position: 'absolute',
                      color: '#e0e0e0',
                    }}
                  />

                  {/* Foreground Progress */}
                  <CircularProgress
                    variant="determinate"
                    value={70}
                    size={140}
                    thickness={2}
                    sx={{
                      color: 'secondary.main'
                    }}
                  />

                  {/* Center Content */}
                  <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                  >
                    <Box component={"img"} src={stationeryImage} alt="Request Quote" width={40} height={40} mb={0.5} />
                    <Typography variant="subtitle1" fontWeight="bold">9,245</Typography>
                    <Typography variant="caption" color="text.secondary">Requests</Typography>
                  </Box>
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between" px={1}>
                <Typography variant="body2" color="primary">Completed: 5.9k</Typography>
                <Typography variant="body2" color="text.secondary">Pending: 3.1k</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Latest Requests */}
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
                          <Typography variant="caption" color="text.secondary">{review.time} from <span style={{ color: '#42a5f5' }}>{review.source}</span></Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Star Rating */}
                  <Box mt={1} display="flex" alignItems="center">
                    {[...Array(5)].map((_, i) =>
                      i < review.rating ? (
                        <Star key={i} sx={{ color: '#FFA534', fontSize: 20 }} />
                      ) : (
                        <StarBorder key={i} sx={{ color: '#CCC', fontSize: 20 }} />
                      )
                    )}
                  </Box>

                  {/* Review Text */}
                  <Typography mt={1.5} fontSize={14} color="text.secondary">
                    {review.text}
                  </Typography>

                  {/* Review Images */}
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
      </Grid>
    </Box>
  );
};

export default Dashboard;