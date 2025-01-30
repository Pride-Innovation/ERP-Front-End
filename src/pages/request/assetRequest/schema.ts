import * as yup from 'yup';

export const requestSchema = yup.object().shape({
    desc: yup.string().required('Description is required'),
    reason: yup.string().required('Reason is required'),
    quantity: yup.number().required('Quantity is required').positive().integer(),
    date: yup.string().required('Expected Return Date is required'),
    status: yup.string().nullable().optional(),
});
