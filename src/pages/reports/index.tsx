/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import {
    alpha,
    Box,
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
import StockReport from './panels/StockReport';
import AssetRegisterReport from './panels/AssetRegisterReport';
import RequestsReport from './panels/RequestsReport';
import MovementReport from './panels/MovementReport';
import DisposalReport from './panels/DisposalReport';
import MaintenanceReport from './panels/MaintenanceReport';
import { PageHero } from '../../components/layout';

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
    const todayLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

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
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <PageHero
                title="Reports & Analytics"
                subtitle="Generate, schedule and export operational reports"
                icon={<AssessmentOutlinedIcon />}
                stat={{
                    value: REPORT_TABS.length,
                    label: 'reports',
                    helper: todayLabel,
                }}
                tabs={
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{
                            minHeight: 44,
                            '& .MuiTab-root': {
                                fontSize: '0.82rem',
                                minHeight: 44,
                                textTransform: 'none',
                                px: 1.75,
                                py: 0,
                                gap: 0.75,
                            },
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
                }
            />

            {/* ── Sub-header: current report context bar ───────────────── */}
            <Box sx={{
                bgcolor: '#fff',
                borderBottom: '1px solid #EEF2F7',
                borderRadius: 2,
                border: '1px solid #EEF2F7',
                px: { xs: 2, md: 3 },
                py: 1.5,
                mb: 2.5,
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
            <Box>
                {renderPanel()}
            </Box>
        </Box>
    );
};

export default ReportsPage;
