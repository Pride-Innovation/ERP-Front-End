import { useEffect } from 'react'
import { IDepartment, IUpdateDepartment } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { departmentSchema } from './schema';
import DepartmentUtills from './utills';
import { IResponseData } from '../../users/interface';
import { toast } from 'react-toastify';
import { Grid } from '@mui/material';
import DepartmentForm from './DepartmentForm';
import { updateDepartmentService } from './service';

const UpdateDepartment = ({
    sendingRequest,
    setSendingRequest,
    handleClose,
    department
}: IUpdateDepartment) => {
    const { updateDepartmentInStore } = DepartmentUtills()
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IDepartment>({
        mode: 'onChange',
        resolver: yupResolver(departmentSchema),
    });

    useEffect(() => {
        reset({ ...department });
    }, [reset]);

    const onSubmit = async (formData: IDepartment) => {
        setSendingRequest(true);
        const { image, ...data } = formData
        const response = await updateDepartmentService(data, formData?.id as string) as IResponseData;
        if (response.status === 'success') {
            updateDepartmentInStore(response.data[0] as unknown as IDepartment)
            toast.success(response.data.message)
            setSendingRequest(false);
            handleClose()
        }
        setSendingRequest(true);
    };

    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <DepartmentForm
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

export default UpdateDepartment