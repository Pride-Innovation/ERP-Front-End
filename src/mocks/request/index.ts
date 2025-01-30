import { IRequest, ITransportRequest } from "../../pages/request/interface";
import { requestStatus } from "../../utils/constants";
import { rolesMock } from "../settings";
import { usersMock } from "../users";

export const requestMock: IRequest[] = [
    {
        id: 1,
        name: "Software Upgrade Request",
        requesterID: 12345,
        quantity: 1,
        priority: "High",
        status: "pending",
        desc: "Requesting to upgrade the software on the development machine.",
        requester: {
            reportsTo: "Jane Smith",
            firstName: "John",
            lastName: "Doe",
            otherName: "PAtson",
            image: "https://example.com/images/john.jpg",
            email: "john.doe@example.com",
            title: "Software Engineer",
            department: "Engineering",
            unit: "Development",
            gender: "Male",
            staffNumber: "E12345",
            availability: "present",
            role: rolesMock[0]
        },
        timeOfSubmissionOfRequest: new Date().toISOString(),
        position: "Software Engineer",
        fromPosition: "Junior Software Engineer",
        Narration: "test",
    }
];


export const transportRequest: ITransportRequest[] = [
    {
        id: 1,
        requester: usersMock[0],
        requestDate: "2024-11-01",
        timeOfSubmissionOfRequest: "08:00",
        timeVehicleIsRequired: "09:00",
        dateVehicleIsRequired: "2024-11-01",
        destination: "123 Main St, Cityville",
        purpose: "Business meeting",
        duration: "2 hours",
        priority: "high",
        status: requestStatus.approved,
        signature: null,
        desc: "Need to be on time for a client presentation.",
        position: "test",
        fromPosition: "mbale",
        Narration: "sample",
    }
];
