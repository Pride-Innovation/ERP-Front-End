/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAuditTrail } from "../../pages/trails/interface";

export const auditTrailsMock: IAuditTrail[] = [
    // April 13, 2026 — Today
    { id: 1,  timeStamp: 'Apr 13, 2026 9:01 AM',  event: 'login',    module: 'System',      description: 'User logged into the system',                                                   actor: 'John Okello',   ipAddress: '10.10.1.45',     severity: 'info' },
    { id: 2,  timeStamp: 'Apr 13, 2026 9:15 AM',  event: 'created',  module: 'Assets',      description: 'Added new asset: HP Laptop (TAG-2026-0054)',                                    actor: 'John Okello',   ipAddress: '10.10.1.45',     severity: 'info' },
    { id: 3,  timeStamp: 'Apr 13, 2026 10:02 AM', event: 'updated',  module: 'Inventory',   description: 'Updated stock level for Canon Printer cartridges (Qty: 50 → 45)',              actor: 'Mary Akot',     ipAddress: '10.10.2.11',     severity: 'info' },
    { id: 4,  timeStamp: 'Apr 13, 2026 10:30 AM', event: 'approved', module: 'Requests',    description: 'Approved asset request REQ-2026-081 for Finance Dept',                         actor: 'Peter Omara',   ipAddress: '10.10.1.22',     severity: 'info' },
    { id: 5,  timeStamp: 'Apr 13, 2026 11:15 AM', event: 'deleted',  module: 'Users',       description: 'Deactivated user account (jsmith@pridemicrofinance.co.ug)',                    actor: 'Admin',         ipAddress: '10.10.0.1',      severity: 'warning' },
    // April 12
    { id: 6,  timeStamp: 'Apr 12, 2026 3:25 PM',  event: 'updated',  module: 'Assets',      description: 'Activated user (snamwanja@pridemicrofinance.co.ug)',                           actor: 'John Doe',      ipAddress: '10.10.1.10',     severity: 'info' },
    { id: 7,  timeStamp: 'Apr 12, 2026 3:17 PM',  event: 'updated',  module: 'Users',       description: 'Activated user (dariusk.kats+7@gmail.com)',                                    actor: 'Jane Doe',      ipAddress: '10.10.1.12',     severity: 'info' },
    { id: 8,  timeStamp: 'Apr 12, 2026 2:44 PM',  event: 'created',  module: 'Movement',    description: 'Transfer created: Dell Monitor from Head Office → Gulu Branch',                actor: 'Grace Amanya',  ipAddress: '10.10.3.55',     severity: 'info' },
    { id: 9,  timeStamp: 'Apr 12, 2026 1:10 PM',  event: 'rejected', module: 'Requests',    description: 'Rejected requisition REQ-2026-079 — insufficient stock',                       actor: 'Samuel Opio',   ipAddress: '10.10.1.33',     severity: 'warning' },
    { id: 10, timeStamp: 'Apr 12, 2026 9:55 AM',  event: 'login',    module: 'System',      description: 'Failed login attempt (3 tries) for user k.otim@pridemicrofinance.co.ug',      actor: 'System',        ipAddress: '41.210.87.22',   severity: 'critical' },
    // April 11
    { id: 11, timeStamp: 'Apr 11, 2026 4:30 PM',  event: 'deleted',  module: 'Disposal',    description: 'Asset disposed: Dell Desktop (TAG-2023-0012) — End of Life',                  actor: 'Henry Mugabi',  ipAddress: '10.10.1.88',     severity: 'warning' },
    { id: 12, timeStamp: 'Apr 11, 2026 2:15 PM',  event: 'updated',  module: 'Maintenance', description: 'Maintenance record updated for Toyota Hilux (UBB-987D) — serviced',           actor: 'Daniel Eyoku',  ipAddress: '10.10.2.66',     severity: 'info' },
    { id: 13, timeStamp: 'Apr 11, 2026 11:00 AM', event: 'created',  module: 'Inventory',   description: 'New GRN created: LPO-2026-012 — Office Chairs (25 units)',                    actor: 'Mary Akot',     ipAddress: '10.10.2.11',     severity: 'info' },
    { id: 14, timeStamp: 'Apr 11, 2026 9:30 AM',  event: 'system',   module: 'System',      description: 'Automated backup completed successfully (04:00 AM UTC)',                       actor: 'System',        ipAddress: '127.0.0.1',      severity: 'info' },
    // April 10
    { id: 15, timeStamp: 'Apr 10, 2026 3:00 PM',  event: 'created',  module: 'Store',       description: 'New store requisition STQ-2026-044 — IT Equipment batch',                     actor: 'Ruth Achola',   ipAddress: '10.10.4.21',     severity: 'info' },
    { id: 16, timeStamp: 'Apr 10, 2026 1:45 PM',  event: 'approved', module: 'Movement',    description: 'Movement MV-2026-031 approved — Scanner transferred to Mbarara Branch',       actor: 'Peter Omara',   ipAddress: '10.10.1.22',     severity: 'info' },
    { id: 17, timeStamp: 'Apr 10, 2026 11:30 AM', event: 'updated',  module: 'Assets',      description: 'Asset tag updated: Lenovo ThinkPad TAG-2024-0055 → TAG-2026-0055',            actor: 'John Okello',   ipAddress: '10.10.1.45',     severity: 'info' },
    { id: 18, timeStamp: 'Apr 10, 2026 9:15 AM',  event: 'login',    module: 'System',      description: 'Suspicious login from unrecognized device — session token revoked',           actor: 'System',        ipAddress: '197.157.44.10',  severity: 'critical' },
    // April 9
    { id: 19, timeStamp: 'Apr 09, 2026 4:00 PM',  event: 'logout',   module: 'System',      description: 'Session expired due to inactivity — user forced logout',                      actor: 'Grace Amanya',  ipAddress: '10.10.3.55',     severity: 'info' },
    { id: 20, timeStamp: 'Apr 09, 2026 2:30 PM',  event: 'updated',  module: 'Requests',    description: 'Request REQ-2026-074 status changed: Pending → Approved',                     actor: 'Peter Omara',   ipAddress: '10.10.1.22',     severity: 'info' },
    { id: 21, timeStamp: 'Apr 09, 2026 10:45 AM', event: 'deleted',  module: 'Inventory',   description: 'Removed obsolete stock entry for broken UPS units (Qty: 3)',                  actor: 'Samuel Opio',   ipAddress: '10.10.1.33',     severity: 'warning' },
    // April 8
    { id: 22, timeStamp: 'Apr 08, 2026 3:20 PM',  event: 'created',  module: 'Maintenance', description: 'New maintenance job MNT-2026-019 raised for Photocopier — Kampala Branch',   actor: 'Henry Mugabi',  ipAddress: '10.10.1.88',     severity: 'info' },
    { id: 23, timeStamp: 'Apr 08, 2026 11:00 AM', event: 'system',   module: 'System',      description: 'Database schema migration v2.4 → v2.5 completed successfully',               actor: 'System',        ipAddress: '127.0.0.1',      severity: 'info' },
    // April 7
    { id: 24, timeStamp: 'Apr 07, 2026 2:10 PM',  event: 'created',  module: 'Users',       description: 'New user account created: k.atuhaire@pridemicrofinance.co.ug',               actor: 'Admin',         ipAddress: '10.10.0.1',      severity: 'info' },
    { id: 25, timeStamp: 'Apr 07, 2026 9:00 AM',  event: 'updated',  module: 'Disposal',    description: 'Disposal record updated — recovery value revised for printer batch',          actor: 'Daniel Eyoku',  ipAddress: '10.10.2.66',     severity: 'info' },
];

export interface ITest {
    "userId": number | string;
    "id": number | string;
    "title": string;
    "body": string;
}

export const testListMock: ITest[] = [
    {
        "userId": 1,
        "id": 8,
        "title": "dolorem dolore est ipsam",
        "body": "dignissimos aperiam dolorem qui eum\nfacilis quibusdam animi sint suscipit qui sint possimus cum\nquaerat magni maiores excepturi\nipsam ut commodi dolor voluptatum modi aut vitae"
    },
    {
        "userId": 1,
        "id": 9,
        "title": "nesciunt iure omnis dolorem tempora et accusantium",
        "body": "consectetur animi nesciunt iure dolore\nenim quia ad\nveniam autem ut quam aut nobis\net est aut quod aut provident voluptas autem voluptas"
    },
]

