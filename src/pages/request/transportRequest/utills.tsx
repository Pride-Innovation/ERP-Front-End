import { useContext, useEffect, useState } from "react";
import { ITableHeader } from "../../../components/tables/interface";
import { IRequest, ITransportRequest, ITransportRequestTableData } from "../interface";
import { transportRequest } from "../../../mocks/request";
import { crudStates, requestStatus } from "../../../utils/constants";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { IFormData } from "../../assets/interface";
import { TransportRequestContext } from "../../../context/request/TransportRequestContext";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";

const TransportRequestUtills = () => {
    const endPoint = 'posts';
    const module = "request";
    const header = { plural: 'Transport Requests', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [pendingRequests, setPendingRequests] = useState<Array<ITransportRequest>>([] as ITransportRequest[])
    const [rejectedRequests, setRejectedRequests] = useState<Array<ITransportRequest>>([] as ITransportRequest[])
    const { setTransportRequestTableData } = useContext(TransportRequestContext);
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const {
        id,
        user,
        reason,
        notes,
        signature,
        priority,
        dateVehicleRequired,
        ...data
    } = transportRequest[0];

    const rowData = {
        name: `${transportRequest[0].user?.firstName} ${transportRequest[0].user?.lastName} ${transportRequest[0].user?.otherName}`,
        department: transportRequest[0]?.user?.department,
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

    const formFields: Array<IFormData<IRequest>> = [
        {
            value: "reason",
            label: 'Reason',
            type: "input"
        },
        {
            value: "quantity",
            label: 'Quantity',
            type: "input"
        },
        {
            value: "date",
            label: 'Request Date',
            type: "date"
        },
        {
            value: "description",
            label: 'Description',
            type: "textarea"
        }
    ]


    const handleRequest = (list: Array<ITransportRequest>) => {
        const data: Array<ITransportRequestTableData> = list.map((request, index) => {
            const {
                user,
                ...fielsdata
            } = list[index];

            return (
                {
                    name: `${request.user?.firstName} ${request.user?.lastName}`,
                    department: request.user?.department,
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
            rejectedRequests
        }
    )
}

export default TransportRequestUtills