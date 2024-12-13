import { useState } from "react";
import { IModule, IPermission, IRole } from "../interface";
import BalanceIcon from '@mui/icons-material/Balance';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import GroupIcon from '@mui/icons-material/Group';
import { crudStates } from "../../../utils/constants";
import { fetchAllRolesService } from "./service";

const RoleUtills = () => {
    const endPoint = "posts";
    const [roles, setRoles] = useState<Array<IRole>>([] as Array<IRole>);
    const [mainCheckedState, setMainCheckedState] = useState<{
        create: boolean,
        read: boolean,
        update: boolean,
        delete: boolean
    }>({
        create: false,
        read: false,
        update: false,
        delete: false
    });
    const [open, setOpen] = useState<boolean>(false);
    const [modalState, setModalState] = useState<string>("");
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

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

    const filterPermissions = (verb: string, permissions: Array<IPermission>, module: string): Array<IPermission> => {
        return permissions?.filter(perm => perm.name.indexOf(verb) !== -1 && perm.name.indexOf(module) !== -1);
    }


    const determineCrudStates = (permissions: Array<IPermission>, module: string) => {

        const createList = filterPermissions(crudStates.create, permissions, module);
        const readList = filterPermissions(crudStates.read, permissions, module);
        const updateList = filterPermissions(crudStates.update, permissions, module);
        const deleteList = filterPermissions(crudStates.delete, permissions, module);

        setMainCheckedState(() => {
            return {
                create: createList?.length > 0 ? true : false,
                read: readList?.length > 0 ? true : false,
                update: updateList?.length > 0 ? true : false,
                delete: deleteList?.length > 0 ? true : false,
            }
        })
    }

    const fetchAllRoles = async (): Promise<IRole[]> => {
        const response = await fetchAllRolesService() as unknown as IRole[];
        return response;
    }

    return (
        {
            endPoint,
            setRoles,
            modulesList,
            roles,
            determineCrudStates,
            mainCheckedState,
            filterPermissions,
            handleClose,
            handleOpen,
            open,
            modalState,
            setModalState,
            fetchAllRoles
        }
    )
}

export default RoleUtills