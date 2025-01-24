import { useEffect, useState } from "react"
import { listUnitOfMeasuresService } from "../../assets/ITEquipment/service"
import { IFormData } from "../../assets/interface"
import { IUnitOfMeasure } from "./interface"
import { useDispatch } from "react-redux"
import { addUnitOfMeasure, loadUnitOfMeasures, removeUnitOfMeasure, updateUnitOfMeasure } from "./slice"
import { useSelector } from "react-redux"
import { AppDispatch, RootState } from "../../../store"

const UnitMeasureUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useDispatch<AppDispatch>()
    const { unitsOfMeasure } = useSelector((state: RootState) => state.UnitsOfMeasureStore);

    const fetchAllUnitsOfMeasure = async () => {
        const response = await listUnitOfMeasuresService() as Array<IUnitOfMeasure>;
        dispatch(loadUnitOfMeasures(response))
    }

    useEffect(() => { fetchAllUnitsOfMeasure() }, []);

    const addUnitOfMeasureToStore = (unitOfMeasure: IUnitOfMeasure) => {
        dispatch(addUnitOfMeasure(unitOfMeasure))
    }

    const removeUnitOfMeasureToStore = (unitOfMeasure: IUnitOfMeasure) => {
        dispatch(removeUnitOfMeasure(unitOfMeasure))
    }

    const updateUnitOfMeasureInStore = (unitOfMeasure: IUnitOfMeasure) => {
        dispatch(updateUnitOfMeasure(unitOfMeasure))
    }


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
        formFields,
        addUnitOfMeasureToStore,
        removeUnitOfMeasureToStore,
        updateUnitOfMeasureInStore
    })
}

export default UnitMeasureUtills;