// Mock movement data for the dashboard
export type MovementStatus =
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'released'
    | 'received'
    | 'completed';

export interface IMockMovement {
    id: string;
    referenceNo: string;
    requestingOfficer: string;
    department: string;
    destination: string;
    destinationType: 'Branch' | 'Department' | 'External';
    assetsCount: number;
    reason: string;
    expectedReturnDate: string;
    status: MovementStatus;
    createdDate: string;
    lastModified: string;
    rejectionComment?: string;
    approvedBy?: string;
    approvedDate?: string;
    securityPassAvailable?: boolean;
}

export const mockMovements: IMockMovement[] = [
    {
        id: '1',
        referenceNo: 'MOV-2026-001',
        requestingOfficer: 'Sunday Odong',
        department: 'IT Department',
        destination: 'Gulu Branch',
        destinationType: 'Branch',
        assetsCount: 3,
        reason: 'Field support mission – laptops and printers required for branch setup',
        expectedReturnDate: '2026-04-20',
        status: 'approved',
        createdDate: '2026-04-01',
        lastModified: '2026-04-03',
        approvedBy: 'James Okello',
        approvedDate: '2026-04-03',
        securityPassAvailable: true,
    },
    {
        id: '2',
        referenceNo: 'MOV-2026-002',
        requestingOfficer: 'Sarah Namutebi',
        department: 'Finance',
        destination: 'Kampala Branch',
        destinationType: 'Branch',
        assetsCount: 1,
        reason: 'Audit equipment relocation',
        expectedReturnDate: '2026-04-15',
        status: 'pending_approval',
        createdDate: '2026-04-05',
        lastModified: '2026-04-05',
    },
    {
        id: '3',
        referenceNo: 'MOV-2026-003',
        requestingOfficer: 'Peter Ochieng',
        department: 'Operations',
        destination: 'Board Room – HQ',
        destinationType: 'Department',
        assetsCount: 5,
        reason: 'Board meeting AV setup',
        expectedReturnDate: '2026-04-09',
        status: 'released',
        createdDate: '2026-04-06',
        lastModified: '2026-04-07',
        approvedBy: 'Mary Atim',
        approvedDate: '2026-04-06',
    },
    {
        id: '4',
        referenceNo: 'MOV-2026-004',
        requestingOfficer: 'Grace Alalo',
        department: 'HR',
        destination: 'Mbale Branch',
        destinationType: 'Branch',
        assetsCount: 2,
        reason: 'Training session – projectors and stands',
        expectedReturnDate: '2026-04-30',
        status: 'rejected',
        createdDate: '2026-04-02',
        lastModified: '2026-04-04',
        rejectionComment: 'Insufficient justification; assets are required at HQ during that period.',
    },
    {
        id: '5',
        referenceNo: 'MOV-2026-005',
        requestingOfficer: 'David Wanyama',
        department: 'ICT',
        destination: 'Tororo Branch',
        destinationType: 'Branch',
        assetsCount: 4,
        reason: 'Network switch replacements',
        expectedReturnDate: '2026-05-10',
        status: 'draft',
        createdDate: '2026-04-08',
        lastModified: '2026-04-08',
    },
    {
        id: '6',
        referenceNo: 'MOV-2026-006',
        requestingOfficer: 'Patience Achayo',
        department: 'Admin',
        destination: 'Lira Branch',
        destinationType: 'Branch',
        assetsCount: 2,
        reason: 'Desk equipment relocation for new staff',
        expectedReturnDate: '2026-05-01',
        status: 'completed',
        createdDate: '2026-03-20',
        lastModified: '2026-04-01',
        approvedBy: 'James Okello',
        approvedDate: '2026-03-21',
        securityPassAvailable: true,
    },
];

export const statusConfig: Record<MovementStatus, { label: string; color: string; bg: string; border: string }> = {
    draft: {
        label: 'Draft',
        color: '#6B7280',
        bg: '#F3F4F6',
        border: '#D1D5DB',
    },
    pending_approval: {
        label: 'Pending Approval',
        color: '#D97706',
        bg: '#FEF3C7',
        border: '#FCD34D',
    },
    approved: {
        label: 'Approved',
        color: '#059669',
        bg: '#D1FAE5',
        border: '#6EE7B7',
    },
    rejected: {
        label: 'Rejected',
        color: '#DC2626',
        bg: '#FEE2E2',
        border: '#FCA5A5',
    },
    released: {
        label: 'Released',
        color: '#2563EB',
        bg: '#DBEAFE',
        border: '#93C5FD',
    },
    received: {
        label: 'Received',
        color: '#7C3AED',
        bg: '#EDE9FE',
        border: '#C4B5FD',
    },
    completed: {
        label: 'Completed',
        color: '#08796C',
        bg: '#CCFBF1',
        border: '#5EEAD4',
    },
};
