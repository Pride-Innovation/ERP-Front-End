/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../../core/apis/axiosInstance';
import { IAsyncAutocompletePage } from '../../../components/forms/AsyncAutocomplete';
import { ITitle } from '../../settings/titles/interface';
import { IBranch } from '../../settings/branch/interface';
import { IDepartment } from '../../settings/departments/interface';
import { IUnit } from '../../settings/units/interface';

interface SpringPage<T> {
    content: T[];
    totalElements: number;
}

export interface ReferenceOption {
    value: number;
    label: string;
}

/**
 * Single-shot fetch helpers returning `{value,label}` arrays suitable as
 * `columnFilters` select options on the Users table. Reference tables are
 * small in practice; one round-trip with a generous page size is cheaper than
 * paginating in the toolbar.
 */
const REF_PAGE = { pageNumber: 0, pageSize: 1000 } as const;

export const fetchAllTitles = async (): Promise<ReferenceOption[]> => {
    const { data } = await axiosInstance.get<SpringPage<ITitle>>('titles', { params: REF_PAGE });
    return data.content.map(t => ({ value: t.id as number, label: t.name }));
};

export const fetchAllBranches = async (): Promise<ReferenceOption[]> => {
    const { data } = await axiosInstance.get<SpringPage<IBranch>>('branches', { params: REF_PAGE });
    return data.content.map(b => ({ value: b.id as number, label: b.name }));
};

export const fetchAllDepartments = async (): Promise<ReferenceOption[]> => {
    const { data } = await axiosInstance.get<SpringPage<IDepartment>>('departments', { params: REF_PAGE });
    return data.content.map(d => ({ value: d.id as number, label: d.name }));
};

interface RoleLite { id: number; name: string }

export const fetchAllRoles = async (): Promise<ReferenceOption[]> => {
    const { data } = await axiosInstance.get<SpringPage<RoleLite>>('roles', { params: REF_PAGE });
    return data.content.map(r => ({ value: r.id, label: r.name }));
};

/** Paginated, name-searchable title fetcher used by the User form. */
export const fetchTitlesPage = async (
    query: string,
    page: number,
    pageSize: number
): Promise<IAsyncAutocompletePage> => {
    const { data } = await axiosInstance.get<SpringPage<ITitle>>('titles', {
        params: { pageNumber: page, pageSize, name: query || undefined },
    });
    return {
        totalElements: data.totalElements,
        options: data.content.map((t) => ({
            value: t.id as number,
            label: t.name,
            raw: t,
        })),
    };
};

/** Paginated, name-searchable branch fetcher. Each option carries the full branch (incl. `isHeadOffice`). */
export const fetchBranchesPage = async (
    query: string,
    page: number,
    pageSize: number
): Promise<IAsyncAutocompletePage> => {
    const { data } = await axiosInstance.get<SpringPage<IBranch>>('branches', {
        params: { pageNumber: page, pageSize, name: query || undefined },
    });
    return {
        totalElements: data.totalElements,
        options: data.content.map((b) => ({
            value: b.id as number,
            label: b.name,
            raw: b,
        })),
    };
};

/**
 * Paginated, name-searchable department fetcher. Always scoped to a branch
 * (mandatory) so the Head Office department picker never leaks departments from
 * other branches.
 */
export const fetchDepartmentsPage = (branchId: number | string | undefined) =>
    async (
        query: string,
        page: number,
        pageSize: number
    ): Promise<IAsyncAutocompletePage> => {
        if (!branchId) return { options: [], totalElements: 0 };
        const { data } = await axiosInstance.get<SpringPage<IDepartment>>('departments', {
            params: { pageNumber: page, pageSize, name: query || undefined, branchId },
        });
        return {
            totalElements: data.totalElements,
            options: data.content.map((d) => ({
                value: d.id as number,
                label: d.name,
                raw: d,
            })),
        };
    };

/**
 * Paginated, name-searchable unit fetcher. Always scoped to a department so the
 * Head Office unit picker only shows units belonging to the chosen department.
 */
export const fetchUnitsPage = (departmentId: number | string | undefined) =>
    async (
        query: string,
        page: number,
        pageSize: number
    ): Promise<IAsyncAutocompletePage> => {
        if (!departmentId) return { options: [], totalElements: 0 };
        const { data } = await axiosInstance.get<SpringPage<IUnit>>('units', {
            params: { pageNumber: page, pageSize, name: query || undefined, departmentId },
        });
        return {
            totalElements: data.totalElements,
            options: data.content.map((u) => ({
                value: u.id as number,
                label: u.name,
                raw: u,
            })),
        };
    };
