import { useState } from 'react';
import {
    alpha,
    Box,
    Chip,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import RecentActorsOutlinedIcon from '@mui/icons-material/RecentActorsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import StockReport from './panels/StockReport';
import AssetRegisterReport from './panels/AssetRegisterReport';
import RequestsReport from './panels/RequestsReport';
import MovementReport from './panels/MovementReport';
import DisposalReport from './panels/DisposalReport';
import MaintenanceReport from './panels/MaintenanceReport';

const PRIMARY = '#08796C';

interface ReportTab {
    id: number;
    label: string;
    shortLabel: string;
    icon: JSX.Element;
    description: string;
    color: string;
}

const REPORT_TABS: ReportTab[] = [
    {
        id: 0,
        label: 'Stock Management',
        shortLabel: 'Stock',
        icon: <Inventory2OutlinedIcon fontSize="small" />,
        description: 'Track inventory inflow, suppliers and stock levels',
        color: '#0369A1',
    },
    {
        id: 1,
        label: 'Asset Register',
        shortLabel: 'Assets',
        icon: <TuneOutlinedIcon fontSize="small" />,
        description: 'Full asset register with values and assignments',
        color: '#059669',
    },
    {
        id: 2,
        label: 'Requests / Requisitions',
        shortLabel: 'Requests',
        icon: <RecentActorsOutlinedIcon fontSize="small" />,
        description: 'Asset requests with approval and status tracking',
        color: '#D97706',
    },
    {
        id: 3,
        label: 'Asset Movement',
        shortLabel: 'Movement',
        icon: <LocalShippingOutlinedIcon fontSize="small" />,
        description: 'Transfers and location changes of assets',
        color: '#7C3AED',
    },
    {
        id: 4,
        label: 'Asset Disposal',
        shortLabel: 'Disposal',
        icon: <DeleteForeverOutlinedIcon fontSize="small" />,
        description: 'Decommissioned assets and disposal audit trail',
        color: '#DC2626',
    },
    {
        id: 5,
        label: 'Maintenance',
        shortLabel: 'Maintenance',
        icon: <BuildOutlinedIcon fontSize="small" />,
        description: 'Repair history, costs and vendor management',
        color: '#0891B2',
    },
];

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState<number>(0);

    const currentTab = REPORT_TABS[activeTab];

    const renderPanel = () => {
        switch (activeTab) {
            case 0: return <StockReport />;
            case 1: return <AssetRegisterReport />;
            case 2: return <RequestsReport />;
            case 3: return <MovementReport />;
            case 4: return <DisposalReport />;
            case 5: return <MaintenanceReport />;
            default: return null;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F1F5FB', pb: 4 }}>

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${PRIMARY} 0%, #065E53 60%, #044a42 100%)`,
                    px: { xs: 2, md: 4 },
                    pt: 4,
                    pb: 0,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* background decorative circles */}
                <Box sx={{
                    position: 'absolute', top: -40, right: -40,
                    width: 220, height: 220, borderRadius: '50%',
                    bgcolor: alpha('#fff', 0.04), pointerEvents: 'none'
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -60, right: 140,
                    width: 140, height: 140, borderRadius: '50%',
                    bgcolor: alpha('#fff', 0.03), pointerEvents: 'none'
                }} />

                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Box sx={{
                            width: 48, height: 48, borderRadius: 2,
                            bgcolor: alpha('#fff', 0.15),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                        }}>
                            <AssessmentOutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                                Reports &amp; Analytics
                            </Typography>
                            <Typography variant="body2" sx={{ color: alpha('#fff', 0.72), mt: 0.3 }}>
                                Export, filter and drill-down across all asset management modules
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" gap={1} alignItems="center">
                        <Chip
                            icon={<CalendarTodayOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                            label={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            size="small"
                            sx={{
                                bgcolor: alpha('#fff', 0.14),
                                color: '#fff',
                                border: `1px solid ${alpha('#fff', 0.2)}`,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                backdropFilter: 'blur(4px)',
                                '& .MuiChip-icon': { color: alpha('#fff', 0.8) }
                            }}
                        />
                    </Stack>
                </Stack>

                {/* ── Report tabs strip ─────────────────────────────────── */}
                <Box sx={{ mt: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: '#fff',
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                            }
                        }}
                        sx={{
                            '& .MuiTab-root': {
                                color: alpha('#fff', 0.65),
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                textTransform: 'none',
                                minHeight: 48,
                                px: 2.5,
                                gap: 0.75,
                                transition: 'color 0.2s',
                                '&.Mui-selected': { color: '#fff' },
                                '&:hover': { color: alpha('#fff', 0.9) },
                            },
                            '& .MuiTabs-scrollButtons': { color: alpha('#fff', 0.7) },
                        }}
                    >
                        {REPORT_TABS.map((tab) => (
                            <Tab
                                key={tab.id}
                                icon={tab.icon}
                                iconPosition="start"
                                label={tab.label}
                            />
                        ))}
                    </Tabs>
                </Box>
            </Box>

            {/* ── Sub-header: current report context bar ───────────────── */}
            <Box sx={{
                bgcolor: '#fff',
                borderBottom: '1px solid #EEF2F7',
                px: { xs: 2, md: 4 },
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
            }}>
                <Box sx={{
                    width: 34, height: 34, borderRadius: 1.5,
                    bgcolor: alpha(currentTab.color, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Box sx={{ color: currentTab.color, display: 'flex' }}>
                        {currentTab.icon}
                    </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', lineHeight: 1.2 }}>
                        {currentTab.label} Report
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {currentTab.description}
                    </Typography>
                </Box>
            </Box>

            {/* ── Report Panel Content ──────────────────────────────────── */}
            <Box sx={{ px: { xs: 1, md: 3 }, pt: 3 }}>
                {renderPanel()}
            </Box>
        </Box>
    );
};

export default ReportsPage;
