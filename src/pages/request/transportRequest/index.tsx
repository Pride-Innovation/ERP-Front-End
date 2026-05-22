/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Tab, Tabs } from '@mui/material';
import {
    Outlet,
    useLocation,
    useNavigate,
} from 'react-router';
import { ROUTES } from '../../../core/routes/routes';
import { useMemo } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ListIcon from '@mui/icons-material/List';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import { PageHero } from '../../../components/layout';

const TABS = [
    { id: 1, label: 'All Requests', path: ROUTES.TRANSPORT_REQUEST, icon: <ListIcon fontSize="small" /> },
    { id: 2, label: 'Pending', path: ROUTES.LIST_TRANSPORT_PENDING, icon: <RestartAltIcon fontSize="small" /> },
    { id: 3, label: 'Rejected', path: ROUTES.LIST_TRANSPORT_REJECTED, icon: <CancelIcon fontSize="small" /> },
];

const TransportRequestsManagement = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const activeTabIndex = useMemo(() => {
        const idx = TABS.findIndex(t => pathname === t.path || pathname.startsWith(t.path + '/'));
        return idx >= 0 ? idx : 0;
    }, [pathname]);

    const activeLabel = TABS[activeTabIndex]?.label ?? 'All Requests';

    return (
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <PageHero
                title="Transport Requests"
                subtitle={`${activeLabel} · Vehicle booking & logistics`}
                icon={<DirectionsCarOutlinedIcon />}
                tabs={
                    <Tabs
                        value={activeTabIndex}
                        onChange={(_, idx) => navigate(TABS[idx].path)}
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
                        {TABS.map(tab => (
                            <Tab key={tab.id} label={tab.label} icon={tab.icon} iconPosition="start" />
                        ))}
                    </Tabs>
                }
            />

            <Box sx={{ px: { xs: 0, md: 0 } }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default TransportRequestsManagement;
