import { useForm } from 'react-hook-form';
import { IUnitOfMeasure, IUpdateUnitOfMeasure } from './interface';
import { useEffect } from 'react';
import { Grid } from '@mui/material';
import UnitOfMeasureForm from './UnitOfMeasureForm';

const UpdateUnitOfMeasure = ({ unitOfMeasure, handleClose, sendingRequest }: IUpdateUnitOfMeasure) => {
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IUnitOfMeasure>({
        mode: 'onChange',
        // resolver: yupResolver(roleSchema),
    });

    useEffect(() => {
        reset({ ...unitOfMeasure });
    }, [reset]);

    const onSubmit = (formData: IUnitOfMeasure) => {
        console.log(formData, "form data!!")
    };
    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <UnitOfMeasureForm
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

export default UpdateUnitOfMeasure