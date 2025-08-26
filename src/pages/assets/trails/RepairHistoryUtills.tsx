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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { listRepairDetailService } from "../officeEquipment/service";
import { IRepairDetails, IRepairDetailsAxiosResponse, IRepairsTableData } from "../interface";
import { loadAssetRepairHistory } from "./slice";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import AttachmentOutlinedIcon from '@mui/icons-material/AttachmentOutlined';

const RepairHistoryUtills = () => {
    const endPoint = 'posts';
    const header = { plural: 'Repair History', singular: 'Repair History' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const [repairsTableData, setRepairsTableData] = useState<Array<IRepairsTableData>>([] as Array<IRepairsTableData>);
    const { assetRepairHistory } = useSelector((state: RootState) => state.AssetAssignmentHistoryStore);


    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCreation = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const {
        id,
        asset,
        documents,
        ...data
    } = repairHistoryMock[0];

    const rowData = {
        serialNumber: repairHistoryMock[0].asset?.engravedNumber,
        ...data,
        action: {
            label: "options",
            options: [
                { value: crudStates.read, label: "Description", icon: <DescriptionOutlinedIcon fontSize='small' color='error' /> },
                { value: crudStates.update, label: "Complete Repair", icon: <HandymanOutlinedIcon fontSize='small' color='info' /> },
                { value: crudStates.upload, label: "Attachments", icon: <AttachmentOutlinedIcon fontSize='small' color='error' /> },
            ]
        },
    };


    const handleRepairTableData = (repairs: Array<IRepairDetails>) => {
        const data: Array<IRepairsTableData> = repairs.map((repair, index) => {
            const {
                asset,
                documents,
                ...fieldsData
            } = repairs[index];

            return (
                {
                    ...fieldsData,
                    serialNumber: repair?.asset?.engravedNumber ? repair?.asset?.engravedNumber : '',
                    repairStartDate: repair?.repairStartDate ? repair?.repairStartDate : '',
                    repairEndDate: repair?.repairEndDate ? repair?.repairEndDate : '',
                    technician: repair?.technician ? repair?.technician : '',
                    repairReason: repair?.repairReason ? repair?.repairReason : '',
                }
            )
        })

        setRepairsTableData(data);
    }

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
        if (assetRepairHistory.length > 0) {
            handleRepairTableData(assetRepairHistory);
        }
    }, [assetRepairHistory])

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
        fetchResources,
        loading,
        repairsTableData
    }
    )
}

export default RepairHistoryUtills