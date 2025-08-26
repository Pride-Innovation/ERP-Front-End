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
import moment from "moment";

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
    const [repairDetails, setRepairDetails] = useState<IRepairDetails | null>(null);

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
        status,
        ...data
    } = repairHistoryMock[0];

    const rowData = {
        ...data,
        action: {
            label: "options",
            options: [
                { value: crudStates.read, label: "Description", icon: <DescriptionOutlinedIcon fontSize='small' color='secondary' /> },
                { value: crudStates.update, label: "Complete Repair", icon: <HandymanOutlinedIcon fontSize='small' color='info' /> },
                { value: crudStates.upload, label: "Attachments", icon: <AttachmentOutlinedIcon fontSize='small' color='inherit' /> },
            ]
        },
    };


    const handleRepairTableData = (repairs: Array<IRepairDetails>) => {
        const data: Array<IRepairsTableData> = repairs.map((repair, index) => {
            const {
                asset,
                documents,
                status,
                ...fieldsData
            } = repairs[index];

            return (
                {
                    ...fieldsData,
                    repairStartDate: repair?.repairStartDate ? moment(repair?.repairStartDate as string).format("Do MMM YYYY") : '',
                    repairEndDate: repair?.repairEndDate ? moment(repair?.repairEndDate as string).format("Do MMM YYYY") : 'Pending',
                    technician: repair?.technician ? repair?.technician : '',
                    repairReason: repair?.repairReason ? repair?.repairReason.length > 20
                        ? repair?.repairReason.substring(0, 20) + "..." : repair?.repairReason : '',
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


    const findRepair = (id: number): IRepairDetails => {
        return assetRepairHistory.find(repair => repair.id === id) as IRepairDetails;
    }


    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.read:
                setModalState(option as string)
                setRepairDetails(findRepair(moduleID as number))
                handleOpen();
                break;
            case crudStates.update:
                setModalState(option as string)
                setRepairDetails(findRepair(moduleID as number))
                handleOpen();
                break;
            case crudStates.upload:
                setModalState(option as string)
                setRepairDetails(findRepair(moduleID as number))
                handleOpen();
                break;
            default:
                break
        }
    }


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
        repairsTableData,
        handleOptionClicked,
        repairDetails
    })
}

export default RepairHistoryUtills  