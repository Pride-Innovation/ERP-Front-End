import { useEffect, useState } from 'react'
import { ITableHeader } from '../../../components/tables/interface';
import { getTableHeaders } from '../../../components/tables/getTableHeaders';
import { itEquipmentMock } from '../../../mocks/itEquipment';

const IndividualRequestUtill = () => {
    const endPoint = 'posts';
    const header = { plural: 'Personal Assets', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const {
        id,
        model,
        ram,
        cpuSpeed,
        hardDiskSize,
        ipAddress,
        macAddress,
        image,
        interfaceType,
        purchaseCost,
        detailNetBookValue,
        dateReceipt,
        supplier,
        unitOfMeasure,
        assetDepreciationRate,
        assetSubCategory_id,
        desc,
        netValueB,
        costOfTheAsset,
        hostname,
        assetCategory_id,
        location,
        assetStatus,
        ...data
    } = itEquipmentMock[0];

    const rowData = {
        image: itEquipmentMock[0].image,
        ...data,
    };


    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    return (
        {
            endPoint,
            header,
            columnHeaders,
        }
    )
}

export default IndividualRequestUtill