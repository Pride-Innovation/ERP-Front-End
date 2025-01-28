import * as yup from 'yup';

export const transportRequestSchema = yup.object().shape({
    requestDate: yup.string().nullable().optional(),
    requestTime: yup.string().nullable().optional(),
    timeRequired: yup.string().required('Time Required is required'),
    dateVehicleIsRequired: yup.string().required('Date Required is required'),
    timeVehicleIsRequired: yup.string().required('Date Required is required'),
    destination: yup.string().required('Destination is required'),
    reason: yup.string().required('Reason is required'),
    duration: yup.string().required('Duration is required'),
    priority: yup.string().required('Priority is required'),
    notes: yup.string().required('Notes is required')
});
