import { ISideBarItem } from './interface';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import { ROUTES } from '../../core/routes/routes';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import TuneIcon from '@mui/icons-material/Tune';

export const sideBarItems: Array<ISideBarItem> = [
    {
        id: 1,
        name: "Dashboard",
        route: ROUTES.ASSETS_MANAGEMENT,
        icon: <DashboardIcon />,
        subroutes: []
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
        icon: <ManageAccountsIcon />,
        subroutes: []
    },
    {
        id: 4,
        name: "Users",
        route: ROUTES.USERS,
        icon: <GroupIcon />,
        subroutes: []
    },
    {
        id: 5,
        name: "Audit Trails",
        route: ROUTES.AUDIT_TRAILS,
        icon: <ReceiptLongIcon />,
        subroutes: []
    },
    {
        id: 6,
        name: "Assets",
        route: ROUTES.LIST_ASSETS,
        icon: <TuneIcon />,
        subroutes: []
    },
    {
        id: 7,
        name: "Requests",
        route: ROUTES.REQUEST,
        icon: <RecentActorsIcon />,
        subroutes: []
    },
    {
        id: 8,
        name: "Test",
        route: ROUTES.TEST,
        icon: <ReceiptLongIcon />,
        subroutes: []
    },
]