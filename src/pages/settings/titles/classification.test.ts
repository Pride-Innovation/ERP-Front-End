/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { NO_DEPARTMENT, titleFilterParams, toTitlePayload } from './classification';

/**
 * Spring drops a query parameter the endpoint does not declare (trap #2), and the list then comes back
 * unfiltered under a filter that looks applied. These are the keys `TitleQueryParams` declares.
 */
describe('titleFilterParams', () => {
    it('sends nothing when no filter is chosen', () => {
        expect(titleFilterParams({ workplace: '', department: '' })).toEqual({});
    });

    it('sends the workplace as declared, including the Not set value', () => {
        expect(titleFilterParams({ workplace: 'HEAD_OFFICE' })).toEqual({ workplace: 'HEAD_OFFICE' });
        expect(titleFilterParams({ workplace: 'BRANCH' })).toEqual({ workplace: 'BRANCH' });
        expect(titleFilterParams({ workplace: 'NOT_SET' })).toEqual({ workplace: 'NOT_SET' });
    });

    it('sends a department as an id, and "No department" as its own flag', () => {
        expect(titleFilterParams({ department: '7' })).toEqual({ departmentId: 7 });
        expect(titleFilterParams({ department: NO_DEPARTMENT })).toEqual({ noDepartment: true });
    });

    it('combines with the name and role filters', () => {
        expect(titleFilterParams({ name: 'officer', roleId: '3', workplace: 'BRANCH', department: '2' }))
            .toEqual({ name: 'officer', roleId: '3', workplace: 'BRANCH', departmentId: 2 });
    });
});

describe('toTitlePayload', () => {
    it('sends scalar ids and both classification fields', () => {
        expect(toTitlePayload({
            name: 'Teller', shortCode: 'TLR', reportsTo: '4', role: { id: 2 },
            workplace: 'BRANCH', departmentId: 5,
        })).toEqual({ name: 'Teller', shortCode: 'TLR', reportsTo: 4, role: 2, workplace: 'BRANCH', departmentId: 5 });
    });

    /* An update replaces the whole title: "Not set" and "None" must be sent as null, not left out. */
    it('sends Not set and None as explicit nulls', () => {
        const payload = toTitlePayload({ name: 'Driver', shortCode: 'DRV', role: 1, workplace: '', departmentId: null });
        expect(payload).toHaveProperty('workplace', null);
        expect(payload).toHaveProperty('departmentId', null);
        expect(payload).toHaveProperty('reportsTo', null);
    });
});
