import { useEffect, useState } from "react";
import { ITableHeader } from "../../../components/tables/interface";
import { fleetsMock } from "../../../mocks/assets/fleet";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../../components/tables/getTableHeaders";

const FleetUtills = () => {
    const endPoint = 'posts';
    const header = { plural: 'Fleets', singular: 'Fleet' };
    const [open, setOpen] = useState<boolean>(false);
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const {
        id,
        hostname,
        detailNetBookValue,
        desc,
        image,
        assetCategory_id,
        unitOfMeasure,
        supplier,
        costOfTheAsset,
        netValueB,
        ...data
    } = fleetsMock[0];

    const rowData = {
        image: fleetsMock[0].image,
        ...data,
        action: {
            label: "options",
            options: [
                { value: "dispose", label: "Dispose", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: "update", label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: "read", label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> }
            ]
        },
    };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    return (
        {
            endPoint,
            open,
            handleClose,
            handleOpen,
            columnHeaders,
            header
        }
    )
}

export default FleetUtills;