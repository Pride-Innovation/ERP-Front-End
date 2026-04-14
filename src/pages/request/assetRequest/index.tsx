/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    alpha,
    Box,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import {
    Outlet,
    useLocation,
    useNavigate,
} from 'react-router';
import { ROUTES } from '../../../core/routes/routes';
import { useMemo } from 'react';
import RoutesUtills from '../../../core/routes/utills';
import { permissionsMock } from '../../../mocks/settings';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';

const PRIMARY = '#08796C';

interface INavTab {
    id: number;
    label: string;
    path: string;
    icon: JSX.Element;
    /** permissionsMock id — undefined means always visible */
    permissionId?: number;
}

const ALL_TABS: INavTab[] = [
    {
        id: 0,
        label: 'All Requests',
        path: ROUTES.LIST_ALL,
        icon: <ListAltOutlinedIcon fontSize="small" />,
        permissionId: 13, // READ_REQUEST
    },
    {
        id: 1,
        label: 'Pending',
        path: ROUTES.LIST_PENDING,
        icon: <HourglassEmptyOutlinedIcon fontSize="small" />,
        permissionId: 13, // READ_REQUEST
    },
    {
        id: 2,
        label: 'Rejected',
        path: ROUTES.LIST_REJECTED,
        icon: <BlockOutlinedIcon fontSize="small" />,
        permissionId: 13, // READ_REQUEST
    },
    {
        id: 3,
        label: 'Issued',
        path: ROUTES.LIST_ISSUED,
        icon: <MoveToInboxOutlinedIcon fontSize="small" />,
        permissionId: 46, // ISSUE_ITEMS — storekeepers / logistics only
    },
];

const RequestsManagement = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { determinePermission, routePermission } = RoutesUtills();

    /* ── Filter tabs the current user is allowed to see ─────────────── */
    const visibleTabs = useMemo(
        () =>
            ALL_TABS.filter(tab => {
                if (!tab.permissionId) return true;
                const perm = routePermission(tab.permissionId);
                return perm ? determinePermission(perm) : true;
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    /* ── Derive the active tab index from the current URL ──────────── */
    const activeTabIndex = useMemo(() => {
        const idx = visibleTabs.findIndex(tab => pathname.startsWith(tab.path));
        return idx >= 0 ? idx : 0;
    }, [pathname, visibleTabs]);

    const activeLabel = visibleTabs[activeTabIndex]?.label ?? 'Asset Requests';

    /* ── Permissions badge shown in the subtitle ─────────────────────── */
    const canApprove = determinePermission(permissionsMock[43]); // APPROVE_REQUEST
    const canIssue = determinePermission(permissionsMock[45]);   // ISSUE_ITEMS

    const roleHint = canIssue
        ? 'Storekeeper / Logistics'
        : canApprove
            ? 'Approver'
            : 'Requestor';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F1F5FB', pb: 4 }}>

            {/* ── Gradient Header ───────────────────────────────────── */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${PRIMARY} 0%, #065E53 60%, #044a42 100%)`,
                    px: { xs: 2, md: 4 },
                    pt: 3,
                    pb: 0,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative background circles */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha('#fff', 0.04), pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', bottom: -50, right: 140, width: 120, height: 120, borderRadius: '50%', bgcolor: alpha('#fff', 0.03), pointerEvents: 'none' }} />

                {/* Title row */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Box sx={{
                            width: 46, height: 46, borderRadius: 2,
                            bgcolor: alpha('#fff', 0.15),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                        }}>
                            <InboxOutlinedIcon sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                                Asset Requests
                            </Typography>
                            <Typography variant="body2" sx={{ color: alpha('#fff', 0.70), mt: 0.25 }}>
                                {activeLabel} · {roleHint}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>

                {/* Navigation Tabs */}
                <Tabs
                    value={activeTabIndex}
                    onChange={(_, idx) => navigate(visibleTabs[idx].path)}
                    TabIndicatorProps={{ style: { backgroundColor: '#fff', height: 3, borderRadius: '2px 2px 0 0' } }}
                    sx={{
                        minHeight: 44,
                        '& .MuiTab-root': {
                            color: alpha('#fff', 0.62),
                            fontWeight: 500,
                            fontSize: '0.82rem',
                            minHeight: 44,
                            textTransform: 'none',
                            px: 1.75,
                            py: 0,
                            gap: 0.75,
                            '&.Mui-selected': { color: '#fff', fontWeight: 700 },
                            '&:hover': { color: alpha('#fff', 0.9) },
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
            </Box>

            {/* ── Page content (sub-route outlet) ───────────────────── */}
            <Box sx={{ px: { xs: 1, md: 3 }, pt: 3 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default RequestsManagement;