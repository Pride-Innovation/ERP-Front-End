import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { IStatus } from "./interface";
import { listAssetStatusesService } from "./service";
import { addStatus, loadStatuses, removeStatus, updateStatus } from "./slice";
import { useSelector } from "react-redux";
import { IFormData } from "../../assets/interface";
import { requestStatus } from "../../../utils/constants";

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

    const addStatusToStore = (status: IStatus) => {
        dispatch(addStatus(status))
    }

    const updateStatusInStore = (status: IStatus) => {
        dispatch(updateStatus(status))
    }

    const removeStatusFromStore = (status: IStatus) => {
        dispatch(removeStatus(status))
    }

    const formFields: Array<IFormData<IStatus>> = [
        {
            value: "name",
            label: 'Status Name',
            type: "input"
        },
        {
            value: "status",
            label: "Status Color",
            type: "select",
            options: [
                { label: "Red Color", value: requestStatus.rejected },
                { label: "Green Color", value: requestStatus.approved },
                { label: "Orange Color", value: requestStatus.pending },
                { label: "Blue Color", value: requestStatus.normal },
            ]
        },
        {
            value: "desc",
            label: 'Description',
            type: "textarea"
        }]

    return (
        {
            modalState,
            setModalState,
            handleClose,
            handleOpen,
            open,
            setOpen,
            statuses,
            formFields,
            addStatusToStore,
            updateStatusInStore,
            removeStatusFromStore
        }
    )
}

export default StatusUtills