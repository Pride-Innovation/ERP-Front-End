import { useEffect, useState } from "react"
import { IUnitOfMeasure } from "../../assets/ITEquipment/interface"
import { listUnitOfMeasuresService } from "../../assets/ITEquipment/service"
import { IFormData } from "../../assets/interface"

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

    useEffect(() => { fetchAllUnitsOfMeasure() }, []);


    const formFields: Array<IFormData<IUnitOfMeasure>> = [
        {
            value: "name",
            label: 'Branch Name',
            type: "input"
        },
        {
            value: "symbol",
            label: 'Unit Symbol',
            type: "input"
        },
        {
            value: "status",
            label: 'Branch Status',
            type: "select",
            options: [
                {
                    label: "Full Branch",
                    value: 1
                },
                {
                    label: "Minor Branch",
                    value: 2
                }
            ]
        },
        {
            value: "desc",
            label: 'Description',
            type: "textarea"
        }]

    return ({
        unitsOfMeasure,
        handleClose,
        handleOpen,
        setModalState,
        open,
        modalState,
        formFields
    })
}

export default UnitMeasureUtills;