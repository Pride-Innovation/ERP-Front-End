/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { ITableHeader } from "../../../components/tables/interface";
import assignmentHistoryMock from "../../../mocks/assignmentHistory";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { crudStates } from "../../../utils/constants";
import { fetchRowsService } from "../../../core/apis/globalService";
import { IAssetAssignmentHistorysAxiosResponse } from "./interface";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { loadAssetAssignmentHistory } from "./slice";

const AssignmentHistoryUtills = () => {
    const endPoint = 'assignment-history';
    const header = { plural: 'Assignment History', singular: 'Assignment' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>()

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCreation = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const {
        id,
        user,
        serialNumber,
        statusBefore,
        statusAfter,
        ...data
    } = assignmentHistoryMock[0];

    const rowData = {
        user: assignmentHistoryMock[0].user,
        serialNumber: assignmentHistoryMock[0].serialNumber,
        statusBefore: assignmentHistoryMock[0].statusBefore,
        statusAfter: assignmentHistoryMock[0].statusAfter,
        ...data,
    };

    const fetchAssignmentHistory = async (params?: Record<string, any>) => {
        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params
            }) as IAssetAssignmentHistorysAxiosResponse
            if (response.status === 200) {
                console.log(response.data.content)
                dispatch(loadAssetAssignmentHistory(response.data.content))
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    return ({
        endPoint,
        header,
        columnHeaders,
        modalState,
        setModalState,
        open,
        handleClose,
        handleCreation,
        fetchAssignmentHistory
    }
    )
}

export default AssignmentHistoryUtills