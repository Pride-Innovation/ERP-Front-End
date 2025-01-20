import axiosInstance from "../../../core/apis/axiosInstance";

const createUSerService = async (body: object) => {
  try {
    const response = await axiosInstance.post("users/create", body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    throw error
  }
};

const updateUSerService = async (body: object, id: string | number) => {
  try {
    const response = await axiosInstance.post(`users/update/${id}`, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    throw error
  }
};

const fetchUsersService = async () => {
  try {
    const response = await axiosInstance.get("users");
    return response.data?.data;
  } catch (error) {
    throw error
  }
}

const deleteUserService = async (id: string | number) => {
  try {
    const response = await axiosInstance.get(`users/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

const fetchSingleUserService = async (id: string | number) => {
  try {
    const response = await axiosInstance.get(`users/${id}`);
    return response.data?.data;
  } catch (error) {
    throw error
  }
}

const fetchRolesService = async () => {
  try {
    const response = await axiosInstance.get("roles");
    return response.data?.data;
  } catch (error) {
    throw error
  }
}

export {
  createUSerService,
  fetchSingleUserService,
  deleteUserService,
  fetchUsersService,
  updateUSerService,
  fetchRolesService
}