import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    Stack,
    Typography,
    Paper,
    useTheme,
    alpha,
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Button
} from "@mui/material";
import ButtonComponent from "../../components/forms/Button";
import { IRepair } from "./interface";
import {
    Assignment as AssetIcon,
    BuildCircle as RepairIcon,
    Fingerprint as FingerprintIcon,
    Engineering as TechnicianIcon,
    CloudUpload as UploadIcon,
    AttachFile as AttachFileIcon,
    InsertDriveFile as FileIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { crudStates } from "../../utils/constants";
import { useState, useRef } from "react";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

const Repair = ({
    handleClose,
    sendingRequest,
    handleClickAction,
    buttonText,
    asset
}: IRepair) => {
    const theme = useTheme();
    const [repairDate, setRepairDate] = useState<Dayjs | null>(null);
    const [repairReason, setRepairReason] = useState("");
    const [technician, setTechnician] = useState("");

    // File upload states
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    };

    // Handle file drag events
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    };

    // Remove file
    const removeFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    // Get appropriate icon based on file type
    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
            return <ImageIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />;
        } else if (extension === 'pdf') {
            return <PdfIcon fontSize="small" sx={{ color: '#d32f2f' }} />;
        } else {
            return <FileIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
        }
    };

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.08),
                    py: 1.5,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <RepairIcon color="info" />
                <Typography variant="subtitle1" fontWeight={600} color="info.main">
                    Asset Repair Request
                </Typography>
            </Box>

            {/* Main Content - Scrollable if needed */}
            <CardContent
                sx={{
                    p: 3,
                    overflow: 'auto',
                    flex: 1,
                    "&:last-child": { pb: 3 } // Override MUI's default padding bottom
                }}
            >
                {/* Asset Information - Top Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.background.default, 0.7),
                        border: `1px solid ${alpha('#000', 0.08)}`,
                        mb: 3
                    }}
                >
                    <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 2 }}>
                        You're requesting repair for the following asset:
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    sx={{
                                        bgcolor: theme.palette.primary.main,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 0.8,
                                        borderRadius: 1,
                                        boxShadow: `0 3px 6px ${alpha(theme.palette.primary.main, 0.25)}`
                                    }}
                                >
                                    <AssetIcon fontSize="small" />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        Asset Name
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                        {asset.assetName}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    sx={{
                                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                                        color: theme.palette.grey[600],
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 0.8,
                                        borderRadius: 1
                                    }}
                                >
                                    <FingerprintIcon fontSize="small" />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        Engraved Number
                                    </Typography>
                                    {asset.engravedNumber ? (
                                        <Typography variant="subtitle1" fontWeight={500} color="text.primary">
                                            {asset.engravedNumber}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" fontStyle="italic" color="text.disabled">
                                            Not specified
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Two Column Layout for Form and Attachments */}
                <Grid container spacing={3}>
                    {/* Repair Details - Left Column */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            height: '100%'
                        }}>
                            <Typography variant="subtitle2" color="text.primary" fontWeight={600} sx={{ mb: 2 }}>
                                Repair Details
                            </Typography>

                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={12}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Repair Date"
                                            value={repairDate}
                                            onChange={(newValue) => setRepairDate(newValue)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    variant: 'outlined',
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 1.5
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item xs={12} sm={12}>
                                    <FormControl fullWidth>
                                        <InputLabel id="technician-select-label">Technician</InputLabel>
                                        <Select
                                            labelId="technician-select-label"
                                            id="technician-select"
                                            value={technician}
                                            label="Technician"
                                            onChange={(e) => setTechnician(e.target.value)}
                                            startAdornment={
                                                <TechnicianIcon color="action" sx={{ ml: 1, mr: 0.5 }} />
                                            }
                                            sx={{
                                                borderRadius: 1.5,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: alpha('#000', 0.23),
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.palette.primary.main,
                                                }
                                            }}
                                        >
                                            <MenuItem value="internal">Internal IT Staff</MenuItem>
                                            <MenuItem value="vendor">Vendor Technician</MenuItem>
                                            <MenuItem value="contractor">External Contractor</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Reason for Repair / Description of Issue"
                                        multiline
                                        rows={4}
                                        value={repairReason}
                                        onChange={(e) => setRepairReason(e.target.value)}
                                        fullWidth
                                        placeholder="Please describe the issue with this asset that needs repair..."
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1.5
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Supporting Documents - Right Column */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <Typography variant="subtitle2" color="text.primary" fontWeight={600} sx={{
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <AttachFileIcon fontSize="small" sx={{ mr: 0.75, color: theme.palette.info.main }} />
                                Supporting Documents
                            </Typography>

                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 1.5,
                                    border: `1px dashed ${isDragging ? theme.palette.info.main : alpha('#000', 0.15)}`,
                                    bgcolor: isDragging ? alpha(theme.palette.info.main, 0.05) : 'transparent',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    p: 0,
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    accept="image/*,.pdf,.doc,.docx"
                                />

                                {files.length === 0 ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            py: 4,
                                            px: 2,
                                            flex: 1
                                        }}
                                    >
                                        <UploadIcon
                                            sx={{
                                                fontSize: 48,
                                                color: isDragging ? theme.palette.info.main : alpha('#000', 0.3),
                                                mb: 2
                                            }}
                                        />
                                        <Typography variant="body1" fontWeight={500} color="text.primary" align="center">
                                            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5, mb: 2 }}>
                                            or click to browse
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            color="info"
                                            size="small"
                                            startIcon={<AttachFileIcon />}
                                            sx={{ borderRadius: 1.5 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                        >
                                            Select Files
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <List dense sx={{ py: 0, flex: 1, overflowY: 'auto' }}>
                                            {files.map((file, index) => (
                                                <ListItem
                                                    key={index}
                                                    sx={{
                                                        py: 1,
                                                        px: 2,
                                                        '&:not(:last-child)': {
                                                            borderBottom: `1px solid ${alpha('#000', 0.08)}`
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                        {getFileIcon(file.name)}
                                                        <ListItemText
                                                            primary={file.name}
                                                            secondary={formatFileSize(file.size)}
                                                            primaryTypographyProps={{
                                                                variant: 'body2',
                                                                fontWeight: 500,
                                                                color: 'text.primary',
                                                                sx: {
                                                                    ml: 1.5,
                                                                    textOverflow: 'ellipsis',
                                                                    overflow: 'hidden',
                                                                    whiteSpace: 'nowrap',
                                                                    maxWidth: '80%'
                                                                }
                                                            }}
                                                            secondaryTypographyProps={{
                                                                variant: 'caption',
                                                                color: 'text.secondary',
                                                                sx: { ml: 1.5 }
                                                            }}
                                                        />
                                                        <IconButton
                                                            edge="end"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeFile(index);
                                                            }}
                                                            sx={{
                                                                ml: 'auto',
                                                                color: theme.palette.grey[500],
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                                    color: theme.palette.error.main
                                                                }
                                                            }}
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </ListItem>
                                            ))}
                                        </List>

                                        <Divider sx={{ my: 0.5 }} />

                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            px: 2,
                                            py: 1.5,
                                            bgcolor: alpha(theme.palette.background.default, 0.4)
                                        }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {files.length} {files.length === 1 ? 'file' : 'files'} selected
                                            </Typography>
                                            <Button
                                                size="small"
                                                variant="text"
                                                color="info"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fileInputRef.current?.click();
                                                }}
                                                startIcon={<AttachFileIcon fontSize="small" />}
                                            >
                                                Add More
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Paper>

                            {files.length > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Supported file types: Images (JPG, PNG), Documents (PDF, DOC)
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Stack direction="row" spacing={2}>
                        <ButtonComponent
                            handleClick={handleClose}
                            buttonColor='info'
                            type='button'
                            variant="outlined"
                            sendingRequest={false}
                            buttonText="Cancel"
                        />
                        <ButtonComponent
                            buttonColor='primary'
                            type='submit'
                            sendingRequest={sendingRequest}
                            handleClick={() => handleClickAction?.(crudStates.delete, asset?.id as string)}
                            buttonText={buttonText}
                        />
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default Repair;