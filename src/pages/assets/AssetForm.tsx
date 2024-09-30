import {
    Grid,
    Stack
} from '@mui/material'
import ButtonComponent from '../../components/forms/Button';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../core/routes/routes';
import { UseFormSelect, UseFormInput } from '../../components/forms';
import { IAssetForm } from './interface';

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
                <Grid item xs={12} md={4}>
                    <UseFormInput register={register} control={control} formState={formState} value="name" label='Asset Name' />
                </Grid>
                <Grid item xs={12} md={4}>
                    <UseFormInput register={register} control={control} formState={formState} value="category" label='Category' />
                </Grid>
                <Grid item xs={12} md={4}>
                    <UseFormInput register={register} control={control} formState={formState} value="engravedNumber" label='Engraved Number' />
                </Grid>
                <Grid item xs={12} md={4}>
                    <UseFormInput register={register} control={control} formState={formState} value="model" label='Model' />
                </Grid>
                <Grid item xs={12} md={4}>
                    <UseFormInput register={register} control={control} formState={formState} value="serialNo" label='Serial Number' />
                </Grid>
                <Grid item xs={12} md={4}>
                    <UseFormSelect options={
                        [
                            { label: "In Use", value: "use" },
                            { label: "In Store", value: "store" },
                            { label: "In Repair", value: "repair" },
                            { label: "Disposed/Decommisioned", value: "disposed" },
                        ]
                    } register={register} control={control} formState={formState} value='status' label='Status' />
                </Grid>
                <Grid item xs={12} md={4}>
                    <UseFormInput register={register} control={control} formState={formState} value="costOfAsset" label='Cost 0f Asset' />
                </Grid>
                <Grid item xs={12} md={4}>
                    <UseFormInput register={register} control={control} formState={formState} value="netValue" label='Net value' />
                </Grid>
                <Grid item xs={12} md={4}>
                    <UseFormInput register={register} control={control} formState={formState} value="depreciationRate" label='Depreciation Rate' />
                </Grid>
                <Grid item xs={12} md={4}>
                    <UseFormInput register={register} control={control} formState={formState} value="assignedTo" label='Assigned To' />
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                    <Stack direction="row" spacing={3} sx={{ width: "30%" }}>
                        <ButtonComponent handleClick={() => navigate(ROUTES.LIST_ASSETS)} buttonColor='error' type='button' sendingRequest={false} buttonText="Back" />
                        <ButtonComponent buttonColor='success' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default AssetForm;