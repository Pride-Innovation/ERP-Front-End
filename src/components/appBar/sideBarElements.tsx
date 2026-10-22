/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ISideBarItem } from './interface';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import { ROUTES } from '../../core/routes/routes';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import TuneIcon from '@mui/icons-material/Tune';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Store } from '@mui/icons-material'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import usePermissions from '../../core/permissions/usePermissions';
import { PERMISSIONS } from '../../core/permissions/constants';
import { REPORT_PAGE_PERMISSIONS } from '../../pages/reports/reportPermissions';


const SideBarElements = () => {
    const { has } = usePermissions();

    // Items are rendered in this order, sectioned by `group` (uppercase micro-label
    // when the drawer is open, hairline divider when collapsed).
    const sideBarList: Array<ISideBarItem> = [
        {
            id: 1,
            name: "Dashboard",
            route: ROUTES.ASSETS_MANAGEMENT,
            icon: <DashboardIcon />,
            group: "Overview",
            subroutes: [],
            access: true
        },
        {
            id: 13,
            name: "My Items",
            route: ROUTES.MY_ITEMS,
            icon: <BadgeOutlinedIcon />,
            group: "Overview",
            subroutes: [],
            /*
             * Everyone signed in, like the route: it only ever describes the caller. Its one way in
             * used to be a button on the Store page, which needs READ_STORE - measured, 5 of 27
             * accounts - so most people could reach their own items only by typing the address.
             */
            access: true
        },
        {
            id: 2,
            name: "Assets",
            route: ROUTES.LIST_ASSETS,
            icon: <TuneIcon />,
            group: "Operations",
            subroutes: [],
            access: has(PERMISSIONS.READ_ASSET)
        },
        {
            id: 4,
            name: "Requests",
            route: ROUTES.REQUEST,
            icon: <RecentActorsIcon />,
            group: "Operations",
            subroutes: [],
            access: has(PERMISSIONS.READ_REQUEST)
        },
        {
            id: 5,
            name: "Transport",
            route: ROUTES.TRANSPORT_REQUEST,
            icon: <DirectionsCarIcon />,
            group: "Operations",
            subroutes: [],
            access: has(PERMISSIONS.READ_TRANSPORT)
        },
        {
            id: 6,
            name: "Inventory",
            route: ROUTES.INVENTORY,
            icon: <Inventory2OutlinedIcon />,
            group: "Operations",
            subroutes: [],
            access: has(PERMISSIONS.READ_INVENTORY)
        },
        {
            id: 7,
            name: "Store",
            route: ROUTES.STORE,
            icon: <Store />,
            group: "Operations",
            subroutes: [],
            access: has(PERMISSIONS.READ_STORE)
        },
        {
            id: 8,
            name: "Movement",
            route: ROUTES.MOVEMENT,
            icon: <LocalShippingOutlinedIcon />,
            group: "Operations",
            subroutes: [],
            // Must match the route guard in subroutes/movement — a link the route then rejects is
            // worse than no link.
            access: has(PERMISSIONS.READ_MOVEMENT)
        },
        {
            id: 9,
            name: "Reports",
            route: ROUTES.REPORTS,
            icon: <BarChartOutlinedIcon />,
            group: "Insights",
            subroutes: [],
            /*
             * What the six tabs actually read — not READ_AUDIT, which no tab touches.
             *
             * Measured when this was found: **4 of 27 accounts could see this link, and 23 could
             * read every report on it without ever being shown it.** Nobody hit the opposite
             * failure, so the page was simply invisible to the people it was built for — and nobody
             * complained, because nobody complains about a page they do not know exists.
             *
             * A disjunction rather than one permission: the page hides the tabs a viewer cannot
             * load, so holding any one of these is enough to have something worth opening. The
             * list is the tabs' own, so the link, the route and the tabs cannot disagree.
             */
            access: REPORT_PAGE_PERMISSIONS.some((p) => has(p))
        },
        {
            id: 12,
            name: "Audit Trails",
            route: ROUTES.AUDIT_TRAILS,
            icon: <ReceiptLongIcon />,
            group: "Insights",
            subroutes: [],
            access: has(PERMISSIONS.READ_AUDIT)
        },
        {
            id: 3,
            name: "Users",
            route: ROUTES.USERS,
            icon: <GroupIcon />,
            group: "Administration",
            subroutes: [],
            access: has(PERMISSIONS.READ_USER)
        },
        {
            id: 10,
            name: "Settings",
            route: ROUTES.SETTINGS,
            icon: <SettingsIcon />,
            group: "Administration",
            subroutes: [],
            access: has(PERMISSIONS.READ_SETTING)
        },
        {
            id: 11,
            name: "Approval Workflows",
            route: ROUTES.APPROVAL_WORKFLOWS,
            icon: <AccountTreeOutlinedIcon />,
            group: "Administration",
            subroutes: [],
            access: has(PERMISSIONS.READ_SETTING)
        },
    ]
    return ({ sideBarList })
}

export default SideBarElements
