import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Grid } from "@mui/material";
import SupplierForm from "./SupplierForm";
import { ICreateSupplier, ISupplier } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { supplierSchema } from "./schema";
import { IResponseData } from "../../users/interface";
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
    const request = {
      ...formData,
      user_id: 1
    }
    const response = await createSupplierService(request) as IResponseData;
    if (response.status === 'success') {
      addSupplierToStore(response.data[0] as unknown as ISupplier)
      toast.success(response.data.message)
      setSendingRequest(false);
      handleClose()
    }
  };

  return (
    <Grid container xs={12}>
      <Grid item xs={12}>
        <form
          style={{ width: "100%" }}
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          <SupplierForm
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

export default CreateSupplier