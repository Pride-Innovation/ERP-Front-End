import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { IAssetFieldConfig, FieldConfigState } from '../pages/settings/assetTypes/interface';

const DEFAULT_STATE: FieldConfigState = 'optional';

/**
 * Reads the fieldConfig for a given assetTypeId from the Redux store and returns
 * helper functions that forms use to filter / annotate their field lists.
 *
 * @param assetTypeId  The id of the asset type (from URL param or form context).
 */
export const useAssetFieldConfig = (assetTypeId?: number | string | null) => {
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const assetType = assetTypeId
        ? assetTypes.find(at => String(at.id) === String(assetTypeId))
        : null;

    const config: IAssetFieldConfig | null | undefined = assetType?.fieldConfig;

    /** Returns the configured state for a field, defaulting to 'optional'. */
    const getFieldState = (fieldName: keyof IAssetFieldConfig): FieldConfigState => {
        if (!config) return DEFAULT_STATE;
        return config[fieldName] ?? DEFAULT_STATE;
    };

    const isHidden = (fieldName: keyof IAssetFieldConfig) =>
        getFieldState(fieldName) === 'hidden';

    const isRequired = (fieldName: keyof IAssetFieldConfig) =>
        getFieldState(fieldName) === 'required';

    /**
     * Filters a formFields array (as used by OfficeEquipmentUtills / FleetUtills etc.)
     * by removing hidden fields and setting `required: false` on optional ones.
     * MUI renders its own asterisk via the `required` prop — do NOT modify labels.
     */
    const applyToFormFields = <T extends { value: string; label: string; [key: string]: any }>(
        formFields: T[]
    ): T[] => {
        if (!config) return formFields;

        return formFields
            .filter(field => !isHidden(field.value as keyof IAssetFieldConfig))
            .map(field => {
                const state = getFieldState(field.value as keyof IAssetFieldConfig);
                return {
                    ...field,
                    // required=false tells SteppedOfficeEquipmentForm to suppress the MUI asterisk
                    required: state === 'required',
                };
            });
    };

    return { getFieldState, isHidden, isRequired, applyToFormFields, config };
};
