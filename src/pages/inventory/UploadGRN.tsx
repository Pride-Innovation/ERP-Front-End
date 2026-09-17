/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Alert,
    Avatar,
    Box,
    Button as MuiButton,
    CircularProgress,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    alpha,
    useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InputFileUpload from "../../components/forms/FileUpload";
import { uploadGRNService } from "./service";
import { toast } from "react-toastify";
import { IGRNUploadResponse } from "./interface";

/** Mirrors the server-side whitelist in FileUpload.uploadFileToLocalDirectory. */
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'jfif'];
/** Mirrors spring.servlet.multipart.max-file-size. */
const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT_ATTR = '.pdf,.jpg,.jpeg,.png,.jfif';

const prettySize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const extensionOf = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

/**
 * Attaches the countersigned GRN scan to a GRN record.
 *
 * <p>Validates against the same rules the server enforces (extension whitelist and 2 MB cap) so a
 * wrong file is rejected here with an explanation, rather than after the round trip as an opaque
 * 400. The chosen file is previewed before submitting — a GRN is a signed record, and re-uploading
 * replaces what's stored, so the wrong scan should be caught before it is sent.
 */
const UploadGRN = ({
    id,
    grnNumber,
    onUploaded,
    handleClose,
}: {
    id?: string | number;
    grnNumber?: string;
    onUploaded?: () => void;
    handleClose?: () => void;
}) => {
    const theme = useTheme();
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileUrl, setFileUrl] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);

    // Object URLs are only valid while held; release the previous one whenever it changes.
    useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

    const isPdf = file ? extensionOf(file.name) === 'pdf' : false;

    const acceptFile = (picked: File | undefined | null) => {
        if (!picked) return;

        const ext = extensionOf(picked.name);
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setError(`"${picked.name}" isn't an accepted format. Upload a PDF or an image (${ALLOWED_EXTENSIONS.join(', ')}).`);
            return;
        }
        if (picked.size > MAX_BYTES) {
            setError(`"${picked.name}" is ${prettySize(picked.size)}. The maximum accepted size is 2 MB — try a lower-resolution scan.`);
            return;
        }

        setError("");
        setFile(picked);
        setFileUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(picked);
        });
    };

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    };

    const clearFile = () => {
        setFileUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return ""; });
        setFile(null);
        setError("");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        acceptFile(e.dataTransfer.files?.[0]);
    };

    const handleSubmit = async () => {
        if (!file) {
            setError("Choose the signed GRN document first.");
            return;
        }
        if (id === undefined || id === null || id === '') {
            setError("No GRN is selected to attach this document to. Open the stock's Goods Received Notes tab and upload against a specific GRN.");
            return;
        }

        const payload = new FormData();
        payload.append("file", file);

        setUploading(true);
        try {
            const response = await uploadGRNService(payload, id as string) as IGRNUploadResponse;
            if (response?.status === 201) {
                toast.success("Signed GRN uploaded successfully");
                onUploaded?.();
            } else {
                setError("The upload did not complete. Please try again.");
            }
        } catch (err) {
            console.error("Error uploading file:", err);
            setError("The upload failed. Check your connection and try again.");
        } finally {
            setUploading(false);
        }
    };

    const missingTarget = id === undefined || id === null || id === '';

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* Header */}
            <Box
                sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main, width: 40, height: 40 }}>
                    <CloudUploadOutlinedIcon />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, lineHeight: 1.3 }}>
                        Upload Signed GRN
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {grnNumber
                            ? `Attach the countersigned copy of ${grnNumber}`
                            : 'Attach the countersigned copy of this Goods Received Note'}
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
                {missingTarget ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        No GRN is selected. Open the stock, go to <strong>Goods Received Notes</strong>, and choose
                        <strong> Upload Signed GRN</strong> on the specific note you want to attach a scan to.
                    </Alert>
                ) : (
                    <>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                            Before you upload, make sure that:
                        </Typography>
                        <Box sx={{ ml: 2, pl: 2, mb: 3, borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.5)}` }}>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                • The note has been signed by both the supplier's representative and the receiving storekeeper
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                • Every page of the document is included and legible
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                                • The file is a <strong>PDF or image</strong> (PDF, JPG, PNG, JFIF) and no larger than <strong>2 MB</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                • Uploading again <strong>replaces</strong> the document currently held against this GRN
                            </Typography>
                        </Box>
                    </>
                )}

                {error && (
                    <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Dropzone / selected file */}
                {!file ? (
                    <Box
                        onClick={missingTarget ? undefined : handleButtonClick}
                        onDragOver={(e) => { e.preventDefault(); if (!missingTarget) setDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                        onDrop={missingTarget ? undefined : handleDrop}
                        sx={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            py: 5, px: 2, borderRadius: 2, textAlign: 'center',
                            border: `1px dashed ${dragging ? theme.palette.primary.main : alpha('#000', 0.18)}`,
                            bgcolor: dragging ? alpha(theme.palette.primary.main, 0.04) : alpha('#f5f5f5', 0.5),
                            cursor: missingTarget ? 'not-allowed' : 'pointer',
                            opacity: missingTarget ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <UploadFileOutlinedIcon sx={{ fontSize: 38, color: dragging ? 'primary.main' : alpha('#000', 0.3), mb: 1.25 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Drag and drop the signed GRN here
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, mb: 1.75 }}>
                            or click to browse your files
                        </Typography>
                        <MuiButton
                            variant="outlined"
                            size="small"
                            disabled={missingTarget}
                            startIcon={<CloudUploadOutlinedIcon />}
                            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                        >
                            Choose file
                        </MuiButton>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.75 }}>
                            PDF, JPG, PNG or JFIF · up to 2 MB
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Selected file summary */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2, mb: 2, borderRadius: 2,
                                bgcolor: alpha('#f5f5f5', 0.5), border: `1px solid ${alpha('#000', 0.08)}`,
                                display: 'flex', alignItems: 'center', gap: 2,
                            }}
                        >
                            <Avatar
                                variant="rounded"
                                sx={{
                                    width: 44, height: 44,
                                    bgcolor: alpha(isPdf ? theme.palette.error.main : theme.palette.info.main, 0.1),
                                    color: isPdf ? theme.palette.error.main : theme.palette.info.main,
                                }}
                            >
                                {isPdf ? <PictureAsPdfOutlinedIcon /> : <ImageOutlinedIcon />}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>{file.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {prettySize(file.size)} · ready to upload
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Choose a different file">
                                    <IconButton size="small" onClick={handleButtonClick} disabled={uploading}>
                                        <CloudUploadOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Remove">
                                    <IconButton size="small" color="error" onClick={clearFile} disabled={uploading}>
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Paper>

                        {/* Preview — iframe for PDFs, plain img for scans */}
                        <Box sx={{ height: 340, borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha('#000', 0.1)}`, bgcolor: '#fafafa' }}>
                            {isPdf ? (
                                <iframe src={fileUrl} title="Signed GRN preview" width="100%" height="100%" style={{ border: 'none' }} />
                            ) : (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
                                    <Box component="img" src={fileUrl} alt="Signed GRN preview" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </Box>
                            )}
                        </Box>
                    </>
                )}

                <InputFileUpload
                    inputRef={inputRef}
                    handleFileUpload={(files) => acceptFile(files?.[0])}
                    accept={ACCEPT_ATTR}
                    multiple={false}
                />
            </Box>

            {/* Actions */}
            <Divider />
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end', bgcolor: alpha('#f9f9f9', 0.8) }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <MuiButton
                        onClick={handleClose}
                        color="inherit"
                        type="button"
                        variant="outlined"
                        disabled={uploading}
                        sx={{
                            borderColor: alpha('#000', 0.2), color: 'text.secondary',
                            order: { xs: 2, sm: 1 }, textTransform: 'none',
                            '&:hover': { borderColor: alpha('#000', 0.3), bgcolor: alpha('#000', 0.05) },
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        onClick={handleSubmit}
                        color="primary"
                        type="button"
                        variant="contained"
                        disableElevation
                        disabled={!file || uploading || missingTarget}
                        startIcon={uploading
                            ? <CircularProgress size={16} sx={{ color: 'inherit' }} />
                            : <CloudUploadOutlinedIcon />}
                        sx={{ order: { xs: 1, sm: 2 }, fontWeight: 600, textTransform: 'none', minWidth: { xs: '100%', sm: 150 } }}
                    >
                        {uploading ? 'Uploading…' : 'Upload GRN'}
                    </MuiButton>
                </Stack>
            </Box>
        </Paper>
    );
};

export default UploadGRN;
