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
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import usePermissions from '../../../core/permissions/usePermissions';
import { PERMISSIONS, PermissionName } from '../../../core/permissions/constants';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import { PageHero } from '../../../components/layout';

interface INavTab {
    id: number;
    label: string;
    path: string;
    icon: JSX.Element;
    /** Permission name required to see this tab — undefined means always visible */
    permission?: PermissionName;
}

const ALL_TABS: INavTab[] = [
    {
        id: 0,
        label: 'All Requests',
        path: ROUTES.LIST_ALL,
        icon: <ListAltOutlinedIcon fontSize="small" />,
        permission: PERMISSIONS.READ_REQUEST,
    },
    {
        id: 1,
        label: 'Pending',
        path: ROUTES.LIST_PENDING,
        icon: <HourglassEmptyOutlinedIcon fontSize="small" />,
        permission: PERMISSIONS.READ_REQUEST,
    },
    {
        id: 2,
        label: 'Rejected',
        path: ROUTES.LIST_REJECTED,
        icon: <BlockOutlinedIcon fontSize="small" />,
        permission: PERMISSIONS.READ_REQUEST,
    },
    {
        id: 3,
        label: 'Issued',
        path: ROUTES.LIST_ISSUED,
        icon: <MoveToInboxOutlinedIcon fontSize="small" />,
        permission: PERMISSIONS.READ_REQUEST,
    },
];

const RequestsManagement = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { has } = usePermissions();
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore);
    const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const visibleTabs = useMemo(
        () => ALL_TABS.filter(tab => !tab.permission || has(tab.permission)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const activeTabIndex = useMemo(() => {
        const idx = visibleTabs.findIndex(tab => pathname.startsWith(tab.path));
        return idx >= 0 ? idx : 0;
    }, [pathname, visibleTabs]);

    const activeLabel = visibleTabs[activeTabIndex]?.label ?? 'Asset Requests';

    const canApprove = has(PERMISSIONS.APPROVE_REQUEST);
    const canIssue = has(PERMISSIONS.ISSUE_ITEMS);
    const roleHint = canIssue
        ? 'Storekeeper / Logistics'
        : canApprove
            ? 'Approver'
            : 'Requestor';

    return (
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <PageHero
                title="Asset Requests"
                subtitle={`${activeLabel} · ${roleHint}`}
                icon={<InboxOutlinedIcon />}
                stat={{
                    value: requests.length.toLocaleString(),
                    label: 'records',
                    helper: todayLabel,
                }}
                tabs={
                    <Tabs
                        value={activeTabIndex}
                        onChange={(_, idx) => navigate(visibleTabs[idx].path)}
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
                        {visibleTabs.map(tab => (
                            <Tab
                                key={tab.id}
                                label={tab.label}
                                icon={tab.icon}
                                iconPosition="start"
                            />
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

export default RequestsManagement;
