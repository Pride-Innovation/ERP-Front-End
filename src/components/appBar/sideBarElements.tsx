import { ISideBarItem } from './interface';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import { ROUTES } from '../../core/routes/routes';

export const SideBarItems: Array<ISideBarItem> = [
    {
        id: 1,
        name: "Dashboard",
        route: ROUTES.DASHBOARD,
        icon: <DashboardIcon />
    },
    {
        id: 2,
        name: "Settings",
        route: ROUTES.SETTINGS,
        icon: <SettingsIcon />
    }
]