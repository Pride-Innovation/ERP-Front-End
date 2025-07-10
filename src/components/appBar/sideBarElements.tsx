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
import RoutesUtills from '../../core/routes/utills';
import { IPermission } from '../../pages/settings/interface';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Store } from '@mui/icons-material'
import { permissionsMock } from '../../mocks/settings';


const SideBarElements = () => {
    const { getCurrentUser } = RoutesUtills();
    const userPermissions = getCurrentUser()?.title?.role?.permissions as Array<IPermission>;

    const rightsToViewRow = (permission: IPermission): boolean => {
        // The goal is to check if a user has permission to view a route or not
        if (!userPermissions) return false;
        // Check if the user has the specific permission
        return userPermissions.some((userPermission: IPermission) => userPermission.id === permission.id);

        // return ROUTES.LIST_ASSETS;
    }

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
            access: rightsToViewRow(permissionsMock[39]) // Assuming this is the permission for asset read access
        },
        {
            id: 3,
            name: "Users",
            route: ROUTES.USERS,
            icon: <GroupIcon />,
            subroutes: [],
            access: rightsToViewRow(permissionsMock[9]) // Assuming this is the permission for user read access
        },
        {
            id: 4,
            name: "Requests",
            route: ROUTES.REQUEST,
            icon: <RecentActorsIcon />,
            subroutes: [],
            access: rightsToViewRow(permissionsMock[12]) // Assuming this is the permission for request read access
        },
        {
            id: 5,
            name: "Transport",
            route: ROUTES.TRANSPORT_REQUEST,
            icon: <DirectionsCarIcon />,
            subroutes: [],
            access: rightsToViewRow(permissionsMock[19]) // Assuming this is the permission for transport read access
        },
        {
            id: 6,
            name: "Inventory",
            route: ROUTES.INVENTORY,
            icon: <Inventory2OutlinedIcon />,
            subroutes: [],
            access: rightsToViewRow(permissionsMock[23]) // Assuming this is the permission for inventory read access
        },
        {
            id: 7,
            name: "Settings",
            route: ROUTES.SETTINGS,
            icon: <SettingsIcon />,
            subroutes: [],
            access: rightsToViewRow(permissionsMock[27]) // Assuming this is the permission for settings access
        },
        {
            id: 8,
            name: "Audit Trails",
            route: ROUTES.AUDIT_TRAILS,
            icon: <ReceiptLongIcon />,
            subroutes: [],
            access: rightsToViewRow(permissionsMock[31]) // Assuming this is the permission for audit trails access
        },
        {
            id: 9,
            name: "Store",
            route: ROUTES.STORE,
            icon: <Store />,
            subroutes: [],
            access: rightsToViewRow(permissionsMock[35]) // Assuming this is the permission for store access
        },
    ]
    return ({ sideBarList })
}

export default SideBarElements

