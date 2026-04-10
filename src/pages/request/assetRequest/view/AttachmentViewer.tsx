import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    Button,
    alpha,
    CircularProgress,
} from '@mui/material';
import {
    Close as CloseIcon,
    Description as DocumentIcon,
    PictureAsPdf as PdfIcon,
    InsertDriveFile as FileIcon,
    Image as ImageIcon,
    Download as DownloadIcon,
    OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

interface AttachmentViewerProps {
    open: boolean;
    onClose: () => void;
    filePath?: string | null;
    fileName?: string;
}

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
    open,
    onClose,
    filePath,
    fileName,
}) => {
    // const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'pdf' | 'other'>('other');

    // Function to get file name from path
    const getFileName = (): string => {
        if (fileName) return fileName;

        if (!filePath) return 'Unknown File';
        // eslint-disable-next-line no-useless-escape
        const pathSegments = filePath.split(/[\/\\]/);
        return pathSegments[pathSegments.length - 1];
    };

    // Function to determine file type
    useEffect(() => {
        if (!filePath) {
            setFileType('other');
            return;
        }

        const extension = filePath.split('.').pop()?.toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
            setFileType('image');
        } else if (extension === 'pdf') {
            setFileType('pdf');
        } else {
            setFileType('other');
        }
    }, [filePath]);

    // Extract the public path for the file
    const getPublicFilePath = (): string => {
        if (!filePath) return '';

        // If it's an absolute server path, convert to a relative path for browser
        if (filePath.includes('/public/')) {
            const pathAfterPublic = filePath.split('/public/')[1];
            return `/${pathAfterPublic}`;
        }

        // If it already starts with /statics/ just use as is
        if (filePath.startsWith('/statics/')) {
            return filePath;
        }

        // Try to extract the filename and assume it's in /statics/
        // eslint-disable-next-line no-useless-escape
        const fileName = filePath.split(/[\/\\]/).pop();
        return fileName ? `/statics/${fileName}` : '';
    };

    const displayPath = getPublicFilePath();
    const displayName = getFileName();

    // Handle image load events
    const handleImageLoad = () => {
        setLoading(false);
    };

    const handleImageError = () => {
        setLoading(false);
        setError('Failed to load image. The file may be missing or inaccessible.');
    };

    // Handle PDF load events
    const handlePdfLoad = () => {
        setLoading(false);
    };

    const handlePdfError = () => {
        setLoading(false);
        setError('Failed to load PDF. The file may be missing or inaccessible.');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: 'hidden',
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: alpha(PRIMARY_COLOR, 0.05),
                borderBottom: `1px solid ${alpha('#000', 0.1)}`,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {fileType === 'image' && <ImageIcon sx={{ mr: 1, color: PRIMARY_COLOR }} />}
                    {fileType === 'pdf' && <PdfIcon sx={{ mr: 1, color: '#E44D26' }} />}
                    {fileType === 'other' && <DocumentIcon sx={{ mr: 1, color: SECONDARY_COLOR }} />}
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {displayName}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: 600 }}>
                {!filePath ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            p: 3,
                            textAlign: 'center'
                        }}
                    >
                        <FileIcon sx={{ fontSize: 60, color: alpha('#000', 0.2), mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No attachment available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            This request doesn't have any attached documents
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* File content area */}
                        <Box sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            bgcolor: alpha('#000', 0.03),
                            overflow: 'auto'
                        }}>
                            {loading && (
                                <Box sx={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress size={40} />
                                </Box>
                            )}

                            {error && (
                                <Box
                                    sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        maxWidth: 400,
                                        bgcolor: alpha('#f44336', 0.05),
                                        borderRadius: 2,
                                        border: `1px solid ${alpha('#f44336', 0.1)}`
                                    }}
                                >
                                    <DocumentIcon sx={{ fontSize: 40, color: alpha('#f44336', 0.7), mb: 1 }} />
                                    <Typography variant="body1" color="error" sx={{ mb: 1, fontWeight: 500 }}>
                                        Error Loading Document
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {error}
                                    </Typography>
                                </Box>
                            )}

                            {fileType === 'image' && !error && (
                                <img
                                    src={displayPath}
                                    alt={displayName}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        display: loading ? 'none' : 'block'
                                    }}
                                />
                            )}

                            {fileType === 'pdf' && !error && (
                                <iframe
                                    src={`${displayPath}#toolbar=1&navpanes=1`}
                                    title={displayName}
                                    width="100%"
                                    height="100%"
                                    style={{
                                        border: 'none',
                                        display: loading ? 'none' : 'block'
                                    }}
                                    onLoad={handlePdfLoad}
                                    onError={handlePdfError}
                                />
                            )}

                            {fileType === 'other' && !error && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        p: 4
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 3,
                                            bgcolor: alpha('#f5f5f5', 0.7),
                                            borderRadius: 2,
                                            mb: 3,
                                            width: 120,
                                            height: 140,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            border: '1px solid rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <FileIcon sx={{ fontSize: 60, color: SECONDARY_COLOR, mb: 1 }} />
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                            {displayPath.split('.').pop()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                        {displayName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        This file type cannot be previewed directly in the browser
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="contained"
                                            href={displayPath}
                                            download={displayName}
                                            startIcon={<DownloadIcon />}
                                        >
                                            Download File
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Footer with actions */}
                        <Box
                            sx={{
                                py: 1.5,
                                px: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderTop: `1px solid ${alpha('#000', 0.1)}`,
                                bgcolor: alpha('#f5f5f5', 0.5)
                            }}
                        >
                            <Box>
                                <Typography variant="body2" fontWeight={500}>
                                    {displayName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    File type: {fileType === 'image' ? 'Image' : fileType === 'pdf' ? 'PDF Document' : 'Document'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<OpenInNewIcon />}
                                    href={displayPath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open in New Tab
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<DownloadIcon />}
                                    href={displayPath}
                                    download={displayName}
                                >
                                    Download
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AttachmentViewer;