/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo } from 'react';
import { Box, Chip, alpha } from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Control, Controller, UseFormSetValue, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import AutocompleteComponent from '../../../../components/forms/Autocomplete';
import { IRequest } from '../../interface';
import { PageSection } from '../../../../components/layout';

const PRIMARY = '#08796C';

interface ICategoryAttributesPanelProps {
    control: Control<IRequest>;
    setValue: UseFormSetValue<IRequest>;
}

const CategoryAttributesPanel = ({ control, setValue }: ICategoryAttributesPanelProps) => {
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const categoryOptions = useMemo(
        () => assetTypes.map((at) => ({ value: at.id as number, label: at.name })),
        [assetTypes],
    );

    const selectedCategoryId = useWatch({ control, name: 'assetTypeId' });
    const selectedCategory = useMemo(
        () => assetTypes.find((at) => String(at.id) === String(selectedCategoryId)) ?? null,
        [assetTypes, selectedCategoryId],
    );

    useEffect(() => {
        setValue('attributes', {} as any, { shouldDirty: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategoryId]);

    return (
        <PageSection
            title="Asset Category"
            subtitle="Pick the category your request belongs to — it drives the approval flow."
            icon={<CategoryOutlinedIcon />}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Controller
                    control={control}
                    name="assetTypeId"
                    render={({ field, fieldState }) => (
                        <AutocompleteComponent
                            label="Asset Category"
                            options={categoryOptions}
                            field={{
                                value: field.value ?? null,
                                onChange: (val: any) => field.onChange(val ?? null),
                            }}
                            error={fieldState.error}
                        />
                    )}
                />

                {selectedCategory && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        borderRadius: '8px',
                        bgcolor: alpha(PRIMARY, 0.06),
                        border: `1px solid ${alpha(PRIMARY, 0.15)}`,
                    }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 15, color: PRIMARY }} />
                        <Chip
                            label={selectedCategory.name}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                bgcolor: alpha(PRIMARY, 0.1),
                                color: PRIMARY,
                                border: 'none',
                            }}
                        />
                    </Box>
                )}
            </Box>
        </PageSection>
    );
};

export default CategoryAttributesPanel;
