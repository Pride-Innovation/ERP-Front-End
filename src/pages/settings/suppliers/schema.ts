import * as yup from 'yup';

export const supplierSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().trim().email('Invalid email format').required('Email Address is required'),
    tel: yup.string().trim().required('Telephone Number is required'),
    desc: yup.string().nullable().optional(),
    status: yup.string().nullable().optional(),
    image: yup.mixed().nullable().optional(),
    symbol: yup.string().nullable().optional(),
});
