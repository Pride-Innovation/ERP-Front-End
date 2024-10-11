import * as yup from 'yup';

export const requestSchema = yup.object().shape({
    officerName: yup.string().required('Officer Name is required'),
    title: yup.string().required('Title is required'),
    department: yup.string().required('Department is required'),
    reason: yup.string().required('Reason is required'),
    quantity: yup.number().required('Quantity is required').positive().integer(),
    destination: yup.string().required('Destination is required'),
    expectedReturnDate: yup.string().required('Expected Return Date is required'),
    particulars: yup.array().of(
        yup.object().shape({
            name: yup.string().required('Name is required'),
            serialNumber: yup.string().required('Serial Number is required'),
            engravedNumber: yup.string().required('Engraved Number is required')
        })
    ).required('Particulars are required'),
});
