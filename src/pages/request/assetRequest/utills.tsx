import {
    useContext,
    useEffect,
    useState
} from 'react';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { IOptions, ITableHeader } from '../../../components/tables/interface';
import { IRequest, IRequestTableData } from '../interface';
import { RequestContext } from '../../../context/request/RequestContext';
import { requestMock } from '../../../mocks/request';
import { crudStates, requestStatus } from '../../../utils/constants';
import { IFormData } from '../../assets/interface';
import { getTableHeaders } from '../../../components/tables/getTableHeaders';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { loadAllRequests, removeAssetRequest } from './slice';
import { useSelector } from 'react-redux';
import { listAssetStatusesService } from '../../settings/statuses/service';
import { IStatusFetchResponse } from '../../settings/statuses/interface';
import { loadStatuses } from '../../settings/statuses/slice';
import moment from 'moment';

const RequestUtills = () => {
    const endPoint = 'requests';
    const module = "request";
    const header = { plural: 'Requests', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [pendingRequests, setPendingRequests] = useState<Array<IRequest>>([] as IRequest[])
    const [rejectedRequests, setRejectedRequests] = useState<Array<IRequest>>([] as IRequest[])
    const { setRequestTableData } = useContext(RequestContext);
    const [open, setOpen] = useState<boolean>(false);
    const { statuses } = useSelector((state: RootState) => state.StatusesStore)
    const [optionsObject, setOptionsObject] = useState<{ statusesOptions: Array<IOptions> }>({ statusesOptions: [] });
    const dispatch = useDispatch<AppDispatch>();
    const { assetsRequests } = useSelector((state: RootState) => state.AssetsRequestsStore)

    useEffect(() => {
        if (statuses?.length > 0) {
            setOptionsObject({
                statusesOptions: statuses?.map(status => ({ label: status.name, value: status.id as number })) || [],
            })
        }

    }, [statuses])

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const addAllRequestsInStore = (assetRequests: Array<IRequest>) => {
        dispatch(loadAllRequests(assetRequests))
    }

    const fetchAllStatuses = async () => {
        const response = await listAssetStatusesService() as IStatusFetchResponse;
        dispatch(loadStatuses(response.content))
    }

    useEffect(() => { fetchAllStatuses() }, []);

    const removeAssetRequestFromStore = (request: IRequest) => {
        dispatch(removeAssetRequest(request))
    }

    const {
        id,
        requester,
        timeOfSubmissionOfRequest,
        name,
        description,
        createDate,
        status,
        ...data
    } = requestMock[0];

    const rowData = {
        name: requestMock[0]?.name,
        requestDate: requestMock[0]?.createDate,
        timeOfSubmissionOfRequest: requestMock[0]?.timeOfSubmissionOfRequest,
        ...data,
        status: requestMock[0]?.status?.status,
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
            value: "name",
            label: "Name",
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
            value: "status",
            label: 'Status',
            type: "select",
            options: optionsObject.statusesOptions
        },

        {
            value: "quantity",
            label: "Quantity",
            type: "input"
        },
        {
            value: "description",
            label: "Description",
            type: "textarea"
        },
    ];

    const determineStatusColor = (id: number): string => {
        const statusColor = (statuses.find(status => status.id === id))?.status
        return statusColor === requestStatus.approved ? requestStatus.approved
            : statusColor === requestStatus.pending ? requestStatus.pending
                : requestStatus.rejected
    }

    const handleRequest = (list: Array<IRequest>) => {
        const data: Array<IRequestTableData> = list.map((request, index) => {
            const {
                requester,
                ...fielsdata
            } = list[index];

            return (
                {
                    ...fielsdata,
                    requestDate: moment(request.createDate).format('LL'),
                    timeOfSubmissionOfRequest: moment(request.createDate).format('LT'),
                    status: determineStatusColor(request.status?.id as number)
                }
            )
        })
        setRequestTableData(data);
    }

    const determineCurrentRequest = (id: number, itemList: Array<IRequest>): IRequest => {
        const item = itemList.find(item => item.id === id);
        return item as IRequest;
    }

    const filterPendingRecords = (items: Array<IRequest>) => {
        setPendingRequests(items.filter(item => item.status?.name === requestStatus.pending))
    }


    const filterRejectedRecords = (items: Array<IRequest>) => {
        setRejectedRequests(items.filter(item => item.status?.name === requestStatus.rejected))
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
            addAllRequestsInStore,
            assetsRequests,
            removeAssetRequestFromStore
        }
    )
}

export default RequestUtills;