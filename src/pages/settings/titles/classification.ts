/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Where a title is used, and its department - both optional, both for filtering the Titles page only.
 * Nothing reads them for permissions, scope or approval routing.
 *
 * "Branches" is one group, not a branch: every branch shares the same titles. This is deliberately
 * not `title.branch`, which names one branch and is read elsewhere as a fallback for a user's own.
 */
export type TitleWorkplace = 'HEAD_OFFICE' | 'BRANCH';

export const WORKPLACE_LABEL: Record<TitleWorkplace, string> = {
    HEAD_OFFICE: 'Head Office',
    BRANCH: 'Branches',
};

export const WORKPLACE_OPTIONS: Array<{ value: TitleWorkplace; label: string }> = [
    { value: 'HEAD_OFFICE', label: WORKPLACE_LABEL.HEAD_OFFICE },
    { value: 'BRANCH', label: WORKPLACE_LABEL.BRANCH },
];

/** `''` = no filter. `NOT_SET` finds the titles nobody has classified yet. */
export type WorkplaceFilter = '' | TitleWorkplace | 'NOT_SET';

/** Department filter value meaning "titles with no department". Any other non-empty value is an id. */
export const NO_DEPARTMENT = 'none';

export interface TitleFilters {
    name?: string;
    roleId?: string | number;
    workplace?: WorkplaceFilter;
    department?: string;
}

/** The query parameters `GET /titles` declares for these filters - nothing it would silently drop. */
export const titleFilterParams = ({ name, roleId, workplace, department }: TitleFilters): Record<string, string | number | boolean> => {
    const params: Record<string, string | number | boolean> = {};
    if (name) params.name = name;
    if (roleId) params.roleId = roleId;
    if (workplace) params.workplace = workplace;
    if (department === NO_DEPARTMENT) params.noDepartment = true;
    else if (department) params.departmentId = Number(department);
    return params;
};

const idOf = (value: unknown): number | null => {
    if (value == null || value === '') return null;
    if (typeof value === 'object') {
        const id = (value as { id?: unknown }).id;
        return id == null ? null : Number(id);
    }
    return Number(value);
};

/**
 * The body `TitleRequestDTO` expects: scalar ids, and the two classification fields always present.
 * An update replaces the whole title, so leaving them out would clear them - send null on purpose.
 */
export const toTitlePayload = (form: Record<string, unknown>) => ({
    name: form.name as string,
    shortCode: form.shortCode as string,
    reportsTo: idOf(form.reportsTo),
    role: idOf(form.role),
    workplace: (form.workplace as TitleWorkplace | '' | null | undefined) || null,
    departmentId: idOf(form.departmentId),
});
