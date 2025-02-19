import { useForm } from "react-hook-form";
import UnitUtills from "./utills";
import { IUnit, IUpdateUnit } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { unitSchema } from "./schema";
import { useEffect } from "react";
import { Grid } from "@mui/material";
import UnitForm from "./UnitForm";
import { IResponseData } from "../../users/interface";
import { updateUnitService } from "./service";
import { toast } from "react-toastify";

const UpdateUnit = ({
    unit,
    sendingRequest,
    setSendingRequest,
    handleClose
}: IUpdateUnit) => {
    const { updateUnitInStore } = UnitUtills()
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IUnit>({
        mode: 'onChange',
        resolver: yupResolver(unitSchema),
    });

    useEffect(() => {
        console.log(unit, "unit information!!")
        reset({ ...unit });
    }, [reset]);

    const onSubmit = async (formData: IUnit) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            user_id: 1
        }

        const response = await updateUnitService(request, formData?.id as string) as IResponseData;
        if (response.status === 'success') {
            updateUnitInStore(response.data[0] as unknown as IUnit)
            toast.success(response.data.message)
            setSendingRequest(false);
            handleClose()
        }

        setSendingRequest(false);
    };
    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <UnitForm
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

export default UpdateUnit