import { IAssignmentHistory } from "../../pages/assets/interface";

const assignmentHistoryMock: IAssignmentHistory[] = [
    {
        id: 1,
        startDate: "2024-01-01",
        endDate: "2024-01-05",
        statusBefore: "Working",
        statusAfter: "Defective",
        user: "alice smith",
        serialNumber: "SN001"
    },
    {
        id: 2,
        startDate: "2024-02-01",
        endDate: "2024-02-03",
        statusBefore: "Working",
        statusAfter: "In Repair",
        user: "bob johnson",
        serialNumber: "SN002"
    },
    {
        id: 3,
        startDate: "2024-03-01",
        endDate: "2024-03-04",
        statusBefore: "Defective",
        statusAfter: "Repaired",
        user: "carol williams",
        serialNumber: "SN003"
    },
    {
        id: 4,
        startDate: "2024-04-01",
        endDate: "2024-04-06",
        statusBefore: "Working",
        statusAfter: "Archived",
        user: "david brown",
        serialNumber: "SN004"
    },
    {
        id: 5,
        startDate: "2024-05-01",
        endDate: "2024-05-02",
        statusBefore: "In Repair",
        statusAfter: "Working",
        user: "emily jones",
        serialNumber: "SN005"
    },
    {
        id: 6,
        startDate: "2024-06-01",
        endDate: "2024-06-05",
        statusBefore: "Working",
        statusAfter: "Defective",
        user: "frank miller",
        serialNumber: "SN006"
    },
    {
        id: 7,
        startDate: "2024-07-01",
        endDate: "2024-07-07",
        statusBefore: "Working",
        statusAfter: "Lost",
        user: "grace davis",
        serialNumber: "SN007"
    },
    {
        id: 8,
        startDate: "2024-08-01",
        endDate: "2024-08-02",
        statusBefore: "Defective",
        statusAfter: "Replaced",
        user: "henry garcia",
        serialNumber: "SN008"
    },
    {
        id: 9,
        startDate: "2024-09-01",
        endDate: "2024-09-05",
        statusBefore: "Working",
        statusAfter: "Working",
        user: "isabella martinez",
        serialNumber: "SN009"
    },
    {
        id: 10,
        startDate: "2024-10-01",
        endDate: "2024-10-10",
        statusBefore: "In Repair",
        statusAfter: "Defective",
        user: "jack robinson",
        serialNumber: "SN010"
    }
];

export default assignmentHistoryMock;
