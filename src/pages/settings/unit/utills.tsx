/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useSelector } from 'react-redux';
import { IUnit } from './interface';
import { IFormData } from '../../assets/interface';
import { addUnit, loadAllUnits, removeUnit, updateUnit } from './slice';
import { listUnitsService } from './service';

const UnitUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useDispatch<AppDispatch>()
    const { units } = useSelector((state: RootState) => state.UnitStore);

    const fetchAllUnits = async () => {
        const response = await listUnitsService() as Array<IUnit>;
        dispatch(loadAllUnits(response))
    }

    useEffect(() => { fetchAllUnits() }, []);

    const addUnitToStore = (unit: IUnit) => {
        dispatch(addUnit(unit))
    }

    const removeUnitFromStore = (unit: IUnit) => {
        dispatch(removeUnit(unit))
    }

    const updateUnitInStore = (unit: IUnit) => {
        dispatch(updateUnit(unit))
    }


    const formFields: Array<IFormData<IUnit>> = [
        {
            value: "name",
            label: 'Unit Name',
            type: "input"
        },
        {
            value: "department_id",
            label: 'Department',
            type: "select",
            options: [
                { label: "Department One", value: 1 },
                { label: "Department Two", value: 2 },
            ]
        },
        {
            value: "head",
            label: "Manager",
            type: "select",
            options: [
                { label: "Manager One", value: 1 },
                { label: "Manager Two", value: 2 }
            ]
        },
        {
            value: "status",
            label: 'Unit Status',
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
            type: "textarea",
            required: false
        }]

    return ({
        units,
        handleClose,
        handleOpen,
        setModalState,
        open,
        modalState,
        formFields,
        addUnitToStore,
        removeUnitFromStore,
        updateUnitInStore
    })
}

export default UnitUtills