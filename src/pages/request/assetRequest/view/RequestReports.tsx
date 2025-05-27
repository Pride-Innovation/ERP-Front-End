import { useEffect, useState } from 'react';
import { IRequestReport, IRequestReportTableData } from '../../interface';
import { ITableHeader } from '../../../../components/tables/interface';
import { usersMock } from '../../../../mocks/users';
import { statusMocks } from '../../../../mocks/status';
import { requestMock } from '../../../../mocks/request';
import { getTableHeaders } from '../../../../components/tables/getTableHeaders';
import TableComponent from '../../../../components/tables/TableComponent';
import { crudStates } from '../../../../utils/constants';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import ModalComponent from '../../../../components/modal';
import { Grid, Stack, Typography } from '@mui/material';
import ButtonComponent from '../../../../components/forms/Button';

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
    const [modalState, setModalState] = useState<string>("")
    const [currentReport, setCurrentReport] = useState<IRequestReport>({} as IRequestReport)
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false)

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
        action: {
            label: "View Comment",
            options: [
                { value: crudStates.read, label: "View Comment", icon: <CommentOutlinedIcon fontSize='small' color='primary' /> }
            ]
        },
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
                    status: rep.status.status as string,
                    comment: rep.comment.length > 20 ? rep.comment.substring(0, 20) + "..." : rep.comment,
                    createDate: rep.createDate
                }
            )
        })

        setReportsTableData(data);
    }

    useEffect(() => { handleReportsTableData(requestReports) }, [requestReports]);

    const findCurrentReport = (id: number) => {
        const rep = requestReports.find(report => report.id === id) as IRequestReport;
        setCurrentReport(rep)
    }

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.read:
                findCurrentReport(moduleID as number)
                setModalState(crudStates.read)
                handleOpen()
                break;
            default:
                break;
        }
    }

    return columnHeaders.length === 0 ? null :
        (
            <>
                {crudStates.read === modalState &&
                    <ModalComponent width={"40%"} title='Comment' open={open} handleClose={handleClose} >
                        <Grid item container spacing={4} xs={12}>
                            <Grid item xs={12}>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CommentOutlinedIcon color="primary" />
                                    <Typography variant="subtitle1" color="textSecondary">
                                        {currentReport?.comment && currentReport.comment}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                                <Stack direction="row" spacing={3} sx={{ width: "30%" }}>
                                    <ButtonComponent
                                        handleClick={handleClose}
                                        buttonColor='info'
                                        type='button'
                                        variant="outlined"
                                        sendingRequest={false}
                                        buttonText="Close"
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </ModalComponent>}
                <TableComponent
                    endPoint=""
                    loading={false}
                    count={100}
                    exportData
                    header={{ plural: 'Request Reports', singular: 'Report' }}
                    module=""
                    rows={reportsTableData || []}
                    createAction={false}
                    columnHeaders={columnHeaders}
                    handleOptionClicked={handleOptionClicked}
                    searchAction={false}
                    paginationMode='client'
                />
            </>
        )
}

export default RequestReports