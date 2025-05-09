/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"

const fetchAllRolesService = async () => {
    try {
        const response = await axiosInstance.get("roles");
        return response?.data?.data
    } catch (error) {
        console.log(error)
    }
}

export { fetchAllRolesService }