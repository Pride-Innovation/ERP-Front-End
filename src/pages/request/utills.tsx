import { useEffect, useState } from 'react'
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { ITableHeader } from '../../components/tables/interface';
import { requestMock } from '../../mocks/request';
import { IFormData } from '../assets/interface';
import { getTableHeaders } from '../../components/tables/getTableHeaders';
import { IRequest } from './interface';


const RequestUtills = () => {
    const endPoint = 'posts';
    const header = { plural: 'Requests', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);

    const {
        id,
        particulars,
        ...data
    } = requestMock[0];

    const rowData = {
        ...data,
        action: {
            label: "options",
            options: [
                { value: "dispose", label: "Dispose", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: "update", label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: "read", label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> }
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
            value: "destination",
            label: 'Destination',
            type: "select",
            options: [
                { label: "In Use", value: "use" },
                { label: "In Store", value: "store" },
                { label: "In Repair", value: "repair" },
                { label: "Disposed/Decommisioned", value: "disposed" },
            ]
        },
        {
            value: "expectedReturnDate",
            label: 'Expected Return Date',
            type: "date"
        }
    ]


    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);
    return (
        { endPoint, header, columnHeaders, formFields }
    )
}

export default RequestUtills