/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import {
    Box,
    Tab,
    Tabs,
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
}

const REPORT_TABS: ReportTab[] = [
    { id: 0, label: 'Stock Management', shortLabel: 'Stock', icon: <Inventory2OutlinedIcon fontSize="small" /> },
    { id: 1, label: 'Asset Register', shortLabel: 'Assets', icon: <TuneOutlinedIcon fontSize="small" /> },
    { id: 2, label: 'Requests / Requisitions', shortLabel: 'Requests', icon: <RecentActorsOutlinedIcon fontSize="small" /> },
    { id: 3, label: 'Asset Movement', shortLabel: 'Movement', icon: <LocalShippingOutlinedIcon fontSize="small" /> },
    { id: 4, label: 'Asset Disposal', shortLabel: 'Disposal', icon: <DeleteForeverOutlinedIcon fontSize="small" /> },
    { id: 5, label: 'Maintenance', shortLabel: 'Maintenance', icon: <BuildOutlinedIcon fontSize="small" /> },
];

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState<number>(0);

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
        // Same page padding as PageShell / the movement pages so all modules align.
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
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

            {/* ── Report Panel Content ──────────────────────────────────── */}
            <Box sx={{ mt: 2.5 }}>
                {renderPanel()}
            </Box>
        </Box>
    );
};

export default ReportsPage;
