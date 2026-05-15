/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
import { IModule, IPermission, IRole, IRolesAxiosResponse, IRoleAxiosResponse, IPermissionsAxiosResponse } from "../interface";
import BalanceIcon from '@mui/icons-material/Balance';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import GroupIcon from '@mui/icons-material/Group';
import { crudStates } from "../../../utils/constants";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { addRole, loadAllRoles, removeRoles, setPaginationMeta, updateRole } from "./slice";
import { fetchRowsService } from "../../../core/apis/globalService";
import { fetchAllPermissionsService } from "./service";

const RoleUtills = () => {
    const endPoint = "roles";
    const dispatch = useDispatch<AppDispatch>();
    const [allPermissions, setAllPermissions] = useState<IPermission[]>([]);
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
    const handleClose = () => {
        setOpen(false);
        setModalState("");
    };
    const [loading, setLoading] = useState<boolean>(false);

    const modulesList: IModule[] = [
        {
            id: 1,
            icon: <SettingsBrightnessIcon fontSize='large' color='info' />,
            name: "Asset"
        },
        {
            id: 2,
            icon: <BalanceIcon fontSize='large' color='info' />,
            name: "Request"
        },
        {
            id: 3,
            icon: <DirectionsCarFilledIcon fontSize='large' color='info' />,
            name: "Transport"
        },
        {
            id: 4,
            icon: <GroupIcon fontSize='large' color='info' />,
            name: "User"
        },
        {
            id: 5,
            icon: <GroupIcon fontSize='large' color='info' />,
            name: "Inventory"
        },
        {
            id: 6,
            icon: <GroupIcon fontSize='large' color='info' />,
            name: "Store"
        },
        {
            id: 7,
            icon: <GroupIcon fontSize='large' color='info' />,
            name: "Setting"
        },
        {
            id: 8,
            icon: <GroupIcon fontSize='large' color='info' />,
            name: "Audit"
        }
    ]

    const filterPermissions = (verb: string, permissions: Array<IPermission>, module: string): Array<IPermission> => {
        return permissions?.filter(perm => perm.name.indexOf(verb.toUpperCase()) !== -1 && perm.name.indexOf(module.toUpperCase()) !== -1);
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

        setMainCheckedState({
            create: createList?.length > 0,
            read: readList?.length > 0,
            update: updateList?.length > 0,
            delete: deleteList?.length > 0,
        });
    }

    const fetchAllRoles = async ({ pageNumber = 0, pageSize = 9, name }: { pageNumber?: number; pageSize?: number; name?: string } = {}) => {
        setLoading(true);
        try {
            const response = await fetchRowsService({
                pageNumber,
                pageSize,
                endPoint,
                params: { name }
            }) as IRolesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllRoles(response.data.content));
                dispatch(setPaginationMeta({
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements,
                }));
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    }

    const fetchAllPermissions = async () => {
        try {
            const response = await fetchAllPermissionsService() as IPermissionsAxiosResponse;
            if (response.status === 200) {
                setAllPermissions(response.data);
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    }

    const addRoleToStore = (role: IRole) => dispatch(addRole(role));
    const updateRoleInStore = (role: IRole) => dispatch(updateRole(role));
    const removeRoleFromStore = (role: IRole) => dispatch(removeRoles(role));

    return {
        endPoint,
        modulesList,
        allPermissions,
        fetchAllPermissions,
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
        fetchAllRoles,
        addRoleToStore,
        updateRoleInStore,
        removeRoleFromStore,
    }
}

export default RoleUtills