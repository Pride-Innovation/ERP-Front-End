/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react'
import { ITableHeader } from '../../../components/tables/interface';
import { itEquipmentMock } from '../../../mocks/itEquipment';
import { getTableHeaders } from '../../../components/tables/getTableHeaders';
import InfoIcon from '@mui/icons-material/Info';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';

const DashboardOfficeAssetsUtills = () => {
    const endPoint = 'posts';
    const header = { plural: 'Office Assets', singular: 'Request' };
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
        assetStatus,
        hostname,
        branch,
        stock,
        assignedTo,
        commodity,
        make,
        lpoNumber,
        ...data
    } = itEquipmentMock[0];

    const rowData = {
        image: itEquipmentMock[0].image,
        ...data,
        action: {
            label: "options",
            options: [
                { value: "dispose", label: "Approve", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: "update", label: "Revert", icon: <DoNotDisturbAltIcon fontSize='small' color='info' /> },
            ]
        },
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

export default DashboardOfficeAssetsUtills