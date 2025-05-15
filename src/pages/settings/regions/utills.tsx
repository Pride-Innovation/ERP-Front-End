/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useDispatch } from "react-redux";
import { fetchRowsService } from "../../../core/apis/globalService"
import { IRegionsAxiosResponse } from "./interface";
import { AppDispatch } from "../../../store";
import { loadAllRegions } from "./slice";
import { useState } from "react";

const RegionUtills = () => {
    const endPoint = "regions";
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useDispatch<AppDispatch>();

    const fetchAllRegions = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint }) as IRegionsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllRegions(response.data.content))
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    return (
        {
            fetchAllRegions,
            modalState,
            setModalState,
            open,
            loading,
            handleClose,
            handleOpen
        }
    )
}

export default RegionUtills