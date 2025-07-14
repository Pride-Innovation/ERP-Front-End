/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react'
import { ITableHeader } from '../../../components/tables/interface';
import { getTableHeaders } from '../../../components/tables/getTableHeaders';
import { itEquipmentMock } from '../../../mocks/itEquipment';

const IndividualRequestUtill = () => {
    const endPoint = 'assets';
    const header = { plural: 'IT Assets', singular: 'Asset' };
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
        description,
        netValueB,
        costOfTheAsset,
        hostname,
        assetStatus,
        assignedTo,
        branch,
        lpoNumber,
        stock,
        commodity,
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