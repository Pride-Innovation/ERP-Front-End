/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { ITitle, ITitleAxiosResponse, IUpdateTitle } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { titleSchema } from "./schema";
import { Grid, Paper } from "@mui/material";
import TitleForm from "./TitleForm";
import { updateTitleService } from "./service";
import { toast } from "react-toastify";
import TitleUtills from "./utills";

const UpdateTitle = ({ handleClose, sendingRequest, setSendingRequest, title }: IUpdateTitle) => {
    const [defaultTitle, setDefaultTitle] = useState<any>(title);
    const { updateTitleInStore } = TitleUtills()

    useEffect(() => {
        setDefaultTitle({
            ...title,
            reportsTo: title.reportsTo?.id
        })
    }, [title]);

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
        reset({ ...defaultTitle });
    }, [defaultTitle]);

    const onSubmit = async (formData: ITitle) => {
        setSendingRequest(true);
        try {
            const response = await updateTitleService(formData, title.id as number) as ITitleAxiosResponse;
            if (response.status === 201) {
                toast.success("Title created successfully")
                updateTitleInStore(response.data)
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
                            buttonText="Update"
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

export default UpdateTitle