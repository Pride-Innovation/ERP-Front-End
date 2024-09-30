import {
    FormControl,
    FormHelperText,
    Grid,
    Stack
} from '@mui/material'
import {
    Control,
    Controller,
    FieldError,
    FormState,
    UseFormRegister
} from 'react-hook-form'
import { InputComponent } from '../../components/forms/Inputs';
import ButtonComponent from '../../components/forms/Button';
import SelectComponent from '../../components/forms/Select';
import { IAsset } from './interface';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../core/routes/routes';

interface IAssetForm {
    formState: FormState<IAsset> & {
        errors: {
            name?: FieldError;
            category?: FieldError;
            engravedNumber?: FieldError;
            model?: FieldError;
            serialNo?: FieldError;
            ram?: FieldError;
            cpuSpeed?: FieldError;
            hardDiskSize?: FieldError;
            ipAddress?: FieldError;
            macAddress?: FieldError;
            interfaceType?: FieldError;
            location?: FieldError;
            status?: FieldError;
            purchaseCost?: FieldError;
            verificationDate?: FieldError;
            deploymentDate?: FieldError;
            costOfAsset?: FieldError;
            netValue?: FieldError;
            depreciationRate?: FieldError;
            assignedTo?: FieldError
        };
    };
    control: Control<IAsset>;
    register: UseFormRegister<IAsset>;
    buttonText: string;
    sendingRequest: boolean;
}

const AssetForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
}: IAssetForm) => {
    const navigate = useNavigate();
    return (
        <Grid item container xs={12}>
            <Grid item container spacing={4} xs={12}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("name")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent type='input' required label='Asset Name' field={field} error={formState.errors.name} id='name' />
                            )}
                        />
                        {formState.errors.name && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.name?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("category")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent type='input' required label='category' field={field} error={formState.errors.category} id='category' />
                            )}
                        />
                        {formState.errors.category && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.category?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("engravedNumber")}
                            rules={{ required: false }}
                            render={({ field }) => (
                                <InputComponent type='input' label='Engraved Number' field={field} error={formState.errors.engravedNumber} id='engravedNumber' />
                            )}
                        />
                        {formState.errors.engravedNumber && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.engravedNumber?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("model")}
                            rules={{ required: false }}
                            render={({ field }) => (
                                <InputComponent type='input' required label='Model' field={field} error={formState.errors.model} id='model' />
                            )}
                        />
                        {formState.errors.model && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.model?.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("serialNo")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Serial Number' field={field} error={formState.errors.serialNo} id='serialNo' />
                            )}
                        />
                        {formState.errors.serialNo && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.serialNo.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("status")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <SelectComponent
                                    id='status'
                                    field={field}
                                    error={formState.errors.status}
                                    required label='Status'
                                    options={[
                                        { label: "use", value: "In Use" },
                                        { label: "store", value: "In Store" },
                                        { label: "repair", value: "In Repair" },
                                        { label: "disposed", value: "Disposed/Decommisioned" },
                                    ]} />
                            )}
                        />
                        {formState.errors.status && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.status.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("costOfAsset")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Cost of Asset' field={field} error={formState.errors.costOfAsset} id='costOfAsset' />
                            )}
                        />
                        {formState.errors.costOfAsset && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.costOfAsset.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("netValue")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Net Value' field={field} error={formState.errors.netValue} id='netValue' />
                            )}
                        />
                        {formState.errors.netValue && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.netValue.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("depreciationRate")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Depreciation rate' field={field} error={formState.errors.depreciationRate} id='depreciationRate' />
                            )}
                        />
                        {formState.errors.depreciationRate && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.depreciationRate.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("assignedTo")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Assigned To' field={field} error={formState.errors.assignedTo} id='assignedTo' />
                            )}
                        />
                        {formState.errors.assignedTo && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.assignedTo.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                    <Stack direction="row" spacing={3} sx={{ width: "30%" }}>
                        <ButtonComponent handleClick={() => navigate(ROUTES.LIST_ASSETS)} buttonColor='error' type='button' sendingRequest={false} buttonText="Close" />
                        <ButtonComponent buttonColor='success' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default AssetForm;