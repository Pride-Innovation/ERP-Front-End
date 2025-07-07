/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    useContext,
    useEffect,
    useState
} from 'react';
import { ITableHeader } from '../../../components/tables/interface';
import { IRequest, IRequestsAxiosResponse, IRequestTableData } from '../interface';
import { requestMock } from '../../../mocks/request';
import { crudStates, requestStatus } from '../../../utils/constants';
import { IFormData } from '../../assets/interface';
import { getTableHeaders } from '../../../components/tables/getTableHeaders';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { loadAllRequests, removeAssetRequest } from './slice';
import { useSelector } from 'react-redux';
import { fetchRowsService } from '../../../core/apis/globalService';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../core/routes/routes';
import { RequestContext } from '../../../context/request/RequestContext';
import moment from 'moment';

const RequestUtills = () => {
    const endPoint = 'requests';
    const module = "request";
    const header = { plural: 'Requests', singular: 'Request' };
    const [modalState, setModalState] = useState<string>("");
    const [currentRequest, setCurrentRequest] = useState<IRequest>({} as IRequest);
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [pendingRequests, setPendingRequests] = useState<Array<IRequest>>([] as IRequest[])
    const [rejectedRequests, setRejectedRequests] = useState<Array<IRequest>>([] as IRequest[])
    const { setRequestTableData, setCount, count, options } = useContext(RequestContext);
    const [open, setOpen] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const { requests } = useSelector((state: RootState) => state.AssetsRequestsStore)
    const [loading, setLoading] = useState<boolean>(false);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const navigate = useNavigate();


    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    const fetchAllRequests = async (params?: Record<string, any>) => {
        setLoading(true)
        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: params?.pageSize ? params?.pageSize : 10,
                endPoint,
                params
            }) as IRequestsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllRequests(response.data.content));
                setCount(response.data.totalElements)
            }

        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    const addAllRequestsInStore = (assetRequests: Array<IRequest>) => {
        dispatch(loadAllRequests(assetRequests))
    }

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
        lastModified,
        createdBy,
        lastModifiedBy,
        commodities,
        emailMessage,
        currentApprover,
        priority,
        status,
        signaturePath,
        ...data
    } = requestMock[0];

    const rowData = {
        name: requestMock[0]?.name,
        requestDate: requestMock[0]?.createDate,
        priority: requestMock[0]?.priority,
        ...data,
        requestedBy: `${requestMock[0].requester?.firstName} ${requestMock[0].requester?.lastName}`,
        approver: `${requestMock[0].currentApprover?.firstName} ${requestMock[0].currentApprover?.lastName}`,
        requestedFrom: requestMock[0].requester?.branch?.name,
        status: requestMock[0]?.status?.status,
        action: {
            label: "options",
            options: options
        },
    };


    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_REQUEST}/${moduleID}`);
                break;
            case crudStates.delete:
                setModalState(crudStates.delete)
                setCurrentRequest(determineCurrentRequest(moduleID as number, requests as IRequest[]))
                handleOpen();
                break;
            case crudStates.read:
                navigate(`${ROUTES.READ_REQUEST}/${moduleID}`)
                break;
            case crudStates.reject:
                setModalState(crudStates.reject)
                setCurrentRequest(determineCurrentRequest(moduleID as number, requests as IRequest[]))
                handleOpen();
                break;
            case crudStates.approve:
                setModalState(crudStates.approve)
                setCurrentRequest(determineCurrentRequest(moduleID as number, requests as IRequest[]))
                handleOpen();
                break;
            case crudStates.issue:
                navigate(`${ROUTES.ISSUE_REQUEST}/${moduleID}`)
                break;
            case crudStates.acknowledgeRequest:
                setModalState(crudStates.acknowledgeRequest)
                setCurrentRequest(determineCurrentRequest(moduleID as number, requests as IRequest[]))
                handleOpen();
                break;
            case crudStates.acknowledgeReceipt:
                setModalState(crudStates.acknowledgeReceipt)
                setCurrentRequest(determineCurrentRequest(moduleID as number, requests as IRequest[]))
                handleOpen();
                break;
            default:
                break;
        }
    }


    const formFields: Array<IFormData<IRequest>> = [
        {
            value: "name",
            label: "Title",
            type: "input"
        },
        {
            value: "priority",
            label: 'priority',
            type: "select",
            options: [
                { label: "High", value: "high" },
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
            ]
        },
        {
            value: "description",
            label: "Description",
            type: "textarea"
        },
    ];

    const handleRequestTableData = (list: Array<IRequest>) => {
        const data: Array<IRequestTableData> = list.map((request, index) => {
            const {
                status,
                timeOfSubmissionOfRequest,
                lastModified,
                lastModifiedBy,
                signaturePath,
                createdBy,
                requester,
                currentApprover,
                ...fielsdata
            } = list[index];

            return (
                {
                    ...fielsdata,
                    name: request.name,
                    requestDate: moment(request.createDate).format('Do MMMM YYYY, h:mm a'),
                    priority: request.priority,
                    requestedBy: `${request.requester?.firstName} ${request.requester?.lastName}`,
                    approver: `${request.currentApprover?.firstName} ${request.currentApprover?.lastName}`,
                    requestedFrom: request.requester?.branch?.name,
                    status: request.status?.status,
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
    }, [options]);

    return (
        {
            endPoint,
            header,
            columnHeaders,
            formFields,
            handleRequest: handleRequestTableData,
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
            requests,
            removeAssetRequestFromStore,
            fetchAllRequests,
            modalState,
            handleOptionClicked,
            count,
            currentRequest,
            loading,
            sendingRequest,
            setSendingRequest,
        }
    )
}

export default RequestUtills;