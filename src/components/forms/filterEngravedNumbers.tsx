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
import { useContext, useEffect, useState } from 'react';
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
        assetsEngravedInStore,
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

    useEffect(() => {
        if (row.groupName.length > 0 && assetType.name.length > 0 && issuanceAvailableId) {
            const params = {
                assetTypeId: row.assetTypeId,
                assetStatusId: issuanceAvailableId, // Available for Issuance
                commodityId: row.commodityId
            }
            fetchAllAssets(params)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [row, issuanceAvailableId]);

    useEffect(() => {
        setInputValue(debouncedInput);
    }, [debouncedInput, setInputValue]);


    useEffect(() => {
        if (row.groupName.length > 0 &&
            assetType.name.length > 0 &&
            inputValue.length > 0 &&
            issuanceAvailableId
        ) {
            const params = {
                assetTypeId: row.assetTypeId,
                assetStatusId: issuanceAvailableId, // Available for Issuance
                commodityId: row.commodityId,
                engravedNumber: inputValue
            }
            fetchAllAssets(params)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue]);

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
                options={
                    /**
                     * Filter assets based on the asset type
                     * to display engraved number for that particular asset type.
                     */
                    [...(assetsEngravedInStore
                        .filter(asst => asst.commodity?.id === row.commodityId))]
                }
                getOptionLabel={(option) => option?.engravedNumber || ''}
                value={row.selectedAssets ?? []}
                onChange={(_, newValue) => addEngravedNumberListToRow(newValue)}
                filterSelectedOptions
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
