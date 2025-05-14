import { useForm } from 'react-hook-form';
import { ICreateTitle, ITitle, ITitleAxiosResponse } from './interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import TitleUtills from './utills';
import { titleSchema } from './schema';
import { toast } from 'react-toastify';
import { createTitleService } from './service';
import { Grid, Paper } from '@mui/material';
import TitleForm from './TitleForm';

const CreateTitle = ({ sendingRequest, setSendingRequest, handleClose }: ICreateTitle) => {
    const defaultCommodity: ITitle = {} as ITitle;
    const { addTitleToStore } = TitleUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
    } = useForm<ITitle>({
        mode: "onChange",
        resolver: yupResolver(titleSchema),
    });

    useEffect(() => {
        reset({ ...defaultCommodity });
    }, [reset]);

    const onSubmit = async (formData: ITitle) => {
        setSendingRequest(true);
        try {
            const response = await createTitleService(formData) as ITitleAxiosResponse;
            if (response.status === 201) {
                addTitleToStore(response.data);
                toast.success("Title created successfully")
            }
        } catch (error) {
            console.log(error);
        }
        setSendingRequest(false);
        handleClose()
    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: "none", maxWidth: "1200px", mx: "auto" }}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TitleForm
                            handleClose={handleClose}
                            buttonText="Submit"
                            formState={formState}
                            control={control}
                            sendingRequest={sendingRequest}
                            register={register}
                        />
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
}

export default CreateTitle