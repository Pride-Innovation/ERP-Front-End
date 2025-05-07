import axiosInstance from "../../../core/apis/axiosInstance"

export const loginService = async (body: object) => {

    try {
        const response = await axiosInstance.post('auth/login', body)
        return response
    } catch (error) {
        return error
    }
}

export const userProfileService = async (token: string) => {
    try {
        const response = await axiosInstance.get('profile', {
            headers: { "Authorization": `Bearer ${token}` }
        })
        return response.data
    } catch (error) {
        throw error
    }
}