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

const deleteUnitService = async (id: string | number) => {
    try {
        return await axiosInstance.delete(`units/${id}`);
    } catch (error) {
        return error;
    }
};

export {
    getUnitsByDepartmentService,
    createUnitService,
    updateUnitService,
    deleteUnitService,
};
