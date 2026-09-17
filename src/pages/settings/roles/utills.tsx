/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
import { IModule, IPermission, IRole, IRolesAxiosResponse, IPermissionsAxiosResponse } from "../interface";
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

/*
 * The modules whose CREATE/READ/UPDATE/DELETE checkboxes make up the permission grid.
 *
 * Lifted out of the hook so the roles page can also ask which permission names this grid already
 * covers — anything seeded that it does not cover has no control anywhere in Settings, which is how
 * VIEW_ALL_BRANCHES and the three stock-take permissions ended up ungrantable through the UI.
 */
export const MODULES_LIST: IModule[] = [
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
    ];

/** The verbs the grid offers, in column order. */
const CRUD_VERBS = [crudStates.create, crudStates.read, crudStates.update, crudStates.delete];

/** Turns a module's display name into the form its permissions are named with, e.g. "Asset" -> "ASSET". */
export const permissionModuleToken = (module: IModule): string =>
    module.name.toLocaleLowerCase().split(" ").join("_").toUpperCase();

/**
 * Every permission name the CRUD grid can already toggle, as `VERB_MODULE`.
 *
 * Used by the roles page to work out what is left over and needs a control of its own.
 */
export const MODULE_CRUD_PERMISSION_NAMES: ReadonlySet<string> = new Set(
    MODULES_LIST.flatMap(module =>
        CRUD_VERBS.map(verb => `${verb.toUpperCase()}_${permissionModuleToken(module)}`)),
);

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

    const modulesList = MODULES_LIST;

    /*
     * The permission a grid checkbox stands for, matched by its exact `VERB_MODULE` name.
     *
     * This used to be two substring tests — name contains the verb AND name contains the module —
     * which is only correct while no permission name happens to contain another's words. It does
     * not survive the estate growing: RECEIVE_ASSET_IN_STORE carries both "ASSET" and "STORE", and
     * a future READ_ASSET_REPORT would answer to the Asset module's Read box and be toggled by it.
     * The grid means one exact name per cell, so it now asks for exactly that.
     */
    const filterPermissions = (verb: string, permissions: Array<IPermission>, module: string): Array<IPermission> => {
        const target = `${verb.toUpperCase()}_${module.toUpperCase()}`;
        return permissions?.filter(perm => perm.name === target);
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