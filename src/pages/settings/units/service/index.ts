/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

const getUnitsByDepartmentService = async (departmentId: string | number) => {
    try {
        return await axiosInstance.get('units', {
            params: { departmentId, pageSize: 100 },
        });
    } catch (error) {
        return error;
    }
};

/** Generic paginated list / search — used by the dedicated Units page and the assign Autocomplete. */
const fetchUnitsService = async (params?: Record<string, any>) => {
    try {
        return await axiosInstance.get('units', { params });
    } catch (error) {
        return error;
    }
};

const createUnitService = async (body: Object) => {
    try {
        return await axiosInstance.post('units', body);
    } catch (error) {
        return error;
    }
};

const updateUnitService = async (body: Object, id: string | number) => {
    try {
        return await axiosInstance.put(`units/${id}`, body);
    } catch (error) {
        return error;
    }
};

/**
 * Replaces the roles a unit confers.
 *
 * <p>A replacement, not an add/remove pair: send the complete list you want, and an empty list to
 * revoke everything. That makes revoking the same operation as granting, so there is no second call
 * anyone can forget and no way to be left holding a role nobody remembers assigning.
 *
 * <p>Guarded by UPDATE_ROLE on the backend — it changes who holds what, so it belongs to whoever is
 * trusted to edit roles rather than whoever may rename a unit.
 */
const setUnitRolesService = async (id: string | number, roleIds: Array<number>) => {
    try {
        return await axiosInstance.put(`units/${id}/roles`, { roleIds });
    } catch (error) {
        return error;
    }
};

const deleteUnitService = async (id: string | number) => {
    try {
        return await axiosInstance.delete(`units/${id}`);
    } catch (error) {
        return error;
    }
};

export {
    getUnitsByDepartmentService,
    fetchUnitsService,
    createUnitService,
    updateUnitService,
    setUnitRolesService,
    deleteUnitService,
};
