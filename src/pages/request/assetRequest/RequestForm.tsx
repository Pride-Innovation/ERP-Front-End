import {
    Box,
    Button,
    Card,
    CardMedia,
    Grid,
    Stack,
    Paper
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
import PlaceHolder from "../../../statics/images/Placeholder.png";
import { grey } from '@mui/material/colors';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InputFileUpload from '../../../components/forms/FileUpload';
import { useRef } from 'react';
import InventoryTable from '../../../components/forms/InventoryTable';

const RequestForm = ({
    register,
    control,
    formState,
    sendingRequest,
    buttonText,
    setImage,
    setFile,
    image
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
        setFile?.(file);
        setImage(URL.createObjectURL(file));
    };

    return (
        <Paper elevation={1} sx={{ p: 4, boxShadow: "none" }}>
            <Box component="form" autoComplete="off">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={3}>
                            {formFields.map((field, idx) => {
                                const commonProps = {
                                    register,
                                    control,
                                    formState,
                                    value: field.value,
                                    label: field.label,
                                };

                                return (
                                    <Grid item xs={12} md={field.type === 'textarea' ? 12 : 6} key={idx}>
                                        {field.type === 'input' || field.type === 'number' ? (
                                            <UseFormInput {...commonProps} type={field.type} />
                                        ) : field.type === 'textarea' ? (
                                            <UseFormInput {...commonProps} multiline row={4} />
                                        ) : field.type === 'select' ? (
                                            <UseFormSelect {...commonProps} options={field.options} />
                                        ) : field.type === 'date' ? (
                                            <UseFormDatePicker {...commonProps} />
                                        ) : field.type === 'time' ? (
                                            <UseFormTimePicker {...commonProps} />
                                        ) : field.type === 'autocomplete' ? (
                                            <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                                        ) : null}
                                    </Grid>
                                );
                            })}
                        </Grid>
                        <Box sx={{ width: "100%", mt: 3 }}>
                            <InventoryTable />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: grey[100], borderRadius: 1, boxShadow: "none" }}>
                            <CardMedia
                                component="img"
                                image={image || PlaceHolder}
                                alt="Request image"
                                sx={{ objectFit: 'contain' }}
                            />
                            <Box sx={{ p: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                    fullWidth
                                    onClick={handleButtonClick}
                                >
                                    Supporting Document
                                </Button>
                                <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
                            </Box>
                        </Card>
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', width: "100%" }}>
                            <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                <ButtonComponent
                                    handleClick={() => navigate(ROUTES.REQUEST)}
                                    buttonColor="error"
                                    type="button"
                                    sendingRequest={false}
                                    buttonText="Back"
                                    variant='outlined'
                                />
                                <ButtonComponent
                                    buttonColor="success"
                                    type="submit"
                                    sendingRequest={sendingRequest}
                                    buttonText={buttonText}
                                />
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default RequestForm;