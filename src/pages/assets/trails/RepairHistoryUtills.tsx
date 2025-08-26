/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { ITableHeader } from "../../../components/tables/interface";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { crudStates } from "../../../utils/constants";
import { repairHistoryMock } from "../../../mocks/repairHistory";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { listRepairDetailService } from "../officeEquipment/service";
import { IRepairDetailsAxiosResponse } from "../interface";
import { loadAssetRepairHistory } from "./slice";

const RepairHistoryUtills = () => {
    const endPoint = 'posts';
    const header = { plural: 'Repair History', singular: 'Repair History' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCreation = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const {
        id,
        serialNumber,
        ...data
    } = repairHistoryMock[0];

    const rowData = {
        serialNumber: repairHistoryMock[0].serialNumber,
        ...data,
    };


    const fetchResources = async (id: string | number) => {
        setLoading(true)
        try {
            const response = await listRepairDetailService(id) as IRepairDetailsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAssetRepairHistory(response.data.content));
            }
        } catch (error) {

        }
        setLoading(false)
    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, [id]);

    return ({
        endPoint,
        header,
        columnHeaders,
        modalState,
        setModalState,
        open,
        handleClose,
        handleCreation,
        fetchResources,
        loading
    }
    )
}

export default RepairHistoryUtills