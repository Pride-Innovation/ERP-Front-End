/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../../core/apis/axiosInstance';

/** A person as a dropdown needs them — enough to choose, and nothing else. */
export interface IStaffOption {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    title?: string | null;
}

export interface IStaffOptionPage {
    content: IStaffOption[];
    totalElements: number;
}

/**
 * The one call behind every "choose a person" dropdown in the application.
 *
 * <h2>Why this exists</h2>
 * A dozen screens offer a staff picker — Requested By and Approver on the four request tabs,
 * Assigned To on the assets register and its form, Reassign, Repair, the movement recipient, the
 * acting person on the leave form — and **every one of them loaded `GET /users`**, the staff
 * directory. So each of those ordinary screens required `READ_USER`, a permission that also opens
 * the Users page and needs `READ_ROLE` behind it to render its filters.
 *
 * <p>That left a choice between granting administrative rights to everybody and leaving ordinary
 * screens broken for officers. Neither was a decision anybody made: it followed from a picker
 * borrowing a directory.
 *
 * <h2>What it does not change</h2>
 * **The scope is identical.** `GET /users/picker` runs through the same branch resolution the
 * directory does, so a branch user is offered their own duty station and Head Office sees everyone —
 * exactly what these dropdowns return today. What changed is the permission required (authentication
 * alone) and the shape returned (a name, a title and a work email, not a personnel record). Those
 * two go together; the second is what makes the first defensible.
 *
 * @param excludeSelf for the leave form, where nominating yourself to act in your own absence is not
 *                    a choice worth offering
 */
export const fetchStaffOptionsService = async (params: {
    name?: string;
    pageNumber?: number;
    pageSize?: number;
    excludeSelf?: boolean;
} = {}): Promise<IStaffOptionPage> => {
    const { data } = await axiosInstance.get('users/picker', {
        params: {
            name: params.name?.trim() || undefined,
            pageNumber: params.pageNumber ?? 0,
            pageSize: params.pageSize ?? 10,
            excludeSelf: params.excludeSelf ?? undefined,
        },
    });
    return {
        content: data?.content ?? [],
        totalElements: data?.totalElements ?? 0,
    };
};

/** `"Okello John"`, falling back to the work email and then the id. */
export const staffOptionLabel = (person: IStaffOption): string =>
    [person.firstName, person.lastName].filter(Boolean).join(' ').trim()
    || person.email
    || `User ${person.id}`;
