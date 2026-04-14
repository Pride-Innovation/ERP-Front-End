// UpdateTitle.tsx
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

import TitleForm from "./TitleForm";
import { updateTitleService } from "./service";
import { toast } from "react-toastify";
import TitleUtills from "./utills";

const UpdateTitle = ({ handleClose, sendingRequest, setSendingRequest, title }: IUpdateTitle) => {
    const [defaultTitle, setDefaultTitle] = useState<any>(title);
    const { updateTitleInStore } = TitleUtills();

    useEffect(() => {
        setDefaultTitle({
            ...title,
            reportsTo: title.reportsTo?.id
        });
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
                toast.success("Title updated successfully", { position: 'bottom-right' });
                updateTitleInStore(response.data);
            }
        } catch (error) {
            console.error("Error updating title:", error);
            toast.error("Failed to update title. Please try again.", { position: 'bottom-right' });
        }
        setSendingRequest(false);
        handleClose();
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <TitleForm
                handleClose={handleClose}
                buttonText="Update Title"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
                update={true}
            />
        </form>
    );
};

export default UpdateTitle;