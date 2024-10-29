import { useContext, useEffect, useState } from 'react'
import { ITableHeader } from '../../../components/tables/interface';
import { requestMock } from '../../../mocks/request';
import { IRequest, IRequestTableData } from '../../request/interface';
import { getTableHeaders } from '../../../components/tables/getTableHeaders';
import { RequestContext } from '../../../context/request/RequestContext';

const IndividualRequestUtill = () => {
    const endPoint = 'posts';
    const header = { plural: 'Personal Assets', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { setRequestTableData } = useContext(RequestContext)

    const {
        id,
        reason,
        user,
        description,
        ...data
    } = requestMock[0];

    const rowData = {
        name: `${requestMock[0].user?.firstName} ${requestMock[0].user?.lastName}`,
        department: requestMock[0].user?.department,
        ...data,
    };

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

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData));
    }, []);

    return (
        {
            endPoint,
            header,
            columnHeaders,
            handleRequest
        }
    )
}

export default IndividualRequestUtill