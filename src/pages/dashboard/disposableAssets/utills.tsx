import { useEffect, useState } from 'react'
import { ITableHeader } from '../../../components/tables/interface';
import { itEquipmentMock } from '../../../mocks/itEquipment';
import { getTableHeaders } from '../../../components/tables/getTableHeaders';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

const DisposalAssetsUtills = () => {
    const endPoint = 'posts';
    const header = { plural: 'Disposable Assets', singular: 'Request' };
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
        assetStatus,
        hostname,
        assetCategory_id,
        location,
        ...data
    } = itEquipmentMock[0];

    const rowData = {
        image: itEquipmentMock[0].image,
        ...data,
        action: {
            label: "options",
            options: [
                { value: "dispose", label: "Approve", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: "update", label: "Revert", icon: <ModeEditIcon fontSize='small' color='info' /> },
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

export default DisposalAssetsUtills