/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid } from '@mui/material'
import { ICreateUnit, IUnit } from './interface'
import UnitUtills from './utills';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import UnitForm from './UnitForm';
import { unitSchema } from './schema';
import { createUnitService } from './service';
import { IResponseData } from '../../users/interface';
import { toast } from 'react-toastify';

const CreateUnit = ({ handleClose, sendingRequest, setSendingRequest }: ICreateUnit) => {
    const defaultUnit: IUnit = {} as IUnit;
    const { addUnitToStore } = UnitUtills()

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IUnit>({
        mode: 'onChange',
        resolver: yupResolver(unitSchema),
    });

    useEffect(() => {
        reset({ ...defaultUnit });
    }, [reset]);

    const onSubmit = async (formData: IUnit) => {
        setSendingRequest(true);
        const response = await createUnitService(formData) as IResponseData;
        if (response.status === 'success') {
            addUnitToStore(response.data["0"] as unknown as IUnit)
            toast.success(response.data.message)
            setSendingRequest(false);
            handleClose()
        }

        setSendingRequest(false)
    };
    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <UnitForm
                        handleClose={handleClose}
                        buttonText="Submit"
                        formState={formState}
                        control={control}
                        sendingRequest={sendingRequest}
                        register={register}
                    />
                </form>
            </Grid>
        </Grid>
    )
}

export default CreateUnit