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
import usePermissions from '../../core/permissions/usePermissions';
import { PERMISSIONS, PermissionName } from '../../core/permissions/constants';

interface ReportTab {
    id: number;
    label: string;
    shortLabel: string;
    icon: JSX.Element;
    /**
     * The permission the tab's endpoint demands.
     *
     * <p>A tab whose data the viewer cannot fetch is not shown. The alternative — render it and let
     * the panel report "Could not load this report" — is the failure this codebase keeps meeting
     * from different directions: a boundary rendering as a fault, indistinguishable from the server
     * being down.
     */
    permission: PermissionName;
    render: () => JSX.Element;
}

const REPORT_TABS: ReportTab[] = [
    {
        id: 0, label: 'Stock Management', shortLabel: 'Stock',
        icon: <Inventory2OutlinedIcon fontSize="small" />,
        // GET /stocks/** answers to READ_INVENTORY.
        permission: PERMISSIONS.READ_INVENTORY, render: () => <StockReport />,
    },
    {
        id: 1, label: 'Asset Register', shortLabel: 'Assets',
        icon: <TuneOutlinedIcon fontSize="small" />,
        permission: PERMISSIONS.READ_ASSET, render: () => <AssetRegisterReport />,
    },
    {
        id: 2, label: 'Requests / Requisitions', shortLabel: 'Requests',
        icon: <RecentActorsOutlinedIcon fontSize="small" />,
        permission: PERMISSIONS.READ_REQUEST, render: () => <RequestsReport />,
    },
    {
        id: 3, label: 'Asset Movement', shortLabel: 'Movement',
        icon: <LocalShippingOutlinedIcon fontSize="small" />,
        permission: PERMISSIONS.READ_MOVEMENT, render: () => <MovementReport />,
    },
    {
        id: 4, label: 'Asset Disposal', shortLabel: 'Disposal',
        icon: <DeleteForeverOutlinedIcon fontSize="small" />,
        // Disposals are assets with the written-off flag, read through GET /assets.
        permission: PERMISSIONS.READ_ASSET, render: () => <DisposalReport />,
    },
    {
        id: 5, label: 'Maintenance', shortLabel: 'Maintenance',
        icon: <BuildOutlinedIcon fontSize="small" />,
        // GET /assets/repairs sits under /assets/**, so it answers to READ_ASSET too.
        permission: PERMISSIONS.READ_ASSET, render: () => <MaintenanceReport />,
    },
];

const ReportsPage = () => {
    const { has } = usePermissions();

    /*
     * Indexed by position in the *visible* list, not by the tab's own id — MUI's Tabs value is the
     * index of the rendered tab, and keying the panel on `id` while filtering the list is exactly
     * how the asset detail page's tabs came to show the wrong panel.
     */
    const visibleTabs = REPORT_TABS.filter((tab) => has(tab.permission));
    const [activeTab, setActiveTab] = useState<number>(0);
    const current = visibleTabs[activeTab] ?? visibleTabs[0];

    const todayLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });


    return (
        // Same page padding as PageShell / the movement pages so all modules align.
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="Reports & Analytics"
                subtitle="Generate and export operational reports"
                icon={<AssessmentOutlinedIcon />}
                stat={{
                    // What this viewer can actually open, not what the page could show somebody
                    // else — a count that includes tabs you cannot see is just a wrong number.
                    value: visibleTabs.length,
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
                        {visibleTabs.map((tab) => (
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
                {current?.render() ?? null}
            </Box>
        </Box>
    );
};

export default ReportsPage;
