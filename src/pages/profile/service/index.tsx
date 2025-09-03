import axiosInstance from "../../../core/apis/axiosInstance";
import { IUserAxiosResponse } from "../../users/interface";

/**
 * Update user profile image service
 * @param userId - The ID of the user whose profile image is to be updated
 * @param formData - FormData containing the image file
 * @returns Promise with the response
 */
export const updateUserProfileImageService = async (
    userId: string,
    formData: FormData
): Promise<IUserAxiosResponse> => {
    return await axiosInstance.put(`users/image/${userId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

/**
 * Remove user profile image service
 * @param userId - The ID of the user whose profile image is to be removed
 * @returns Promise with the response
 */
export const removeUserProfileImageService = async (
    userId: string
): Promise<IUserAxiosResponse> => {
    return await axiosInstance.put(`users/remove/image/${userId}`);
};