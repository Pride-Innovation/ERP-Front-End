// CreateTitle.tsx
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from 'react-hook-form';
import { ICreateTitle, ITitle, ITitleAxiosResponse } from './interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import TitleUtills from './utills';
import { titleSchema } from './schema';
import { toast } from 'react-toastify';
import { createTitleService } from './service';
import TitleForm from './TitleForm';

const CreateTitle = ({ sendingRequest, setSendingRequest, handleClose }: ICreateTitle) => {
    const defaultTitle: ITitle = {} as ITitle;
    const { addTitleToStore } = TitleUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
    } = useForm<ITitle>({
        mode: "onChange",
        resolver: yupResolver(titleSchema) as any,
    });

    useEffect(() => {
        reset({ ...defaultTitle });
    }, [reset]);

    const onSubmit = async (formData: ITitle) => {
        setSendingRequest(true);
        try {
            const response = await createTitleService(formData) as ITitleAxiosResponse;
            if (response.status === 201) {
                addTitleToStore(response.data);
                toast.success("Title created successfully", { position: 'bottom-right' });
            }
        } catch (error) {
            console.error("Error creating title:", error);
            toast.error("Failed to create title. Please try again.", { position: 'bottom-right' });
        }
        setSendingRequest(false);
        handleClose();
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <TitleForm
                handleClose={handleClose}
                buttonText="Create Title"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
            />
        </form>
    );
};

export default CreateTitle;