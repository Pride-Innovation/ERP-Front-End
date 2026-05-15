/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"

const fetchAllPermissionsService = async () => {
    const response = await axiosInstance.get('/permissions');
    return response;
}

const assignPermissionToRoleService = async (roleId: string | number, permissionId: string | number) => {
    const response = await axiosInstance.put(`/roles/${roleId}/add-permissions/${permissionId}`);
    return response;
}

const removePermissionFromRoleService = async (roleId: string | number, permissionId: string | number) => {
    const response = await axiosInstance.put(`/roles/${roleId}/remove-permissions/${permissionId}`);
    return response;
}

const createRoleService = async (body: Object) => {
    const response = await axiosInstance.post('roles', body);
    return response;
}

const updateRoleService = async (body: Object, id: string | number) => {
    const response = await axiosInstance.put(`roles/${id}`, body);
    return response;
}

const deleteRoleService = async (id: string | number) => {
    const response = await axiosInstance.delete(`roles/${id}`);
    return response;
}

export {
    fetchAllPermissionsService,
    assignPermissionToRoleService,
    removePermissionFromRoleService,
    createRoleService,
    updateRoleService,
    deleteRoleService
}