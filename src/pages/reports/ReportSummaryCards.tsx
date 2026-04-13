import { alpha, Box, Grid, Stack, Typography } from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';

interface SummaryCardProps {
    label: string;
    value: string | number;
    subLabel?: string;
    icon: React.ReactNode;
    color: string;
    trend?: number; // positive = up, negative = down
}

export const SummaryCard = ({ label, value, subLabel, icon, color, trend }: SummaryCardProps) => (
    <Box sx={{
        bgcolor: '#fff',
        border: '1px solid #EEF2F7',
        borderRadius: 2,
        p: 2.5,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': {
            boxShadow: `0 4px 20px ${alpha(color, 0.12)}`,
            transform: 'translateY(-1px)',
        },
    }}>
        {/* accent bar */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: color, borderRadius: '2px 0 0 2px' }} />

        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    {value}
                </Typography>
                {subLabel && (
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748B', mt: 0.5 }}>{subLabel}</Typography>
                )}
                {trend !== undefined && (
                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.75 }}>
                        {trend >= 0
                            ? <TrendingUpOutlinedIcon sx={{ fontSize: 14, color: '#15803D' }} />
                            : <TrendingDownOutlinedIcon sx={{ fontSize: 14, color: '#DC2626' }} />
                        }
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: trend >= 0 ? '#15803D' : '#DC2626' }}>
                            {Math.abs(trend)}% vs last period
                        </Typography>
                    </Stack>
                )}
            </Box>
            <Box sx={{
                width: 44, height: 44, borderRadius: 1.5,
                bgcolor: alpha(color, 0.1),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color, flexShrink: 0,
            }}>
                {icon}
            </Box>
        </Stack>
    </Box>
);

interface SummaryRowProps {
    cards: SummaryCardProps[];
}

const ReportSummaryCards = ({ cards }: SummaryRowProps) => (
    <Grid container spacing={2}>
        {cards.map((card, i) => (
            <Grid item xs={12} sm={6} md={3} lg key={i}>
                <SummaryCard {...card} />
            </Grid>
        ))}
    </Grid>
);

export default ReportSummaryCards;
