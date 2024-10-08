import { useEffect, useState } from "react";
import { IRequest } from "../interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { requestSchema } from "../../schema";
import { Grid, Typography } from "@mui/material";

const CreateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const defaultRequest: IRequest = {} as IRequest;

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IRequest>({
        mode: 'onChange',
        resolver: yupResolver(requestSchema),
    });

    useEffect(() => {
        reset({ ...defaultRequest });
    }, [reset]);

    const onSubmit = (formData: IRequest) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!");
        console.log(sendingRequest);
        console.log(control)
        console.log(handleSubmit)
        console.log(formState)
        console.log(register)
    };
    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <Typography sx={{ my: 4, fontWeight: 600 }}>Request an Asset</Typography>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    Request an Asset!!
                </form>
            </Grid>
        </Grid>
    )
}

export default CreateRequest;