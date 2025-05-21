/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../core/apis/axiosInstance";

const createUSerService = async (body: object) => {
  try {
    const response = await axiosInstance.post("users", body);
    return response;
  } catch (error) {
    return error
  }
};

const updateUSerService = async (body: object, id: string | number) => {
  try {
    const response = await axiosInstance.put(`users/${id}`, body);
    return response;
  } catch (error) {
    return error
  }
};

const deleteUserService = async (id: string | number) => {
  try {
    const response = await axiosInstance.delete(`users/${id}`);
    return response;
  } catch (error) {
    return error;
  }
}

const fetchSingleUserService = async (id: string | number) => {
  try {
    const response = await axiosInstance.get(`users/${id}`);
    return response;
  } catch (error) {
    return error
  }
}

const fetchRolesService = async () => {
  try {
    const response = await axiosInstance.get("roles");
    return response;
  } catch (error) {
    return error
  }
}

export {
  createUSerService,
  fetchSingleUserService,
  deleteUserService,
  updateUSerService,
  fetchRolesService
}