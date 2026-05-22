/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo } from 'react';
import { Alert, Box, Grid } from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import { Control, Controller, UseFormSetValue, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import AutocompleteComponent from '../../../../components/forms/Autocomplete';
import DynamicAttributesForm from '../../../../components/forms/DynamicAttributesForm';
import AssetTypeUtills from '../../../settings/assetTypes/utills';
import { IRequest } from '../../interface';
import { PageSection } from '../../../../components/layout';

interface ICategoryAttributesPanelProps {
    control: Control<IRequest>;
    setValue: UseFormSetValue<IRequest>;
}

const CategoryAttributesPanel = ({ control, setValue }: ICategoryAttributesPanelProps) => {
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { fetchAllAssetTypes } = AssetTypeUtills();

    useEffect(() => {
        if (assetTypes.length === 0) {
            fetchAllAssetTypes({ pageSize: 200 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const categoryOptions = useMemo(
        () => assetTypes.map((at) => ({ value: at.id as number, label: at.name })),
        [assetTypes]
    );

    const selectedCategoryId = useWatch({ control, name: 'assetTypeId' });
    const selectedCategory = useMemo(
        () =>
            assetTypes.find((at) => String(at.id) === String(selectedCategoryId)) ?? null,
        [assetTypes, selectedCategoryId]
    );

    // Clear attribute values when category changes
    useEffect(() => {
        setValue('attributes', {} as any, { shouldDirty: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategoryId]);

    const customAttributes = selectedCategory?.customAttributes ?? [];

    return (
        <>
            <PageSection
                title="Asset Category"
                subtitle="Pick the category your request belongs to — it drives the approval flow and the fields below."
                icon={<CategoryOutlinedIcon />}
            >
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
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
                    </Grid>
                </Grid>
            </PageSection>

            {selectedCategoryId && customAttributes.length > 0 && (
                <PageSection
                    title="Category Details"
                    subtitle={`Fields specific to "${selectedCategory?.name}".`}
                    icon={<TuneIcon />}
                >
                    <DynamicAttributesForm<IRequest>
                        attributes={customAttributes}
                        control={control}
                        namePrefix="attributes"
                    />
                </PageSection>
            )}

            {selectedCategoryId && customAttributes.length === 0 && (
                <Box sx={{ mb: 3 }}>
                    <Alert severity="info" variant="outlined">
                        This category has no custom attributes configured.
                    </Alert>
                </Box>
            )}
        </>
    );
};

export default CategoryAttributesPanel;
