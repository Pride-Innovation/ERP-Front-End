import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Button,
    useTheme,
    alpha,
    Chip,
    IconButton,
    Tooltip,
    useMediaQuery,
    Fade,
    CircularProgress,
    Grid
} from '@mui/material';
import {
    Attachment as AttachmentIcon,
    InsertDriveFile as FileIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon,
    Description as DocumentIcon,
    Info as InfoIcon,
    Close as CloseIcon,
    ExpandLess as ExpandLessIcon,
    FullscreenOutlined as FullscreenIcon,
    FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { IRepairDetails } from '../../interface';
import { useState, useEffect } from 'react';

// Helper functions remain the same...
const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
        return <ImageIcon fontSize="small" sx={{ color: '#2196f3' }} />;
    } else if (extension === 'pdf') {
        return <PdfIcon fontSize="small" sx={{ color: '#f44336' }} />;
    } else if (['doc', 'docx'].includes(extension)) {
        return <DocumentIcon fontSize="small" sx={{ color: '#1976d2' }} />;
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
        return <FileIcon fontSize="small" sx={{ color: '#2e7d32' }} />;
    } else {
        return <FileIcon fontSize="small" sx={{ color: '#757575' }} />;
    }
};

const getFileType = (fileName: string): { label: string, color: string } => {
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

const getFileSize = (fileName: string): string => {
    const size = fileName.length * 10 + (fileName.charCodeAt(0) % 100) * 5;
    if (size < 1024) return `${size} KB`;
    return `${(size / 1024).toFixed(1)} MB`;
};

// Check if file is an image
const isImageFile = (fileName: string): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension);
};

// Check if file is a PDF
const isPdfFile = (fileName: string): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return extension === 'pdf';
};

// Updated getFilePath to use statics folder like InventoryDetails component
const getFilePath = (documentPath: string): string => {
    // Extract just the filename from the document path
    const fileName = documentPath.split('/').pop() || '';

    // Return path to file in public statics folder
    return `/statics/${fileName}`;
};

interface AttachmentProps {
    repair: IRepairDetails;
    handleClose?: () => void;
}

const Attachment = ({ repair, handleClose }: AttachmentProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const hasDocuments = repair.documents && repair.documents.length > 0;

    // Auto-select first document when component loads
    useEffect(() => {
        if (hasDocuments && repair.documents?.length > 0 && !selectedFile) {
            setSelectedFile(repair.documents[0]);
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 800); // Simulate loading
        }
    }, [repair.documents, hasDocuments]);

    const handleFilePreview = (documentPath: string) => {
        if (selectedFile === documentPath) return;

        setIsLoading(true);
        setSelectedFile(documentPath);

        // Simulate loading delay
        setTimeout(() => {
            setIsLoading(false);
        }, 800);
    };

    const handleFileDownload = (documentPath: string) => {
        // Get the file path and open it in a new tab/window to allow download
        const filePath = getFilePath(documentPath);
        window.open(filePath, '_blank');
    };

    // Determine file type for the selected file
    const selectedFileType = selectedFile ? getFileType(selectedFile.split('/').pop() || '') : null;
    const selectedIsImage = selectedFile ? isImageFile(selectedFile) : false;
    const selectedIsPdf = selectedFile ? isPdfFile(selectedFile) : false;

    return (
        <Box sx={{
            height: 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 1, sm: 1.5 },
            overflow: 'hidden'
        }}>
            {/* Header section */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                flexWrap: isSmall ? 'wrap' : 'nowrap',
                gap: isSmall ? 1 : 0
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: isSmall ? '100%' : 'auto',
                    justifyContent: isSmall ? 'space-between' : 'flex-start'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                            p: 0.8,
                            borderRadius: '50%',
                            mr: 1.5,
                            display: 'flex'
                        }}>
                            <AttachmentIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                                Repair Documents
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {hasDocuments
                                    ? `${repair.documents?.length} document${repair.documents?.length === 1 ? '' : 's'} attached`
                                    : 'No documents attached'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Mobile close button */}
                    {isSmall && handleClose && (
                        <Tooltip title="Close">
                            <IconButton
                                onClick={handleClose}
                                sx={{
                                    color: theme.palette.text.secondary,
                                    bgcolor: alpha(theme.palette.background.default, 0.8),
                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.error.light, 0.1),
                                        color: theme.palette.error.main
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                                size="small"
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Document count badge and desktop close button */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 1.5,
                    ml: 'auto'
                }}>
                    {hasDocuments && (
                        <Chip
                            label={`${repair.documents?.length} file${repair.documents?.length === 1 ? '' : 's'}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                                fontWeight: 500,
                                borderRadius: 1.5,
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        />
                    )}

                    {!isSmall && handleClose && (
                        <Tooltip title="Close">
                            <IconButton
                                onClick={handleClose}
                                sx={{
                                    color: theme.palette.text.secondary,
                                    bgcolor: alpha(theme.palette.background.default, 0.8),
                                    border: `1px solid ${alpha('#000', 0.08)}`,
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.error.light, 0.1),
                                        color: theme.palette.error.main
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                                size="small"
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Side-by-side document list and viewer layout */}
            {!hasDocuments ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 1.5,
                        border: `1px dashed ${alpha('#000', 0.15)}`,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%'
                    }}
                >
                    <Box sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.08),
                        color: theme.palette.info.main,
                        p: 1.5,
                        borderRadius: '50%',
                        mb: 2,
                        display: 'flex'
                    }}>
                        <InfoIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
                        No Documents Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: '80%' }}>
                        There are no documents attached to this repair record.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2} sx={{ flexGrow: 1, height: 'calc(100% - 60px)' }}>
                    {/* Document list - takes 40% width on desktop, full width on mobile with smaller height */}
                    <Grid item xs={12} md={5} lg={4}
                        sx={{
                            height: isMobile ? 'auto' : '100%',
                            maxHeight: isMobile ? '30%' : '100%',
                            overflow: 'auto'
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                border: `1px solid ${alpha('#000', 0.08)}`,
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <List
                                sx={{
                                    width: '100%',
                                    bgcolor: 'background.paper',
                                    overflow: 'auto',
                                    p: 0,
                                    height: '100%',
                                    '& .MuiListItem-root': {
                                        transition: 'all 0.15s ease'
                                    }
                                }}
                            >
                                {repair.documents.map((document, index) => {
                                    const fileName = document.split('/').pop() || document;
                                    const fileType = getFileType(fileName);
                                    const isSelected = selectedFile === document;

                                    return (
                                        <ListItem
                                            key={index}
                                            sx={{
                                                py: 1.5,
                                                px: { xs: 1.5, sm: 2 },
                                                borderBottom: index < repair.documents.length - 1 ? `1px solid ${alpha('#000', 0.08)}` : 'none',
                                                bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                                '&:hover': {
                                                    bgcolor: isSelected
                                                        ? alpha(theme.palette.primary.main, 0.12)
                                                        : alpha(theme.palette.primary.main, 0.04)
                                                },
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleFilePreview(document)}
                                            secondaryAction={
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    height: '100%',
                                                    pr: { xs: 0.5, sm: 1 }
                                                }}>
                                                    <Tooltip title="Download">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleFileDownload(document);
                                                            }}
                                                            sx={{
                                                                color: theme.palette.text.secondary,
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    color: theme.palette.success.main,
                                                                    bgcolor: alpha(theme.palette.success.main, 0.08),
                                                                }
                                                            }}
                                                        >
                                                            <DownloadIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            }
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: { xs: 32, sm: 40 },
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    height: 32,
                                                    width: 32,
                                                    borderRadius: 1,
                                                    bgcolor: alpha(fileType.color, 0.08),
                                                }}
                                            >
                                                {getFileIcon(fileName)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        flexWrap: 'nowrap'
                                                    }}>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={isSelected ? 600 : 500}
                                                            color={isSelected ? 'primary.main' : 'text.primary'}
                                                            noWrap
                                                            sx={{
                                                                maxWidth: '70%',
                                                                flexGrow: 1
                                                            }}
                                                        >
                                                            {fileName.length > 50
                                                                ? fileName.substring(0, 50) + '...'
                                                                : fileName}
                                                        </Typography>
                                                        <Chip
                                                            label={fileType.label}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                minWidth: 40,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 500,
                                                                color: fileType.color,
                                                                bgcolor: alpha(fileType.color, 0.08),
                                                                display: { xs: 'none', sm: 'flex' }
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mt: 0.5
                                                    }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {getFileSize(fileName)}
                                                        </Typography>
                                                        <Chip
                                                            label={fileType.label}
                                                            size="small"
                                                            sx={{
                                                                height: 16,
                                                                fontSize: '0.6rem',
                                                                fontWeight: 500,
                                                                color: fileType.color,
                                                                bgcolor: alpha(fileType.color, 0.08),
                                                                display: { xs: 'flex', sm: 'none' }
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                                primaryTypographyProps={{
                                                    noWrap: true
                                                }}
                                                sx={{
                                                    m: 0,
                                                    ml: { xs: 1, sm: 2 }
                                                }}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Document viewer - takes 60% width on desktop, full width below */}
                    <Grid item xs={12} md={7} lg={8}
                        sx={{
                            height: isMobile ? '70%' : '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                border: `1px solid ${alpha('#000', 0.08)}`,
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative'
                            }}
                        >
                            {/* Document viewer header */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1.5,
                                borderBottom: `1px solid ${alpha('#000', 0.08)}`,
                                bgcolor: alpha(theme.palette.background.default, 0.4)
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                    {selectedFile && (
                                        <>
                                            <Box sx={{
                                                mr: 1.5,
                                                bgcolor: alpha(selectedFileType?.color || '#757575', 0.08),
                                                color: selectedFileType?.color || '#757575',
                                                p: 0.5,
                                                borderRadius: 1,
                                                display: 'flex'
                                            }}>
                                                {getFileIcon(selectedFile)}
                                            </Box>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={600}
                                                color="text.primary"
                                                sx={{ maxWidth: '80%' }}
                                                noWrap
                                            >
                                                {selectedFile.split('/').pop()}
                                            </Typography>
                                        </>
                                    )}
                                    {!selectedFile && (
                                        <Typography variant="subtitle2" fontWeight={500} color="text.secondary">
                                            Select a document to preview
                                        </Typography>
                                    )}
                                </Box>

                                {selectedFile && (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Open in new window">
                                            <IconButton
                                                size="small"
                                                onClick={() => window.open(getFilePath(selectedFile), '_blank')}
                                                sx={{
                                                    color: theme.palette.primary.main,
                                                    '&:hover': {
                                                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                                                    }
                                                }}
                                            >
                                                <FullscreenIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Download document">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleFileDownload(selectedFile)}
                                                sx={{
                                                    color: theme.palette.success.main,
                                                    '&:hover': {
                                                        bgcolor: alpha(theme.palette.success.main, 0.08)
                                                    }
                                                }}
                                            >
                                                <FileDownloadIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                            </Box>

                            {/* Document viewer content area */}
                            <Box sx={{
                                flexGrow: 1,
                                position: 'relative',
                                bgcolor: alpha('#f5f5f5', 0.7),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {isLoading && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 2,
                                        bgcolor: 'rgba(255,255,255,0.8)'
                                    }}>
                                        <CircularProgress size={40} color="primary" />
                                    </Box>
                                )}

                                {!selectedFile && (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 3
                                    }}>
                                        <Box sx={{
                                            bgcolor: alpha(theme.palette.info.main, 0.08),
                                            color: theme.palette.info.main,
                                            p: 1.5,
                                            borderRadius: '50%',
                                            mb: 2,
                                            display: 'flex'
                                        }}>
                                            <InfoIcon sx={{ fontSize: 28 }} />
                                        </Box>
                                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                            No Document Selected
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="center">
                                            Select a document from the list to preview it here
                                        </Typography>
                                    </Box>
                                )}

                                {/* PDF Viewer - Using the proper statics path */}
                                {selectedFile && selectedIsPdf && !isLoading && (
                                    <Fade in={!isLoading}>
                                        <Box sx={{
                                            width: '100%',
                                            height: '100%',
                                            overflow: 'hidden',
                                            display: 'flex'
                                        }}>
                                            <iframe
                                                src={`${getFilePath(selectedFile)}#toolbar=0&navpanes=0&scrollbar=1`}
                                                title="PDF Preview"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 'none'
                                                }}
                                            />
                                        </Box>
                                    </Fade>
                                )}

                                {/* Image Viewer - Using the proper statics path */}
                                {selectedFile && selectedIsImage && !isLoading && (
                                    <Fade in={!isLoading}>
                                        <Box sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 2
                                        }}>
                                            <Box
                                                component="img"
                                                src={getFilePath(selectedFile)}
                                                alt={selectedFile.split('/').pop() || "Document preview"}
                                                sx={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain',
                                                    borderRadius: 1,
                                                    boxShadow: `0 0 20px ${alpha('#000', 0.08)}`
                                                }}
                                            />
                                        </Box>
                                    </Fade>
                                )}

                                {/* Fallback for other file types */}
                                {selectedFile && !selectedIsImage && !selectedIsPdf && !isLoading && (
                                    <Fade in={!isLoading}>
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 4
                                        }}>
                                            <Box sx={{
                                                bgcolor: alpha(selectedFileType?.color || '#757575', 0.08),
                                                color: selectedFileType?.color || '#757575',
                                                p: 2.5,
                                                borderRadius: '50%',
                                                mb: 2.5,
                                                display: 'flex'
                                            }}>
                                                {getFileIcon(selectedFile.split('/').pop() || '')}
                                            </Box>
                                            <Typography variant="subtitle1" fontWeight={600} gutterBottom align="center">
                                                {selectedFileType?.label} File
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                                                Preview not available for this file type
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                startIcon={<DownloadIcon />}
                                                onClick={() => handleFileDownload(selectedFile)}
                                                size="small"
                                                sx={{ borderRadius: 1.5 }}
                                            >
                                                Download to View
                                            </Button>
                                        </Box>
                                    </Fade>
                                )}
                            </Box>

                            {/* Document info footer */}
                            {selectedFile && (
                                <Box sx={{
                                    p: 1.5,
                                    borderTop: `1px solid ${alpha('#000', 0.08)}`,
                                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Chip
                                            label={selectedFileType?.label}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                fontWeight: 500,
                                                mr: 1.5,
                                                color: selectedFileType?.color,
                                                bgcolor: alpha(selectedFileType?.color || '#757575', 0.08),
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {getFileSize(selectedFile)}
                                        </Typography>
                                    </Box>
                                    <Button
                                        size="small"
                                        startIcon={<DownloadIcon fontSize="small" />}
                                        onClick={() => handleFileDownload(selectedFile)}
                                        sx={{
                                            color: theme.palette.success.main,
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.success.main, 0.08)
                                            }
                                        }}
                                    >
                                        Download
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default Attachment;