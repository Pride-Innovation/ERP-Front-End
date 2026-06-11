/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Autocomplete,
    TableCell,
    TextField,
    Chip,
    useTheme
} from '@mui/material';
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
    const theme = useTheme();
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

    return (
        <TableCell sx={{ borderBottom: 'none', px: 2, py: 1 }}>
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
                onChange={(_, newValue) => addEngravedNumberListToRow(newValue)}
                filterSelectedOptions
                onInputChange={(_, newInputValue) => setLocalInput(newInputValue)}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="filled"
                            label={option.engravedNumber}
                            {...getTagProps({ index })}
                            sx={{
                                backgroundColor: '#08796C',
                                color: theme.palette.background.paper,
                                fontWeight: 500,
                                borderRadius: 1,
                                fontSize: 12,
                            }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select"
                        variant="standard"
                        InputProps={{
                            ...params.InputProps,
                            disableUnderline: true,
                        }}
                        sx={{
                            backgroundColor: '#08796C20',
                            borderRadius: 2,
                            px: 1.2,
                            py: 0.8,
                            '& .MuiInputBase-input': {
                                color: '#000',
                                fontWeight: 500,
                            },
                            '& input::placeholder': {
                                color: '#08796C',
                                opacity: 1,
                                fontWeight: 500,
                                fontStyle: "italic",
                                fontSize: "14px"
                            },
                        }}
                    />
                )}
            />
        </TableCell>
    );
};

export default FilterEngravedNumbers;
