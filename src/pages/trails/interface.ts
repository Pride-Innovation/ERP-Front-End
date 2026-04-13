/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

export interface IAuditTrail {
    id: string | number;
    timeStamp: string;
    event: 'created' | 'updated' | 'deleted' | 'login' | 'logout' | 'approved' | 'rejected' | 'system';
    module: 'Assets' | 'Inventory' | 'Users' | 'Store' | 'Requests' | 'Movement' | 'Disposal' | 'Maintenance' | 'System';
    description: string;
    actor: string;
    ipAddress: string;
    severity: 'info' | 'warning' | 'critical';
}