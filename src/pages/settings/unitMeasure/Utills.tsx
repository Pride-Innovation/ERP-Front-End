import { useEffect, useState } from "react"
import { IUnitOfMeasure } from "../../assets/ITEquipment/interface"
import { listUnitOfMeasuresService } from "../../assets/ITEquipment/service"

const UnitMeasureUtills = () => {
    const [unitsOfMeasure, setunitsOfMeasure] = useState<IUnitOfMeasure[]>([] as Array<IUnitOfMeasure>)
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    const fetchAllUnitsOfMeasure = async () => {
        const response = await listUnitOfMeasuresService() as Array<IUnitOfMeasure>;
        setunitsOfMeasure(response)
    }

    useEffect(() => { fetchAllUnitsOfMeasure() }, [])
    return ({ unitsOfMeasure, handleClose, handleOpen, setModalState, open, modalState })
}

export default UnitMeasureUtills;