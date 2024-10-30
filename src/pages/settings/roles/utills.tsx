import { useState } from "react";
import { IModule, IPermission } from "../interface";
import BalanceIcon from '@mui/icons-material/Balance';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import GroupIcon from '@mui/icons-material/Group';

const RoleUtills = () => {
    const endPoint = "posts";
    const [permissions, setPermissions] = useState<Array<IPermission>>([] as Array<IPermission>);

    const modulesList: IModule[] = [
        {
            id: 1,
            icon: <SettingsBrightnessIcon fontSize='large' color='info' />,
            name: "IT Equipment"
        },
        {
            id: 2,
            icon: <BalanceIcon fontSize='large' color='info' />,
            name: "Office Equipment"
        },
        {
            id: 3,
            icon: <DirectionsCarFilledIcon fontSize='large' color='info' />,
            name: "Fleet"
        },
        {
            id: 4,
            icon: <GroupIcon fontSize='large' color='info' />,
            name: "Users"
        }
    ]


    return (
        { endPoint, setPermissions, modulesList }
    )
}

export default RoleUtills