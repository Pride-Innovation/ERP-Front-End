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
import { loadAllRequests } from './slice';
import { useSelector } from 'react-redux';
import { listAssetStatusesService } from '../../settings/statuses/service';
import { IStatus } from '../../settings/statuses/interface';
import { loadStatuses } from '../../settings/statuses/slice';
import moment from 'moment';

const RequestUtills = () => {
    const endPoint = 'assetRequisitions';
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
        setOptionsObject({
            statusesOptions: statuses?.map(status => ({ label: status.name, value: status.id as number })) || [],
        })

    }, [statuses])

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const addAllRequestsInStore = (transportRequests: Array<IRequest>) => {
        dispatch(loadAllRequests(transportRequests))
    }

    const fetchAllStatuses = async () => {
        const response = await listAssetStatusesService() as Array<IStatus>;
        dispatch(loadStatuses(response))
    }

    useEffect(() => { fetchAllStatuses() }, []);

    const {
        id,
        requester,
        requesterID,
        requestDate,
        timeOfSubmissionOfRequest,
        Narration,
        name,
        desc,
        ...data
    } = requestMock[0];

    const rowData = {
        name: `${requestMock[0].requester?.name}`,
        requestDate: requestMock[0]?.requestDate,
        timeOfSubmissionOfRequest: requestMock[0]?.timeOfSubmissionOfRequest,
        fromPosition: requestMock[0].fromPosition,
        position: requestMock[0].position,
        ...data,
        status: requestMock[0]?.status,
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

    const handleRequest = (list: Array<IRequest>) => {
        const data: Array<IRequestTableData> = list.map((request, index) => {
            const {
                name,
                requester,
                ...fielsdata
            } = list[index];

            return (
                {
                    name: `${request.requester?.name}`,
                    ...fielsdata,
                    requestDate: moment(request.requestDate).format('LL'),
                    timeOfSubmissionOfRequest: moment(request.timeOfSubmissionOfRequest).format('LT'),
                    fromPosition: request.fromPosition,
                    position: request.position,
                    status: request.status
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
        setPendingRequests(items.filter(item => item.status === requestStatus.pending))
    }


    const filterRejectedRecords = (items: Array<IRequest>) => {
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
            addAllRequestsInStore,
            assetsRequests
        }
    )
}

export default RequestUtills;