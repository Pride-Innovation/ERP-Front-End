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
import ListAltIcon from '@mui/icons-material/ListAlt';
import DownloadingIcon from '@mui/icons-material/Downloading';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';

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
            icon: <ListAltIcon />
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
            icon: <ApartmentIcon />
        }
    ]

    return ({ navigations })
}

export default SettingsUtills