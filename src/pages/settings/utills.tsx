/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import CameraOutdoorOutlinedIcon from '@mui/icons-material/CameraOutdoorOutlined';
import { ISettingsNavigation } from './interface';
import { ROUTES } from '../../core/routes/routes';
import DownloadingIcon from '@mui/icons-material/Downloading';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';


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
            text: "Commodities",
            path: ROUTES.COMMODITY,
            icon: <CategoryOutlinedIcon />
        },
        {
            id: 4,
            text: "Titles",
            path: ROUTES.TITLES,
            icon: <WorkOutlineOutlinedIcon />
        },
        {
            id: 5,
            text: "Suppliers",
            path: ROUTES.SUPPLIERS,
            icon: <LocalShippingOutlinedIcon />
        },
        {
            id: 6,
            text: "Statuses",
            path: ROUTES.STATUSES,
            icon: <DownloadingIcon />
        },
        {
            id: 6,
            text: "Departments",
            path: ROUTES.DEPARTMENT,
            icon: <AccountTreeOutlinedIcon />
        }
    ]

    return ({ navigations })
}

export default SettingsUtills