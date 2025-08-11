import { useEffect, ReactElement, useContext } from 'react';
import {
    Box,
    Card,
    Typography,
    alpha,
    Divider,
    Stack,
    LinearProgress,
    Grid,
    Tooltip
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import ChairIcon from '@mui/icons-material/Chair';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CountUp from 'react-countup';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BuildIcon from '@mui/icons-material/Build';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import SectionUtills from './utills';
import CarbonBG from '../../../statics/images/carbon-fibre.png';
import { DashboardContext } from '../../../context/dashboard';

// Primary brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold/Amber

// Extended color palette
const TEAL_DARK = '#056158';
const TEAL_LIGHT = '#20A599';
const GOLD_DARK = '#9E7022';
const GOLD_LIGHT = '#D9A441';

// Asset category colors - combination of teal and gold shades
const ACCENT_COLORS = [
    PRIMARY_COLOR,     // Primary teal for IT Equipment
    SECONDARY_COLOR,   // Gold for Office Equipment
    TEAL_DARK,         // Dark teal for Fleet
];

interface AssetCategoryCardProps {
    title: string;
    icon: ReactElement;
    total: number;
    active: number;
    maintenance: number;
    unassigned: number;
    color: string;
}

// Asset category card component
const AssetCategoryCard = ({
    title,
    icon,
    total,
    active,
    maintenance,
    unassigned,
    color
}: AssetCategoryCardProps) => {
    // Calculate secondary color (slightly darker)
    const darkenColor = color === SECONDARY_COLOR ? GOLD_DARK :
        color === PRIMARY_COLOR ? TEAL_DARK :
            TEAL_DARK;

    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 2,
                // Subtle gradient background instead of plain white
                background: `linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)`,
                // Gradient border effect using box-shadow
                boxShadow: `0 1px 3px ${alpha('#000', 0.1)}, 0 0 0 1px ${alpha(color, 0.15)}, 0 4px 12px ${alpha(color, 0.08)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                    transform: 'translateY(-5px) scale(1.01)',
                    boxShadow: `0 10px 20px ${alpha(color, 0.2)}, 0 0 0 1px ${alpha(color, 0.2)}`,
                    '& .card-icon': {
                        transform: 'scale(1.1)'
                    }
                }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box
                    className="card-icon"
                    sx={{
                        color: '#fff',
                        p: 1.2,
                        borderRadius: 2,
                        // Gradient background for icons
                        background: `linear-gradient(145deg, ${color} 0%, ${darkenColor} 100%)`,
                        boxShadow: `0 4px 10px ${alpha(color, 0.3)}`,
                        transition: 'all 0.3s ease'
                    }}
                >
                    {icon}
                </Box>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                        color,
                        textShadow: `0 1px 1px ${alpha('#fff', 0.8)}`,
                    }}
                >
                    <CountUp end={total} duration={2.5} separator="," />
                </Typography>
            </Box>

            <Typography
                variant="h6"
                fontWeight={600}
                color={color}
                gutterBottom
                sx={{
                    borderLeft: `3px solid ${color}`,
                    pl: 1,
                    ml: -0.5
                }}
            >
                {title}
            </Typography>

            <Divider sx={{
                my: 1.8,
                height: '2px',
                background: `linear-gradient(to right, ${alpha(color, 0.5)}, ${alpha(color, 0.05)})`,
                border: 'none'
            }} />

            <Stack spacing={2} mt={2}>
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.8}>
                        <Box display="flex" alignItems="center">
                            <BusinessCenterIcon sx={{ fontSize: '0.9rem', color: alpha(color, 0.7), mr: 0.5 }} />
                            <Typography variant="caption" fontWeight={600} color={color}>
                                Active Assets
                            </Typography>
                        </Box>
                        <Typography variant="caption" fontWeight="bold" color={color}>
                            {Math.round((active / total) * 100)}%
                        </Typography>
                    </Box>
                    <Tooltip title={`${active} active assets`} arrow placement="top">
                        <LinearProgress
                            variant="determinate"
                            value={(active / total) * 100}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: alpha(color, 0.12),
                                '& .MuiLinearProgress-bar': {
                                    // Gradient fill for progress bar
                                    background: `linear-gradient(90deg, ${darkenColor} 0%, ${color} 100%)`,
                                    borderRadius: 4,
                                }
                            }}
                        />
                    </Tooltip>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                        <BuildIcon sx={{ fontSize: '0.9rem', color: alpha(color, 0.7), mr: 0.7 }} />
                        <Typography variant="body2" color={alpha(color, 0.8)}>
                            In Maintenance
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            bgcolor: alpha(color, 0.1),
                            px: 1.2,
                            py: 0.3,
                            borderRadius: 5,
                            minWidth: '28px',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="body2" fontWeight="bold" color={color}>
                            {maintenance}
                        </Typography>
                    </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                        <PersonOffIcon sx={{ fontSize: '0.9rem', color: alpha(color, 0.7), mr: 0.7 }} />
                        <Typography variant="body2" color={alpha(color, 0.8)}>
                            Unassigned
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            bgcolor: alpha(color, 0.1),
                            px: 1.2,
                            py: 0.3,
                            borderRadius: 5,
                            minWidth: '28px',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="body2" fontWeight="bold" color={color}>
                            {unassigned}
                        </Typography>
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
};

const AssetInventorySummary = () => {
    const { fetchBranchAssetStatics } = SectionUtills();
    const { assetStats } = useContext(DashboardContext);

    useEffect(() => {
        fetchBranchAssetStatics();
    }, []);

    const totalAssets = assetStats != null && assetStats?.itequipment?.total +
        assetStats?.officeequipment?.total +
        assetStats?.fleet?.total;

    console.log(assetStats, "Asset Stats");

    return (
        <Grid item xs={12}>
            <Card
                sx={{
                    background: `linear-gradient(135deg, 
                        ${PRIMARY_COLOR} 0%, 
                        ${alpha(TEAL_DARK, 0.95)} 60%,
                        ${alpha(TEAL_DARK, 0.9)} 100%)`,
                    color: 'white',
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    position: 'relative',
                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '50%',
                        height: '100%',
                        background: `radial-gradient(circle at top right, 
                            ${alpha(SECONDARY_COLOR, 0.15)} 0%, 
                            ${alpha(SECONDARY_COLOR, 0.05)} 50%,
                            transparent 70%)`,
                        zIndex: 0
                    }}
                />

                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0.07,
                        background: `url(${CarbonBG})`,
                        zIndex: 0
                    }}
                />

                <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${alpha(SECONDARY_COLOR, 0.8)} 0%, ${alpha(GOLD_DARK, 0.9)} 100%)`,
                                mr: 2,
                                display: 'flex',
                                boxShadow: `0 3px 8px ${alpha(SECONDARY_COLOR, 0.4)}`,
                            }}
                        >
                            <DashboardIcon sx={{ color: '#fff' }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="white"
                                sx={{
                                    textShadow: `1px 1px 2px ${alpha('#000', 0.3)}`,
                                    letterSpacing: '0.5px'
                                }}
                            >
                                Asset Inventory Summary
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: alpha('#fff', 0.85),
                                    fontStyle: 'italic'
                                }}
                            >
                                Complete overview of all organization assets
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{
                        my: 2.2,
                        borderColor: alpha('#fff', 0.2),
                        '&::before': {
                            width: '100%',
                            borderTop: `thin solid ${alpha(SECONDARY_COLOR, 0.3)}`
                        }
                    }} />

                    <Grid container spacing={2.5} sx={{ mt: 0.2 }}>
                        <Grid item xs={12}>
                            <AssetCategoryCard
                                title="IT Equipment"
                                icon={<ComputerIcon fontSize="medium" />}
                                total={assetStats?.itequipment?.total}
                                active={assetStats?.itequipment?.total - assetStats?.itequipment?.inMaintenance - assetStats?.itequipment?.unassigned}
                                maintenance={assetStats?.itequipment?.inMaintenance}
                                unassigned={assetStats?.itequipment?.unassigned}
                                color={ACCENT_COLORS[0]}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <AssetCategoryCard
                                title="Office Equipment"
                                icon={<ChairIcon fontSize="medium" />}
                                total={assetStats?.officeequipment?.total}
                                active={assetStats?.officeequipment?.total - assetStats?.officeequipment?.inMaintenance - assetStats?.officeequipment?.unassigned}
                                maintenance={assetStats?.officeequipment?.inMaintenance}
                                unassigned={assetStats?.officeequipment?.unassigned}
                                color={ACCENT_COLORS[1]}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <AssetCategoryCard
                                title="Fleet Vehicles"
                                icon={<DirectionsCarIcon fontSize="medium" />}
                                total={assetStats?.fleet?.total}
                                active={assetStats?.fleet?.total - assetStats?.fleet?.inMaintenance - assetStats?.fleet?.unassigned}
                                maintenance={assetStats?.fleet?.inMaintenance}
                                unassigned={assetStats?.fleet?.unassigned}
                                color={ACCENT_COLORS[2]}
                            />
                        </Grid>
                    </Grid>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 3,
                            p: 1.8,
                            borderRadius: 2,
                            background: `linear-gradient(to right, ${alpha('#fff', 0.12)}, ${alpha('#fff', 0.06)})`,
                            backdropFilter: 'blur(8px)',
                            border: `1px solid ${alpha('#fff', 0.1)}`,
                            boxShadow: `0 2px 6px ${alpha('#000', 0.1)}`
                        }}
                    >
                        <Typography
                            variant="body1"
                            color="#fff"
                            sx={{ fontWeight: 600 }}
                        >
                            Total Assets: <Box component="span" sx={{
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                color: GOLD_LIGHT
                            }}>
                                {totalAssets?.toLocaleString()}
                            </Box>
                        </Typography>
                        <Typography variant="caption" color={alpha('#fff', 0.8)}>
                            Last updated: {new Date().toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Grid>
    );
};

export default AssetInventorySummary;