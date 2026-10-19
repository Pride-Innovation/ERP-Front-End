/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { DragEvent, MutableRefObject, ReactNode, useRef, useState } from 'react';
import { alpha, Box, Button, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { toast } from 'react-toastify';
import { brand, border, neutral } from '../../../utils/tokens';
import { GroupLabel, listSx } from './parts';

/**
 * The Documents card's body: the release note this page can generate, and the signed paperwork
 * people have attached.
 *
 * <h2>Why it looked wrong before</h2>
 * Every upload is stored as `<uuid>_<original name>` (`FileUpload.uploadFileToLocalDirectory`), and
 * the card printed that raw — so each row opened with 37 characters of UUID and was ellipsised before
 * the real name began. Nothing told a PDF from a photo of a signed note, the Release Note action sat
 * in the header beside Upload as though it were one of the attachments' controls, and Upload was
 * offered to everyone although the endpoint needs `CREATE_MOVEMENT` and reach over the movement.
 */

/** What `FileUpload` accepts. Its check is case-sensitive, so the picker offers exactly these. */
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.jfif';
const ALLOWED = ['pdf', 'jpg', 'jpeg', 'png', 'jfif'];

const UUID_PREFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;

/** The stored file name, the name the person uploaded, and what kind of file it is. */
export const describeDocument = (path: string) => {
    const stored = path.split('/').pop() ?? path;
    const name = stored.replace(UUID_PREFIX, '') || stored;
    const ext = (name.split('.').pop() ?? '').toLowerCase();
    const isPdf = ext === 'pdf';
    return { stored, name, ext, isPdf, kind: isPdf ? 'PDF document' : 'Image' };
};

const PDF_RED = '#DC2626';
const IMAGE_BLUE = '#2563EB';

const FileTile = ({ label, color }: { label: string; color: string }) => (
    <Box
        sx={{
            width: 36, height: 40, flexShrink: 0, borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.18)}`,
            color, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.02em',
        }}
    >
        {label}
    </Box>
);

/** One document: a tile saying what it is, its name, a muted line about it, and one action. */
const DocRow = ({ tile, name, meta, trailing, href }: {
    tile: ReactNode; name: string; meta: string; trailing: ReactNode; href?: string;
}) => (
    <Stack
        direction="row" alignItems="center" spacing={1.5}
        {...(href ? { component: 'a', href, target: '_blank', rel: 'noopener noreferrer' } : {})}
        sx={{
            px: 1.5, py: 1.25, textDecoration: 'none', color: 'inherit',
            transition: 'background-color .12s',
            ...(href && { '&:hover': { bgcolor: neutral[50] }, '&:hover .doc-open': { color: brand[600] } }),
        }}
    >
        {tile}
        <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap title={name} sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[800], lineHeight: 1.4 }}>
                {name}
            </Typography>
            <Typography noWrap sx={{ fontSize: '0.8rem', color: neutral[500], lineHeight: 1.4 }}>{meta}</Typography>
        </Box>
        {trailing}
    </Stack>
);

export interface IMovementDocumentsProps {
    documents: string[];
    /** Whether the viewer may attach — the endpoint's permission and the movement's scope. */
    canUpload: boolean;
    /** Resolves once the upload has finished, successfully or not. */
    onUpload: (file: File) => Promise<void>;
    onReleaseNote: () => void;
    /** Owned by the page, so the card header's Upload button opens the same picker. */
    inputRef: MutableRefObject<HTMLInputElement | null>;
    /** The file name being uploaded, or null. Owned by the page for the same reason. */
    uploading: string | null;
    setUploading: (name: string | null) => void;
}

/** Header action for the card — the one control the card's header carries. */
export const UploadDocumentButton = ({ onClick, uploading }: { onClick: () => void; uploading: boolean }) => (
    <Button
        size="small" variant="outlined" disabled={uploading} onClick={onClick}
        startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 16 }} />}
        sx={{
            borderRadius: '8px', fontWeight: 600, color: neutral[700], borderColor: border.default,
            borderWidth: '1px !important', bgcolor: '#fff',
            '&:hover': { borderColor: neutral[300], bgcolor: neutral[50] },
        }}
    >
        {uploading ? 'Uploading…' : 'Upload'}
    </Button>
);

/**
 * The body of the Documents card. Owns the hidden file input so the header button, the drop area
 * and the drag-and-drop all lead to one upload path.
 */
const MovementDocuments = ({
    documents, canUpload, onUpload, onReleaseNote, inputRef, uploading, setUploading,
}: IMovementDocumentsProps) => {
    const [dragging, setDragging] = useState(false);
    const dragDepth = useRef(0);

    const send = async (file?: File | null) => {
        if (!file || uploading) return;
        const ext = (file.name.split('.').pop() ?? '').toLowerCase();
        if (!ALLOWED.includes(ext)) {
            // Refused here rather than after the upload: the server would say the same thing, later.
            toast.error('Only PDF, JPG or PNG files can be attached.');
            return;
        }
        setUploading(file.name);
        try {
            await onUpload(file);
        } finally {
            setUploading(null);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const dropHandlers = canUpload ? {
        onDragEnter: (e: DragEvent) => { e.preventDefault(); dragDepth.current += 1; setDragging(true); },
        onDragOver: (e: DragEvent) => e.preventDefault(),
        onDragLeave: () => { dragDepth.current -= 1; if (dragDepth.current <= 0) setDragging(false); },
        onDrop: (e: DragEvent) => {
            e.preventDefault(); dragDepth.current = 0; setDragging(false);
            send(e.dataTransfer.files?.[0]);
        },
    } : {};

    const attached = documents.map(describeDocument);

    return (
        <Stack spacing={2.5} {...dropHandlers}>

            <Box>
                {/* Inside a group rather than the Stack, which would space it like a visible child. */}
                <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={(e) => send(e.target.files?.[0])} />
                <GroupLabel>Release note</GroupLabel>
                <Box sx={listSx}>
                    <DocRow
                        tile={<FileTile label="PDF" color={brand[600]} />}
                        name="Release note"
                        meta="Generated from this movement · print for signing"
                        trailing={(
                            <Button
                                size="small" onClick={onReleaseNote}
                                startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                                sx={{ borderRadius: '6px', fontWeight: 600, color: brand[600], flexShrink: 0 }}
                            >
                                Download
                            </Button>
                        )}
                    />
                </Box>
            </Box>

            <Box>
                <GroupLabel count={attached.length || undefined}>Signed documents</GroupLabel>

                {(attached.length > 0 || uploading) && (
                    <Box sx={{ ...listSx, ...(dragging && { borderColor: brand[500], boxShadow: `0 0 0 3px ${alpha(brand[500], 0.12)}` }) }}>
                        {attached.map((doc, i) => (
                            <DocRow
                                key={`${doc.stored}-${i}`}
                                href={`/statics/${encodeURIComponent(doc.stored)}`}
                                tile={<FileTile label={doc.isPdf ? 'PDF' : 'IMG'} color={doc.isPdf ? PDF_RED : IMAGE_BLUE} />}
                                name={doc.name}
                                meta={doc.kind}
                                trailing={(
                                    <Tooltip title="Open in a new tab" arrow>
                                        <OpenInNewIcon className="doc-open" sx={{ fontSize: 16, color: neutral[400], flexShrink: 0, mr: 0.5 }} />
                                    </Tooltip>
                                )}
                            />
                        ))}
                        {uploading && (
                            <Box sx={{ px: 1.5, py: 1.25 }}>
                                <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[700], mb: 0.75 }}>
                                    Uploading {uploading}…
                                </Typography>
                                <LinearProgress sx={{ height: 4 }} />
                            </Box>
                        )}
                    </Box>
                )}

                {attached.length === 0 && !uploading && (canUpload ? (
                    <Box
                        role="button"
                        tabIndex={0}
                        onClick={() => inputRef.current?.click()}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
                        sx={{
                            border: `1.5px dashed ${dragging ? brand[500] : neutral[300]}`,
                            bgcolor: dragging ? alpha(brand[500], 0.04) : neutral[50],
                            borderRadius: '8px', px: 2, py: 2.5, textAlign: 'center', cursor: 'pointer',
                            transition: 'border-color .12s, background-color .12s',
                            '&:hover, &:focus-visible': { borderColor: brand[500], bgcolor: alpha(brand[500], 0.03), outline: 'none' },
                        }}
                    >
                        <UploadFileOutlinedIcon sx={{ fontSize: 22, color: dragging ? brand[500] : neutral[400], mb: 0.5 }} />
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[700] }}>
                            Drop the signed note here, or{' '}
                            <Box component="span" sx={{ color: brand[600] }}>browse</Box>
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: neutral[500], mt: 0.25 }}>PDF, JPG or PNG</Typography>
                    </Box>
                ) : (
                    <Typography sx={{ fontSize: '0.875rem', color: neutral[500] }}>
                        No signed documents have been attached yet.
                    </Typography>
                ))}
            </Box>
        </Stack>
    );
};

export default MovementDocuments;
