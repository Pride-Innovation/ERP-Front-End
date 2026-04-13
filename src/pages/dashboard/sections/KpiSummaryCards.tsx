import {
    Box,
    Grid,
    Paper,
    Typography,
    Skeleton,
    alpha,
} from '@mui/material';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CountUp from 'react-countup';
import { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '../../../context/dashboard';
import SectionUtills from './utills';

const PRIMARY_COLOR = '#08796C';

interface KpiCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle: string;
    trend?: { value: number; positive: boolean } | null;
    loading: boolean;
}

const KpiCard = ({ title, value, icon, color, subtitle, trend, loading }: KpiCardProps) => (
    <Paper
        elevation={0}
        sx={{
            p: 2.5,
            borderRadius: 2,
            border: `1px solid ${alpha('#000', 0.07)}`,
            height: '100%',
            transition: 'all 0.2s ease',
            '&:hover': {
                boxShadow: `0 6px 20px ${alpha('#000', 0.08)}`,
                transform: 'translateY(-2px)',
            },
        }}
    >
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {loading ? (
                    <Skeleton variant="text" width={70} height={44} />
                ) : (
                    <Typography variant="h4" fontWeight={700} color="text.primary" lineHeight={1.2}>
                        <CountUp end={value} duration={1.5} separator="," />
                    </Typography>
                )}
                <Typography variant="body2" color="text.secondary" mt={0.5} fontWeight={500}>
                    {title}
                </Typography>
                <Typography variant="caption" color="text.disabled" display="block" mt={0.25}>
                    {subtitle}
                </Typography>
                {trend && !loading && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                        {trend.positive ? (
                            <TrendingUpIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
                        ) : (
                            <TrendingDownIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                        )}
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            color={trend.positive ? '#2e7d32' : '#d32f2f'}
                        >
                            {trend.value}% vs last month
                        </Typography>
                    </Box>
                )}
            </Box>
            <Box
                sx={{
                    bgcolor: alpha(color, 0.12),
                    color,
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    ml: 2,
                }}
            >
                {icon}
            </Box>
        </Box>
    </Paper>
);

const KpiSummaryCards = () => {
    const { assetStats, requestVariationStats } = useContext(DashboardContext);
    const { fetchBranchAssetStatics, requestRatingVariationFxn } = SectionUtills();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetchBranchAssetStatics(),
            requestRatingVariationFxn(),
        ]).finally(() => setLoading(false));
    }, []);

    const totalAssets =
        (assetStats?.itequipment?.total || 0) +
        (assetStats?.officeequipment?.total || 0) +
        (assetStats?.fleet?.total || 0);

    const activeAssets =
        ((assetStats?.itequipment?.total || 0) - (assetStats?.itequipment?.inMaintenance || 0) - (assetStats?.itequipment?.unassigned || 0)) +
        ((assetStats?.officeequipment?.total || 0) - (assetStats?.officeequipment?.inMaintenance || 0) - (assetStats?.officeequipment?.unassigned || 0)) +
        ((assetStats?.fleet?.total || 0) - (assetStats?.fleet?.inMaintenance || 0) - (assetStats?.fleet?.unassigned || 0));

    const inMaintenance =
        (assetStats?.itequipment?.inMaintenance || 0) +
        (assetStats?.officeequipment?.inMaintenance || 0) +
        (assetStats?.fleet?.inMaintenance || 0);

    const unassigned =
        (assetStats?.itequipment?.unassigned || 0) +
        (assetStats?.officeequipment?.unassigned || 0) +
        (assetStats?.fleet?.unassigned || 0);

    const prevMonth = requestVariationStats?.previousMonth || 0;
    const currentMonth = requestVariationStats?.currentMonth || 0;
    const trendValue =
        prevMonth > 0
            ? Math.abs(Math.round(((currentMonth - prevMonth) / prevMonth) * 100))
            : 0;
    const trendPositive = currentMonth >= prevMonth;

    return (
        <Grid container spacing={2.5}>
            <Grid item xs={12} sm={3} xl={3}>
                <KpiCard
                    title="Total Assets"
                    value={totalAssets}
                    icon={<DevicesOutlinedIcon />}
                    color={PRIMARY_COLOR}
                    subtitle="IT · Office · Fleet combined"
                    loading={loading}
                />
            </Grid>
            <Grid item xs={12} sm={3} xl={3}>
                <KpiCard
                    title="Active / Assigned"
                    value={activeAssets}
                    icon={<CheckCircleOutlineIcon />}
                    color="#2e7d32"
                    subtitle="Currently in use by staff"
                    loading={loading}
                />
            </Grid>
            <Grid item xs={12} sm={3} xl={3}>
                <KpiCard
                    title="In Maintenance"
                    value={inMaintenance}
                    icon={<BuildOutlinedIcon />}
                    color="#f59300"
                    subtitle="Under repair or servicing"
                    loading={loading}
                />
            </Grid>
            <Grid item xs={12} sm={3} xl={3}>
                <KpiCard
                    title="Unassigned / In Store"
                    value={unassigned}
                    icon={<InventoryOutlinedIcon />}
                    color="#4285F4"
                    subtitle="Available in stock"
                    trend={{ value: trendValue, positive: trendPositive }}
                    loading={loading}
                />
            </Grid>
        </Grid>
    );
};

export default KpiSummaryCards;
