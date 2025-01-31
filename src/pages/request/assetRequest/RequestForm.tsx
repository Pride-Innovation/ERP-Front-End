import {
    Box,
    Button,
    Card,
    CardMedia,
    Grid,
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router';
import { IRequestForm } from '../interface';
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect,
    UseFormTimePicker
} from '../../../components/forms';
import ButtonComponent from '../../../components/forms/Button';
import { ROUTES } from '../../../core/routes/routes';
import RequestUtills from './utills';
import PlaceHolder from "../../../statics/images/Placeholder.png"
import { grey } from '@mui/material/colors';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InputFileUpload from '../../../components/forms/FileUpload';
import { useRef } from 'react';


const RequestForm = ({
    register,
    control,
    formState,
    sendingRequest,
    buttonText,
    setImage
}: IRequestForm) => {
    const { formFields } = RequestUtills();
    const navigate = useNavigate();

    const inputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    };

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;
        const file = files[0];
        setImage(URL.createObjectURL(file));
    };

    return (
        <Grid item container xs={12} spacing={3}>
            <Grid item container md={3}>
                <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                    <CardMedia
                        component="img"
                        height="250"
                        image={PlaceHolder}
                        alt="Equipment Image"
                    />
                    <Box sx={{ my: 2, px: 2 }}>
                        <Button
                            sx={{ minHeight: "40px", width: "100%" }}
                            onClick={handleButtonClick}
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                        >
                            Upload Image
                        </Button>
                        <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
                    </Box>

                </Card>
            </Grid>
            <Grid item container spacing={4} md={9} xs={12}>
                {
                    formFields.map(formField => {
                        return formField.type === 'input' ? (
                            <Grid item xs={12} md={3}>
                                <UseFormInput
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label}
                                />
                            </Grid>
                        ) : formField.type === 'textarea' ? (
                            <Grid item xs={12} md={9}>
                                <UseFormInput
                                    row={6}
                                    multiline={true}
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label}
                                />
                            </Grid>
                        ) : formField.type === 'select' ? (
                            <Grid item xs={12} md={3}>
                                <UseFormSelect
                                    options={formField.options}
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label} />
                            </Grid>
                        ) : formField.type === 'date' ? (
                            <Grid item xs={12} md={3}>
                                <UseFormDatePicker
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label} />
                            </Grid>
                        ) : formField.type === 'time' ? (
                            <Grid item xs={12} md={3}>
                                <UseFormTimePicker
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label} />
                            </Grid>
                        ) : formField.type === 'autocomplete' ? (
                            <Grid item xs={12} md={3}>
                                <UseFormAutocompleteComponent
                                    register={register}
                                    control={control}
                                    formState={formState}
                                    value={formField.value}
                                    label={formField.label}
                                    options={formField.options}
                                />
                            </Grid>
                        )
                            : null
                    })
                }
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
                    <Stack direction="row" spacing={3} sx={{ width: "30%" }}>
                        <ButtonComponent
                            handleClick={() => navigate(ROUTES.REQUEST)}
                            buttonColor='error'
                            type='button'
                            sendingRequest={false}
                            buttonText="Back"
                        />
                        <ButtonComponent
                            buttonColor='success'
                            type='submit'
                            sendingRequest={sendingRequest}
                            buttonText={buttonText} />
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default RequestForm