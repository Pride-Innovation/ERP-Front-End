import { useDispatch } from "react-redux";
import { fetchRowsService } from "../../../core/apis/globalService"
import { IRegionsAxiosResponse } from "./interface";
import { AppDispatch } from "../../../store";
import { loadAllRegions } from "./slice";

const RegionUtills = () => {
    const endPoint = "regions";
    const dispatch = useDispatch<AppDispatch>();
    const fetchAllRegions = async () => {
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint }) as IRegionsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllRegions(response.data.content))
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        { fetchAllRegions }
    )
}

export default RegionUtills