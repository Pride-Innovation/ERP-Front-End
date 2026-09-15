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




/**
 * Change user password service
 * @param body - The request body containing password details
 * @returns Promise with the response
 *
 */
export const changeUserPasswordService = async (
    body: object
): Promise<IUserAxiosResponse> => {
    return await axiosInstance.post('users/change-password', body);
};

/**
 * Submit leave application service
 * @param body - The request body containing leave application details
 * @returns Promise with the response
 */
/**
 * Colleagues you could nominate to act while you are away.
 *
 * <p>Not the staff directory. The leave form used to load `GET /users` to fill this one dropdown, so
 * an officer could not apply for leave without `READ_USER` — which also opens the Users page and
 * needs `READ_ROLE` behind it. This takes no parameters, answers to authentication alone, and returns
 * your own branch minus yourself.
 *
 * <p>It is also unpaged, where the old call asked for `pageSize=10` — so the picker could only ever
 * offer the first ten people in the bank.
 */
export const fetchColleaguesService = async () =>
    axiosInstance.get('users/picker', {
        // Unpaged in practice: a branch is tens of people, and the old call asked for `pageSize=10`,
        // so the picker could only ever offer the first ten people in the bank.
        params: { excludeSelf: true, pageNumber: 0, pageSize: 500 },
    });

export const submitLeaveApplicationService = async (
    body: object,
    userId: string
): Promise<IUserAxiosResponse> => {
    return await axiosInstance.post(`leave/${userId}`, body);
};