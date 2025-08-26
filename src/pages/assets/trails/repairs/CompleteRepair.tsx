import { useState, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Divider,
    Grid,
    IconButton,
    useTheme,
    CircularProgress,
    Alert,
    Fade,
    Chip,
    Tooltip,
    useMediaQuery,
    alpha,
    Card,
    Stack,
    CardContent,
    CardHeader
} from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { IRepairDetails } from '../../interface';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BuildIcon from '@mui/icons-material/Build';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import { toast } from 'react-toastify';
import moment from 'moment';
import dayjs, { Dayjs } from 'dayjs';

// Get file icon based on file type
const getFileTypeInfo = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
        return { label: 'Image', color: '#2196f3' };
    } else if (extension === 'pdf') {
        return { label: 'PDF', color: '#f44336' };
    } else if (['doc', 'docx'].includes(extension)) {
        return { label: 'Word', color: '#1976d2' };
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
        return { label: 'Excel', color: '#2e7d32' };
    } else {
        return { label: 'File', color: '#757575' };
    }
};

// Max file size in MB
const MAX_FILE_SIZE = 5;

interface CompleteRepairProps {
    repair: IRepairDetails;
    handleClose: () => void;
}

const CompleteRepair = ({ repair, handleClose }: CompleteRepairProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [completionDate, setCompletionDate] = useState<Dayjs | null>(null);
    const [completionNotes, setCompletionNotes] = useState<string>('');
    const [files, setFiles] = useState<File[]>([]);
    const [fileErrors, setFileErrors] = useState<string[]>([]);
    const [formErrors, setFormErrors] = useState({
        completionDate: '',
        completionNotes: '',
        files: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    // Validate form before submission
    const validateForm = () => {
        let isValid = true;
        const errors = {
            completionDate: '',
            completionNotes: '',
            files: ''
        };

        if (!completionDate) {
            errors.completionDate = 'Please select a completion date';
            isValid = false;
        } else if (completionDate.isAfter(dayjs())) {
            errors.completionDate = 'Completion date cannot be in the future';
            isValid = false;
        }

        if (!completionNotes.trim()) {
            errors.completionNotes = 'Please provide completion notes';
            isValid = false;
        } else if (completionNotes.trim().length < 10) {
            errors.completionNotes = 'Notes should be at least 10 characters';
            isValid = false;
        }

        if (fileErrors.length > 0) {
            errors.files = 'Please fix file errors before submitting';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;

        const newFiles: File[] = Array.from(event.target.files);
        const newErrors: string[] = [];

        newFiles.forEach((file) => {
            // Check file size (convert to MB)
            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > MAX_FILE_SIZE) {
                newErrors.push(`${file.name} exceeds the ${MAX_FILE_SIZE}MB limit`);
            }
        });

        setFileErrors(newErrors);

        if (newErrors.length === 0) {
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
        } else {
            toast.error('Some files could not be added. Please check the errors.');
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove file
    const handleRemoveFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create form data for upload
            const formData = new FormData();
            formData.append('repairId', repair.id?.toString() || '');
            formData.append('completionDate', completionDate?.toISOString() || '');
            formData.append('completionNotes', completionNotes);

            // Append files
            files.forEach(file => {
                formData.append('files', file);
            });

            // Mock API call with timeout
            // Replace this with your actual API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Form data to submit:', {
                repairId: repair.id,
                completionDate,
                completionNotes,
                files: files.map(f => f.name)
            });

            // Show success feedback
            setSubmissionSuccess(true);
            toast.success('Repair marked as completed successfully!');

            // Reset form after submission
            setTimeout(() => {
                setCompletionDate(null);
                setCompletionNotes('');
                setFiles([]);
                setFileErrors([]);
                setIsSubmitting(false);

                // Close modal after a delay to show success state
                setTimeout(() => {
                    handleClose();
                }, 1000);
            }, 1500);

        } catch (error) {
            console.error('Error submitting repair completion:', error);
            toast.error('Failed to mark repair as completed. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Trigger file input click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            p: { xs: 2, md: 3 },
            maxWidth: '100%',
            overflow: 'hidden'
        }}>
            {/* Header with repair details */}
            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                <CardHeader
                    avatar={
                        <Box sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%'
                        }}>
                            <BuildIcon />
                        </Box>
                    }
                    title={
                        <Typography variant="h6" fontWeight={600} color="primary.main">
                            Complete Repair #{repair.id}
                        </Typography>
                    }
                    sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
                    }}
                />
            </Card>

            {/* Form content */}
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <Fade in={!submissionSuccess}>
                    <Box component="form" sx={{ height: '100%', overflow: 'auto' }}>
                        <Grid container spacing={3}>
                            {/* Left column - Date and Notes */}
                            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        border: `1px solid ${alpha('#000', 0.08)}`,
                                        borderRadius: 2
                                    }}
                                >
                                    <CardHeader
                                        title={
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main, mr: 1 }} />
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    Repair Information
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{
                                            bgcolor: alpha('#f5f5f5', 0.5),
                                            borderBottom: `1px solid ${alpha('#000', 0.08)}`,
                                            py: 1.5
                                        }}
                                    />

                                    <CardContent sx={{ pt: 3 }}>
                                        <Stack spacing={3}>
                                            {/* Completion date picker */}
                                            <Box>
                                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                                    <CalendarTodayIcon fontSize="small" sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Completion Date *
                                                    </Typography>
                                                </Box>

                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        value={completionDate}
                                                        onChange={(newValue) => setCompletionDate(newValue)}
                                                        disableFuture
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                variant: 'outlined',
                                                                error: !!formErrors.completionDate,
                                                                helperText: formErrors.completionDate,
                                                                placeholder: 'Select completion date',
                                                                InputProps: {
                                                                    startAdornment: (
                                                                        <EventAvailableIcon color="action" sx={{ mr: 1 }} />
                                                                    )
                                                                }
                                                            }
                                                        }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 1.5
                                                            }
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            </Box>

                                            {/* Completion notes */}
                                            <Box>
                                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                                    <TextFieldsIcon fontSize="small" sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Completion Notes *
                                                    </Typography>
                                                </Box>

                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={isMediumScreen ? 2 : 4}
                                                    placeholder="Enter details about the completed repair work"
                                                    value={completionNotes}
                                                    onChange={(e) => setCompletionNotes(e.target.value)}
                                                    error={!!formErrors.completionNotes}
                                                    helperText={formErrors.completionNotes}
                                                    variant="outlined"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 1.5
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Right column - File attachments */}
                            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        border: `1px solid ${alpha('#000', 0.08)}`,
                                        borderRadius: 2,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <CardHeader
                                        title={
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <AttachFileIcon fontSize="small" sx={{ color: theme.palette.info.main, mr: 1 }} />
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    Attachments
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                    (Optional)
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{
                                            bgcolor: alpha('#f5f5f5', 0.5),
                                            borderBottom: `1px solid ${alpha('#000', 0.08)}`,
                                            py: 1.5
                                        }}
                                    />

                                    <CardContent sx={{ pt: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                borderRadius: 1.5,
                                                p: 2,
                                                borderStyle: 'dashed',
                                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                    cursor: 'pointer'
                                                },
                                                transition: 'all 0.2s ease',
                                                mb: 2
                                            }}
                                            onClick={handleUploadClick}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    py: 2
                                                }}
                                            >
                                                <UploadFileIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                                <Typography variant="subtitle1" fontWeight={500} align="center">
                                                    Drag & drop files here or click to browse
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" align="center">
                                                    Max. file size: {MAX_FILE_SIZE}MB
                                                </Typography>
                                            </Box>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                multiple
                                                style={{ display: 'none' }}
                                                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                                            />
                                        </Paper>

                                        {/* File errors */}
                                        {fileErrors.length > 0 && (
                                            <Alert severity="error" sx={{ mt: 0, mb: 2, borderRadius: 1.5 }}>
                                                <Typography variant="body2" fontWeight={500}>
                                                    Some files couldn't be added:
                                                </Typography>
                                                <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                                                    {fileErrors.map((error, index) => (
                                                        <li key={index}>
                                                            <Typography variant="body2">{error}</Typography>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Alert>
                                        )}

                                        {/* Selected files list */}
                                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                            {files.length > 0 ? (
                                                <>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            Selected Files ({files.length})
                                                        </Typography>
                                                        {files.length > 1 && (
                                                            <Button
                                                                size="small"
                                                                color="error"
                                                                variant="text"
                                                                onClick={() => setFiles([])}
                                                                sx={{ minWidth: 'auto', p: 0.5 }}
                                                            >
                                                                Clear All
                                                            </Button>
                                                        )}
                                                    </Box>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            borderRadius: 1.5,
                                                            overflow: 'hidden',
                                                            flexGrow: 1,
                                                            display: 'flex',
                                                            flexDirection: 'column'
                                                        }}
                                                    >
                                                        <Box sx={{
                                                            flexGrow: 1,
                                                            overflowY: 'auto',
                                                            maxHeight: isMediumScreen ? '200px' : '260px'
                                                        }}>
                                                            {files.map((file, index) => {
                                                                const fileType = getFileTypeInfo(file.name);
                                                                const fileSize = file.size / 1024 < 1000
                                                                    ? `${Math.round(file.size / 1024)} KB`
                                                                    : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

                                                                return (
                                                                    <Box
                                                                        key={index}
                                                                        sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            p: 1.5,
                                                                            borderBottom: index < files.length - 1 ? `1px solid ${alpha('#000', 0.08)}` : 'none',
                                                                            '&:hover': {
                                                                                bgcolor: alpha(theme.palette.primary.main, 0.04)
                                                                            },
                                                                            transition: 'background-color 0.15s ease'
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                                                            <Chip
                                                                                label={fileType.label}
                                                                                size="small"
                                                                                sx={{
                                                                                    bgcolor: alpha(fileType.color, 0.1),
                                                                                    color: fileType.color,
                                                                                    fontWeight: 500,
                                                                                    mr: 1.5,
                                                                                    minWidth: 50
                                                                                }}
                                                                            />
                                                                            <Box sx={{ overflow: 'hidden' }}>
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    noWrap
                                                                                    fontWeight={500}
                                                                                    sx={{ maxWidth: { xs: '180px', sm: '300px' } }}
                                                                                >
                                                                                    {file.name}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {fileSize}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>

                                                                        <Tooltip title="Remove file">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRemoveFile(index);
                                                                                }}
                                                                                sx={{
                                                                                    color: theme.palette.text.secondary,
                                                                                    '&:hover': {
                                                                                        color: theme.palette.error.main,
                                                                                        bgcolor: alpha(theme.palette.error.main, 0.08)
                                                                                    },
                                                                                    transition: 'all 0.2s ease'
                                                                                }}
                                                                            >
                                                                                <DeleteOutlineIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Box>
                                                                );
                                                            })}
                                                        </Box>
                                                    </Paper>
                                                </>
                                            ) : (
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexGrow: 1,
                                                    mt: 2,
                                                    mb: 3,
                                                    opacity: 0.7
                                                }}>
                                                    <Typography variant="body2" color="text.secondary" align="center">
                                                        No files attached yet.
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" align="center">
                                                        Click above to upload supporting documents.
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Fade>

                {/* Success state */}
                {submissionSuccess && (
                    <Fade in={submissionSuccess}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 5,
                            px: 2,
                            height: '100%'
                        }}>
                            <Box
                                sx={{
                                    bgcolor: alpha(theme.palette.success.main, 0.08),
                                    color: theme.palette.success.main,
                                    p: 2.5,
                                    borderRadius: '50%',
                                    mb: 3,
                                    display: 'flex',
                                    boxShadow: `0 0 0 8px ${alpha(theme.palette.success.main, 0.04)}`
                                }}
                            >
                                <CheckCircleOutlineIcon sx={{ fontSize: 64 }} />
                            </Box>
                            <Typography variant="h5" fontWeight={600} align="center" color="success.main">
                                Repair Completed Successfully
                            </Typography>
                            <Typography variant="body1" align="center" sx={{ mt: 2, mb: 3, maxWidth: '400px' }}>
                                The repair has been marked as completed and all information has been saved.
                            </Typography>
                        </Box>
                    </Fade>
                )}
            </Box>

            {/* Action buttons */}
            <Divider sx={{ mt: 'auto', my: 1.5 }} />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    flexDirection: isMobile ? 'column' : 'row'
                }}
            >
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleClose}
                    startIcon={<CloseIcon />}
                    disabled={isSubmitting}
                    sx={{
                        borderRadius: 1.5,
                        px: 2.5,
                        py: 1,
                        order: isMobile ? 2 : 1,
                        minWidth: isMobile ? '100%' : '120px',
                    }}
                >
                    {submissionSuccess ? 'Close' : 'Cancel'}
                </Button>

                {!submissionSuccess && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        sx={{
                            borderRadius: 1.5,
                            px: 3,
                            py: 1,
                            order: isMobile ? 1 : 2,
                            minWidth: isMobile ? '100%' : '180px',
                            boxShadow: 2
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Submitting...
                            </>
                        ) : (
                            'Complete Repair'
                        )}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default CompleteRepair;