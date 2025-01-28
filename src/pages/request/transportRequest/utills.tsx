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
import moment from "moment"

const TransportRequestUtills = () => {
    const endPoint = 'fleetRequisitions';
    const module = "request";
    const header = { plural: 'Transport Requests', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [pendingRequests, setPendingRequests] = useState<Array<ITransportRequest>>([] as ITransportRequest[])
    const [rejectedRequests, setRejectedRequests] = useState<Array<ITransportRequest>>([] as ITransportRequest[])
    const { setTransportRequestTableData } = useContext(TransportRequestContext);
    const [open, setOpen] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const { allTranportRequests } = useSelector((state: RootState) => state.TransportRequestStore)

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const addAllTransportRequestsInStore = (transportRequests: Array<ITransportRequest>) => {
        dispatch(loadAllTransportRequest(transportRequests))
    }

    const addNewTransportRequestToStore = (transportRequest: ITransportRequest) => {
        dispatch(addNewTransportRequest(transportRequest))
    }

    const {
        id,
        user,
        reason,
        notes,
        signature,
        priority,
        requestDate,
        requestTime,
        timeRequired,
        timeVehicleIsRequired,
        dateVehicleIsRequired,
        ...data
    } = transportRequest[0];

    const rowData = {
        name: "",
        dateRequested: "",
        timeRequested: "",
        timeVehicleRequired: "",
        dateVehicleRequired: "",
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
            value: "requestDate",
            label: 'Request Date',
            type: "date"
        },
        {
            value: "requestTime",
            label: 'Request Time',
            type: "time"
        },
        {
            value: "dateVehicleIsRequired",
            label: 'Date Required',
            type: "date"
        },
        {
            value: "timeRequired",
            label: 'Time Required',
            type: "time"
        },
        {
            value: "destination",
            label: 'Destination',
            type: "input"
        },
        {
            value: "reason",
            label: 'Reason',
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
            value: "notes",
            label: "Notes",
            type: "textarea"
        }
    ]


    const handleRequest = (list: Array<ITransportRequest>) => {
        const data: Array<ITransportRequestTableData> = list.map((request, index) => {
            const {
                ...fielsdata
            } = list[index];

            return (
                {
                    name: `${request.requester?.name}`,
                    dateRequested: moment(request.requestDate).format('LL'),
                    timeRequested: moment(request.requestDate).format('LT'),
                    timeVehicleRequired: moment(request.timeVehicleIsRequired).format('LT'),
                    dateVehicleRequired: moment(request.timeVehicleIsRequired).format('LL'),
                    ...fielsdata
                }
            )
        })
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
            allTranportRequests
        }
    )
}

export default TransportRequestUtills