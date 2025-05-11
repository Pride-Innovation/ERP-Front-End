/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Typography } from "@mui/material";
import { IModule, IPermission, IRoleAxiosResponse, IRoleRow } from "../interface";
import CheckboxComponent from "../../../components/forms/CheckBox";
import RoleUtills from "./utills";
import { ChangeEvent, useEffect, useState } from "react";
import { crudStates } from "../../../utils/constants";
import { permissionsMock } from "../../../mocks/settings";
import { toast } from "react-toastify";
import { assignPermissionToRoleService, removePermissionFromRoleService } from "./service";

const RoleRow = ({ role, module }: IRoleRow) => {
    const { determineCrudStates, mainCheckedState, filterPermissions, updatePermissionsOnClick } = RoleUtills();
    const [selectedPermissions, setSelectedPermissions] = useState<IPermission[]>([] as Array<IPermission>);
    const [updatedPermissions, setUpdatedPermissions] = useState<IPermission[]>([] as Array<IPermission>)
    const moduleNameFxn = (module: IModule) => module.name.toLocaleLowerCase().split(" ").join("_");

    useEffect(() => {
        if (((role.permissions as Array<IPermission>)?.length) > 0)
            setUpdatedPermissions(role.permissions as Array<IPermission>)
    }, [])

    useEffect(() => {
        if (updatedPermissions.length > 0) {
            determineCrudStates(updatedPermissions, moduleNameFxn(module))
        }
    }, [updatedPermissions]);

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const verb = event.target.name;
        const val = event.target.checked;
        const permission = filterPermissions(verb, permissionsMock, moduleNameFxn(module));
        let response = {} as IRoleAxiosResponse;
        if (val) {
            response = await assignPermissionToRoleService(role?.id as number, permission[0].id as number) as IRoleAxiosResponse;
        } else {
            response = await removePermissionFromRoleService(role?.id as number, permission[0].id as number) as IRoleAxiosResponse;
        }

        if (response?.status === 201) {
            toast.success(`Role ${response.data.name} permissions have been updated successfully`)
        }

        const result = updatePermissionsOnClick(updatedPermissions as Array<IPermission>, permission[0], val);

        setSelectedPermissions([...result]);
        setUpdatedPermissions([...result])
    }

    useEffect(() => {
        if (selectedPermissions.length > 0) {
            determineCrudStates(selectedPermissions, moduleNameFxn(module))
        }
    }, [selectedPermissions]);

    return (
        <Box
            display="grid"
            sx={{ width: "100%", alignItems: "center" }}
            gridTemplateColumns="6fr 1fr 1fr 1fr 1fr"
            gap={4}
            px={3}
            py={0.5}
        >
            <Typography variant="body2">{module.name}</Typography>
            <CheckboxComponent name={crudStates.create} handleChangeEvent={handleChange} checked={mainCheckedState.create} />
            <CheckboxComponent name={crudStates.read} handleChangeEvent={handleChange} checked={mainCheckedState.read} />
            <CheckboxComponent name={crudStates.update} handleChangeEvent={handleChange} checked={mainCheckedState.update} />
            <CheckboxComponent name={crudStates.delete} handleChangeEvent={handleChange} checked={mainCheckedState.delete} />
        </Box>
    )
}

export default RoleRow;