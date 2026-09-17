/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../core/apis/axiosInstance";
import { IUserAxiosResponse } from "../interface";

/**
 * A paginated page of the staff directory.
 *
 * <p>Branch-scoped on the server: a branch user's request comes back with their own duty station
 * whatever they ask for, and Head Office sees everyone. There is deliberately no `branchId` here —
 * passing one from the client would be a suggestion rather than a rule, and the endpoint ignores it
 * below ALL scope.
 */
const fetchUsersService = async (params?: Record<string, any>) => {
  try {
    return await axiosInstance.get("users", { params });
  } catch (error) {
    return error;
  }
};

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
    const response = await axiosInstance.post(`users/${id}/disable`);
    return response;
  } catch (error) {
    return error;
  }
}

const unBlockUserService = async (id: string | number) => {
  try {
    const response = await axiosInstance.post(`users/${id}/unblock`);
    return response;
  } catch (error) {
    return error;
  }
}

/**
 * Your own record, from the JWT.
 *
 * <p>Separate from `fetchSingleUserService` because they are different questions with different
 * rules. That one reads the **staff directory** and needs `READ_USER`; this one takes no id and can
 * only ever return the caller, so it needs nothing beyond being signed in.
 *
 * <p>Using the directory endpoint for the profile page is what made seeing your own profile require
 * `READ_USER` — which showed the Users page, which loads roles, which needs `READ_ROLE`. A chain of
 * administrative permissions, entered through a page about yourself.
 */
const fetchOwnProfileService = async () => {
  try {
    return await axiosInstance.get('users/me');
  } catch (error) {
    return error;
  }
};

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

const searchUserService = async (query: string) => {
  try {
    const response = await axiosInstance.get(`users/search`, { params: { text: query } });
    return response;
  } catch (error) {
    return error;
  }
};

const blockUserService = async (id: string | number) => {
  try { const response = await axiosInstance.post(`users/${id}/block`); return response; }
  catch (error) { return error; }
}

const returnFromLeaveService = async (id: string | number) => {
  try { const response = await axiosInstance.post(`users/${id}/return-from-leave`); return response; }
  catch (error) { return error; }
}

const enableUserService = async (userId: number): Promise<IUserAxiosResponse> => {
  return await axiosInstance.post(`/users/${userId}/enable`);
};

const bulkInsertUsersService = async (data: object) => {
  try {
    const response = await axiosInstance.post(`users/bulk-insert`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export {
  createUSerService,
  fetchUsersService,
  fetchOwnProfileService,
  fetchSingleUserService,
  deleteUserService,
  searchUserService,
  updateUSerService,
  fetchRolesService,
  unBlockUserService,
  enableUserService,
  bulkInsertUsersService,
  blockUserService,
  returnFromLeaveService
}