import React, { useEffect, useState } from 'react'
import { ITableHeader } from '../../../../components/tables/interface';
import { requestMock } from '../../../../mocks/request';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from '../../../../components/tables/getTableHeaders';

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


    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);
    return (
        { endPoint, header, columnHeaders }
    )
}

export default RequestUtills