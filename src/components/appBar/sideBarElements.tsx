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
import usePermissions from '../../core/permissions/usePermissions';
import { PERMISSIONS } from '../../core/permissions/constants';


const SideBarElements = () => {
    const { has } = usePermissions();

    const sideBarList: Array<ISideBarItem> = [
        {
            id: 1,
            name: "Dashboard",
            route: ROUTES.ASSETS_MANAGEMENT,
            icon: <DashboardIcon />,
            subroutes: [],
            access: true
        },
        {
            id: 2,
            name: "Assets",
            route: ROUTES.LIST_ASSETS,
            icon: <TuneIcon />,
            subroutes: [],
            access: has(PERMISSIONS.READ_ASSET)
        },
        {
            id: 3,
            name: "Users",
            route: ROUTES.USERS,
            icon: <GroupIcon />,
            subroutes: [],
            access: has(PERMISSIONS.READ_USER)
        },
        {
            id: 4,
            name: "Requests",
            route: ROUTES.REQUEST,
            icon: <RecentActorsIcon />,
            subroutes: [],
            access: has(PERMISSIONS.READ_REQUEST)
        },
        {
            id: 5,
            name: "Transport",
            route: ROUTES.TRANSPORT_REQUEST,
            icon: <DirectionsCarIcon />,
            subroutes: [],
            access: has(PERMISSIONS.READ_TRANSPORT)
        },
        {
            id: 6,
            name: "Inventory",
            route: ROUTES.INVENTORY,
            icon: <Inventory2OutlinedIcon />,
            subroutes: [],
            access: has(PERMISSIONS.READ_INVENTORY)
        },
        {
            id: 7,
            name: "Store",
            route: ROUTES.STORE,
            icon: <Store />,
            subroutes: [],
            access: has(PERMISSIONS.READ_STORE)
        },
        {
            id: 8,
            name: "Movement",
            route: ROUTES.MOVEMENT,
            icon: <LocalShippingOutlinedIcon />,
            subroutes: [],
            access: has(PERMISSIONS.READ_ASSET)
        },
        {
            id: 9,
            name: "Reports",
            route: ROUTES.REPORTS,
            icon: <BarChartOutlinedIcon />,
            subroutes: [],
            access: has(PERMISSIONS.READ_AUDIT)
        },
        {
            id: 10,
            name: "Settings",
            route: ROUTES.SETTINGS,
            icon: <SettingsIcon />,
            subroutes: [],
            access: has(PERMISSIONS.READ_SETTING)
        },
        {
            id: 11,
            name: "Approval Workflows",
            route: ROUTES.APPROVAL_WORKFLOWS,
            icon: <AccountTreeOutlinedIcon />,
            subroutes: [],
            access: has(PERMISSIONS.READ_SETTING)
        },
        {
            id: 12,
            name: "Audit Trails",
            route: ROUTES.AUDIT_TRAILS,
            icon: <ReceiptLongIcon />,
            subroutes: [],
            access: has(PERMISSIONS.READ_AUDIT)
        },
    ]
    return ({ sideBarList })
}

export default SideBarElements
