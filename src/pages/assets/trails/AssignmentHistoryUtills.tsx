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
import {
    IAssetAssignmentHistory,
    IAssetAssignmentHistorysAxiosResponse,
    IAssetAssignmentHistoryTableData
} from "./interface";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { loadAssetAssignmentHistory } from "./slice";
import { useSelector } from "react-redux";
import moment from "moment";

const AssignmentHistoryUtills = () => {
    const endPoint = 'assignment-history';
    const header = { plural: 'Assignment History', singular: 'Assignment' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>()
    const [loading, setLoading] = useState<boolean>(false);
    const { assetAssignmentHistory } = useSelector((state: RootState) => state.AssetAssignmentHistoryStore);
    const [assetAssignmentHistoryTableData, setAssetAssignmentHistoryTableData] = useState<IAssetAssignmentHistoryTableData[]>([] as IAssetAssignmentHistoryTableData[])


    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCreation = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const {
        id,
        user,
        statusBefore,
        statusAfter,
        asset,
        ...data
    } = assignmentHistoryMock[0];

    const rowData = {
        user: assignmentHistoryMock[0].user?.firstName,
        engravedNumber: "",
        location: "",
        // statusAfter: assignmentHistoryMock[0].statusAfter?.name,
        ...data,
    };

    const fetchAssignmentHistory = async (params?: Record<string, any>) => {
        setLoading(true)
        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params
            }) as IAssetAssignmentHistorysAxiosResponse
            if (response.status === 200) {
                dispatch(loadAssetAssignmentHistory(response.data.content))
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);


    const handleAssetAssignmentHistoryTableData = (list: Array<IAssetAssignmentHistory>) => {
        const data: Array<IAssetAssignmentHistoryTableData> = list.map((item, index) => {
            const {
                user,
                statusBefore,
                statusAfter,
                asset,
                ...data
            } = list[index];

            return (
                {
                    ...data,
                    user: item.user?.firstName ? `${item.user.firstName} ${item.user.lastName}` : '',
                    engravedNumber: item.asset?.engravedNumber as string,
                    location: item.user ? item.user.branch?.name as string :
                        item.asset?.branch?.name as string,
                    startDate: item.startDate ? moment(item.startDate).format('Do MMMM YYYY') : '',
                    endDate: item.endDate ? moment(item.endDate as string).format('Do MMMM YYYY') : 'To Date',

                }
            )
        })
        setAssetAssignmentHistoryTableData(data);

    }

    useEffect(() => {
        handleAssetAssignmentHistoryTableData(assetAssignmentHistory)
    }, [assetAssignmentHistory])

    return ({
        endPoint,
        header,
        columnHeaders,
        modalState,
        setModalState,
        open,
        handleClose,
        handleCreation,
        fetchAssignmentHistory,
        loading,
        assetAssignmentHistoryTableData
    })
}

export default AssignmentHistoryUtills