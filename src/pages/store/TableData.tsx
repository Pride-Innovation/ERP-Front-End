import { useContext, useEffect, useState } from 'react'
import TableComponent from '../../components/tables/TableComponent'
import { ITableHeader } from '../../components/tables/interface';
import { StoreMocks } from '../../mocks/store';
import { crudStates } from '../../utils/constants';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import { getTableHeaders } from '../../components/tables/getTableHeaders';
import { IStore, IStoreReportTableData } from './interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import StoreUtills from './utillls';
import { StoreContext } from '../../context/store';


const TableData = () => {
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { stores } = useSelector((state: RootState) => state.StoreStore)
    const { count } = useContext(StoreContext);

    const {
        setStoreReportTableData,
        storeReportTableData,
        sendingRequest,
    } = StoreUtills()
    const {
        commodity,
        branch,
        id,
        ...data
    } = StoreMocks[0];

    const rowData = {
        name: StoreMocks[0].commodity.name,
        unitOfMeasure: StoreMocks[0].commodity.groupName,
        ...data,
        quantity: StoreMocks[0].quantity,
        branch: StoreMocks[0].branch.name,
        status: StoreMocks[0].quantity < 5 ? 'low' :
            StoreMocks[0].quantity > 5 && StoreMocks[0].quantity < 10 ? 'warning' : 'in stock',
        action: {
            label: "View Details",
            options: [
                { value: crudStates.read, label: "View Details", icon: <CommentOutlinedIcon fontSize='small' color='primary' /> }
            ]
        },
    };


    const handleReportsTableData = (storeReports: Array<IStore>) => {
        const data: Array<IStoreReportTableData> = storeReports.map((str, index) => {
            const {
                commodity,
                branch,
                id,
                ...fielsdata
            } = storeReports[index];

            return (
                {
                    ...fielsdata,
                    id: str.id as number,
                    name: str.commodity.name,
                    unitOfMeasure: str.commodity.groupName,
                    quantity: str.quantity,
                    branch: str.branch.name,
                    status: str.quantity < 5 ? 'low' :
                        str.quantity > 5 && str.quantity < 10 ? 'warning' : 'in stock',
                }
            )
        })

        setStoreReportTableData(data);
    }

    useEffect(() => { handleReportsTableData(stores) }, [stores])

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    return (
        <TableComponent
            endPoint="store"
            loading={sendingRequest}
            count={count}
            exportData
            header={{ plural: 'Store Reports', singular: 'Store' }}
            module=""
            rows={storeReportTableData || []}
            createAction={false}
            columnHeaders={columnHeaders}
            handleOptionClicked={() => console.log("clicked!!")}
            searchAction={false}
            paginationMode='client'
        />
    )
}

export default TableData
