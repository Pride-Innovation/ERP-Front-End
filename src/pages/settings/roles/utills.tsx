/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
import { IModule, IPermission, IRole, IRolesAxiosResponse } from "../interface";
import BalanceIcon from '@mui/icons-material/Balance';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import GroupIcon from '@mui/icons-material/Group';
import { crudStates } from "../../../utils/constants";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { loadAllRoles } from "./slice";
import { fetchRowsService } from "../../../core/apis/globalService";

const RoleUtills = () => {
    const endPoint = "roles";
    const [roles, setRoles] = useState<Array<IRole>>([] as Array<IRole>);
    const dispatch = useDispatch<AppDispatch>();
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
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

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

    const updatePermissionsOnClick = (currentPermissions: Array<IPermission>, newPermission: IPermission, val: boolean) => {
        const newList = currentPermissions.filter(perm => perm.id !== newPermission.id);
        return val ? [...newList, newPermission] : newList
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

    const fetchAllRoles = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint }) as IRolesAxiosResponse;
            if (response.status === 200) {
                addAllRolesInStore(response.data.content);
                setCount(response.data.totalElements)
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    const addAllRolesInStore = (roles: Array<IRole>) => {
        dispatch(loadAllRoles(roles))
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
            updatePermissionsOnClick,
            loading,
            count,
            fetchAllRoles
        }
    )
}

export default RoleUtills