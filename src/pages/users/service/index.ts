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