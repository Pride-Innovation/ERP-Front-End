import React, { useEffect, useState } from 'react'
import { IRequestReport, IRequestReportTableData } from '../../interface';
import { ITableHeader } from '../../../../components/tables/interface';
import { usersMock } from '../../../../mocks/users';
import { statusMocks } from '../../../../mocks/status';
import { requestMock } from '../../../../mocks/request';
import { getTableHeaders } from '../../../../components/tables/getTableHeaders';
import TableComponent from '../../../../components/tables/TableComponent';

const defaultRequestReport: Array<IRequestReport> = [
    {
        id: 3,
        request: requestMock[0],
        approver: usersMock[0],
        status: statusMocks[0],
        comment: "This request has been approved",
        createDate: "",
        lastModified: "",
        lastModifiedBy: usersMock[0],
        createdBy: usersMock[0]
    }
]

const RequestReports = ({ requestReports }: {
    requestReports: Array<IRequestReport>
}) => {
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [reportsTableData, setReportsTableData] = useState<Array<IRequestReportTableData>>([]);

    const {
        request,
        approver,
        status,
        lastModifiedBy,
        createdBy,
        lastModified,
        id,
        comment,
        createDate,
        ...data
    } = defaultRequestReport[0];

    const rowData = {
        approver: defaultRequestReport[0].approver.firstName,
        status: defaultRequestReport[0].status.name,
        createDate: defaultRequestReport[0].createDate,
        comment: defaultRequestReport[0].comment,
        ...data,
    };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);


    const handleReportsTableData = (reportings: Array<IRequestReport>) => {
        const data: Array<IRequestReportTableData> = reportings.map((rep, index) => {
            const {
                request,
                approver,
                status,
                lastModifiedBy,
                createdBy,
                lastModified,
                comment,
                createDate,
                ...fielsdata
            } = reportings[index];

            return (
                {
                    ...fielsdata,
                    id: rep.id as number,
                    approver: rep.approver.firstName + " " + rep.approver.lastName,
                    status: rep.status.name,
                    comment: rep.comment,
                    createDate: rep.createDate
                }
            )
        })

        setReportsTableData(data);
    }

    useEffect(() => { handleReportsTableData(requestReports) }, [requestReports]);

    return columnHeaders.length === 0 || reportsTableData.length === 0 ? null :
        (
            <TableComponent
                endPoint=""
                loading={false}
                count={100}
                exportData={false}
                header={{ plural: 'Request Reports', singular: 'Report' }}
                module=""
                rows={reportsTableData}
                createAction={false}
                columnHeaders={columnHeaders}
                searchAction={false}
                paginationMode='client'
            />)
}

export default RequestReports