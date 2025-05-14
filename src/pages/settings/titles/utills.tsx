import { useState } from "react";
import { fetchRowsService } from "../../../core/apis/globalService";
import { ITitlesAxiosResponse } from "./interface";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { loadAllTitles } from "./slice";

const TitleUtills = () => {
    const endPoint: string = "titles";
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useDispatch<AppDispatch>();

    const fetchAllTitles = async () => {
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint }) as ITitlesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllTitles(response.data.content))
            }
        } catch (error) {
            console.log(error)
        }
    }

    return ({
        modalState,
        setModalState,
        open,
        setOpen,
        loading,
        setLoading,
        handleClose,
        handleOpen,
        fetchAllTitles
    })
}

export default TitleUtills;