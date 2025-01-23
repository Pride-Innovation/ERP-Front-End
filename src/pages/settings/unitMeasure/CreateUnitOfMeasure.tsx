import { useEffect } from 'react'
import { IUnitOfMeasure } from '../../assets/ITEquipment/interface';
import { useForm } from 'react-hook-form';
import { Grid } from '@mui/material';
import UnitOfMeasureForm from './UnitOfMeasureForm';
import { ICreateUnitOfMeasure } from './interface';

const CreateUnitOfMeasure = ({ handleClose, sendingRequest }: ICreateUnitOfMeasure) => {
    const defaultUnitOfMeasure: IUnitOfMeasure = {} as IUnitOfMeasure;

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
        reset({ ...defaultUnitOfMeasure });
    }, [reset]);

    const onSubmit = (formData: IUnitOfMeasure) => {
        console.log(formData, "form data!!!!!");
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

export default CreateUnitOfMeasure