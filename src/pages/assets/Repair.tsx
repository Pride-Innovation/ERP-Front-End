/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Card,
    CardContent,
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
import LaptopIcon from '@mui/icons-material/Laptop';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SettingsIcon from '@mui/icons-material/Settings';

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

    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    };

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

    const removeFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

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
                height: '100%',
                maxHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box
                sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.08),
                    py: 1.25,
                    px: 2.5,
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

            <CardContent sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                height: '100%',
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.background.default, 0.7),
                                border: `1px solid ${alpha('#000', 0.08)}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <AssetIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                    Asset Information
                                </Typography>
                            </Box>

                            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                                <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                bgcolor: theme.palette.primary.main,
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 0.7,
                                                borderRadius: 1,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                            }}
                                        >
                                            <LaptopIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                Asset Name
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                {asset.assetName}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                bgcolor: alpha(theme.palette.grey[500], 0.1),
                                                color: theme.palette.grey[600],
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 0.7,
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
                                                <Typography variant="body2" fontWeight={500} color="text.primary">
                                                    {asset.engravedNumber}
                                                </Typography>
                                            ) : (
                                                <Typography variant="caption" fontStyle="italic" color="text.disabled">
                                                    Not specified
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {asset.branch && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                                    color: theme.palette.info.main,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: 0.7,
                                                    borderRadius: 1
                                                }}
                                            >
                                                <LocationOnIcon fontSize="small" />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    Current Location
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} color="text.primary">
                                                    {asset.branch.name}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {asset.make && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                                    color: theme.palette.success.main,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: 0.7,
                                                    borderRadius: 1
                                                }}
                                            >
                                                <SettingsIcon fontSize="small" />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    Make/Model
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} color="text.primary">
                                                    {asset.make}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                height: '100%',
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.background.default, 0.7),
                                border: `1px solid ${alpha('#000', 0.08)}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <RepairIcon color="info" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                    Repair Information
                                </Typography>
                            </Box>

                            <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Repair Date"
                                        value={repairDate}
                                        onChange={(newValue) => setRepairDate(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
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

                                <FormControl fullWidth size="small">
                                    <InputLabel id="technician-select-label">Technician</InputLabel>
                                    <Select
                                        labelId="technician-select-label"
                                        id="technician-select"
                                        value={technician}
                                        label="Technician"
                                        onChange={(e) => setTechnician(e.target.value)}
                                        startAdornment={
                                            <TechnicianIcon color="action" sx={{ ml: 1, mr: 0.5 }} fontSize="small" />
                                        }
                                        sx={{
                                            borderRadius: 1.5,
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

                                <TextField
                                    label="Reason for Repair"
                                    multiline
                                    rows={6}
                                    value={repairReason}
                                    onChange={(e) => setRepairReason(e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="Please describe the issue with this asset that needs repair..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1.5
                                        },
                                        flexGrow: 1
                                    }}
                                />
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                height: '100%',
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.info.main, 0.05),
                                border: `1px solid ${alpha('#000', 0.08)}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <AttachFileIcon color="info" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                    Supporting Documents
                                </Typography>
                            </Box>

                            <Box sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 1.5,
                                border: `1px dashed ${isDragging ? theme.palette.info.main : alpha('#000', 0.15)}`,
                                bgcolor: isDragging ? alpha(theme.palette.info.main, 0.05) : 'transparent',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                overflow: 'hidden'
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
                                            p: 2,
                                            flexGrow: 1
                                        }}
                                    >
                                        <UploadIcon
                                            sx={{
                                                fontSize: 32,
                                                color: isDragging ? theme.palette.info.main : alpha('#000', 0.3),
                                                mb: 1.5
                                            }}
                                        />
                                        <Typography variant="body2" fontWeight={500} color="text.primary" align="center">
                                            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 0.5, mb: 1.5 }}>
                                            or click to browse
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            color="info"
                                            size="small"
                                            startIcon={<AttachFileIcon />}
                                            sx={{ borderRadius: 1.5 }}
                                        >
                                            Select Files
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <List dense sx={{ py: 0, flexGrow: 1, overflow: 'auto' }}>
                                            {files.map((file, index) => (
                                                <ListItem
                                                    key={index}
                                                    sx={{
                                                        py: 0.5,
                                                        px: 1.5,
                                                        '&:not(:last-child)': {
                                                            borderBottom: `1px solid ${alpha('#000', 0.06)}`
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                        {getFileIcon(file.name)}
                                                        <ListItemText
                                                            primary={file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                                                            secondary={formatFileSize(file.size)}
                                                            primaryTypographyProps={{
                                                                variant: 'body2',
                                                                fontWeight: 500,
                                                                color: 'text.primary',
                                                                sx: { ml: 1.5 }
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
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            px: 1.5,
                                            py: 0.75,
                                            borderTop: `1px solid ${alpha('#000', 0.06)}`,
                                            bgcolor: alpha(theme.palette.background.paper, 0.5)
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
                            </Box>

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Supported: Images (JPG, PNG), Documents (PDF, DOC)
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                    <Stack direction="row" spacing={1.5}>
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