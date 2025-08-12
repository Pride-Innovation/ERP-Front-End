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
    Tooltip,
    Paper
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import ChairIcon from '@mui/icons-material/Chair';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CountUp from 'react-countup';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BuildIcon from '@mui/icons-material/Build';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import SectionUtills from './utills';
import { DashboardContext } from '../../../context/dashboard';

// Core brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold

const ACCENT_COLORS = [
    PRIMARY_COLOR,    // Teal for IT Equipment
    SECONDARY_COLOR,  // Gold for Office Equipment  
    '#445069',        // Slate blue for Fleet (more corporate)
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

const AssetCategoryCard = ({
    title,
    icon,
    total,
    active,
    maintenance,
    unassigned,
    color
}: AssetCategoryCardProps) => {
    const safeTotal = total || 1;
    const activePercentage = Math.round((active / safeTotal) * 100);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 1,
                bgcolor: '#fff',
                border: `1px solid ${alpha('#000', 0.06)}`,
                transition: 'all 0.25s ease',
                '&:hover': {
                    boxShadow: `0 4px 12px ${alpha('#000', 0.08)}`,
                    transform: 'translateY(-2px)'
                }
            }}
        >
            <Box display="flex" alignItems="center" mb={2}>
                <Box
                    sx={{
                        color: '#fff',
                        p: 1.2,
                        borderRadius: 1,
                        bgcolor: color,
                        display: 'flex',
                        mr: 2
                    }}
                >
                    {icon}
                </Box>
                <Box>
                    <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="text.primary"
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Total inventory
                    </Typography>
                </Box>
                <Typography
                    variant="h5"
                    fontWeight="700"
                    color={color}
                    sx={{ ml: 'auto' }}
                >
                    <CountUp end={total || 0} duration={1.8} separator="," />
                </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Box display="flex" alignItems="center">
                            <BusinessCenterIcon sx={{ fontSize: '0.85rem', color: alpha(color, 0.8), mr: 0.7 }} />
                            <Typography variant="body2" fontWeight={500}>
                                Active Assets
                            </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600} color={color}>
                            {active || 0} ({activePercentage}%)
                        </Typography>
                    </Box>
                    <Tooltip title={`${active || 0} active assets`} arrow placement="top">
                        <LinearProgress
                            variant="determinate"
                            value={activePercentage}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(color, 0.12),
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: color
                                }
                            }}
                        />
                    </Tooltip>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                        <BuildIcon sx={{ fontSize: '0.85rem', color: alpha(color, 0.7), mr: 0.7 }} />
                        <Typography variant="body2" color="text.secondary">
                            In Maintenance
                        </Typography>
                    </Box>
                    <Box sx={{ bgcolor: alpha(color, 0.08), px: 1, py: 0.3, borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight={600} color={color}>
                            {maintenance || 0}
                        </Typography>
                    </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                        <PersonOffIcon sx={{ fontSize: '0.85rem', color: alpha(color, 0.7), mr: 0.7 }} />
                        <Typography variant="body2" color="text.secondary">
                            Unassigned
                        </Typography>
                    </Box>
                    <Box sx={{ bgcolor: alpha(color, 0.08), px: 1, py: 0.3, borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight={600} color={color}>
                            {unassigned || 0}
                        </Typography>
                    </Box>
                </Box>
            </Stack>
        </Paper>
    );
};

const AssetInventorySummary = () => {
    const { fetchBranchAssetStatics } = SectionUtills();
    const { assetStats } = useContext(DashboardContext);

    useEffect(() => {
        fetchBranchAssetStatics();
    }, []);

    const totalAssets = (assetStats?.itequipment?.total || 0) +
        (assetStats?.officeequipment?.total || 0) +
        (assetStats?.fleet?.total || 0);

    return (
        <Grid item xs={12}>
            <Card
                elevation={0}
                sx={{
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.12)}`,
                }}
            >
                <Box
                    sx={{
                        px: 2.5,
                        py: 2,
                        bgcolor: PRIMARY_COLOR,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '2px',
                            bgcolor: SECONDARY_COLOR,
                            opacity: 0.5
                        }}
                    />

                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0.04,
                            background: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.2) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.2) 75%)',
                            backgroundSize: '4px 4px',
                        }}
                    />

                    <Box display="flex" alignItems="center">
                        <AssessmentIcon sx={{ mr: 1.5 }} />
                        <Box>
                            <Typography
                                variant="subtitle1"
                                fontWeight="600"
                                sx={{ letterSpacing: 0.3 }}
                            >
                                Asset Inventory Summary
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ opacity: 0.8 }}
                            >
                                Complete overview of all organization assets
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <AssetCategoryCard
                                title="IT Equipment"
                                icon={<ComputerIcon />}
                                total={assetStats?.itequipment?.total || 0}
                                active={(assetStats?.itequipment?.total || 0) - (assetStats?.itequipment?.inMaintenance || 0) - (assetStats?.itequipment?.unassigned || 0)}
                                maintenance={assetStats?.itequipment?.inMaintenance || 0}
                                unassigned={assetStats?.itequipment?.unassigned || 0}
                                color={ACCENT_COLORS[0]}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <AssetCategoryCard
                                title="Office Equipment"
                                icon={<ChairIcon />}
                                total={assetStats?.officeequipment?.total || 0}
                                active={(assetStats?.officeequipment?.total || 0) - (assetStats?.officeequipment?.inMaintenance || 0) - (assetStats?.officeequipment?.unassigned || 0)}
                                maintenance={assetStats?.officeequipment?.inMaintenance || 0}
                                unassigned={assetStats?.officeequipment?.unassigned || 0}
                                color={ACCENT_COLORS[1]}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <AssetCategoryCard
                                title="Fleet Vehicles"
                                icon={<DirectionsCarIcon />}
                                total={assetStats?.fleet?.total || 0}
                                active={(assetStats?.fleet?.total || 0) - (assetStats?.fleet?.inMaintenance || 0) - (assetStats?.fleet?.unassigned || 0)}
                                maintenance={assetStats?.fleet?.inMaintenance || 0}
                                unassigned={assetStats?.fleet?.unassigned || 0}
                                color={ACCENT_COLORS[2]}
                            />
                        </Grid>
                    </Grid>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2.5,
                            pt: 2,
                            borderTop: `1px dashed ${alpha('#000', 0.1)}`
                        }}
                    >
                        <Box display="flex" alignItems="center">
                            <Typography variant="body2" color="text.secondary" mr={1}>
                                Total Assets:
                            </Typography>
                            <Typography
                                variant="body1"
                                fontWeight="bold"
                                color={PRIMARY_COLOR}
                            >
                                {totalAssets.toLocaleString()}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Last updated: {new Date().toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Grid>
    );
};

export default AssetInventorySummary;