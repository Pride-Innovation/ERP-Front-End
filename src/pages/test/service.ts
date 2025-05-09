/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../core/apis/axiosInstance";

export const fetchTestData = async ({ id, size }: { id: number, size: number }) => {
    try {
        const response = await axiosInstance.get(`posts?_page=${id}&_limit=${size}`);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.log(error, "error!!!")
    }
}