import axiosInstance from "../../../core/apis/axiosInstance";

export const createUSerService = async (body: object) => {
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

export const fetchUsersService = async () => {
  try {
    const response = await axiosInstance.get("users");
    return response.data?.data["0"]?.data;
  } catch (error) {
    throw error
  }
}

export const deleteUserService = async (id: string | number) => {
  try {
    const response = await axiosInstance.get(`users/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}