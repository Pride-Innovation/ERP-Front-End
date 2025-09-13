/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Divider,
    Grid,
    Stack,
    Paper,
    Typography,
    Tooltip,
    useTheme,
    useMediaQuery,
    LinearProgress,
    IconButton
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
import { grey, blue } from '@mui/material/colors';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArticleIcon from '@mui/icons-material/Article';
import InputFileUpload from '../../../components/forms/FileUpload';
import { useRef, useState } from 'react';
import InventoryTable from '../../../components/forms/InventoryTable';
import { PictureAsPdf as PdfIcon, TextSnippet as FileIcon } from '@mui/icons-material';

interface SectionProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    helpText?: string;
    icon?: React.ReactNode;
}

const FormSection = ({ title, subtitle, children, helpText, icon }: SectionProps) => {
    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {icon && <Box sx={{ mr: 1, color: blue[700] }}>{icon}</Box>}
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                    {title}
                </Typography>
                {helpText && (
                    <Tooltip title={helpText} arrow placement="top">
                        <IconButton size="small" sx={{ ml: 0.5 }}>
                            <HelpOutlineIcon fontSize="small" color="action" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            {subtitle && (
                <Typography variant="body2" sx={{ mb: 2, color: grey[600] }}>
                    {subtitle}
                </Typography>
            )}
            {children}
        </Box>
    );
};

const RequestForm = ({
    register,
    control,
    formState,
    sendingRequest,
    buttonText,
    setImage,
    setFile,
    image,
    file,
    hideFileUpload = false
}: IRequestForm & { hideFileUpload?: boolean }) => {
    const { formFields } = RequestUtills();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [dragActive, setDragActive] = useState(false);

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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const removeFile = () => {
        setFile?.(null);
        setImage('');
    };

    // Group form fields by type for better organization
    const basicFields = formFields.filter(f => f.type === 'input' || f.type === 'select' || f.type === 'autocomplete');
    const detailFields = formFields.filter(f => f.type === 'textarea');
    const dateTimeFields = formFields.filter(f => f.type === 'date' || f.type === 'time');

    // File type detection function to add at the top of the component
    const getFileType = (file: File): 'image' | 'pdf' | 'word' | 'excel' | 'other' => {
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!extension) return 'other';

        // Check file type by extension
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
            return 'image';
        } else if (extension === 'pdf') {
            return 'pdf';
        } else if (['doc', 'docx'].includes(extension)) {
            return 'word';
        } else if (['xls', 'xlsx'].includes(extension)) {
            return 'excel';
        }

        return 'other';
    };

    return (
        <Paper
            elevation={1}
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                boxShadow: "none",
                borderRadius: 2,
                bgcolor: '#FFFFFF'
            }}
        >
            <Grid container spacing={4}>
                <Grid item xs={12} md={hideFileUpload ? 12 : 8}>
                    <FormSection
                        title="Basic Information"
                        subtitle="Enter the core details of your request"
                        helpText="Provide essential information to identify and prioritize your request"
                        icon={<ArticleIcon />}
                    >
                        <Grid container spacing={3}>
                            {basicFields.map((field, idx) => {
                                const commonProps = {
                                    register,
                                    control,
                                    formState,
                                    value: field.value,
                                    label: field.label,
                                };

                                return (
                                    <Grid item xs={12} md={6} key={idx}>
                                        {field.type === 'input' || field.type === 'number' ? (
                                            <UseFormInput {...commonProps} type={field.type} />
                                        ) : field.type === 'select' ? (
                                            <UseFormSelect {...commonProps} options={field.options} />
                                        ) : field.type === 'autocomplete' ? (
                                            <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                                        ) : null}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </FormSection>

                    {detailFields.length > 0 && (
                        <FormSection title="Request Details" icon={<DescriptionIcon />}>
                            <Grid container spacing={3}>
                                {detailFields.map((field, idx) => (
                                    <Grid item xs={12} key={`detail-${idx}`}>
                                        <UseFormInput
                                            register={register}
                                            control={control}
                                            formState={formState}
                                            value={field.value}
                                            label={field.label}
                                            multiline
                                            row={4}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </FormSection>
                    )}

                    {dateTimeFields.length > 0 && (
                        <FormSection title="Schedule Information">
                            <Grid container spacing={3}>
                                {dateTimeFields.map((field, idx) => (
                                    <Grid item xs={12} md={6} key={`datetime-${idx}`}>
                                        {field.type === 'date' ? (
                                            <UseFormDatePicker
                                                register={register}
                                                control={control}
                                                formState={formState}
                                                value={field.value}
                                                label={field.label}
                                            />
                                        ) : field.type === 'time' ? (
                                            <UseFormTimePicker
                                                register={register}
                                                control={control}
                                                formState={formState}
                                                value={field.value}
                                                label={field.label}
                                            />
                                        ) : null}
                                    </Grid>
                                ))}
                            </Grid>
                        </FormSection>
                    )}

                    <FormSection
                        title="Request Items"
                        subtitle="Add items you want to request"
                        helpText="Specify the assets you're requesting with accurate quantities"
                    >
                        <Box sx={{ width: "100%" }}>
                            <InventoryTable title='Request Items' />
                        </Box>
                    </FormSection>
                </Grid>

                {!hideFileUpload && (
                    <Grid item xs={12} md={4}>
                        <FormSection
                            title="Supporting Documentation"
                            subtitle="Attach any relevant files to support your request"
                            helpText="Add documents like approvals, specifications, or justifications"
                        >
                            <Card
                                sx={{
                                    bgcolor: '#FAFBFC',
                                    borderRadius: 2,
                                    boxShadow: "none",
                                    border: dragActive ? `2px dashed ${blue[500]}` : `1px dashed ${grey[400]}`,
                                    transition: 'all 0.2s ease-in-out'
                                }}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {file && (
                                    <Box sx={{ position: 'relative' }}>
                                        {getFileType(file) === 'image' ? (
                                            // Image display remains unchanged
                                            <CardMedia
                                                component="img"
                                                image={image || PlaceHolder}
                                                alt="Request image"
                                                sx={{
                                                    objectFit: 'contain',
                                                    height: 200,
                                                    bgcolor: grey[100]
                                                }}
                                            />
                                        ) : (
                                            // New document preview for non-image files
                                            <Box
                                                sx={{
                                                    height: 200,
                                                    bgcolor: grey[50],
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: 2,
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Document type icon */}
                                                {getFileType(file) === 'pdf' && (
                                                    <Box
                                                        component="div"
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                bgcolor: '#F8F2F2',
                                                                p: 2,
                                                                borderRadius: 1,
                                                                boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                width: '60%',
                                                                maxWidth: 140,
                                                                border: '1px solid #E0E0E0'
                                                            }}
                                                        >
                                                            <Box sx={{ color: '#E44D26', mb: 1, fontSize: 40 }}>
                                                                <PdfIcon fontSize="large" sx={{ color: '#d32f2f' }} />
                                                            </Box>
                                                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#D32F2F' }}>
                                                                PDF DOCUMENT
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )}

                                                {getFileType(file) === 'word' && (
                                                    <Box
                                                        component="div"
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                bgcolor: '#F0F4FA',
                                                                p: 2,
                                                                borderRadius: 1,
                                                                boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                width: '60%',
                                                                maxWidth: 140,
                                                                border: '1px solid #D6E3F3'
                                                            }}
                                                        >
                                                            <Box sx={{ color: '#295396', mb: 1, fontSize: 40 }}>
                                                                <FileIcon fontSize="large" sx={{ color: theme.palette.info.main }} />
                                                            </Box>
                                                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#295396' }}>
                                                                WORD DOCUMENT
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )}

                                                {getFileType(file) === 'excel' && (
                                                    <Box
                                                        component="div"
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                bgcolor: '#EAF5EC',
                                                                p: 2,
                                                                borderRadius: 1,
                                                                boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                width: '60%',
                                                                maxWidth: 140,
                                                                border: '1px solid #C5E1C8'
                                                            }}
                                                        >
                                                            <Box sx={{ color: '#217346', mb: 1, fontSize: 40 }}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" fill="currentColor">
                                                                    <path d="M320 464c8.8 0 16-7.2 16-16V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320zM0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z" />
                                                                </svg>
                                                            </Box>
                                                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#217346' }}>
                                                                EXCEL DOCUMENT
                                                            </Typography>
                                                        </Box>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={500}
                                                            sx={{
                                                                mt: 2,
                                                                maxWidth: '90%',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {file.name}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {getFileType(file) === 'other' && (
                                                    <Box
                                                        component="div"
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                bgcolor: '#F5F5F5',
                                                                p: 2,
                                                                borderRadius: 1,
                                                                boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                width: '60%',
                                                                maxWidth: 140,
                                                                border: '1px solid #E0E0E0'
                                                            }}
                                                        >
                                                            <Box sx={{ color: '#757575', mb: 1, fontSize: 40 }}>
                                                                {/* <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" fill="currentColor">
                                                                    <path d="M320 464c8.8 0 16-7.2 16-16V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320zM0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z" />
                                                                </svg> */}
                                                                <PdfIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                                                            </Box>
                                                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#757575' }}>
                                                                DOCUMENT
                                                            </Typography>
                                                        </Box>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={500}
                                                            sx={{
                                                                mt: 2,
                                                                maxWidth: '90%',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {file.name}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        {/* Delete button - unchanged */}
                                        <IconButton
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                bgcolor: 'rgba(255,255,255,0.8)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255,255,255,0.9)',
                                                }
                                            }}
                                            onClick={removeFile}
                                        >
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    </Box>
                                )}

                                <CardContent>
                                    {file ? (
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <DescriptionIcon sx={{ color: blue[700], mr: 1 }} />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="body2" fontWeight={500} noWrap>
                                                        {file.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label="Uploaded"
                                                    size="small"
                                                    sx={{ bgcolor: '#E6F9F4', color: '#00C48C' }}
                                                />
                                            </Box>
                                            <LinearProgress variant="determinate" value={100} sx={{ mb: 2 }} />
                                            <Button
                                                variant="outlined"
                                                startIcon={<CloudUploadIcon />}
                                                fullWidth
                                                onClick={handleButtonClick}
                                                size="small"
                                            >
                                                Change Document
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                py: 3,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <CloudUploadIcon sx={{ fontSize: 48, color: grey[400], mb: 2 }} />
                                            <Typography variant="body1" sx={{ mb: 1 }}>
                                                Drag & drop your file here
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                or
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<CloudUploadIcon />}
                                                onClick={handleButtonClick}
                                                sx={{
                                                    px: 3,
                                                    bgcolor: blue[700],
                                                    '&:hover': { bgcolor: blue[800] }
                                                }}
                                            >
                                                Browse Files
                                            </Button>
                                            <Typography variant="caption" sx={{ mt: 2, color: grey[600] }}>
                                                Supports PDF, DOCX, PNG, JPG (max 5MB)
                                            </Typography>
                                        </Box>
                                    )}
                                    <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
                                </CardContent>
                            </Card>
                        </FormSection>

                        <Card sx={{ mt: 3, borderRadius: 2, bgcolor: blue[50], border: `1px solid ${blue[100]}` }}>
                            <CardContent>
                                <Typography variant="subtitle2" sx={{ mb: 1, color: blue[800] }}>
                                    Tips for Faster Approval
                                </Typography>
                                <Typography variant="body2" sx={{ color: blue[900], mb: 0.5 }}>
                                    • Be specific in your request description
                                </Typography>
                                <Typography variant="body2" sx={{ color: blue[900], mb: 0.5 }}>
                                    • Include accurate quantities needed
                                </Typography>
                                <Typography variant="body2" sx={{ color: blue[900] }}>
                                    • Attach supporting documentation when available
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            <Divider sx={{ mt: 4, mb: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end', width: "100%" }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
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
        </Paper>
    );
};

export default RequestForm;