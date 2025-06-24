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
import { RowData } from './interface';
import AssetUtills from '../../pages/assets/Utills';
import { useDebounce } from '../../hooks/useDebounce';

const FilterEngravedNumbers = ({ row }: { row: RowData }) => {
    const { fetchAllAssets } = AssetUtills();
    const theme = useTheme();
    const { assetType } = useContext(RequestContext);
    const { assetsEngravedInStore } = useContext(RequestContext);
    const [localInput, setLocalInput] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const debouncedInput = useDebounce(localInput, 500);

    useEffect(() => {
        if (row.groupName.length > 0 && assetType.name.length > 0) {
            const params = {
                assetTypeId: row.assetTypeId,
                assetStatusId: 7, // This should contain the actual IDs for asset status when it is just registered and not assigned to users. 
                commodityId: row.commodityId
            }
            fetchAllAssets(params)
        }

    }, [row]);

    useEffect(() => {
        setInputValue(debouncedInput);
    }, [debouncedInput, setInputValue]);


    useEffect(() => {
        if (row.groupName.length > 0 &&
            assetType.name.length > 0 &&
            inputValue.length > 0
        ) {
            const params = {
                assetTypeId: row.assetTypeId,
                assetStatusId: 7, // This should contain the actual IDs for asset status when it is just registered and not assigned to users. 
                commodityId: row.commodityId,
                engravedNumber: inputValue
            }
            fetchAllAssets(params)
        }
    }, [inputValue]);


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
                onChange={(_, newValue) => console.log(newValue, "Asset value")}
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
