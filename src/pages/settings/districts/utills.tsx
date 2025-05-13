import { useDispatch } from "react-redux";
import { fetchRowsService } from "../../../core/apis/globalService"
import { IDistrictsAxiosResponse } from "./interface";
import { AppDispatch } from "../../../store";
import { loadDistricts } from "./slice";

const DistrictUtills = () => {
    const endPoint: string = "districts";
    const dispatch = useDispatch<AppDispatch>();

    const fetchAllDistricts = async () => {
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint }) as IDistrictsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadDistricts(response.data.content));
            }
        } catch (error) {
            console.log(error)
        }
    }
    return ({
        fetchAllDistricts
    }
    )
}

export default DistrictUtills