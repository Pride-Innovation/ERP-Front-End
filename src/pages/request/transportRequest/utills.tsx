/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import { IOptions, ITableHeader } from "../../../components/tables/interface";
import { ITransportRequest, ITransportRequestTableData } from "../interface";
import { transportRequest } from "../../../mocks/request";
import { crudStates, requestStatus } from "../../../utils/constants";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { IFormData } from "../../assets/interface";
import { TransportRequestContext } from "../../../context/request/TransportRequestContext";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { useDispatch } from "react-redux";
import { addNewTransportRequest, loadAllTransportRequest, removeTransportRequest } from "./slice";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import moment from "moment";
import { listAssetStatusesService } from "../../settings/statuses/service";
import { loadStatuses } from "../../settings/statuses/slice";
import { IStatus } from "../../settings/statuses/interface";

const TransportRequestUtills = () => {
    const endPoint = 'fleetRequisitions';
    const module = "request";
    const header = { plural: 'Transport Requests', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [pendingRequests, setPendingRequests] = useState<Array<ITransportRequest>>([] as ITransportRequest[])
    const [rejectedRequests, setRejectedRequests] = useState<Array<ITransportRequest>>([] as ITransportRequest[])
    const { setTransportRequestTableData } = useContext(TransportRequestContext);
    const { statuses } = useSelector((state: RootState) => state.StatusesStore)
    const [open, setOpen] = useState<boolean>(false);
    const [optionsObject, setOptionsObject] = useState<{
        statusesOptions: Array<IOptions>,
    }>({
        statusesOptions: []
    });

    const dispatch = useDispatch<AppDispatch>();
    const { allTranportRequests } = useSelector((state: RootState) => state.TransportRequestStore)

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const fetchAllStatuses = async () => {
        const response = await listAssetStatusesService() as Array<IStatus>;
        dispatch(loadStatuses(response))
    }

    useEffect(() => { fetchAllStatuses() }, []);

    const addAllTransportRequestsInStore = (transportRequests: Array<ITransportRequest>) => {
        dispatch(loadAllTransportRequest(transportRequests))
    }

    const addNewTransportRequestToStore = (transportRequest: ITransportRequest) => {
        dispatch(addNewTransportRequest(transportRequest))
    }

    const removeTransportRequestFromStore = (request: ITransportRequest) => {
        dispatch(removeTransportRequest(request))
    }

    useEffect(() => {
        if (statuses.length > 0) {
            setOptionsObject({
                statusesOptions: statuses?.map(status => ({ label: status.name, value: status.id as number })) || [],
            })
        }

    }, [statuses])

    const {
        id,
        requester,
        signature,
        priority,
        duration,
        requestDate,
        timeVehicleIsRequired,
        dateVehicleIsRequired,
        timeOfSubmissionOfRequest,
        Narration,
        purpose,
        desc,
        position,
        fromPosition,
        ...data
    } = transportRequest[0];

    const rowData = {
        name: "",
        requestDate: transportRequest[0]?.requestDate,
        timeOfSubmissionOfRequest: transportRequest[0]?.timeOfSubmissionOfRequest,
        dateVehicleIsRequired: transportRequest[0]?.dateVehicleIsRequired,
        timeVehicleIsRequired: transportRequest[0]?.timeVehicleIsRequired,
        duration: `${transportRequest[0].duration} hrs`,
        ...data,
        action: {
            label: "options",
            options: [
                { value: crudStates.delete, label: "Delete", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> }
            ]
        },
    };

    const formFields: Array<IFormData<ITransportRequest>> = [
        {
            value: "timeVehicleIsRequired",
            label: 'Time Vehicle is Required',
            type: "time"
        },
        {
            value: "dateVehicleIsRequired",
            label: 'Date Required',
            type: "date"
        },
        {
            value: "destination",
            label: 'Destination',
            type: "input"
        },
        {
            value: "purpose",
            label: 'Purpose',
            type: "input"
        },
        {
            value: "duration",
            label: 'Duration (Hours)',
            type: "number"
        },
        {
            value: "priority",
            label: 'priority',
            type: "select",
            options: [
                { label: "High", value: "high" },
                { label: "Low", value: "low" },
            ]
        },
        {
            value: "status",
            label: 'Status',
            type: "select",
            options: optionsObject.statusesOptions
        },
        {
            value: "position",
            label: "position",
            type: "input"
        },
        {
            value: "fromPosition",
            label: "From Position",
            type: "input"
        },
        {
            value: "Narration",
            label: "Narration",
            type: "input"
        },
        {
            value: "desc",
            label: "Description",
            type: "textarea"
        },
    ];

    const determineStatusColor = (id: string) => {
        const statusColor = (statuses.find(status => status.id === parseInt(id, 10)))?.status
        return statusColor === requestStatus.approved ? requestStatus.approved
            : statusColor === requestStatus.pending ? requestStatus.pending
                : requestStatus.rejected
    }

    const handleRequest = (list: Array<ITransportRequest>) => {
        const data: Array<ITransportRequestTableData> = list.map((request, index) => {
            const { requester, signature, ...fielsdata } = list[index];

            return (
                {
                    name: `${request.requester?.name}`,
                    ...fielsdata,
                    duration: `${request.duration} hrs`,
                    requestDate: moment(request.requestDate).format('LL'),
                    timeOfSubmissionOfRequest: moment(request.timeOfSubmissionOfRequest).format('LT'),
                    dateVehicleIsRequired: moment(request.dateVehicleIsRequired).format('LL'),
                    timeVehicleIsRequired: moment(request.timeVehicleIsRequired).format('LL'),
                    status: determineStatusColor(request.status as string)
                }
            )
        });
        setTransportRequestTableData(data);
    }

    const determineCurrentRequest = (id: number, itemList: Array<ITransportRequest>): ITransportRequest => {
        const item = itemList.find(item => item.id === id);
        return item as ITransportRequest;
    }

    const filterPendingRecords = (items: Array<ITransportRequest>) => {
        setPendingRequests(items.filter(item => item.status === requestStatus.pending))
    }


    const filterRejectedRecords = (items: Array<ITransportRequest>) => {
        setRejectedRequests(items.filter(item => item.status === requestStatus.rejected))
    }
    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    return (
        {
            endPoint,
            header,
            columnHeaders,
            formFields,
            handleRequest,
            module,
            determineCurrentRequest,
            handleClose,
            handleOpen,
            open,
            filterPendingRecords,
            pendingRequests,
            filterRejectedRecords,
            rejectedRequests,
            addAllTransportRequestsInStore,
            addNewTransportRequestToStore,
            allTranportRequests,
            removeTransportRequestFromStore
        }
    )
}

export default TransportRequestUtills;