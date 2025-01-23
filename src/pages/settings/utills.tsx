
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import CameraOutdoorOutlinedIcon from '@mui/icons-material/CameraOutdoorOutlined';
import BedroomBabyOutlinedIcon from '@mui/icons-material/BedroomBabyOutlined';
import ScaleIcon from '@mui/icons-material/Scale';
import { ISettingsNavigation } from './interface';
import { ROUTES } from '../../core/routes/routes';

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
        }
    ]

    return ({ navigations })
}

export default SettingsUtills