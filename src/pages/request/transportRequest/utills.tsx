import { useContext, useEffect, useState } from "react";
import { ITableHeader } from "../../../components/tables/interface";
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
import { addNewTransportRequest, loadAllTransportRequest } from "./slice";
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
            label: 'Request Time',
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
            label: 'Duration',
            type: "input"
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
            value: "timeOfSubmissionOfRequest",
            label: 'Time Required',
            type: "time"
        },
        {
            value: "status",
            label: 'Status',
            type: "select",
            options: [
                { label: "High", value: "high" },
                { label: "Low", value: "low" },
            ]
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
        console.log(statuses, "statuses!!")
        const status = statuses.find(status => status.id === parseInt(id, 10));
        console.log(status, id, "status!!")
        // return (statuses.find(status => status.id === parseInt(id, 10)))?.name
        //     === requestStatus.pending ? requestStatus.pending : requestStatus.rejected
        return requestStatus.rejected;
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
        }
    )
}

export default TransportRequestUtills;