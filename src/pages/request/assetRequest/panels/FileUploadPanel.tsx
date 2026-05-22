/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useRef, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    IconButton,
    LinearProgress,
    Typography,
    alpha,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    PictureAsPdf as PdfIcon,
    TextSnippet as WordIcon,
    GridOn as ExcelIcon,
    InsertDriveFile as GenericFileIcon,
    Image as ImageIcon,
} from '@mui/icons-material';
import InputFileUpload from '../../../../components/forms/FileUpload';
import PlaceHolder from '../../../../statics/images/Placeholder.png';
import { brand } from '../../../../utils/tokens';

const PRIMARY_COLOR = brand[500];

type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'other';

const getFileType = (file: File): FileType => {
    const extension = file?.name?.split('.').pop()?.toLowerCase();
    if (!extension) return 'other';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'excel';
    return 'other';
};

interface IFileUploadPanelProps {
    image: string;
    setImage: (image: string) => void;
    file?: File | null;
    setFile?: (file: File | null) => void;
    initialFile?: {
        fileName: string | null;
        fileType: FileType;
        filePath: string | null;
    };
    onRemoveFile?: () => void;
}

const FileUploadPanel = ({
    image,
    setImage,
    file,
    setFile,
    initialFile,
    onRemoveFile,
}: IFileUploadPanelProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    };

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;
        const next = files[0];
        setFile?.(next);
        if (getFileType(next) === 'image') {
            setImage(URL.createObjectURL(next));
        } else {
            setImage('');
        }
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

    const hasFile = Boolean(file || (initialFile?.fileName && image));
    const fileType: FileType | undefined = file ? getFileType(file) : initialFile?.fileType;
    const fileName = file ? file.name : initialFile?.fileName ?? '';

    return (
        <>
            <Card
                sx={{
                    bgcolor: '#FAFBFC',
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: dragActive
                        ? `2px dashed ${PRIMARY_COLOR}`
                        : `1px dashed ${grey[400]}`,
                    transition: 'all 0.2s ease-in-out',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {hasFile && (
                    <Box sx={{ position: 'relative' }}>
                        {fileType === 'image' ? (
                            <CardMedia
                                component="img"
                                image={image || PlaceHolder}
                                alt="Request image"
                                sx={{ objectFit: 'contain', height: 200, bgcolor: grey[100] }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    height: 200,
                                    bgcolor: grey[50],
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 2,
                                    position: 'relative',
                                }}
                            >
                                <DocumentPreview fileType={fileType} fileName={fileName} />
                            </Box>
                        )}
                        <IconButton
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'rgba(255,255,255,0.8)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                            }}
                            onClick={onRemoveFile || removeFile}
                        >
                            <DeleteIcon color="error" />
                        </IconButton>
                    </Box>
                )}

                <CardContent>
                    {hasFile ? (
                        <Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 2,
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'rgba(0,0,0,0.02)',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                }}
                            >
                                <FileTypeIconBadge fileType={fileType} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" fontWeight={600} noWrap>
                                        {file
                                            ? file.name
                                            : (initialFile?.fileName?.length as number) > 20
                                                ? `${initialFile?.fileName?.slice(0, 20)}...`
                                                : initialFile?.fileName || ''}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Document'}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mx: 0.5 }}
                                        >
                                            •
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ textTransform: 'uppercase' }}
                                        >
                                            {file
                                                ? file.name.split('.').pop()
                                                : initialFile?.fileName?.split('.').pop() || ''}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip
                                    label={file ? 'Selected' : 'Uploaded'}
                                    size="small"
                                    sx={{ bgcolor: '#E6F9F4', color: '#00C48C' }}
                                />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={100}
                                sx={{
                                    mb: 2,
                                    borderRadius: 1,
                                    '& .MuiLinearProgress-bar': { bgcolor: PRIMARY_COLOR },
                                }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                fullWidth
                                onClick={handleButtonClick}
                                size="small"
                                sx={{
                                    borderColor: alpha(PRIMARY_COLOR, 0.4),
                                    color: PRIMARY_COLOR,
                                    textTransform: 'none',
                                    '&:hover': {
                                        borderColor: PRIMARY_COLOR,
                                        bgcolor: alpha(PRIMARY_COLOR, 0.04),
                                    },
                                }}
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
                                textAlign: 'center',
                            }}
                        >
                            <CloudUploadIcon sx={{ fontSize: 48, color: grey[400], mb: 2 }} />
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Drag &amp; drop your file here
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
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    bgcolor: PRIMARY_COLOR,
                                    boxShadow: `0 4px 12px ${alpha(PRIMARY_COLOR, 0.3)}`,
                                    '&:hover': {
                                        bgcolor: '#065f54',
                                        transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.2s ease',
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

            <Card
                sx={{
                    mt: 3,
                    borderRadius: 2,
                    bgcolor: 'rgba(8,121,108,0.04)',
                    border: `1px solid rgba(8,121,108,0.15)`,
                }}
            >
                <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#065E54', fontWeight: 600 }}>
                        Tips for Faster Approval
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#08796C', mb: 0.5 }}>
                        • Be specific in your request description
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#08796C', mb: 0.5 }}>
                        • Include accurate quantities needed
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#08796C' }}>
                        • Attach supporting documentation when available
                    </Typography>
                </CardContent>
            </Card>
        </>
    );
};

const DocumentPreview = ({ fileType, fileName }: { fileType?: FileType; fileName: string }) => {
    if (fileType === 'image') return null;

    const previewByType: Record<
        Exclude<FileType, 'image'>,
        { bg: string; border: string; icon: JSX.Element; label: string; labelColor: string }
    > = {
        pdf: {
            bg: '#F8F2F2',
            border: '#E0E0E0',
            icon: <PdfIcon sx={{ color: '#d32f2f', fontSize: 48 }} />,
            label: 'PDF DOCUMENT',
            labelColor: '#D32F2F',
        },
        word: {
            bg: '#F0F4FA',
            border: '#D6E3F3',
            icon: <WordIcon sx={{ color: '#295396', fontSize: 48 }} />,
            label: 'WORD DOCUMENT',
            labelColor: '#295396',
        },
        excel: {
            bg: '#EAF5EC',
            border: '#C5E1C8',
            icon: <ExcelIcon sx={{ color: '#217346', fontSize: 48 }} />,
            label: 'EXCEL DOCUMENT',
            labelColor: '#217346',
        },
        other: {
            bg: '#F5F5F5',
            border: '#E0E0E0',
            icon: <GenericFileIcon sx={{ color: '#757575', fontSize: 48 }} />,
            label: 'DOCUMENT',
            labelColor: '#757575',
        },
    };

    const cfg = previewByType[(fileType ?? 'other') as Exclude<FileType, 'image'>];
    if (!cfg) return null;

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    bgcolor: cfg.bg,
                    p: 2,
                    borderRadius: 1,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '60%',
                    maxWidth: 140,
                    border: `1px solid ${cfg.border}`,
                }}
            >
                <Box sx={{ color: cfg.labelColor, mb: 1 }}>{cfg.icon}</Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: cfg.labelColor }}>
                    {cfg.label}
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
                    textAlign: 'center',
                }}
            >
                {fileName}
            </Typography>
        </Box>
    );
};

const FileTypeIconBadge = ({ fileType }: { fileType?: FileType }) => {
    if (!fileType) return null;
    const config: Record<FileType, { color: string; icon: JSX.Element }> = {
        image: { color: PRIMARY_COLOR, icon: <ImageIcon fontSize="small" /> },
        pdf: { color: '#E44D26', icon: <PdfIcon fontSize="small" /> },
        word: { color: '#295396', icon: <WordIcon fontSize="small" /> },
        excel: { color: '#217346', icon: <ExcelIcon fontSize="small" /> },
        other: { color: grey[600], icon: <GenericFileIcon fontSize="small" /> },
    };
    const cfg = config[fileType];
    return <Box sx={{ color: cfg.color, mr: 1.5 }}>{cfg.icon}</Box>;
};

export default FileUploadPanel;
