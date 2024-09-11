import { ISideBarItem } from './interface';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import { ROUTES } from '../../core/routes/routes';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

export const sideBarItems: Array<ISideBarItem> = [
    {
        id: 1,
        name: "Dashboard",
        route: ROUTES.ASSETS_MANAGEMENT,
        icon: <DashboardIcon />,
        subroutes: [
            {
                id: 1,
                name: "Page One",
                route: ROUTES.ASSETS_MANAGEMENT,
                icon: <AutorenewIcon />,
            },
            {
                id: 1,
                name: "Page Two",
                route: ROUTES.ASSETS_MANAGEMENT,
                icon: <AutoStoriesIcon />,
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