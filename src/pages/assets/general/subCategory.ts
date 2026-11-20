/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../../core/apis/axiosInstance';

/**
 * An asset's sub-category: the level below its category (Laptop, Monitor under Computers; Chair,
 * Table under Furniture).
 *
 * <p><b>It is the commodity</b> - the same record Settings → Commodities manages - and only its
 * label is "Sub-category", matching Configure Fields. Every key stays what it was: the asset form
 * field is still `category`, its Configure Fields key is still `category`, the request parameter is
 * `commodityId`, and the import column is still headed "Commodity" (the importer reads the header as
 * the field name). Renaming any of those would break something; renaming the label breaks nothing.
 */
export const SUB_CATEGORY_LABEL = 'Sub-category';

/** The register row key for the column. Also its key in the export registry. */
export const SUB_CATEGORY_KEY = 'subCategory';

/**
 * The "Not set" choice in the filter. Not an id - {@link subCategoryParams} turns it into the
 * endpoint's `noCommodity=true`, because no commodity id can mean "none".
 */
export const NO_SUB_CATEGORY = 'none';

export interface SubCategoryOption {
    value: number | string;
    label: string;
}

/** The filter's options for one category: its sub-categories by name, then "Not set". */
export const subCategoryOptions = (
    commodities: Array<{ id?: number | string | null; name?: string | null }>,
): SubCategoryOption[] => [
    ...commodities
        .filter((c) => c.id != null && c.name)
        .map((c) => ({ value: Number(c.id), label: String(c.name) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    { value: NO_SUB_CATEGORY, label: 'Not set' },
];

/**
 * The filters as `GET /assets` reads them. A chosen sub-category travels as `commodityId`; "Not set"
 * as `noCommodity=true` with no `commodityId`. Shared by the table and the export, so a file always
 * holds what the screen shows.
 */
export const subCategoryParams = <T extends Record<string, any>>(filters: T): Record<string, any> => {
    const { commodityId, ...rest } = filters;
    if (commodityId === NO_SUB_CATEGORY) return { ...rest, noCommodity: true };
    if (commodityId === undefined || commodityId === null || commodityId === '') return rest;
    return { ...rest, commodityId };
};

/** How the filter summary and the export strip name the chosen value. */
export const subCategorySummary = (
    commodityId: unknown,
    options: SubCategoryOption[],
): string | null => {
    if (commodityId === undefined || commodityId === null || commodityId === '') return null;
    if (commodityId === NO_SUB_CATEGORY) return 'Not set';
    return options.find((o) => String(o.value) === String(commodityId))?.label ?? `#${commodityId}`;
};

/** One category's sub-categories. Throws on failure, so a refusal is never read as "there are none". */
export const fetchSubCategories = async (
    assetTypeId: number | string,
): Promise<Array<{ id: number; name: string }>> => {
    const { data } = await axiosInstance.get('commodities', {
        params: { assetTypeId, pageNumber: 0, pageSize: 1000 },
    });
    return Array.isArray(data?.content) ? data.content : [];
};
