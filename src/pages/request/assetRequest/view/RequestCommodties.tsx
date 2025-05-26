import { useEffect, useState } from 'react';
import TableComponent from '../../../../components/tables/TableComponent';
import { ICommodity } from '../../../settings/commodity/interface';
import { ITableHeader } from '../../../../components/tables/interface';
import { getTableHeaders } from '../../../../components/tables/getTableHeaders';
import { ICommodityTableData } from '../../interface';

const defaultCommodities: Array<{
    commodity: ICommodity
    quantity: number
}> = [
        {
            "commodity": {
                "id": 1,
                "name": "Pens",
                "groupName": "Box",
                "assetType": {
                    "id": 3,
                    "name": "Stationery",
                    "description": "Stationery"
                }
            },
            "quantity": 3
        }]

const RequestCommodties = ({ requestCommodties }: {
    requestCommodties: Array<{
        commodity: ICommodity
        quantity: number
    }>
}) => {
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [commoditiesTableData, setCommoditiesTableData] = useState<Array<ICommodityTableData>>([]);

    const {
        commodity,
        ...data
    } = defaultCommodities[0];

    const rowData = {
        name: defaultCommodities[0].commodity.name,
        unitOfMeasure: defaultCommodities[0].commodity.groupName,
        assetType: defaultCommodities[0].commodity.assetType?.name,
        ...data,
    };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);


    const handleUsersTableData = (commodities: Array<{
        commodity: ICommodity
        quantity: number
    }>) => {
        const data: Array<ICommodityTableData> = commodities.map((com, index) => {
            const {
                commodity,
                ...fielsdata
            } = commodities[index];

            return (
                {
                    ...fielsdata,
                    id: index,
                    name: com.commodity.name,
                    unitOfMeasure: com.commodity.groupName,
                    assetType: com.commodity.assetType?.name as string,
                    quantity: com.quantity
                }
            )
        })

        setCommoditiesTableData(data);
    }

    useEffect(() => { handleUsersTableData(requestCommodties) }, [requestCommodties]);

    return columnHeaders.length === 0 || commoditiesTableData.length === 0 ? null :
        (
            <TableComponent
                endPoint=""
                loading={false}
                count={100}
                exportData
                createAction
                header={{ plural: 'Assignment History', singular: 'Assignment' }}
                module=""
                rows={commoditiesTableData}
                columnHeaders={columnHeaders}
                paginationMode='client'
            />)
}

export default RequestCommodties