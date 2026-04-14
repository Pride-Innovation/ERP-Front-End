// UpdateSupplier.tsx
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ISupplier, ISupplierAxiosResponse, IUpdateSupplier } from "./interface";
import SupplierForm from "./SupplierForm";
import SupplierUtills from "./Utills";
import { yupResolver } from "@hookform/resolvers/yup";
import { supplierSchema } from "./schema";
import { updateSupplierService } from "./service";
import { toast } from "react-toastify";

const UpdateSupplier = ({ handleClose, sendingRequest, supplier, setSendingRequest }: IUpdateSupplier) => {
    const [defaultSupplier, setDefaultSupplier] = useState<any>(supplier);
    const { updateSupplierInStore } = SupplierUtills();

    useEffect(() => {
        setDefaultSupplier({
            ...supplier,
            commodity: supplier.commodity?.id
        });
    }, [supplier]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<ISupplier>({
        mode: 'onChange',
        resolver: yupResolver(supplierSchema),
    });

    useEffect(() => {
        reset({ ...defaultSupplier });
    }, [defaultSupplier]);

    const onSubmit = async (formData: ISupplier) => {
        setSendingRequest(true);
        try {
            const response = await updateSupplierService(formData, supplier.id as number) as ISupplierAxiosResponse;
            if (response.status === 201) {
                toast.success("Supplier updated successfully", { position: 'bottom-right' });
                updateSupplierInStore(response.data);
            }
        } catch (error) {
            console.error("Error updating supplier:", error);
            toast.error("Failed to update supplier. Please try again.", { position: 'bottom-right' });
        }
        setSendingRequest(false);
        handleClose();
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <SupplierForm
                handleClose={handleClose}
                buttonText="Update Supplier"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
                update={true}
            />
        </form>
    );
};

export default UpdateSupplier;