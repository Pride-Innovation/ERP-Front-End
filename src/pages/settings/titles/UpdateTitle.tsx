// UpdateTitle.tsx
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo } from "react";
import { ITitle, ITitleAxiosResponse, IUpdateTitle } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { titleSchema } from "./schema";
import TitleForm from "./TitleForm";
import { updateTitleService } from "./service";
import { toast } from "react-toastify";
import TitleUtills from "./utills";
import { toTitlePayload } from "./classification";

const UpdateTitle = ({ handleClose, sendingRequest, setSendingRequest, title }: IUpdateTitle) => {
    const { updateTitleInStore } = TitleUtills();

    const { control, handleSubmit, formState, register, reset } = useForm<ITitle>({
        mode: "onChange",
        resolver: yupResolver(titleSchema) as any,
    });

    // Build the initial "Reports To" option from the title being edited.
    // This is passed to the live-search picker so it can display the correct
    // name before the user starts typing, even if it's not in the first page.
    const initialReportsTo = useMemo(() => {
        if (!title.reportsTo?.id) return null;
        return {
            value: title.reportsTo.id as number,
            label: title.reportsTo.name,
        };
    }, [title.reportsTo]);

    useEffect(() => {
        reset({
            ...title,
            // The pickers store IDs so the backend receives the scalar ids the
            // TitleRequestDTO expects (reportsTo: Long, role: Long) rather than nested objects.
            reportsTo: title.reportsTo?.id as any,
            role: (typeof title.role === 'object' && title.role ? (title.role as any).id : title.role) as any,
            workplace: (title.workplace ?? '') as any,
            departmentId: title.department?.id ?? null,
        });
    }, [title, reset]);

    const onSubmit = async (formData: ITitle) => {
        setSendingRequest(true);
        let updated = false;
        try {
            // TitleRequestDTO expects scalar ids, and the classification fields always present:
            // an update replaces the whole title, so an omitted field would be cleared.
            const response = await updateTitleService(toTitlePayload(formData as any), title.id as number) as ITitleAxiosResponse;
            if (response?.status === 200 || response?.status === 201) {
                toast.success("Title updated successfully", { position: "bottom-right" });
                updateTitleInStore(response.data);
                updated = true;
            } else {
                // Trap #6: a failure arrives as a value. Keep the dialog open rather than look saved.
                toast.error("Failed to update title. Please try again.", { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error updating title:", error);
            toast.error("Failed to update title. Please try again.", { position: "bottom-right" });
        }
        setSendingRequest(false);
        if (updated) handleClose();
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
                update
                initialReportsTo={initialReportsTo}
            />
        </form>
    );
};

export default UpdateTitle;
