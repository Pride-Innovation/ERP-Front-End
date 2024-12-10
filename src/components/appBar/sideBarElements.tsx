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

const SideBarElements = () => {
    const { getCurrentUser } = RoutesUtills();
    const userPermissions = getCurrentUser()?.role?.permissions as Array<IPermission>;

    const determinAssetRoute = (): string => {
        const path = userPermissions ? (
            userPermissions.find(perm => perm.id === 8) ? ROUTES.LIST_ASSETS :
                userPermissions.find(perm => perm.id === 12) ? ROUTES.LIST_OFFICE_EQUIPMENT :
                    userPermissions.find(perm => perm.id === 16) ? ROUTES.LIST_FLEET :
                        ROUTES.ERRORS
        ) : ROUTES.ERRORS;

        // return path;
        return ROUTES.LIST_ASSETS;
    }

    const sideBarList: Array<ISideBarItem> = [
        {
            id: 1,
            name: "Dashboard",
            route: ROUTES.ASSETS_MANAGEMENT,
            icon: <DashboardIcon />,
            subroutes: []
        },
        {
            id: 2,
            name: "Assets",
            route: determinAssetRoute(),
            icon: <TuneIcon />,
            subroutes: []
        },
        {
            id: 3,
            name: "Users",
            route: ROUTES.USERS,
            icon: <GroupIcon />,
            subroutes: []
        },
        {
            id: 4,
            name: "Asset Request",
            route: ROUTES.REQUEST,
            icon: <RecentActorsIcon />,
            subroutes: []
        },
        {
            id: 5,
            name: "Transport Request",
            route: ROUTES.TRANSPORT_REQUEST,
            icon: <DirectionsCarIcon />,
            subroutes: []
        },
        {
            id: 6,
            name: "Settings",
            route: ROUTES.SETTINGS,
            icon: <SettingsIcon />,
            subroutes: []
        },
        {
            id: 7,
            name: "Audit Trails",
            route: ROUTES.AUDIT_TRAILS,
            icon: <ReceiptLongIcon />,
            subroutes: []
        },
    ]
    return ({ sideBarList })
}

export default SideBarElements

