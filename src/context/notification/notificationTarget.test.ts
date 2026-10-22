/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ROUTES } from '../../core/routes/routes';
import { kindOf, notificationRoute } from './notificationTarget';
import { IAppNotification } from './service';

const notification = (entityType: string | null, entityId: number | null, type = 'STEP_PENDING') =>
    ({ id: 1, title: 't', message: 'm', type, entityType, entityId, isRead: false } as unknown as IAppNotification);

describe('where a notification goes', () => {
    it('opens a submitted stock count on its sheet, and files it with the other actions', () => {
        expect(notificationRoute(notification('STOCK_COUNT', 14))).toBe(`${ROUTES.STOCK_TAKE}/14`);
        expect(kindOf('STOCK_COUNT_PENDING')).toEqual({ label: 'Stock count to approve', group: 'action' });
    });

    it('leads nowhere rather than somewhere wrong', () => {
        expect(notificationRoute(notification('SOMETHING_NEW', 3))).toBeNull();
        expect(notificationRoute(notification('STOCK_COUNT', null))).toBeNull();
    });
});
