/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';

import {
    clearViewerChoice,
    loadExportColumnConfig,
    readViewerChoice,
    resolveExportColumns,
    writeViewerChoice,
} from '../../utils/exports/exportColumns';
import { findExportTable } from '../../utils/exports/exportTables';
import { brand, border, neutral } from '../../utils/tokens';

interface Props {
    tableKey: string;
    open: boolean;
    onClose: () => void;
}

/**
 * Lets the person exporting choose which columns land in *their* copy of the file.
 *
 * <h2>What this is not</h2>
 * It is not the shared configuration. That is set in Settings by whoever holds
 * `UPDATE_EXPORT_COLUMNS`, and it decides which columns are on offer here at all. This dialog only
 * narrows further, for this person, on this browser — so one reader trimming a report cannot change
 * what the rest of the bank prints.
 *
 * <p>Nothing here hides anything: every column is still on screen in the table behind it, and the
 * file is still built in the browser from rows it already holds. This is about what is worth
 * printing, not about what anyone may see.
 */
const ExportColumnsDialog = ({ tableKey, open, onClose }: Props) => {
    const table = findExportTable(tableKey);
    const [available, setAvailable] = useState<string[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !table) return;
        let cancelled = false;

        (async () => {
            setLoading(true);
            const config = await loadExportColumnConfig();
            if (cancelled) return;

            // What the configuration allows, before this viewer's own narrowing — that is the set
            // the checkboxes are drawn from.
            const allowed = resolveExportColumns(tableKey, config, null) ?? [];
            const choice = readViewerChoice(tableKey);

            setAvailable(allowed);
            setSelected(new Set(choice ? allowed.filter((key) => choice.includes(key)) : allowed));
            setLoading(false);
        })();

        return () => { cancelled = true; };
    }, [open, tableKey, table]);

    if (!table) return null;

    const labelFor = (key: string) =>
        table.columns.find((column) => column.key === key)?.label ?? key;

    const toggle = (key: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const save = () => {
        // Everything ticked is the same as no preference at all, and storing it would freeze this
        // viewer's file against a later change to the shared configuration.
        if (selected.size === available.length) clearViewerChoice(tableKey);
        else writeViewerChoice(tableKey, available.filter((key) => selected.has(key)));
        onClose();
    };

    const reset = () => {
        clearViewerChoice(tableKey);
        setSelected(new Set(available));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ pb: 1.5 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{
                        width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                        bgcolor: alpha(brand[500], 0.1), color: brand[600],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ViewColumnOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                            Columns to export
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {table.title}
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Applies to your PDF and Excel downloads from this table. The table on screen is
                    unchanged, and this does not affect anybody else.
                </Typography>

                {loading ? (
                    <Typography variant="body2" color="text.secondary">Loading columns…</Typography>
                ) : (
                    <>
                        <Stack sx={{ maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
                            {available.map((key) => (
                                <FormControlLabel
                                    key={key}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={selected.has(key)}
                                            onChange={() => toggle(key)}
                                        />
                                    }
                                    label={<Typography variant="body2">{labelFor(key)}</Typography>}
                                    sx={{ ml: 0, py: 0.15 }}
                                />
                            ))}
                        </Stack>

                        {/*
                         * Untick everything and the file would have no columns, which reads as a
                         * broken export rather than a choice. Said here rather than enforced
                         * silently, so the reason is visible at the moment it matters.
                         */}
                        {selected.size === 0 && (
                            <Alert severity="warning" sx={{ mt: 1.5, py: 0.5 }}>
                                Choose at least one column — an export with none produces an empty file.
                            </Alert>
                        )}
                    </>
                )}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 2.5, py: 1.5, justifyContent: 'space-between' }}>
                <Button size="small" onClick={reset} sx={{ textTransform: 'none', color: neutral[600] }}>
                    Reset to default
                </Button>
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        onClick={onClose}
                        sx={{ textTransform: 'none', color: neutral[600] }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        onClick={save}
                        disabled={loading || selected.size === 0}
                        sx={{ textTransform: 'none', borderRadius: '8px', border: `1px solid ${border.subtle}` }}
                    >
                        Save
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ExportColumnsDialog;
