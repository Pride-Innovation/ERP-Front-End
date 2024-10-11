import { IRequest } from "../../pages/request/interface";

export const requestMock: IRequest[] = [
    {
        id: 1,
        officerName: "John Doe",
        title: "equipmentRequest",
        department: "Engineering",
        reason: "Project work",
        quantity: 2,
        destination: "Site A",
        expectedReturnDate: "2024-12-15",
        particulars: [
            { name: "Laptop", serialNumber: "LAP123456", engravedNumber: "ENGR-LAP123" },
            { name: "Projector", serialNumber: "PROJ987654", engravedNumber: "ENGR-PROJ987" }
        ]
    },
    {
        id: 2,
        officerName: "Jane Smith",
        title: "equipmentRequest",
        department: "HR",
        reason: "Training session",
        quantity: 1,
        destination: "Training Room 1",
        expectedReturnDate: "2024-12-20",
        particulars: [
            { name: "Tablet", serialNumber: "TAB654321", engravedNumber: "ENGR-TAB654" }
        ]
    },
    {
        id: 3,
        officerName: "Michael Brown",
        title: "toolRequest",
        department: "Maintenance",
        reason: "Repair work",
        quantity: 3,
        destination: "Warehouse",
        expectedReturnDate: "2024-12-22",
        particulars: [
            { name: "Drill", serialNumber: "DRL111222", engravedNumber: "ENGR-DRL111" },
            { name: "Wrench Set", serialNumber: "WRE333444", engravedNumber: "ENGR-WRE333" },
            { name: "Screwdriver", serialNumber: "SCR555666", engravedNumber: "ENGR-SCR555" }
        ]
    },
    {
        id: 4,
        officerName: "Emily Davis",
        title: "equipmentRequest",
        department: "Marketing",
        reason: "Campaign setup",
        quantity: 2,
        destination: "Office B",
        expectedReturnDate: "2024-12-18",
        particulars: [
            { name: "Camera", serialNumber: "CAM222333", engravedNumber: "ENGR-CAM222" },
            { name: "Tripod", serialNumber: "TRI444555", engravedNumber: "ENGR-TRI444" }
        ]
    },
    {
        id: 5,
        officerName: "Chris Wilson",
        title: "equipmentRequest",
        department: "IT",
        reason: "System upgrade",
        quantity: 5,
        destination: "Server Room",
        expectedReturnDate: "2024-12-30",
        particulars: [
            { name: "Server Rack", serialNumber: "SRV111", engravedNumber: "ENGR-SRV111" },
            { name: "Network Switch", serialNumber: "NET222", engravedNumber: "ENGR-NET222" },
            { name: "Cabling", serialNumber: "CAB333", engravedNumber: "ENGR-CAB333" },
            { name: "Firewall", serialNumber: "FW444", engravedNumber: "ENGR-FW444" },
            { name: "UPS", serialNumber: "UPS555", engravedNumber: "ENGR-UPS555" }
        ]
    },
    {
        id: 6,
        officerName: "Sarah Johnson",
        title: "equipmentRequest",
        department: "Finance",
        reason: "Audit preparation",
        quantity: 1,
        destination: "Office C",
        expectedReturnDate: "2024-12-25",
        particulars: [
            { name: "Printer", serialNumber: "PRT666", engravedNumber: "ENGR-PRT666" }
        ]
    },
    {
        id: 7,
        officerName: "David Martinez",
        title: "assetRequest",
        department: "Operations",
        reason: "Logistics",
        quantity: 4,
        destination: "Depot",
        expectedReturnDate: "2024-12-29",
        particulars: [
            { name: "Forklift", serialNumber: "FLK777", engravedNumber: "ENGR-FLK777" },
            { name: "Pallet Jack", serialNumber: "PJ888", engravedNumber: "ENGR-PJ888" },
            { name: "Hand Truck", serialNumber: "HT999", engravedNumber: "ENGR-HT999" },
            { name: "Safety Helmet", serialNumber: "SH000", engravedNumber: "ENGR-SH000" }
        ]
    },
    {
        id: 8,
        officerName: "Linda Thompson",
        title: "equipmentRequest",
        department: "Legal",
        reason: "Client meeting",
        quantity: 1,
        destination: "Conference Room",
        expectedReturnDate: "2024-12-21",
        particulars: [
            { name: "Video Conferencing System", serialNumber: "VCS111", engravedNumber: "ENGR-VCS111" }
        ]
    },
    {
        id: 9,
        officerName: "Robert Garcia",
        title: "assetRequest",
        department: "R&D",
        reason: "Research project",
        quantity: 3,
        destination: "Lab A",
        expectedReturnDate: "2024-12-28",
        particulars: [
            { name: "Microscope", serialNumber: "MIC222", engravedNumber: "ENGR-MIC222" },
            { name: "Beaker Set", serialNumber: "BEK333", engravedNumber: "ENGR-BEK333" },
            { name: "Test Tubes", serialNumber: "TT444", engravedNumber: "ENGR-TT444" }
        ]
    },
    {
        id: 10,
        officerName: "Jessica Lee",
        title: "equipmentRequest",
        department: "Customer Service",
        reason: "Customer support",
        quantity: 2,
        destination: "Call Center",
        expectedReturnDate: "2024-12-16",
        particulars: [
            { name: "Headset", serialNumber: "HDS555", engravedNumber: "ENGR-HDS555" },
            { name: "Desktop Phone", serialNumber: "DP666", engravedNumber: "ENGR-DP666" }
        ]
    }
];
