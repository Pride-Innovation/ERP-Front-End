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
import { IITEquipment } from '../../assets/ITEquipment/interface';
import { IAssetTableData } from '../interface';
import moment from 'moment';

const IndividualRequestUtill = () => {
    const endPoint = 'assets';
    const header = { plural: 'IT Assets', singular: 'Asset' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [iTEquipmentTableData, setITEquipmentTableData] = useState<IAssetTableData[]>([] as IAssetTableData[])

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
        ...data,
    };


    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);


    const handleITEquipmentTableData = (list: Array<IITEquipment>) => {
        const data: Array<IAssetTableData> = list.map((item, index) => {
            const {
                branch,
                assignedTo,
                assetType,
                assetStatus,
                supplier,
                description,
                assetDepreciationRate,
                interfaceType,
                ipAddress,
                macAddress,
                hardDiskSize,
                hostname,
                cpuSpeed,
                ram,
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
        setITEquipmentTableData(data);

    }

    return (
        {
            endPoint,
            header,
            columnHeaders,
            handleITEquipmentTableData,
            iTEquipmentTableData
        }
    )
}

export default IndividualRequestUtill