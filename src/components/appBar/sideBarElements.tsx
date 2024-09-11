import { ISideBarItem } from './interface';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import { ROUTES } from '../../core/routes/routes';

export const sideBarItems: Array<ISideBarItem> = [
    {
        id: 1,
        name: "Dashboard",
        route: ROUTES.ASSETS_MANAGEMENT,
        icon: <DashboardIcon />,
        subroutes: [
            {
                id: 1,
                name: "Dashboard",
                route: ROUTES.ASSETS_MANAGEMENT,
                icon: <DashboardIcon />,
            }
        ]
    },
    {
        id: 2,
        name: "Settings",
        route: ROUTES.SETTINGS,
        icon: <SettingsIcon />,
        subroutes: []
    },
    {
        id: 3,
        name: "Profile",
        route: ROUTES.PROFILE,
        icon: <DashboardIcon />,
        subroutes: [
            {
                id: 1,
                name: "Dashboard",
                route: ROUTES.ASSETS_MANAGEMENT,
                icon: <DashboardIcon />,
            }
        ]
    },
]