/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import { toast } from 'react-toastify';

import { PageHero } from '../../../components/layout';
import usePermissions from '../../../core/permissions/usePermissions';
import { PERMISSIONS } from '../../../core/permissions/constants';
import { refusal } from '../../../core/apis/globalService';
import {
    ExportColumnConfig,
    fetchExportColumnConfig,
    resetExportColumnConfig,
    saveExportColumnConfig,
} from '../../../utils/exports/exportColumns';
import { EXPORT_TABLES, ExportTable, defaultColumnKeys } from '../../../utils/exports/exportTables';
import { brand, border, neutral, surface } from '../../../utils/tokens';

/**
 * Decides which columns each table puts into its exported PDF and Excel files.
 *
 * <h2>What this is, plainly</h2>
 * Tidiness. A register running to fifteen columns prints as an unreadable wall, so somebody decides
 * which of them belong in the file and everybody's download follows. **Nothing here hides anything
 * from anybody:** every column stays visible in the table on screen, and the file is still assembled
 * in the browser from rows it already holds. Reading this page as an access control would be the one
 * misreading that matters, because it would put a confidentiality expectation on a control that
 * cannot carry one.
 *
 * <p>Individual users can narrow their own copy further from the export menu, and that choice stays
 * in their browser. This page is the shared default beneath it.
 */
const ExportColumnsSettings = () => {
    const { has } = usePermissions();
    const mayEdit = has(PERMISSIONS.UPDATE_EXPORT_COLUMNS);

    const [config, setConfig] = useState<ExportColumnConfig>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeKey, setActiveKey] = useState<string>(EXPORT_TABLES[0]?.key ?? '');
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const active: ExportTable | undefined = useMemo(
        () => EXPORT_TABLES.find((table) => table.key === activeKey),
        [activeKey],
    );

    useEffect(() => {
        (async () => {
            setLoading(true);
            setConfig(await fetchExportColumnConfig());
            setLoading(false);
        })();
    }, []);

    // Whenever the selected table changes, show what it is actually configured to — falling back to
    // its defaults, which is what an unconfigured table exports.
    useEffect(() => {
        if (!active) return;
        const saved = config[active.key];
        setSelected(new Set(saved && saved.length > 0 ? saved : defaultColumnKeys(active)));
    }, [active, config]);

    const toggle = (key: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const save = async () => {
        if (!active) return;
        setSaving(true);
        try {
            // Registry order, not tick order — the file's reading order is a property of the table,
            // not of the sequence somebody happened to click in.
            const keys = active.columns.map((c) => c.key).filter((key) => selected.has(key));
            await saveExportColumnConfig(active.key, keys);
            setConfig((prev) => ({ ...prev, [active.key]: keys }));
            toast.success(`Export columns saved for ${active.title}.`);
        } catch (error) {
            toast.error(refusal(error, 'Could not save these columns. Please try again.'));
        } finally {
            setSaving(false);
        }
    };

    const reset = async () => {
        if (!active) return;
        setSaving(true);
        try {
            await resetExportColumnConfig(active.key);
            setConfig((prev) => {
                const next = { ...prev };
                delete next[active.key];
                return next;
            });
            setSelected(new Set(defaultColumnKeys(active)));
            toast.success(`${active.title} is back to its default columns.`);
        } catch (error) {
            toast.error(refusal(error, 'Could not reset this table. Please try again.'));
        } finally {
            setSaving(false);
        }
    };

    const grouped = useMemo(() => {
        const byGroup = new Map<string, ExportTable[]>();
        EXPORT_TABLES.forEach((table) => {
            if (!byGroup.has(table.group)) byGroup.set(table.group, []);
            byGroup.get(table.group)?.push(table);
        });
        return Array.from(byGroup.entries());
    }, []);

    return (
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="Export Columns"
                subtitle="Choose which columns each table prints in its PDF and Excel exports"
                icon={<ViewColumnOutlinedIcon />}
            />

            {/*
             * Said once, at the top, because the page's name invites the other reading. Somebody
             * arriving here to "stop branch staff exporting cost" needs to know immediately that
             * this is not that control, rather than discover it later.
             */}
            <Alert severity="info" sx={{ mb: 2.5 }}>
                This changes what goes <strong>into the file</strong> only. Every column stays visible
                in the table on screen for anyone who can open it — use roles and permissions if you
                need to restrict what people can see.
            </Alert>

            {!mayEdit && (
                <Alert severity="warning" sx={{ mb: 2.5 }}>
                    You can see how each table is configured, but changing it needs the
                    “Update export columns” permission.
                </Alert>
            )}

            {loading ? (
                <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={22} /></Stack>
            ) : (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems="flex-start">
                    {/* Tables */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: { xs: '100%', md: 300 }, flexShrink: 0,
                            border: `1px solid ${border.subtle}`, borderRadius: 2, overflow: 'hidden',
                            bgcolor: surface.card,
                        }}
                    >
                        {grouped.map(([group, tables]) => (
                            <Box key={group}>
                                <Box sx={{ px: 2, py: 1, bgcolor: alpha(brand[500], 0.04) }}>
                                    <Typography sx={{
                                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em',
                                        textTransform: 'uppercase', color: neutral[500],
                                    }}>
                                        {group}
                                    </Typography>
                                </Box>
                                <List disablePadding>
                                    {tables.map((table) => (
                                        <ListItemButton
                                            key={table.key}
                                            selected={table.key === activeKey}
                                            onClick={() => setActiveKey(table.key)}
                                            sx={{ py: 1, '&.Mui-selected': { bgcolor: alpha(brand[500], 0.08) } }}
                                        >
                                            <ListItemText
                                                primary={table.title}
                                                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                                            />
                                            {config[table.key] && (
                                                // Says at a glance which tables somebody has curated
                                                // and which are still on their defaults.
                                                <Chip
                                                    size="small"
                                                    label={`${config[table.key].length}`}
                                                    sx={{ height: 19, fontSize: '0.65rem', fontWeight: 700 }}
                                                />
                                            )}
                                        </ListItemButton>
                                    ))}
                                </List>
                                <Divider />
                            </Box>
                        ))}
                    </Paper>

                    {/* Columns */}
                    {active && (
                        <Paper
                            elevation={0}
                            sx={{
                                flex: 1, minWidth: 0, border: `1px solid ${border.subtle}`,
                                borderRadius: 2, overflow: 'hidden', bgcolor: surface.card,
                            }}
                        >
                            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border.subtle}` }}>
                                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                                    {active.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {config[active.key]
                                        ? `${config[active.key].length} of ${active.columns.length} columns exported`
                                        : `Not configured — exporting ${defaultColumnKeys(active).length} default columns`}
                                </Typography>
                            </Box>

                            <Box sx={{ p: 2.5 }}>
                                <Stack>
                                    {active.columns.map((column) => (
                                        <FormControlLabel
                                            key={column.key}
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    disabled={!mayEdit || saving}
                                                    checked={selected.has(column.key)}
                                                    onChange={() => toggle(column.key)}
                                                />
                                            }
                                            label={
                                                <Typography variant="body2">{column.label}</Typography>
                                            }
                                            sx={{ ml: 0, py: 0.15 }}
                                        />
                                    ))}
                                </Stack>

                                {/*
                                 * Refused by the server as well, deliberately — a table configured to
                                 * export nothing produces an empty file, which reads as a broken
                                 * report rather than a setting. Saying so here means the reason
                                 * arrives before the click rather than after it.
                                 */}
                                {selected.size === 0 && (
                                    <Alert severity="warning" sx={{ mt: 2, py: 0.5 }}>
                                        Choose at least one column. To stop exporting a table
                                        altogether, turn its export off on the page itself.
                                    </Alert>
                                )}
                            </Box>

                            {mayEdit && (
                                <>
                                    <Divider />
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        justifyContent="space-between"
                                        sx={{ px: 2.5, py: 1.75 }}
                                    >
                                        <Button
                                            size="small"
                                            onClick={reset}
                                            disabled={saving || !config[active.key]}
                                            sx={{ textTransform: 'none', color: neutral[600] }}
                                        >
                                            Reset to default
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            disableElevation
                                            onClick={save}
                                            disabled={saving || selected.size === 0}
                                            sx={{ textTransform: 'none', borderRadius: '8px' }}
                                        >
                                            {saving ? 'Saving…' : 'Save columns'}
                                        </Button>
                                    </Stack>
                                </>
                            )}
                        </Paper>
                    )}
                </Stack>
            )}
        </Box>
    );
};

export default ExportColumnsSettings;
