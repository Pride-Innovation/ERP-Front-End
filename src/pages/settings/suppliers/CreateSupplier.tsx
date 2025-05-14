/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Grid, Paper } from "@mui/material";
import SupplierForm from "./SupplierForm";
import { ICreateSupplier, ISupplier, ISupplierAxiosResponse } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { supplierSchema } from "./schema";
import { createSupplierService } from "./service";
import SupplierUtills from "./Utills";
import { toast } from "react-toastify";

const CreateSupplier = ({ handleClose, sendingRequest, setSendingRequest }: ICreateSupplier) => {
  const defaultSupplier: ISupplier = {} as ISupplier;
  const { addSupplierToStore } = SupplierUtills()
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
  }, [reset]);

  const onSubmit = async (formData: ISupplier) => {
    setSendingRequest(true)
    try {
      const response = await createSupplierService(formData) as ISupplierAxiosResponse;
      if (response.status === 201) {
        toast.success("Supplier created successfully");
        addSupplierToStore(response.data)
      }
    } catch (error) {
      console.log(error)
    }
    setSendingRequest(false);
    handleClose()
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: "none", maxWidth: "1200px", mx: "auto" }}>
      <form
        style={{ width: "100%" }}
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SupplierForm
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
    </Paper >
  )
}

export default CreateSupplier