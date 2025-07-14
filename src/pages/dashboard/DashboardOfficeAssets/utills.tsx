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
import { IAssetTableData } from '../interface';
import { IOfficeEquipment } from '../../assets/officeEquipment/interface';
import moment from 'moment';

const DashboardOfficeAssetsUtills = () => {
    const endPoint = 'assets';
    const header = { plural: 'Office Assets', singular: 'Asset' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [officeEquipmentTableData, setOfficeEquipmentTableData] = useState<IAssetTableData[]>([] as IAssetTableData[])

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
        serialNumber,
        make,
        lpoNumber,
        ...data
    } = itEquipmentMock[0];

    const rowData = {
        ...data,
        location: "",
        assignedTo: ""
    };


    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    const handleOfficeEquipmentTableData = (list: Array<IOfficeEquipment>) => {
        const data: Array<IAssetTableData> = list.map((item, index) => {
            const {
                branch,
                assignedTo,
                assetType,
                assetStatus,
                supplier,
                description,
                assetDepreciationRate,
                detailNetBookValue,
                netValueB,
                unitOfMeasure,
                lpoNumber,
                stock,
                commodity,
                dateReceipt,
                image,
                ...fielsdata
            } = list[index];

            return (
                {
                    ...fielsdata,
                    assetName: item.assetName,
                    engravedNumber: item.engravedNumber,
                    dateReceived: moment(item.dateReceipt).format('Do MMMM YYYY'),
                    assignedTo: item.assignedTo?.firstName ? `${item.assignedTo?.lastName} ${item.assignedTo?.firstName}` : "",
                    location: item.branch?.name as string
                }
            )
        })
        setOfficeEquipmentTableData(data);

    }

    return (
        {
            endPoint,
            header,
            columnHeaders,
            officeEquipmentTableData,
            handleOfficeEquipmentTableData
        }
    )
}

export default DashboardOfficeAssetsUtills