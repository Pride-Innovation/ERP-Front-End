import axiosInstance from "../../../core/apis/axiosInstance";

export const findAssetByTagNameService = async (tagName: string) => {
    try {
        const response = await axiosInstance.get(`assets/tag-name?tagName=${tagName}`);
        return response.data;
    } catch (error) {
        return error;
    }
}

