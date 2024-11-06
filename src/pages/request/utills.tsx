import {
    useContext,
    useEffect,
    useState
} from 'react';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { ITableHeader } from '../../components/tables/interface';
import { requestMock } from '../../mocks/request';
import { IFormData } from '../assets/interface';
import { getTableHeaders } from '../../components/tables/getTableHeaders';
import {
    IRequest,
    IRequestTableData
} from './interface';
import { crudStates } from '../../utils/constants';
import { RequestContext } from '../../context/request/RequestContext';

const RequestUtills = () => {
    const endPoint = 'posts';
    const module = "request";
    const header = { plural: 'Requests', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { setRequestTableData } = useContext(RequestContext);
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const {
        id,
        user,
        description,
        ...data
    } = requestMock[0];

    const rowData = {
        name: `${requestMock[0].user?.firstName} ${requestMock[0].user?.lastName} ${requestMock[0].user?.otherName}`,
        department: requestMock[0]?.user?.department,
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


    const handleRequest = (list: Array<IRequest>) => {
        const data: Array<IRequestTableData> = list.map((request, index) => {
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
        setRequestTableData(data);
    }

    const determineCurrentRequest = (id: number, itemList: Array<IRequest>): IRequest => {
        const item = itemList.find(item => item.id === id);
        return item as IRequest;
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
            open
        }
    )
}

export default RequestUtills;