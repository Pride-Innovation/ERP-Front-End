import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { IStatus } from "./interface";
import { listAssetStatusesService } from "./service";
import { loadStatuses } from "./slice";
import { useSelector } from "react-redux";

const StatusUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useDispatch<AppDispatch>()
    const { statuses } = useSelector((state: RootState) => state.StatusesStore)
    const fetchAllStatuses = async () => {
        const response = await listAssetStatusesService() as Array<IStatus>;
        dispatch(loadStatuses(response))
    }

    useEffect(() => { fetchAllStatuses() }, []);

    return (
        {
            modalState,
            setModalState,
            handleClose,
            handleOpen,
            open,
            setOpen,
            statuses
        }
    )
}

export default StatusUtills