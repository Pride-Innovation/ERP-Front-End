import { useEffect, useContext } from 'react';
import {
    Box,
    Card,
    Typography,
    alpha,
    Stack,
    Grid,
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import ChairIcon from '@mui/icons-material/Chair';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CountUp from 'react-countup';
import SectionUtills from './utills';
import { DashboardContext } from '../../../context/dashboard';

const PRIMARY_COLOR = '#08796C';

interface CategoryData {
    title: string;
    icon: React.ReactNode;
    color: string;
    total: number;
    active: number;
    maintenance: number;
    unassigned: number;
}

const CategoryCard = ({ data }: { data: CategoryData }) => {
    const { title, icon, color, total, active, maintenance, unassigned } = data;

    const rows = [
        { label: 'Active / Assigned', value: active, icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />, color: '#2e7d32' },
        { label: 'In Store', value: unassigned, icon: <Inventory2OutlinedIcon sx={{ fontSize: 14 }} />, color: '#4285F4' },
        { label: 'In Repair', value: maintenance, icon: <BuildOutlinedIcon sx={{ fontSize: 14 }} />, color: '#f59300' },
    ];

    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                border: `1px solid ${alpha('#000', 0.07)}`,
                borderRadius: 2,
                // borderTop: `3px solid ${color}`,
                overflow: 'hidden',
                transition: 'box-shadow 0.2s',
                '&:hover': {
                    boxShadow: `0 4px 20px ${alpha(color, 0.12)}`,
                },
            }}
        >
            {/* Card header */}
            <Box
                px={2.5}
                pt={2.5}
                pb={2}
                sx={{
                    background: `linear-gradient(135deg, ${alpha(color, 0.04)} 0%, transparent 100%)`,
                    borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                bgcolor: alpha(color, 0.1),
                                color,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            {icon}
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                                {title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {activeRate}% utilisation rate
                            </Typography>
                        </Box>
                    </Stack>
                    <Box textAlign="right">
                        <Typography variant="h4" fontWeight={800} color={color} lineHeight={1}>
                            <CountUp end={total} duration={1.6} separator="," />
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            total
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Metric rows */}
            <Box px={2.5} py={2}>
                <Stack spacing={1.25}>
                    {rows.map((row) => (
                        <Stack
                            key={row.label}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Box sx={{ color: row.color, display: 'flex', flexShrink: 0 }}>
                                    {row.icon}
                                </Box>
                                <Typography variant="body2" color="text.secondary" fontSize="0.82rem">
                                    {row.label}
                                </Typography>
                            </Stack>
                            <Box
                                sx={{
                                    minWidth: 36,
                                    px: 1.2,
                                    py: 0.3,
                                    borderRadius: 1,
                                    bgcolor: alpha(row.color, 0.08),
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="body2" fontWeight={700} color={row.color} lineHeight={1.4}>
                                    {row.value}
                                </Typography>
                            </Box>
                        </Stack>
                    ))}
                </Stack>

                {/* Mini utilisation bar */}
                <Box mt={2}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                            Utilisation
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color={color} fontSize="0.68rem">
                            {activeRate}%
                        </Typography>
                    </Stack>
                    <Box
                        sx={{
                            height: 5,
                            borderRadius: 3,
                            bgcolor: alpha(color, 0.1),
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                height: '100%',
                                width: `${activeRate}%`,
                                bgcolor: color,
                                borderRadius: 3,
                                transition: 'width 1s ease',
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Card>
    );
};

const AssetInventorySummary = () => {
    const { fetchBranchAssetStatics } = SectionUtills();
    const { assetStats } = useContext(DashboardContext);

    useEffect(() => {
        fetchBranchAssetStatics();
    }, []);

    const totalAssets =
        (assetStats?.itequipment?.total || 0) +
        (assetStats?.officeequipment?.total || 0) +
        (assetStats?.fleet?.total || 0);

    const categories: CategoryData[] = [
        {
            title: 'IT Equipment',
            icon: <ComputerIcon />,
            color: PRIMARY_COLOR,
            total: assetStats?.itequipment?.total || 0,
            active:
                (assetStats?.itequipment?.total || 0) -
                (assetStats?.itequipment?.inMaintenance || 0) -
                (assetStats?.itequipment?.unassigned || 0),
            maintenance: assetStats?.itequipment?.inMaintenance || 0,
            unassigned: assetStats?.itequipment?.unassigned || 0,
        },
        {
            title: 'Office Equipment',
            icon: <ChairIcon />,
            color: '#BC892C',
            total: assetStats?.officeequipment?.total || 0,
            active:
                (assetStats?.officeequipment?.total || 0) -
                (assetStats?.officeequipment?.inMaintenance || 0) -
                (assetStats?.officeequipment?.unassigned || 0),
            maintenance: assetStats?.officeequipment?.inMaintenance || 0,
            unassigned: assetStats?.officeequipment?.unassigned || 0,
        },
        {
            title: 'Fleet / Vehicles',
            icon: <DirectionsCarIcon />,
            color: '#445069',
            total: assetStats?.fleet?.total || 0,
            active:
                (assetStats?.fleet?.total || 0) -
                (assetStats?.fleet?.inMaintenance || 0) -
                (assetStats?.fleet?.unassigned || 0),
            maintenance: assetStats?.fleet?.inMaintenance || 0,
            unassigned: assetStats?.fleet?.unassigned || 0,
        },
    ];

    return (
        <Card
            elevation={0}
            sx={{
                border: `1px solid ${alpha('#000', 0.08)}`,
                borderRadius: 2,
                overflow: 'hidden',
            }}
        >
            {/* ── Card Header ── */}
            <Box
                px={2.5}
                py={1.75}
                display="flex"
                alignItems="center"
                gap={1.5}
                sx={{
                    borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                    background: `linear-gradient(90deg, ${alpha(PRIMARY_COLOR, 0.04)} 0%, transparent 60%)`,
                }}
            >
                <Box
                    sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                        color: PRIMARY_COLOR,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <InventoryOutlinedIcon fontSize="small" />
                </Box>
                <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                        Asset Inventory Summary
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Complete overview of all organisation assets
                    </Typography>
                </Box>
                <Box textAlign="right">
                    <Typography variant="h6" fontWeight={800} color={PRIMARY_COLOR} lineHeight={1.1}>
                        <CountUp end={totalAssets} duration={1.5} separator="," />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        total assets
                    </Typography>
                </Box>
            </Box>

            {/* ── Category Cards ── */}
            <Box p={2.5}>
                <Grid container spacing={2}>
                    {categories.map((cat) => (
                        <Grid item xs={12} key={cat.title}>
                            <CategoryCard data={cat} />
                        </Grid>
                    ))}
                </Grid>

                {/* Footer */}
                <Box
                    mt={2}
                    pt={1.5}
                    sx={{ borderTop: `1px dashed ${alpha('#000', 0.08)}` }}
                >
                    <Typography variant="caption" color="text.secondary">
                        Last refreshed: {new Date().toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        })}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};

export default AssetInventorySummary;