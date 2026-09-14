/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    alpha,
    Autocomplete,
    Box,
    Chip,
    Stack,
    TableCell,
    TextField,
    Typography,
} from '@mui/material';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import { DropdownPopper, DropdownPaper } from './modalChrome';
import { dataBodyCellSx } from '../tables/dataTableSx';
import { brand, neutral, border, status as statusTokens } from '../../utils/tokens';
import { RequestContext } from '../../context/request/RequestContext';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RowData } from './interface';
import AssetUtills from '../../pages/assets/Utills';
import StatusUtills from '../../pages/settings/statuses/Utills';
import { useDebounce } from '../../hooks/useDebounce';
import { IAsset } from '../../pages/assets/interface';
import { RootState } from '../../store';
import { statusIdByCode } from '../../utils/helpers';

const FilterEngravedNumbers = ({ row }: { row: RowData }) => {
    const { fetchAllAssets } = AssetUtills();
    const {
        assetType,
        issuableAssets,
        rows,
        setRows
    } = useContext(RequestContext);

    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const { fetchAllStatuses } = StatusUtills();
    useEffect(() => {
        if (!statuses.length) fetchAllStatuses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Assets are issuable only once completed → status "Available for Issuance".
    const issuanceAvailableId = statusIdByCode(statuses, 'issuanceAvailable');

    const [localInput, setLocalInput] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const debouncedInput = useDebounce(localInput, 500);

    const { assetTypeId, commodityId, groupName } = row;
    const canLoad = groupName.length > 0 && assetType.name.length > 0 && Boolean(issuanceAvailableId);

    /** The one query this picker makes; `engravedNumber` narrows it to a server-side search. */
    const loadIssuable = useCallback((engravedNumber?: string) => {
        if (!canLoad) return;
        fetchAllAssets({
            assetTypeId,
            assetStatusId: issuanceAvailableId, // Available for Issuance
            commodityId,
            ...(engravedNumber ? { engravedNumber } : {}),
        });
        // `fetchAllAssets` comes from a hook and is a new function every render, so it cannot be a
        // dependency without making this one too.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canLoad, assetTypeId, commodityId, issuanceAvailableId]);

    /*
     * Keyed on the values the query is built from — not on `row`.
     *
     * `row` is a fresh object whenever `setRows` runs, and picking an engraved number calls
     * `setRows`. So this effect refired on every selection, refetched, and handed the Autocomplete a
     * brand-new object for the asset that had just been chosen — which, under reference equality,
     * `filterSelectedOptions` could no longer recognise as selected. **Choosing an item put it
     * straight back in the list.** The identity rule below closes the other half of that loop.
     */
    useEffect(() => {
        loadIssuable();
    }, [loadIssuable]);

    useEffect(() => {
        setInputValue(debouncedInput);
    }, [debouncedInput, setInputValue]);

    useEffect(() => {
        if (inputValue.length > 0) loadIssuable(inputValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue]);

    /**
     * Engraved numbers already spoken for on *other* lines of this issuance.
     *
     * <p>`filterSelectedOptions` only hides what this picker itself holds, so two lines of the same
     * commodity each offered the whole pool and the same asset could be picked on both. It was
     * caught — `validateAssetsOfItems` de-dupes across rows and the server refuses repeats within
     * one payload — but only at submit, which is the wrong end: the issuer had already built the
     * whole issuance around a choice that was never available.
     */
    const takenOnOtherRows = useMemo(() => {
        const ids = new Set<number>();
        rows.forEach(other => {
            if (other.id === row.id) return;
            other.selectedAssets?.forEach(asset => {
                if (asset?.id != null) ids.add(asset.id as number);
            });
        });
        return ids;
    }, [rows, row.id]);

    /*
     * The bucket is already this commodity's, so no client-side commodity filter is needed — that
     * check existed only because every picker shared one flat pool.
     */
    const options = useMemo(
        () => (issuableAssets[commodityId as number] ?? [])
            .filter(asset => !takenOnOtherRows.has(asset.id as number)),
        [issuableAssets, commodityId, takenOnOtherRows],
    );

    const addEngravedNumberListToRow = (list: IAsset[]) => {
        const currentRow = rows.find(rw => rw.id === row.id) as RowData;

        setRows((prev) => {
            return prev.map(ele => ele.id === currentRow.id ? ({
                ...ele,
                selectedAssets: list
            }) : ele)
        })
    }

    const selected = row.selectedAssets?.length ?? 0;
    const required = row.quantity ?? 0;
    /** Picking is a count-matching job, so the field reports progress against the line's quantity. */
    const complete = required > 0 && selected === required;
    const over = selected > required;
    const progressTone = over ? statusTokens.danger.main
        : complete ? statusTokens.success.strong
            : neutral[500];

    return (
        // dataBodyCellSx, like every other cell. This carried `borderBottom: 'none'`, which punched a
        // gap in each row's rule and made the column look detached from the table it sits in.
        <TableCell sx={{ ...dataBodyCellSx, px: { xs: 1, sm: 1.5 }, minWidth: 240 }}>
            <Autocomplete
                multiple
                id="engraved-numbers"
                size="small"
                options={options}
                getOptionLabel={(option) => option?.engravedNumber || ''}
                value={row.selectedAssets ?? []}
                onChange={(_, newValue) => addEngravedNumberListToRow(newValue)}
                filterSelectedOptions
                /*
                 * Without this, MUI compares options to the selected value by **reference**, and the
                 * option objects are replaced wholesale every time the pool is refetched. A picked
                 * asset then no longer matched its own entry in the list, so `filterSelectedOptions`
                 * stopped hiding it and it reappeared in the dropdown — and MUI logged "The value
                 * provided to Autocomplete is invalid" for the same reason.
                 */
                isOptionEqualToValue={(option, value) => option.id === value.id}
                /*
                 * Availability is re-read at the moment of choosing, rather than trusted from
                 * whenever the page happened to load. Somebody else can issue an asset while this
                 * form sits open, and the server will refuse it; asking again on open is what keeps
                 * the list from promising something that has since gone.
                 */
                onOpen={() => loadIssuable()}
                onInputChange={(_, newInputValue) => setLocalInput(newInputValue)}
                PopperComponent={DropdownPopper}
                PaperComponent={DropdownPaper}
                noOptionsText="No available assets for this item"
                // Engraved numbers are codes, not words — monospace makes a mistyped character
                // visible and keeps a column of them aligned.
                renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <QrCode2OutlinedIcon sx={{ fontSize: 14, color: neutral[400] }} />
                            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>
                                {option.engravedNumber}
                            </Typography>
                        </Stack>
                    </li>
                )}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            size="small"
                            label={option.engravedNumber}
                            {...getTagProps({ index })}
                            sx={{
                                height: 22,
                                borderRadius: '6px',
                                fontFamily: 'monospace',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                bgcolor: alpha(brand[500], 0.1),
                                color: brand[700],
                                border: `1px solid ${alpha(brand[500], 0.22)}`,
                                '& .MuiChip-deleteIcon': {
                                    fontSize: 14,
                                    color: alpha(brand[700], 0.5),
                                    '&:hover': { color: brand[700] },
                                },
                            }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={selected === 0 ? 'Pick engraved numbers…' : ''}
                        // Outlined, at the same 7px radius as the selects beside it. It was a
                        // borderless `standard` input floating in a solid teal block with a ~20px
                        // radius, which is why it read as belonging to a different form.
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '7px',
                                bgcolor: '#fff',
                                py: '3px !important',
                                alignItems: 'flex-start',
                                gap: 0.3,
                            },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: border.default },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(brand[500], 0.5) },
                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: brand[500],
                                borderWidth: 1.5,
                            },
                            '& input': { fontSize: '0.8rem', fontFamily: 'monospace' },
                            '& input::placeholder': {
                                color: neutral[400],
                                opacity: 1,
                                fontFamily: 'inherit',
                                fontSize: '0.78rem',
                            },
                        }}
                    />
                )}
            />

            {/*
             * Progress against the line's quantity. The submit gate already requires these to match,
             * so stating the count here turns a silent validation failure into something the issuer
             * can see while picking.
             */}
            {required > 0 && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.6, pl: 0.25 }}>
                    <Box sx={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        bgcolor: progressTone,
                        transition: 'background-color .2s ease',
                    }}
                    />
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: progressTone }}>
                        {selected} of {required} picked{over ? ' — too many' : ''}
                    </Typography>
                </Stack>
            )}
        </TableCell>
    );
};

export default FilterEngravedNumbers;
