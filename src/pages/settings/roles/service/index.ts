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