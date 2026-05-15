/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Typography, alpha, useTheme, Tooltip } from "@mui/material";
import { IModule, IPermission, IRoleAxiosResponse, IRoleRow } from "../interface";
import CheckboxComponent from "../../../components/forms/CheckBox";
import RoleUtills from "./utills";
import { ChangeEvent, useEffect, useState } from "react";
import { crudStates } from "../../../utils/constants";
import { toast } from "react-toastify";
import { assignPermissionToRoleService, removePermissionFromRoleService } from "./service";
import { AppDispatch } from "../../../store";
import { useDispatch } from "react-redux";
import { updateRole } from "./slice";

const RoleRow = ({ role, module, allPermissions }: IRoleRow) => {
    const { determineCrudStates, mainCheckedState, filterPermissions, updatePermissionsOnClick } = RoleUtills();
    const [selectedPermissions, setSelectedPermissions] = useState<IPermission[]>([] as Array<IPermission>);
    const [updatedPermissions, setUpdatedPermissions] = useState<IPermission[]>([] as Array<IPermission>);
    const moduleNameFxn = (module: IModule) => module.name.toLocaleLowerCase().split(" ").join("_");
    const dispatch = useDispatch<AppDispatch>();
    const theme = useTheme();

    useEffect(() => {
        if (((role.permissions as Array<IPermission>)?.length) > 0)
            setUpdatedPermissions(role.permissions as Array<IPermission>)
    }, [role.permissions]);

    useEffect(() => {
        if (updatedPermissions.length > 0) {
            determineCrudStates(updatedPermissions, moduleNameFxn(module))
        }
    }, [updatedPermissions, module]);

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const verb = event.target.name;
        const val = event.target.checked;
        const permission = filterPermissions(verb, allPermissions, moduleNameFxn(module));

        if (!permission || permission.length === 0) {
            toast.error(`No permission found for ${verb.toUpperCase()}_${moduleNameFxn(module).toUpperCase()}`, { position: 'bottom-right' });
            return;
        }

        try {
            let response: IRoleAxiosResponse;

            if (val) {
                response = await assignPermissionToRoleService(role?.id as number, permission[0].id as number) as IRoleAxiosResponse;
                toast.success(
                    `Permission '${(permission[0].name).split("_").join(" ").toLowerCase()}' added to ${response.data.name}`,
                    { position: 'bottom-right' }
                );
            } else {
                response = await removePermissionFromRoleService(role?.id as number, permission[0].id as number) as IRoleAxiosResponse;
                toast.info(
                    `Permission '${(permission[0].name).split("_").join(" ").toLowerCase()}' removed from ${response.data.name}`,
                    { position: 'bottom-right' }
                );
            }

            if (response?.status === 200) {
                dispatch(updateRole(response.data));
            }

            const result = updatePermissionsOnClick(updatedPermissions as Array<IPermission>, permission[0], val);
            setSelectedPermissions([...result]);
            setUpdatedPermissions([...result]);

        } catch (error: any) {
            const detail = error?.response?.data?.detail;
            const message = error?.response?.data?.message;
            if (detail) {
                toast.error(detail, { position: 'bottom-right' });
            } else if (message) {
                toast.error(message, { position: 'bottom-right' });
            } else {
                toast.error('Failed to update permission. Please try again.', { position: 'bottom-right' });
            }
        }
    }

    useEffect(() => {
        if (selectedPermissions.length > 0) {
            determineCrudStates(selectedPermissions, moduleNameFxn(module))
        }
    }, [selectedPermissions]);

    // Determine if this is a special module
    const isSpecialModule = module.name === "User" || module.name === "Request" || module.name === "Store" || module.name === "Audit";

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "6fr 1fr 1fr 1fr 1fr",
                gap: 2,
                px: 3,
                py: 1.5,
                alignItems: "center",
                bgcolor: isSpecialModule ? alpha(theme.palette.background.default, 0.5) : 'transparent',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                },
                transition: 'background-color 0.15s ease'
            }}
        >
            <Tooltip title={`Manage ${module.name} module permissions`} placement="top-start">
                <Typography
                    variant="body2"
                    fontWeight={isSpecialModule ? 500 : 400}
                    color={isSpecialModule ? 'primary' : 'text.primary'}
                >
                    {module.name}
                </Typography>
            </Tooltip>

            {/* Checkboxes with centered alignment */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CheckboxComponent
                    name={crudStates.create}
                    handleChangeEvent={handleChange}
                    checked={mainCheckedState.create}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CheckboxComponent
                    name={crudStates.read}
                    handleChangeEvent={handleChange}
                    checked={mainCheckedState.read}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CheckboxComponent
                    name={crudStates.update}
                    handleChangeEvent={handleChange}
                    checked={mainCheckedState.update}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CheckboxComponent
                    name={crudStates.delete}
                    handleChangeEvent={handleChange}
                    checked={mainCheckedState.delete}
                />
            </Box>
        </Box>
    )
}

export default RoleRow;