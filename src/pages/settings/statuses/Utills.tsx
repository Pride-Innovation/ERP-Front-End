/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { IStatus, IStatusesAxiosResponse } from "./interface";
import { addStatus, loadStatuses, removeStatus, updateStatus } from "./slice";
import { useSelector } from "react-redux";
import { IFormData } from "../../assets/interface";
import { requestStatus } from "../../../utils/constants";
import { fetchRowsService } from "../../../core/apis/globalService";

const StatusUtills = () => {
    const endPoint: string = "statuses";
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useDispatch<AppDispatch>()
    const { statuses } = useSelector((state: RootState) => state.StatusesStore)

    const fetchAllStatuses = async () => {
        try {
            // Load the full status catalogue (there are 19+) so callers can reliably
            // resolve a status id by its code from the store.
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 100, endPoint }) as IStatusesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadStatuses(response.data.content))
            }
        } catch (error) {
            console.log(error)
        }

    }

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
            value: "description",
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
            removeStatusFromStore,
            fetchAllStatuses
        }
    )
}

export default StatusUtills