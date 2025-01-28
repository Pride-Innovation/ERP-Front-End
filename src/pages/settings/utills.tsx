
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import CameraOutdoorOutlinedIcon from '@mui/icons-material/CameraOutdoorOutlined';
import BedroomBabyOutlinedIcon from '@mui/icons-material/BedroomBabyOutlined';
import ScaleIcon from '@mui/icons-material/Scale';
import { ISettingsNavigation } from './interface';
import { ROUTES } from '../../core/routes/routes';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DownloadingIcon from '@mui/icons-material/Downloading';

const SettingsUtills = () => {

    const navigations: Array<ISettingsNavigation> = [
        {
            id: 1,
            text: "Roles and Permissions",
            path: ROUTES.SETTINGS,
            icon: <VpnKeyOutlinedIcon fontSize="small" />
        },
        {
            id: 2,
            text: "Branches",
            path: ROUTES.BRANCHES,
            icon: <CameraOutdoorOutlinedIcon />
        },
        {
            id: 3,
            text: "Units",
            path: ROUTES.UNITS,
            icon: <BedroomBabyOutlinedIcon />
        },
        {
            id: 4,
            text: "Units of Measure",
            path: ROUTES.UNITS_MEASURE,
            icon: <ScaleIcon />
        },
        {
            id: 5,
            text: "Suppliers",
            path: ROUTES.SUPPLIERS,
            icon: <ListAltIcon />
        },
        {
            id: 6,
            text: "Statuses",
            path: ROUTES.STATUSES,
            icon: <DownloadingIcon />
        }
    ]

    return ({ navigations })
}

export default SettingsUtills